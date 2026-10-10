import { supabase } from './supabase'

export const TRACKING_STAGES = [
  {
    key: 'placed',
    label: 'Order placed',
    description: 'We’ve received your order.',
  },
  {
    key: 'paid',
    label: 'Payment received',
    description: 'Funds confirmed — preparing your items.',
  },
  {
    key: 'processing',
    label: 'Processing',
    description: 'We’re packing your order for dispatch.',
  },
  {
    key: 'shipped',
    label: 'Shipped',
    description: 'Out for delivery with Australia Post.',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Your order has arrived.',
  },
]

export function normalizeOrderNumberInput(raw) {
  const trimmed = String(raw || '')
    .trim()
    .toUpperCase()
  return trimmed.replace(/^#/, '')
}

export function ausPostUrl(trackingNumber) {
  return `https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(trackingNumber)}`
}

export async function lookupOrderTracking(orderNumber, email) {
  const normalized = normalizeOrderNumberInput(orderNumber)
  const cleanEmail = String(email || '')
    .trim()
    .toLowerCase()

  if (!normalized) {
    return { data: null, error: 'Please enter an order number.' }
  }
  if (!cleanEmail) {
    return { data: null, error: 'Please enter the email you used at checkout.' }
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
    return { data: null, error: 'That email address doesn’t look right.' }
  }

  try {
    const { data, error } = await supabase.rpc('track_order', {
      p_order_number: normalized,
      p_email: cleanEmail,
    })

    if (error) {
      console.error('[trackOrder] RPC error:', error)
      return {
        data: null,
        error: 'We couldn’t reach our servers. Please try again in a moment.',
      }
    }

    if (!data) {
      return {
        data: null,
        error:
          'We couldn’t find an order matching that number and email. Double-check both and try again.',
      }
    }

    return { data, error: null }
  } catch (err) {
    console.error('[trackOrder] unexpected error:', err)
    return { data: null, error: 'Something went wrong. Please try again.' }
  }
}

/** Map Primal Peps order status onto timeline stage index (0–4). */
export function resolveCurrentStageIndex(order) {
  const status = String(order?.status || '').toLowerCase()

  if (status === 'delivered') return 4
  if (status === 'shipped') return 3
  if (status === 'processing') return 2
  if (status === 'payment received') return 1
  if (status === 'awaiting payment') return 0
  if (status === 'cancelled') return -1

  return 0
}

export function isCancelled(order) {
  return String(order?.status || '').toLowerCase() === 'cancelled'
}

export function formatMoney(n) {
  return `$${Number(n || 0).toFixed(2)}`
}

export function formatTrackDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export function formatShippingMethod(method) {
  if (!method) return ''
  return String(method)
    .split(/[_\s-]+/)
    .map((p) => (p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : ''))
    .join(' ')
}
