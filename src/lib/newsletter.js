import { supabase } from './supabase'

/**
 * Insert an email into newsletter_subscribers.
 * Uses insert (not upsert) so anon RLS only needs INSERT — no SELECT/UPDATE.
 * Duplicate emails are treated as success.
 *
 * @param {string} email
 * @param {'welcome' | 'signup' | 'footer' | string} source
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function subscribeNewsletter(email, source = 'unknown') {
  const normalized = String(email || '')
    .trim()
    .toLowerCase()
  if (!normalized || !normalized.includes('@')) {
    return { ok: false, error: 'Enter a valid email address.' }
  }

  const { error } = await supabase.from('newsletter_subscribers').insert({
    email: normalized,
    source,
  })

  if (error) {
    // Already subscribed
    if (error.code === '23505') return { ok: true }
    return { ok: false, error: error.message || 'Could not save your email.' }
  }

  return { ok: true }
}
