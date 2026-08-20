/**
 * Upload COA PDFs → coa-documents bucket and set product_variants.coa_url.
 * Variants without a mapped PDF get coa_url cleared (pending in the UI).
 *
 * Prerequisites — run once in Supabase SQL Editor:
 *   admin/supabase/coa-documents.sql
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
  const probe = await supabase.from('product_variants').select('coa_url').limit(1)
  if (probe.error?.message?.includes('coa_url')) {
    console.error(
      'Column product_variants.coa_url is missing.\n' +
        'Run admin/supabase/coa-documents.sql in the Supabase SQL Editor first.',
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

  console.log('\nUpdating product_variants.coa_url…')

  const { data: variants, error: vErr } = await supabase
    .from('product_variants')
    .select('id, product_id, variant_key, stock, active')

  if (vErr) {
    console.error('Failed to load variants:', vErr.message)
    process.exit(1)
  }

  const urlByKey = Object.fromEntries(
    uploads.map((u) => [`${u.productId}::${u.variantKey}`, u.publicUrl]),
  )

  let setCount = 0
  let pendingCount = 0

  for (const v of variants || []) {
    const key = `${v.product_id}::${v.variant_key}`
    const coaUrl = urlByKey[key] ?? null
    const inScope = v.active !== false && Number(v.stock ?? 0) > 0

    if (!inScope) continue

    const { error } = await supabase
      .from('product_variants')
      .update({ coa_url: coaUrl })
      .eq('id', v.id)

    if (error) {
      console.error(`  ✗ ${key}: ${error.message}`)
      continue
    }

    if (coaUrl) {
      setCount++
      console.log(`  ✓ ${key} → COA live`)
    } else {
      pendingCount++
      console.log(`  ○ ${key} → pending`)
    }
  }

  console.log(
    `\nDone. Uploaded ${uploads.length} COAs, ${setCount} live, ${pendingCount} pending.`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
