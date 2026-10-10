import { supabase } from './supabase'

/** Local order history: code already used (incl. legacy discounted orders). */
export function ordersShowPromoUsed(orders, code) {
  const normalized = String(code || '')
    .trim()
    .toUpperCase()
  if (!normalized) return false
  return (orders || []).some((o) => {
    const status = String(o.status || '').toLowerCase()
    if (status === 'cancelled') return false
    const pc = String(o.promoCode || '')
      .trim()
      .toUpperCase()
    if (pc && pc === normalized) return true
    // Legacy rows before promo_code existed — any discount counts as used.
    if (!pc && Number(o.discount) > 0) return true
    return false
  })
}

/**
 * Server check via security-definer RPC.
 * @returns {Promise<boolean|null>} true/false, or null if the check could not run
 */
export async function hasUsedPromoCode(code, { email, userId } = {}) {
  const normalized = String(code || '')
    .trim()
    .toUpperCase()
  if (!normalized) return false

  const cleanEmail = String(email || '')
    .trim()
    .toLowerCase()
  if (!cleanEmail && !userId) return false

  const { data, error } = await supabase.rpc('has_used_promo_code', {
    p_code: normalized,
    p_email: cleanEmail || null,
    p_user_id: userId || null,
  })

  if (error) {
    console.warn('has_used_promo_code failed', error.message)
    return null
  }
  return Boolean(data)
}
