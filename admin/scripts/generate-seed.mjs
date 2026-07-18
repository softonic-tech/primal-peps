/**
 * Generates supabase/seed-products.sql from the storefront catalog.
 * Run from admin/: node scripts/generate-seed.mjs
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { PRODUCTS } from '../../src/data/products.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function sqlStr(v) {
  if (v == null) return 'null'
  return `'${String(v).replace(/'/g, "''")}'`
}

function sqlTextArray(arr) {
  if (!arr?.length) return `'{}'`
  return `array[${arr.map(sqlStr).join(', ')}]::text[]`
}

function sqlJson(v) {
  return sqlStr(JSON.stringify(v ?? []))
}

const productRows = PRODUCTS.map((p, i) => {
  return `(
  ${sqlStr(p.id)},
  ${sqlStr(p.name)},
  ${sqlTextArray(p.aka)},
  ${sqlStr(p.sub)},
  ${sqlStr(p.tag)},
  ${sqlStr(p.cat)},
  ${sqlStr(p.categoryLabel || '')},
  ${sqlStr(p.cas)},
  ${sqlStr(p.mw)},
  ${sqlStr(p.lot)},
  ${sqlStr(p.form)},
  ${sqlStr(p.purity)},
  ${sqlStr(p.storageLyophilised)},
  ${sqlStr(p.storageReconstituted)},
  ${sqlStr(p.reconstitution)},
  ${sqlJson(p.composition || [])}::jsonb,
  ${sqlTextArray(p.perks)},
  ${sqlTextArray(p.researchFocus)},
  ${sqlStr(p.description)},
  ${sqlStr(p.story)},
  ${sqlStr(p.hue)},
  true,
  ${i}
)`
}).join(',\n')

const variantRows = PRODUCTS.flatMap((p) =>
  p.variants.map(
    (v, vi) => `(
  ${sqlStr(p.id)},
  ${sqlStr(v.id)},
  ${sqlStr(v.label)},
  ${Number(v.price)},
  ${sqlStr(v.img)},
  100,
  true,
  ${vi}
)`,
  ),
).join(',\n')

const sql = `-- Auto-generated from storefront catalog. Re-run: node scripts/generate-seed.mjs

insert into public.products (
  id, name, aka, sub, tag, cat, category_label, cas, mw, lot, form, purity,
  storage_lyophilised, storage_reconstituted, reconstitution, composition,
  perks, research_focus, description, story, hue, active, sort_order
) values
${productRows}
on conflict (id) do update set
  name = excluded.name,
  aka = excluded.aka,
  sub = excluded.sub,
  tag = excluded.tag,
  cat = excluded.cat,
  category_label = excluded.category_label,
  cas = excluded.cas,
  mw = excluded.mw,
  lot = excluded.lot,
  form = excluded.form,
  purity = excluded.purity,
  storage_lyophilised = excluded.storage_lyophilised,
  storage_reconstituted = excluded.storage_reconstituted,
  reconstitution = excluded.reconstitution,
  composition = excluded.composition,
  perks = excluded.perks,
  research_focus = excluded.research_focus,
  description = excluded.description,
  story = excluded.story,
  hue = excluded.hue,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.product_variants (
  product_id, variant_key, label, price, img, stock, active, sort_order
) values
${variantRows}
on conflict (product_id, variant_key) do update set
  label = excluded.label,
  price = excluded.price,
  img = excluded.img,
  stock = excluded.stock,
  active = excluded.active,
  sort_order = excluded.sort_order;
`

const out = join(__dirname, '../supabase/seed-products.sql')
writeFileSync(out, sql)
console.log(`Wrote ${out}`)
