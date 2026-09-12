/**
 * Seed one clearly labelled demo review per active product.
 * Safe to rerun: upserts on (product_id, user_id).
 *
 *   node admin/scripts/seed-demo-reviews.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match || process.env[match[1]]) continue
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
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

const DEMO_EMAIL = 'demo.reviews@primalpeps.invalid'
const DEMO_NAME = 'Demo Review'

async function findDemoUser() {
  let page = 1
  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    })
    if (error) throw error
    const found = data.users.find((user) => user.email === DEMO_EMAIL)
    if (found) return found
    if (data.users.length < 100) break
    page += 1
  }
  return null
}

async function getDemoUser() {
  const existing = await findDemoUser()
  if (existing) return existing
  const { data, error } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: `${crypto.randomUUID()}Aa1!`,
    email_confirm: true,
    user_metadata: {
      full_name: DEMO_NAME,
      demo_review_user: true,
    },
  })
  if (error) throw error
  return data.user
}

if (process.argv.includes('--remove')) {
  const demoUser = await findDemoUser()
  if (!demoUser) {
    console.log('No seeded demo reviewer found; nothing to remove.')
    process.exit(0)
  }

  const { error } = await supabase.auth.admin.deleteUser(demoUser.id)
  if (error) throw error

  console.log('Removed the demo reviewer account and all seeded reviews.')
  process.exit(0)
}

const { data: products, error: productError } = await supabase
  .from('products')
  .select('id, name, sort_order')
  .eq('active', true)
  .order('sort_order', { ascending: true })

if (productError) throw productError
if (!products?.length) {
  console.log('No active products found.')
  process.exit(0)
}

const demoUser = await getDemoUser()

const templates = [
  (name) =>
    `[Demo review] ${name} arrived securely packed and clearly labelled. The ordering and tracking flow was straightforward.`,
  (name) =>
    `[Demo review] ${name} was professionally presented, well protected in transit, and matched the product listing.`,
  (name) =>
    `[Demo review] A smooth test order for ${name}. Packaging was discreet and the product information was easy to find.`,
  (name) =>
    `[Demo review] ${name} arrived sealed and in excellent condition. Communication throughout the test order was clear.`,
]

for (let index = 0; index < products.length; index += 1) {
  const product = products[index]
  const rating = index % 5 === 4 ? 4 : 5
  const createdAt = new Date(
    Date.now() - (3 + ((index * 7) % 75)) * 24 * 60 * 60 * 1000,
  ).toISOString()

  const { error } = await supabase.from('reviews').upsert(
    {
      product_id: product.id,
      user_id: demoUser.id,
      user_name: DEMO_NAME,
      rating,
      body: templates[index % templates.length](product.name),
      order_id: null,
      created_at: createdAt,
    },
    { onConflict: 'product_id,user_id' },
  )

  if (error) console.error(`✗ ${product.name}: ${error.message}`)
  else console.log(`✓ ${product.name}: ${rating} stars`)
}

console.log(`Done. Seeded ${products.length} labelled demo reviews.`)
