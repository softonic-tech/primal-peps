/**
 * Upload public/products/*.png into the product-images bucket and
 * point product_variants.img at the public URLs.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (bypasses storage RLS).
 *
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... node admin/scripts/upload-product-images.mjs
 *
 * Or add to admin/.env:
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 */
import { createClient } from '@supabase/supabase-js'
import { readdirSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '../..')
const adminEnv = join(root, 'admin/.env')
const rootEnv = join(root, '.env')

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

loadEnvFile(adminEnv)
loadEnvFile(rootEnv)

const url =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const publishable =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ''

if (!url) {
  console.error('Missing VITE_SUPABASE_URL / SUPABASE_URL')
  process.exit(1)
}
if (!serviceKey) {
  console.error(`
Missing SUPABASE_SERVICE_ROLE_KEY.

Get it from: Supabase Dashboard → Project Settings → API → service_role
Then run:

  SUPABASE_SERVICE_ROLE_KEY='your-key' node admin/scripts/upload-product-images.mjs

Or add SUPABASE_SERVICE_ROLE_KEY=... to admin/.env (do not commit it).
`)
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const BUCKET = 'product-images'
const productsDir = join(root, 'public/products')
const files = readdirSync(productsDir).filter((f) =>
  /\.(png|jpe?g|webp|gif)$/i.test(f),
)

console.log(`Uploading ${files.length} images from public/products → ${BUCKET}/…`)

const uploaded = []
for (const file of files) {
  const localPath = join(productsDir, file)
  const storagePath = `products/${file}`
  const buf = readFileSync(localPath)
  const ext = file.split('.').pop().toLowerCase()
  const contentType =
    ext === 'jpg' || ext === 'jpeg'
      ? 'image/jpeg'
      : ext === 'webp'
        ? 'image/webp'
        : ext === 'gif'
          ? 'image/gif'
          : 'image/png'

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buf, {
      contentType,
      upsert: true,
      cacheControl: '31536000',
    })

  if (error) {
    console.error(`  ✗ ${storagePath}: ${error.message}`)
    continue
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  uploaded.push({ file, storagePath, publicUrl: data.publicUrl })
  console.log(`  ✓ ${storagePath}`)
}

// Also upload logo if present
const logoPath = join(root, 'public/logo.png')
if (existsSync(logoPath)) {
  const buf = readFileSync(logoPath)
  const storagePath = 'brand/logo.png'
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buf, {
    contentType: 'image/png',
    upsert: true,
    cacheControl: '31536000',
  })
  if (error) console.error(`  ✗ ${storagePath}: ${error.message}`)
  else console.log(`  ✓ ${storagePath}`)
}

console.log('\nUpdating product_variants.img to public URLs…')

const { data: variants, error: vErr } = await supabase
  .from('product_variants')
  .select('id, product_id, variant_key, img')

if (vErr) {
  console.error('Failed to load variants:', vErr.message)
  process.exit(1)
}

const byLocal = Object.fromEntries(
  uploaded.map((u) => [`products/${u.file}`, u.publicUrl]),
)

let updated = 0
for (const v of variants || []) {
  const local = (v.img || '').replace(/^\//, '')
  const publicUrl = byLocal[local] || byLocal[`products/${local.split('/').pop()}`]
  if (!publicUrl) {
    if (local && !/^https?:\/\//i.test(local)) {
      console.warn(`  · no upload for ${v.product_id}/${v.variant_key} img=${v.img}`)
    }
    continue
  }
  if (v.img === publicUrl) continue
  const { error } = await supabase
    .from('product_variants')
    .update({ img: publicUrl })
    .eq('id', v.id)
  if (error) {
    console.error(`  ✗ update ${v.product_id}/${v.variant_key}: ${error.message}`)
  } else {
    updated++
    console.log(`  ✓ ${v.product_id}/${v.variant_key}`)
  }
}

console.log(`\nDone. Uploaded ${uploaded.length} files, updated ${updated} variants.`)
console.log(
  `Sample URL: ${uploaded[0]?.publicUrl || '(none)'}`,
)

// Sanity: publishable key can read
if (publishable) {
  const anon = createClient(url, publishable)
  const sample = uploaded[0]?.storagePath
  if (sample) {
    const { data } = anon.storage.from(BUCKET).getPublicUrl(sample)
    console.log(`Public read URL: ${data.publicUrl}`)
  }
}
