/**
 * Vite middleware: POST /api/signup
 * Creates a confirmed Auth user via the service role (no confirmation email).
 * Service key is read only on the Node side — never shipped to the browser.
 */
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { handleSignup, resolveSignupEnv } from './signup-handler.js'

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
  return resolveSignupEnv({
    ...loadEnvFile(resolve(root, '.env')),
    ...loadEnvFile(resolve(root, 'admin/.env')),
    ...process.env,
  })
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
          const body = await readJson(req)
          const result = await handleSignup(body, getAdminEnv())
          res.statusCode = result.status
          res.end(JSON.stringify(result.body))
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
