/**
 * Upload root-level product PNGs → product-images bucket and update
 * product_variants.img for in-stock variants.
 *
 *   node admin/scripts/upload-root-product-images.mjs
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

const BUCKET = 'product-images'

/** Root PNG filename → { productId, variantKey } */
const FILE_MAP = {
  'reta-10mg.png': { productId: 'reta', variantKey: '10mg' },
  'mots-c-10mg.png': { productId: 'mots', variantKey: '10mg' },
  'tesa-10mg.png': { productId: 'tesa', variantKey: '10mg' },
  'cjc-ipa-10mg-transparent.png': { productId: 'cjc', variantKey: '10mg' },
  'ghk-cu-50mg-transparent.png': { productId: 'ghk', variantKey: '50mg' },
  'klow-80mg-transparent.png': { productId: 'klow', variantKey: '80mg' },
  'tb-500-10mg-transparent.png': { productId: 'tb', variantKey: '10mg' },
  'bpc-157-10mg-transparent.png': { productId: 'bpc', variantKey: '10mg' },
  'cagrilintide-10mg-transparent.png': { productId: 'cagri', variantKey: '10mg' },
  'mt-2-10mg-transparent.png': { productId: 'mt2', variantKey: '10mg' },
  'bac-water-3ml-transparent.png': { productId: 'bac', variantKey: 'std' },
  'glow-70mg-transparent.png': { productId: 'glow', variantKey: '70mg' },
  'nad-plus-500mg-transparent.png': { productId: 'nad', variantKey: '500mg' },
  'semax-10mg-transparent.png': { productId: 'semax', variantKey: '10mg' },
}

const uploads = []

for (const [file, { productId, variantKey }] of Object.entries(FILE_MAP)) {
  const localPath = join(root, file)
  if (!existsSync(localPath)) {
    console.error(`  ✗ missing file: ${file}`)
    continue
  }

  const buf = readFileSync(localPath)
  const storagePath = `${productId}/${variantKey}-${Date.now()}.png`

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buf, {
    contentType: 'image/png',
    upsert: true,
    cacheControl: '31536000',
  })

  if (error) {
    console.error(`  ✗ upload ${storagePath}: ${error.message}`)
    continue
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  uploads.push({ productId, variantKey, file, storagePath, publicUrl: data.publicUrl })
  console.log(`  ✓ ${file} → ${storagePath}`)
}

if (!uploads.length) {
  console.error('No files uploaded.')
  process.exit(1)
}

console.log('\nUpdating product_variants.img…')

const { data: variants, error: vErr } = await supabase
  .from('product_variants')
  .select('id, product_id, variant_key, img, stock, active')

if (vErr) {
  console.error('Failed to load variants:', vErr.message)
  process.exit(1)
}

const byKey = Object.fromEntries(
  uploads.map((u) => [`${u.productId}::${u.variantKey}`, u.publicUrl]),
)

let updated = 0
for (const v of variants || []) {
  const key = `${v.product_id}::${v.variant_key}`
  const publicUrl = byKey[key]
  if (!publicUrl) continue

  const { error } = await supabase
    .from('product_variants')
    .update({ img: publicUrl })
    .eq('id', v.id)

  if (error) {
    console.error(`  ✗ ${key}: ${error.message}`)
  } else {
    updated++
    console.log(`  ✓ ${key}`)
  }
}

console.log(`\nDone. Uploaded ${uploads.length} images, updated ${updated} variants.`)
