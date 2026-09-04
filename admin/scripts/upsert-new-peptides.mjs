/**
 * Upsert the new out-of-stock peptides ($88) into live Supabase.
 *   node admin/scripts/upsert-new-peptides.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { PRODUCTS } from '../../src/data/products.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '../..')

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let val = m[2].replace(/^['"]|['"]$/g, '')
    if (!process.env[m[1]]) process.env[m[1]] = val
  }
}

loadEnvFile(join(root, 'admin/.env'))
loadEnvFile(join(root, '.env'))

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const NEW_IDS = [
  'selank',
  'bpctb',
  'ahk',
  'kpv',
  'adamax',
  'igf1',
  'mt1',
  'tirz',
]

const products = PRODUCTS.filter((p) => NEW_IDS.includes(p.id) || p.id === 'ghk')
const { data: existing } = await supabase
  .from('products')
  .select('id, sort_order')
  .order('sort_order', { ascending: false })
  .limit(1)

let nextSort = (existing?.[0]?.sort_order ?? 100) + 1

for (const p of products.filter((p) => NEW_IDS.includes(p.id))) {
  const row = {
    id: p.id,
    name: p.name,
    aka: p.aka || [],
    sub: p.sub || '',
    tag: p.tag || '',
    cat: p.cat || 'metabolic',
    category_label: p.categoryLabel || '',
    cas: p.cas,
    mw: p.mw || '',
    lot: p.lot || '',
    form: p.form || 'Lyophilised powder',
    purity: p.purity || '99%+',
    storage_lyophilised: p.storageLyophilised || '',
    storage_reconstituted: p.storageReconstituted || '',
    reconstitution: p.reconstitution || '',
    composition: p.composition || [],
    perks: p.perks || [],
    research_focus: p.researchFocus || [],
    description: p.description || '',
    story: p.story || '',
    hue: p.hue || '#e8a020',
    active: true,
    sort_order: nextSort++,
  }

  const { error } = await supabase.from('products').upsert(row, { onConflict: 'id' })
  if (error) {
    console.error(`✗ product ${p.id}:`, error.message)
    continue
  }
  console.log(`✓ product ${p.id}`)

  for (let i = 0; i < p.variants.length; i++) {
    const v = p.variants[i]
    const { error: vErr } = await supabase.from('product_variants').upsert(
      {
        product_id: p.id,
        variant_key: v.id,
        label: v.label,
        price: v.price,
        img: v.img,
        stock: v.stock,
        active: true,
        sort_order: i,
      },
      { onConflict: 'product_id,variant_key' },
    )
    if (vErr) console.error(`  ✗ variant ${v.id}:`, vErr.message)
    else console.log(`  ✓ variant ${v.id} $${v.price} stock=${v.stock}`)
  }
}

// GHK-Cu 100MG variant on existing product
const ghk = PRODUCTS.find((p) => p.id === 'ghk')
const ghk100 = ghk?.variants.find((v) => v.id === '100mg')
if (ghk100) {
  const { error } = await supabase.from('product_variants').upsert(
    {
      product_id: 'ghk',
      variant_key: '100mg',
      label: ghk100.label,
      price: ghk100.price,
      img: ghk100.img,
      stock: ghk100.stock,
      active: true,
      sort_order: 1,
    },
    { onConflict: 'product_id,variant_key' },
  )
  if (error) console.error('✗ ghk 100mg:', error.message)
  else console.log('✓ ghk 100mg variant $88 stock=0')
}

console.log('Done.')
