/**
 * Vercel serverless: POST /api/signup
 * Mirrors the Vite signup middleware for production.
 */
import { handleSignup, resolveSignupEnv } from '../scripts/signup-handler.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const result = await handleSignup(body, resolveSignupEnv())
    return res.status(result.status).json(result.body)
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Signup failed' })
  }
}
