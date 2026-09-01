/**
 * Vite middleware: POST /api/order-email
 * Sends an order confirmation via Resend. Keys stay on the server.
 */
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { handleOrderEmail, resolveOrderEmailEnv } = require('./order-email-handler.cjs')

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

function getEnv() {
  return resolveOrderEmailEnv({
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

export function orderEmailApiPlugin() {
  return {
    name: 'primal-order-email-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split('?')[0] !== '/api/order-email' || req.method !== 'POST') {
          return next()
        }

        res.setHeader('Content-Type', 'application/json')
        try {
          const body = await readJson(req)
          const result = await handleOrderEmail(body, getEnv())
          res.statusCode = result.status
          res.end(JSON.stringify(result.body))
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message || 'Email failed' }))
        }
      })
    },
  }
}
