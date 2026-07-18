/**
 * Sync inventory from the current AU price list.
 * - Listed variants → in stock + updated price
 * - Other variants → stock 0 (kept in DB, still visible as OOS)
 * - Adds Semax + MOTS-C 40MG if missing
 *
 *   node admin/scripts/sync-stock-from-pricelist.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '../..')

function loadEnv(path) {
  if (!existsSync(path)) return {}
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    out[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
  return out
}

const env = {
  ...loadEnv(join(root, '.env')),
  ...loadEnv(join(root, 'admin/.env')),
  ...process.env,
}

const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Need VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const BUCKET = 'product-images'

/** product_id + variant_key → in-stock price list */
const IN_STOCK = {
  'reta:10mg': { price: 145, label: '10MG' },
  'bac:std': { price: 10, label: '3ML' },
  'ghk:50mg': { price: 80, label: '50MG' },
  'cjc:10mg': { price: 125, label: '10MG' },
  'glow:70mg': { price: 165, label: '70MG' },
  'tesa:10mg': { price: 140, label: '10MG' },
  'bpc:10mg': { price: 90, label: '10MG' },
  'tb:10mg': { price: 125, label: '10MG' },
  'nad:500mg': { price: 125, label: '500MG' },
  'mots:10mg': { price: 90, label: '10MG' },
  'mots:40mg': { price: 155, label: '40MG' },
  'klow:80mg': { price: 195, label: '80MG' },
  'semax:10mg': { price: 65, label: '10MG' },
  'mt2:10mg': { price: 75, label: '10MG' },
  'cagri:10mg': { price: 125, label: '10MG' },
}

const SEMAX_PRODUCT = {
  id: 'semax',
  name: 'Semax',
  aka: ['Met-Glu-His-Phe-Pro-Gly-Pro', 'ACTH(4-10) analogue'],
  sub: 'Synthetic heptapeptide for nootropic and neuroprotection research.',
  tag: 'Cognitive',
  cat: 'recovery',
  category_label: 'Neurological Research',
  cas: '80714-61-0',
  mw: '813.9 Da',
  lot: 'PP-2026-014',
  form: 'Lyophilised powder',
  purity: '99%+',
  storage_lyophilised: '-20 °C — protect from light & moisture',
  storage_reconstituted: '2–8 °C — use within 28 days',
  reconstitution: 'Bacteriostatic water (recommended)',
  composition: [],
  perks: [
    'Cognitive & memory models',
    'Neuroprotection research',
    'BDNF / NGF pathway studies',
  ],
  research_focus: [
    'Learning and memory models',
    'Neurotrophic factor signalling (BDNF, NGF)',
    'Ischaemia and neuroprotection assays',
    'Attention and cognitive performance research',
  ],
  description:
    'Semax is a synthetic heptapeptide analogue of ACTH(4–10), developed for neurological research. It is studied in models of cognitive function, neurotrophic signalling, and neuroprotection. Unlike many ACTH fragments, Semax is formulated without strong hormonal ACTH activity and is used as a research tool for CNS peptide pharmacology. Supplied lyophilised for laboratory reconstitution.',
  story:
    'A widely referenced cognitive-research peptide for neurotrophic and neuroprotection models.',
  hue: '#6ea8dc',
  active: true,
  sort_order: 14,
}

async function uploadLocal(localRel, storagePath) {
  const localPath = join(root, localRel)
  if (!existsSync(localPath)) {
    console.warn(`  ! missing local file ${localRel}`)
    return ''
  }
  const buf = readFileSync(localPath)
  const { error } = await sb.storage.from(BUCKET).upload(storagePath, buf, {
    contentType: 'image/png',
    upsert: true,
    cacheControl: '31536000',
  })
  if (error) {
    console.warn(`  ! upload ${storagePath}: ${error.message}`)
    return ''
  }
  const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

async function ensureSemax(imgUrl) {
  const { data: existing } = await sb
    .from('products')
    .select('id')
    .eq('id', 'semax')
    .maybeSingle()

  if (!existing) {
    const { error } = await sb.from('products').insert(SEMAX_PRODUCT)
    if (error) throw new Error(`Insert Semax: ${error.message}`)
    console.log('  ✓ created product semax')
  } else {
    console.log('  · Semax product already exists')
  }

  const { data: v } = await sb
    .from('product_variants')
    .select('id')
    .eq('product_id', 'semax')
    .eq('variant_key', '10mg')
    .maybeSingle()

  if (!v) {
    const { error } = await sb.from('product_variants').insert({
      product_id: 'semax',
      variant_key: '10mg',
      label: '10MG',
      price: 65,
      img: imgUrl || '',
      stock: 100,
      active: true,
      sort_order: 0,
    })
    if (error) throw new Error(`Insert Semax variant: ${error.message}`)
    console.log('  ✓ created semax/10mg')
  }
}

async function ensureMots40(imgUrl) {
  const { data: v } = await sb
    .from('product_variants')
    .select('id')
    .eq('product_id', 'mots')
    .eq('variant_key', '40mg')
    .maybeSingle()

  if (!v) {
    const { error } = await sb.from('product_variants').insert({
      product_id: 'mots',
      variant_key: '40mg',
      label: '40MG',
      price: 155,
      img: imgUrl || '',
      stock: 100,
      active: true,
      sort_order: 2,
    })
    if (error) throw new Error(`Insert MOTS-C 40mg: ${error.message}`)
    console.log('  ✓ created mots/40mg')
  } else {
    console.log('  · mots/40mg already exists')
  }
}

async function main() {
  console.log('Uploading Semax image…')
  const semaxUrl = await uploadLocal(
    'public/products/SEMAX.png',
    'products/SEMAX.png',
  )
  if (semaxUrl) console.log('  ✓', semaxUrl)

  // Reuse MOTS-C 10MG art for 40MG until a dedicated vial shot exists
  const { data: mots10 } = await sb
    .from('product_variants')
    .select('img')
    .eq('product_id', 'mots')
    .eq('variant_key', '10mg')
    .maybeSingle()
  const mots40Img = mots10?.img || ''

  console.log('Ensuring new SKUs…')
  await ensureSemax(semaxUrl)
  await ensureMots40(mots40Img)

  console.log('Syncing all variants…')
  const { data: variants, error } = await sb
    .from('product_variants')
    .select('id, product_id, variant_key, label, price, stock, active, img')

  if (error) throw new Error(error.message)

  let inStock = 0
  let oos = 0

  for (const v of variants || []) {
    const key = `${v.product_id}:${v.variant_key}`
    const listed = IN_STOCK[key]
    if (listed) {
      const patch = {
        price: listed.price,
        label: listed.label,
        stock: 100,
        active: true,
      }
      if (v.product_id === 'semax' && semaxUrl) patch.img = semaxUrl
      const { error: uErr } = await sb
        .from('product_variants')
        .update(patch)
        .eq('id', v.id)
      if (uErr) console.error(`  ✗ ${key}: ${uErr.message}`)
      else {
        console.log(`  ✓ IN  ${key} → $${listed.price} (${listed.label})`)
        inStock++
      }
    } else {
      const { error: uErr } = await sb
        .from('product_variants')
        .update({ stock: 0, active: true })
        .eq('id', v.id)
      if (uErr) console.error(`  ✗ ${key}: ${uErr.message}`)
      else {
        console.log(`  · OOS ${key}`)
        oos++
      }
    }
  }

  // Keep all listed products active
  const productIds = [
    ...new Set(Object.keys(IN_STOCK).map((k) => k.split(':')[0])),
  ]
  await sb.from('products').update({ active: true }).in('id', productIds)

  console.log(`\nDone. In stock: ${inStock}, Out of stock: ${oos}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
