import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY — copy admin/.env.example to admin/.env',
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '')

export const ORDER_STATUSES = [
  'Awaiting payment',
  'Payment received',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
]

/** Compact labels for narrow screens (keep one line) */
export const STATUS_SHORT = {
  'Awaiting payment': 'Awaiting',
  'Payment received': 'Paid',
  Processing: 'Processing',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
}

export function statusShort(status) {
  return STATUS_SHORT[status] || status
}

/** CSS modifier for status pills / chips */
export function statusTone(status) {
  switch (status) {
    case 'Awaiting payment':
      return 'warn'
    case 'Payment received':
      return 'info'
    case 'Processing':
      return 'info'
    case 'Shipped':
      return 'ok'
    case 'Delivered':
      return 'ok'
    case 'Cancelled':
      return 'danger'
    default:
      return ''
  }
}

export function paymentLabel(method) {
  if (!method || method === 'bank_transfer') return 'Bank transfer'
  return String(method).replace(/_/g, ' ')
}

/** Suggested next status for one-click fulfillment */
export function nextOrderStatus(status) {
  const flow = [
    'Awaiting payment',
    'Payment received',
    'Processing',
    'Shipped',
    'Delivered',
  ]
  const i = flow.indexOf(status)
  if (i < 0 || i >= flow.length - 1) return null
  return flow[i + 1]
}

export function formatRelative(iso) {
  if (!iso) return '—'
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(iso)
}

export const PRODUCT_CATEGORIES = [
  { value: 'metabolic', label: 'Metabolic' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'growth', label: 'Growth' },
  { value: 'repair', label: 'Repair' },
]

export function fmtMoney(n) {
  const num = Number(n || 0)
  return `$${num.toFixed(2)}`
}

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
