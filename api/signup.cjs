/**
 * Vercel Node serverless: POST /api/signup
 * .cjs so this works even though package.json has "type": "module".
 */
const { createClient } = require('@supabase/supabase-js')

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!url || !serviceKey) {
    return res.status(503).json({
      error:
        'Signup API unavailable — set SUPABASE_SERVICE_ROLE_KEY (and VITE_SUPABASE_URL or SUPABASE_URL) on Vercel',
    })
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : req.body || {}

    const email = String(body.email || '')
      .trim()
      .toLowerCase()
    const password = String(body.password || '')
    const fullName = String(body.fullName || '').trim()
    const displayName = fullName || email.split('@')[0]

    if (!email || !password || password.length < 6) {
      return res.status(400).json({
        error: 'Use a valid email and password (6+ chars)',
      })
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: displayName },
    })

    if (error) {
      const msg = error.message || 'Could not create account'
      const status = /already|registered|exists/i.test(msg) ? 409 : 400
      return res.status(status).json({ error: msg })
    }

    if (data.user) {
      await admin.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: displayName,
      })
    }

    return res.status(200).json({ ok: true, userId: data.user?.id })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Signup failed' })
  }
}
