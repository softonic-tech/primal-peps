import { supabase } from './supabase'

/**
 * Send order emails via Supabase Edge Function `order-email`.
 * Avoids CORS to the storefront /api/order-email route.
 */
export async function sendOrderEmail(payload) {
  const { data, error } = await supabase.functions.invoke('order-email', {
    body: payload,
  })

  if (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error.message || 'Edge function failed' },
    }
  }

  if (data?.error) {
    return {
      ok: false,
      status: 502,
      data,
    }
  }

  return {
    ok: true,
    status: 200,
    data: data || { ok: true },
  }
}
