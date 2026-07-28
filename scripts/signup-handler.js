/**
 * Shared signup logic for Vite middleware and Vercel serverless.
 * Creates a confirmed Auth user via the service role (no confirmation email).
 */
import { createClient } from '@supabase/supabase-js'

/**
 * @param {{ email?: string, password?: string, fullName?: string }} body
 * @param {{ url: string, serviceKey: string }} env
 * @returns {Promise<{ status: number, body: Record<string, unknown> }>}
 */
export async function handleSignup(body, env) {
  const { url, serviceKey } = env
  if (!url || !serviceKey) {
    return {
      status: 503,
      body: {
        error:
          'Signup API unavailable — set SUPABASE_SERVICE_ROLE_KEY (and VITE_SUPABASE_URL or SUPABASE_URL)',
      },
    }
  }

  const email = String(body.email || '')
    .trim()
    .toLowerCase()
  const password = String(body.password || '')
  const fullName = String(body.fullName || '').trim()

  if (!email || !password || password.length < 6) {
    return {
      status: 400,
      body: { error: 'Use a valid email and password (6+ chars)' },
    }
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
    return { status, body: { error: msg } }
  }

  if (data.user) {
    await admin.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: fullName || email.split('@')[0],
    })
  }

  return { status: 200, body: { ok: true, userId: data.user?.id } }
}

export function resolveSignupEnv(env = process.env) {
  return {
    url: env.VITE_SUPABASE_URL || env.SUPABASE_URL || '',
    serviceKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
  }
}
