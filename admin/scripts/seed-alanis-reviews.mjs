/**
 * Seed client-provided reviews attributed to "Alanis Jones".
 * 3 reviews per product require 3 auth users (unique product_id + user_id),
 * but every review displays as Alanis Jones.
 *
 *   node admin/scripts/seed-alanis-reviews.mjs
 *   node admin/scripts/seed-alanis-reviews.mjs --remove
 */
import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m || process.env[m[1]]) continue
    process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
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

const DISPLAY_NAME = 'Alanis Jones'
const SEED_USERS = [
  'alanis.seed1@primalpeps.invalid',
  'alanis.seed2@primalpeps.invalid',
  'alanis.seed3@primalpeps.invalid',
]

/** product_id → 3 review bodies */
const REVIEWS = {
  reta: [
    'Ordered on Monday and it arrived sooner than expected. Everything was packed securely and the tracking updates were accurate.',
    'Really smooth ordering experience. Dispatch was quick, delivery was on time, and the vial arrived properly protected.',
    'No issues with the order at all. Fast shipping, good communication, and the package arrived exactly as expected.',
  ],
  mots: [
    'Very quick processing and shipping. Tracking was provided promptly and the package arrived safely.',
    'Easy to order and delivered faster than I expected. Packaging was secure and everything arrived intact.',
    'Good experience overall. The order was dispatched quickly and delivery updates kept me informed.',
  ],
  cjc: [
    'Order was processed quickly and shipped without any delays. Arrived safely and well protected.',
    'Smooth experience from ordering through delivery. Tracking was accurate and the package arrived in good condition.',
    'Fast dispatch and straightforward communication. Delivery was quicker than expected.',
  ],
  ghk: [
    'Really happy with how quickly this order was processed. Tracking came through promptly and delivery was smooth.',
    'Fast shipping and the package arrived safely. No problems with the order from start to finish.',
    'Simple ordering process and quick delivery. Everything arrived secure and intact.',
  ],
  tesa: [
    'Order was dispatched quickly and arrived on schedule. Tracking made it easy to follow the delivery.',
    'Very smooth experience. Quick processing, good shipping updates, and the package arrived safely.',
    'Delivery was faster than expected and everything arrived in good condition. Would order again.',
  ],
  klow: [
    'Considering it was a blend, the package was protected really well. Fast dispatch and delivery with no issues.',
    'Easy checkout and quick shipping. Tracking was provided and the order arrived safely.',
    'Great service throughout the order. Dispatch was quick and delivery was right on schedule.',
  ],
  tb: [
    'Really quick turnaround. Order was confirmed, dispatched, and delivered without any issues.',
    'Fast shipping and good communication throughout. Package arrived safely and on time.',
    'Smooth experience from checkout to delivery. Tracking updates were helpful and accurate.',
  ],
  bpc: [
    'Ordered and received it within a few days. Shipping was quick and the package arrived safely.',
    'Very straightforward order. Fast dispatch, accurate tracking, and everything arrived intact.',
    'Good delivery experience overall. No unnecessary delays and the package was well protected.',
  ],
  cagri: [
    'Quick processing and surprisingly fast delivery. Tracking was available throughout the shipment.',
    'Order arrived on time with no delivery issues. Smooth experience from checkout to receiving the package.',
    'Fast dispatch and reliable shipping. Everything arrived safely and as expected.',
  ],
  mt2: [
    'Shipping was very quick and the tracking updates were consistent. Package arrived safely.',
    'Easy checkout and fast delivery. No issues with the order whatsoever.',
    'Really smooth transaction. Dispatched quickly and arrived within the expected timeframe.',
  ],
  bac: [
    'Added this to my order and everything arrived together. Securely packed and delivered quickly.',
    'Simple ordering experience and fast delivery. Arrived sealed and in good condition.',
    'Good add-on to the order. It was packed properly and arrived without any issues.',
  ],
  glow: [
    'Very quick dispatch and delivery. The package arrived safely and everything was protected well.',
    'Smooth ordering experience with good tracking updates. Delivery was faster than expected.',
    'No problems from checkout to delivery. Fast shipping and the package arrived in excellent condition.',
  ],
  nad: [
    'Arrived safely despite being a heavier package. Shipping was quick and tracking was updated regularly.',
    'Fast processing and delivery. Everything arrived securely packed and intact.',
    'Good experience overall. Quick dispatch, reliable tracking, and no delivery issues.',
  ],
  semax: [
    'Really quick shipping. I received tracking shortly after ordering and delivery was smooth.',
    'Fast dispatch and the package arrived on time. No issues with the order.',
    'Easy checkout, quick delivery, and good communication throughout the shipment.',
  ],
  selank: [
    'Order was processed quickly and delivered without any problems. Tracking was accurate.',
    'Fast shipping and everything arrived safely. Overall a very smooth experience.',
    'Quick turnaround from placing the order to delivery. Would use the service again.',
  ],
  bpctb: [
    'Quick dispatch and delivery. The package arrived safely with everything properly secured.',
    'Smooth ordering process and fast shipping. Tracking updates were helpful and delivery was on time.',
    'Good experience overall. No delays, good communication, and the order arrived intact.',
  ],
  ahk: [
    'Fast processing and delivery. The package arrived safely and exactly when expected.',
    'Really straightforward experience. Quick dispatch and consistent tracking updates.',
    'No complaints with the service. Order was shipped quickly and arrived in good condition.',
  ],
  kpv: [
    'Quick turnaround and reliable delivery. Tracking was provided and the package arrived safely.',
    'Easy checkout and fast shipping. Everything arrived intact with no issues.',
    'Very smooth order experience. Dispatch was quick and delivery was right on schedule.',
  ],
  adamax: [
    'Fast shipping and a smooth delivery experience. Order arrived safely and on time.',
    'Really quick processing. Tracking came through promptly and there were no delivery problems.',
    'Good service from start to finish. Fast dispatch and the package arrived exactly as expected.',
  ],
  igf1: [
    'Quick dispatch and careful delivery. Tracking was clear and the order arrived safely.',
    'Smooth experience overall. Fast shipping and no issues with the package when it arrived.',
    'Order was processed quickly and delivered on time. Everything arrived properly protected.',
  ],
  mt1: [
    'Very fast delivery. The order was dispatched quickly and arrived safely.',
    'Easy ordering and quick shipping. Tracking was accurate and there were no delays.',
    'Good experience from checkout to delivery. Package arrived on time and in good condition.',
  ],
  tirz: [
    'Really impressed with the delivery speed. Order was processed quickly and arrived safely.',
    'Fast dispatch, accurate tracking, and no delivery issues. Very smooth experience overall.',
    'Placed the order and received it sooner than expected. Good communication and reliable delivery.',
  ],
}

async function findUserByEmail(email) {
  let page = 1
  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    })
    if (error) throw error
    const found = data.users.find((u) => u.email === email)
    if (found) return found
    if (data.users.length < 100) break
    page += 1
  }
  return null
}

async function ensureUser(email) {
  const existing = await findUserByEmail(email)
  if (existing) return existing
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: `${crypto.randomUUID()}Aa1!`,
    email_confirm: true,
    user_metadata: {
      full_name: DISPLAY_NAME,
      seeded_alanis_reviewer: true,
    },
  })
  if (error) throw error
  return data.user
}

if (process.argv.includes('--remove')) {
  for (const email of SEED_USERS) {
    const user = await findUserByEmail(email)
    if (!user) {
      console.log(`skip (missing): ${email}`)
      continue
    }
    const { error } = await supabase.auth.admin.deleteUser(user.id)
    if (error) console.error(`✗ remove ${email}: ${error.message}`)
    else console.log(`✓ removed ${email}`)
  }
  console.log('Done removing Alanis seed reviews.')
  process.exit(0)
}

const users = []
for (const email of SEED_USERS) {
  const user = await ensureUser(email)
  users.push(user)
  console.log(`✓ reviewer slot ${email}`)
}

const { data: products, error: pErr } = await supabase
  .from('products')
  .select('id, name')
  .eq('active', true)

if (pErr) throw pErr
const byId = Object.fromEntries((products || []).map((p) => [p.id, p.name]))

let inserted = 0
for (const [productId, bodies] of Object.entries(REVIEWS)) {
  if (!byId[productId]) {
    console.log(`skip missing product: ${productId}`)
    continue
  }
  for (let i = 0; i < bodies.length; i += 1) {
    const user = users[i]
    const daysAgo = 4 + ((inserted * 5) % 80)
    const { error } = await supabase.from('reviews').upsert(
      {
        product_id: productId,
        user_id: user.id,
        user_name: DISPLAY_NAME,
        rating: 5,
        body: bodies[i],
        order_id: null,
        created_at: new Date(
          Date.now() - daysAgo * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      { onConflict: 'product_id,user_id' },
    )
    if (error) {
      console.error(`✗ ${byId[productId]} #${i + 1}: ${error.message}`)
    } else {
      inserted += 1
      console.log(`✓ ${byId[productId]} #${i + 1}`)
    }
  }
}

console.log(`Done. Seeded ${inserted} reviews as ${DISPLAY_NAME}.`)
