/**
 * Vercel Node serverless: POST /api/order-email
 */
const {
  handleOrderEmail,
  resolveOrderEmailEnv,
} = require('../scripts/order-email-handler.cjs')

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : req.body || {}
    const result = await handleOrderEmail(body, resolveOrderEmailEnv(process.env))
    return res.status(result.status).json(result.body)
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Email failed' })
  }
}
