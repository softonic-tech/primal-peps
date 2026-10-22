import { supabase } from './supabase'

/** Normalize TikTok redeem code from settings (fallback TIKTOK50). */
export function resolveTikTokPromoCode(promo) {
  return (
    String(promo?.tiktokCode || 'TIKTOK50')
      .trim()
      .toUpperCase() || 'TIKTOK50'
  )
}

export function resolveTikTokPromoPercent(promo) {
  const n = Number(promo?.tiktokPercent)
  return Number.isFinite(n) && n > 0 ? Math.min(90, n) : 50
}

/**
 * Fetch an unused approved TikTok entitlement for this customer.
 * @returns {Promise<{ id: string, percent: number, customer_email: string } | null>}
 */
export async function getTikTokRewardEntitlement({ email, userId } = {}) {
  const cleanEmail = String(email || '')
    .trim()
    .toLowerCase()
  if (!cleanEmail && !userId) return null

  const { data, error } = await supabase.rpc('get_tiktok_reward_entitlement', {
    p_email: cleanEmail || null,
    p_user_id: userId || null,
  })

  if (error) {
    console.warn('get_tiktok_reward_entitlement failed', error.message)
    return null
  }

  const row = Array.isArray(data) ? data[0] : data
  if (!row?.id) return null
  return {
    id: row.id,
    percent: Number(row.percent) || 50,
    customer_email: row.customer_email,
  }
}

/** Mark entitlement redeemed after the order is saved. */
export async function redeemTikTokReward(rewardId, email, orderId) {
  const { data, error } = await supabase.rpc('redeem_tiktok_reward', {
    p_reward_id: rewardId,
    p_email: String(email || '')
      .trim()
      .toLowerCase(),
    p_order_id: String(orderId || '').trim(),
  })
  if (error) {
    console.warn('redeem_tiktok_reward failed', error.message)
    return false
  }
  return Boolean(data)
}

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
