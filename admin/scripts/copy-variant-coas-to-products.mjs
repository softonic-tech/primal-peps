/**
 * Copy the first non-empty variant COA onto each product.
 *
 * Prerequisites — run once in Supabase SQL Editor:
 *   admin/supabase/product-coa.sql
 *
 * Usage:
 *   node admin/scripts/copy-variant-coas-to-products.mjs
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

async function main() {
  const probe = await supabase.from('products').select('id, coa_url').limit(1)
  if (probe.error) {
    console.error(probe.error.message)
    if (/coa_url/i.test(probe.error.message)) {
      console.error(
        '\nColumn products.coa_url is missing.\n' +
          'Run admin/supabase/product-coa.sql in the Supabase SQL Editor, then re-run this script.',
      )
    }
    process.exit(1)
  }

  const [{ data: products, error: pErr }, { data: variants, error: vErr }] =
    await Promise.all([
      supabase.from('products').select('id, name, coa_url'),
      supabase
        .from('product_variants')
        .select('product_id, coa_url, sort_order, created_at')
        .order('sort_order', { ascending: true }),
    ])

  if (pErr || vErr) {
    console.error(pErr?.message || vErr?.message)
    process.exit(1)
  }

  const firstCoaByProduct = new Map()
  for (const v of variants || []) {
    const url = (v.coa_url || '').trim()
    if (!url || firstCoaByProduct.has(v.product_id)) continue
    firstCoaByProduct.set(v.product_id, url)
  }

  let copied = 0
  let skipped = 0
  let missing = 0

  for (const p of products || []) {
    const existing = (p.coa_url || '').trim()
    if (existing) {
      skipped++
      console.log(`  · ${p.id} already has a product COA`)
      continue
    }
    const fromVariant = firstCoaByProduct.get(p.id)
    if (!fromVariant) {
      missing++
      console.log(`  ○ ${p.id} (${p.name}) — no variant COA to copy`)
      continue
    }
    const { error } = await supabase
      .from('products')
      .update({ coa_url: fromVariant })
      .eq('id', p.id)
    if (error) {
      console.error(`  ✗ ${p.id}: ${error.message}`)
      continue
    }
    copied++
    console.log(`  ✓ ${p.id} (${p.name}) ← variant COA`)
  }

  console.log(
    `\nDone. Copied ${copied}, already set ${skipped}, no source ${missing}.`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
