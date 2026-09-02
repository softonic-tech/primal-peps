/**
 * Upload COA PDFs → coa-documents bucket and set products.coa_url.
 *
 * Prerequisites — run once in Supabase SQL Editor:
 *   admin/supabase/coa-documents.sql
 *   admin/supabase/product-coa.sql
 *
 * Usage:
 *   node admin/scripts/upload-coas.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '../..')

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    const key = m[1]
    let val = m[2].replace(/^['"]|['"]$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnvFile(join(root, 'admin/.env'))
loadEnvFile(join(root, '.env'))

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in admin/.env')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const BUCKET = 'coa-documents'

/** Local PDF filename → { productId, variantKey } */
const COA_MAP = {
  'Retatrutide 10mg COA.pdf': { productId: 'reta', variantKey: '10mg' },
  'MOTS-C 10mg COA.pdf': { productId: 'mots', variantKey: '10mg' },
  'GHK-Cu_50MG_COA.pdf': { productId: 'ghk', variantKey: '50mg' },
  'Tesamorelin coa.pdf': { productId: 'tesa', variantKey: '10mg' },
  'BPC157_COA.pdf': { productId: 'bpc', variantKey: '10mg' },
  'MT-2 coa.pdf': { productId: 'mt2', variantKey: '10mg' },
}

async function ensureBucket() {
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets()
  if (listErr) {
    console.warn('Could not list buckets:', listErr.message)
    return
  }
  if (buckets?.some((b) => b.id === BUCKET)) return

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['application/pdf'],
  })
  if (error && !/already exists/i.test(error.message)) {
    console.warn(`Bucket create: ${error.message}`)
    console.warn('Run admin/supabase/coa-documents.sql in Supabase SQL Editor if needed.')
  }
}

async function main() {
  const probe = await supabase.from('products').select('coa_url').limit(1)
  if (probe.error?.message?.includes('coa_url')) {
    console.error(
      'Column products.coa_url is missing.\n' +
        'Run admin/supabase/product-coa.sql in the Supabase SQL Editor first.',
    )
    process.exit(1)
  }

  await ensureBucket()

  const uploads = []

  for (const [file, { productId, variantKey }] of Object.entries(COA_MAP)) {
    const localPath = join(root, file)
    if (!existsSync(localPath)) {
      console.error(`  ✗ missing file: ${file}`)
      continue
    }

    const buf = readFileSync(localPath)
    const storagePath = `${productId}/${variantKey}.pdf`

    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buf, {
      contentType: 'application/pdf',
      upsert: true,
      cacheControl: '31536000',
    })

    if (error) {
      console.error(`  ✗ upload ${storagePath}: ${error.message}`)
      continue
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
    uploads.push({
      productId,
      variantKey,
      file,
      storagePath,
      publicUrl: data.publicUrl,
    })
    console.log(`  ✓ ${file} → ${storagePath}`)
  }

  if (!uploads.length) {
    console.error('No COA files uploaded.')
    process.exit(1)
  }

  console.log('\nUpdating products.coa_url…')

  let setCount = 0

  for (const u of uploads) {
    const { error } = await supabase
      .from('products')
      .update({ coa_url: u.publicUrl })
      .eq('id', u.productId)

    if (error) {
      console.error(`  ✗ ${u.productId}: ${error.message}`)
      continue
    }

    setCount++
    console.log(`  ✓ ${u.productId} → ${u.file}`)
  }

  console.log(`\nDone. Uploaded ${uploads.length} COAs, ${setCount} products updated.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
