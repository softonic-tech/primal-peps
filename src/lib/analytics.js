/**
 * GA4 ecommerce events via the GTM dataLayer.
 * Currency is AUD. Push { ecommerce: null } first so a previous event
 * does not leak into the next one.
 */

const CURRENCY = 'AUD'
const PURCHASE_FIRED_PREFIX = 'primal_ga4_purchase:'

function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100
}

function dataLayer() {
  if (typeof window === 'undefined') return null
  window.dataLayer = window.dataLayer || []
  return window.dataLayer
}

export function toGa4Items(items) {
  return (items || [])
    .map((item) => ({
      item_id: String(item.productId || item.id || ''),
      item_name: String(item.name || ''),
      item_variant: String(item.variantLabel || item.label || ''),
      price: roundMoney(item.price),
      quantity: Math.max(1, Math.floor(Number(item.qty ?? item.quantity) || 1)),
    }))
    .filter((item) => item.item_id && item.item_name)
}

export function pushEcommerce(event, ecommerce) {
  const layer = dataLayer()
  if (!layer) return
  const items = toGa4Items(ecommerce.items)
  if (!items.length) return
  layer.push({ ecommerce: null })
  layer.push({
    event,
    ecommerce: {
      currency: CURRENCY,
      value: roundMoney(ecommerce.value),
      ...(ecommerce.transaction_id
        ? { transaction_id: ecommerce.transaction_id }
        : {}),
      ...(ecommerce.payment_type ? { payment_type: ecommerce.payment_type } : {}),
      ...(ecommerce.shipping != null
        ? { shipping: roundMoney(ecommerce.shipping) }
        : {}),
      items,
    },
  })
}

export function trackViewItem({ itemId, itemName, itemVariant, price }) {
  const amount = roundMoney(price)
  pushEcommerce('view_item', {
    value: amount,
    items: [
      {
        id: itemId,
        name: itemName,
        variantLabel: itemVariant || '',
        price: amount,
        qty: 1,
      },
    ],
  })
}

export function trackAddToCart({ itemId, itemName, itemVariant, price, quantity }) {
  const qty = Math.max(1, Math.floor(Number(quantity) || 1))
  const amount = roundMoney(price)
  pushEcommerce('add_to_cart', {
    value: roundMoney(amount * qty),
    items: [
      {
        id: itemId,
        name: itemName,
        variantLabel: itemVariant || '',
        price: amount,
        qty,
      },
    ],
  })
}

export function trackBeginCheckout({ items, value }) {
  pushEcommerce('begin_checkout', { items, value })
}

export function trackAddPaymentInfo({ items, value, paymentType = 'payid' }) {
  pushEcommerce('add_payment_info', {
    items,
    value,
    payment_type: paymentType,
  })
}

function purchaseAlreadyFired(transactionId) {
  if (typeof window === 'undefined' || !transactionId) return false
  try {
    return sessionStorage.getItem(PURCHASE_FIRED_PREFIX + transactionId) === '1'
  } catch {
    return false
  }
}

export function trackPurchase({ transactionId, items, value, shipping }) {
  const id = String(transactionId || '').trim()
  if (!id || purchaseAlreadyFired(id)) return
  pushEcommerce('purchase', {
    transaction_id: id,
    items,
    value,
    shipping,
  })
  try {
    sessionStorage.setItem(PURCHASE_FIRED_PREFIX + id, '1')
  } catch {
    /* the event was still pushed */
  }
}
