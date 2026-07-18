/**
 * Vite middleware: POST /api/signup
 * Creates a confirmed Auth user via the service role (no confirmation email).
 * Service key is read only on the Node side — never shipped to the browser.
 */
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnvFile(path) {
  if (!existsSync(path)) return {}
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    out[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
  return out
}

function getAdminEnv() {
  const merged = {
    ...loadEnvFile(resolve(root, '.env')),
    ...loadEnvFile(resolve(root, 'admin/.env')),
    ...process.env,
  }
  return {
    url: merged.VITE_SUPABASE_URL || merged.SUPABASE_URL || '',
    serviceKey: merged.SUPABASE_SERVICE_ROLE_KEY || '',
  }
}

async function readJson(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  return JSON.parse(raw)
}

export function signupApiPlugin() {
  return {
    name: 'primal-signup-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split('?')[0] !== '/api/signup' || req.method !== 'POST') {
          return next()
        }

        res.setHeader('Content-Type', 'application/json')

        try {
          const { url, serviceKey } = getAdminEnv()
          if (!url || !serviceKey) {
            res.statusCode = 503
            res.end(
              JSON.stringify({
                error:
                  'Signup API unavailable — add SUPABASE_SERVICE_ROLE_KEY to admin/.env',
              }),
            )
            return
          }

          const body = await readJson(req)
          const email = String(body.email || '')
            .trim()
            .toLowerCase()
          const password = String(body.password || '')
          const fullName = String(body.fullName || '').trim()

          if (!email || !password || password.length < 6) {
            res.statusCode = 400
            res.end(
              JSON.stringify({
                error: 'Use a valid email and password (6+ chars)',
              }),
            )
            return
          }

          const admin = createClient(url, serviceKey, {
            auth: { persistSession: false, autoRefreshToken: false },
          })

          const { data, error } = await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName || email.split('@')[0],
            },
          })

          if (error) {
            const msg = error.message || 'Could not create account'
            const status = /already|registered|exists/i.test(msg) ? 409 : 400
            res.statusCode = status
            res.end(JSON.stringify({ error: msg }))
            return
          }

          // Ensure profile row exists (trigger usually creates it)
          if (data.user) {
            await admin.from('profiles').upsert({
              id: data.user.id,
              email,
              full_name: fullName || email.split('@')[0],
            })
          }

          res.statusCode = 200
          res.end(JSON.stringify({ ok: true, userId: data.user?.id }))
        } catch (err) {
          res.statusCode = 500
          res.end(
            JSON.stringify({
              error: err.message || 'Signup failed',
            }),
          )
        }
      })
    },
  }
}
