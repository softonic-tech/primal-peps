/**
 * Shared order emails for Vite middleware and Vercel.
 * Sends via Resend — confirmation on checkout, then status updates from admin.
 */
const { createClient } = require('@supabase/supabase-js')

const STATUS_COPY = {
  'Awaiting payment': {
    subject: (id) => `Order ${id} — Primal Peps`,
    heading: 'Order confirmed',
    intro: (id) =>
      `Order <strong style="color:#f7c04a">${id}</strong> is awaiting your bank transfer.`,
    introText: (id) => `Order ${id} is awaiting your bank transfer.`,
    showBank: true,
    bcc: true,
  },
  'Payment received': {
    subject: (id) => `Payment received — ${id}`,
    heading: 'Payment received',
    intro: (id) =>
      `We've received payment for order <strong style="color:#f7c04a">${id}</strong>. We'll start preparing it shortly.`,
    introText: (id) =>
      `We've received payment for order ${id}. We'll start preparing it shortly.`,
    showBank: false,
    bcc: false,
  },
  Processing: {
    subject: (id) => `Order ${id} is being prepared`,
    heading: 'Preparing your order',
    intro: (id) =>
      `Order <strong style="color:#f7c04a">${id}</strong> is being packed. We'll email you when it ships.`,
    introText: (id) =>
      `Order ${id} is being packed. We'll email you when it ships.`,
    showBank: false,
    bcc: false,
  },
  Shipped: {
    subject: (id) => `Order ${id} has shipped`,
    heading: 'On the way',
    intro: (id) =>
      `Order <strong style="color:#f7c04a">${id}</strong> has shipped. Delivery follows the method you chose at checkout.`,
    introText: (id) =>
      `Order ${id} has shipped. Delivery follows the method you chose at checkout.`,
    showBank: false,
    bcc: false,
  },
  Delivered: {
    subject: (id) => `Order ${id} delivered`,
    heading: 'Delivered',
    intro: (id) =>
      `Order <strong style="color:#f7c04a">${id}</strong> is marked as delivered. Thanks for ordering with Primal Peps.`,
    introText: (id) =>
      `Order ${id} is marked as delivered. Thanks for ordering with Primal Peps.`,
    showBank: false,
    bcc: false,
  },
  Cancelled: {
    subject: (id) => `Order ${id} cancelled`,
    heading: 'Order cancelled',
    intro: (id) =>
      `Order <strong style="color:#f7c04a">${id}</strong> has been cancelled. If you already transferred funds, reply to this email and we'll help.`,
    introText: (id) =>
      `Order ${id} has been cancelled. If you already transferred funds, reply to this email and we'll help.`,
    showBank: false,
    bcc: true,
  },
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function money(n) {
  return `$${Number(n || 0).toFixed(2)}`
}

function itemLines(items) {
  return (items || [])
    .map(
      (i) =>
        `- ${i.name} (${i.variant_label}) x${i.qty} — ${money(Number(i.price) * Number(i.qty))}`,
    )
    .join('\n')
}

function itemRows(items) {
  return (items || [])
    .map(
      (i) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #2a241c;color:#ece9e3">
          ${escapeHtml(i.name)}<br>
          <span style="color:#9a9184;font-size:12px">${escapeHtml(i.variant_label)} × ${escapeHtml(i.qty)}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #2a241c;color:#f7c04a;text-align:right;white-space:nowrap">
          ${money(Number(i.price) * Number(i.qty))}
        </td>
      </tr>`,
    )
    .join('')
}

function totalsText(order) {
  return [
    `Subtotal: ${money(order.subtotal)}`,
    Number(order.discount) > 0 ? `Discount: -${money(order.discount)}` : '',
    `Shipping: ${money(order.shipping_fee)}`,
    `Total: ${money(order.total)}`,
  ]
    .filter(Boolean)
    .join('\n')
}

function totalsHtml(order) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">
    <tr><td style="color:#9a9184;padding:4px 0">Subtotal</td><td style="text-align:right;color:#ece9e3">${money(order.subtotal)}</td></tr>
    ${
      Number(order.discount) > 0
        ? `<tr><td style="color:#9a9184;padding:4px 0">Discount</td><td style="text-align:right;color:#ece9e3">-${money(order.discount)}</td></tr>`
        : ''
    }
    <tr><td style="color:#9a9184;padding:4px 0">Shipping</td><td style="text-align:right;color:#ece9e3">${money(order.shipping_fee)}</td></tr>
    <tr><td style="padding:10px 0 0;color:#ece9e3;font-weight:bold">Total</td><td style="padding:10px 0 0;text-align:right;color:#f7c04a;font-weight:bold">${money(order.total)}</td></tr>
  </table>`
}

function bankText(bank) {
  return [
    bank.accountName && `Account name: ${bank.accountName}`,
    bank.bankName && `Bank: ${bank.bankName}`,
    bank.bsb && `BSB: ${bank.bsb}`,
    bank.accountNumber && `Account number: ${bank.accountNumber}`,
  ]
    .filter(Boolean)
    .join('\n')
}

function bankHtml(order, bank) {
  const rows = [
    ['Account name', bank.accountName],
    ['Bank', bank.bankName],
    ['BSB', bank.bsb],
    ['Account number', bank.accountNumber],
  ]
    .filter(([, v]) => v)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 0;color:#9a9184">${escapeHtml(label)}</td><td style="padding:4px 0;color:#ece9e3;text-align:right">${escapeHtml(value)}</td></tr>`,
    )
    .join('')
  return `<p style="margin:22px 0 8px;color:#e8a020;letter-spacing:.12em;font-size:11px;text-transform:uppercase">Bank transfer</p>
    <p style="margin:0 0 10px;color:#9a9184;font-size:13px">Use <strong style="color:#ece9e3">${escapeHtml(order.id)}</strong> as the payment reference.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`
}

function wrapHtml(heading, introHtml, bodyHtml) {
  return `<!doctype html>
<html><body style="margin:0;background:#050504;color:#ece9e3;font-family:Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050504;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#12100c;border:1px solid #57431c;border-radius:16px;padding:28px">
        <tr><td>
          <p style="margin:0 0 6px;color:#e8a020;letter-spacing:.18em;font-size:11px;text-transform:uppercase">Primal Peps</p>
          <h1 style="margin:0 0 8px;font-size:28px;line-height:1.1;color:#ece9e3">${escapeHtml(heading)}</h1>
          <p style="margin:0 0 22px;color:#9a9184">${introHtml}</p>
          ${bodyHtml}
          <p style="margin:22px 0 0;color:#6e675d;font-size:12px">Research use only. 18+.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function buildEmail(order, items, bank, status) {
  const copy = STATUS_COPY[status] || STATUS_COPY['Awaiting payment']
  const id = escapeHtml(order.id)
  const html = wrapHtml(
    copy.heading,
    copy.intro(id),
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows(items)}</table>
     ${totalsHtml(order)}
     ${copy.showBank ? bankHtml(order, bank) : ''}`,
  )
  const text = [
    copy.introText(order.id),
    '',
    'Items',
    itemLines(items) || '- (none)',
    '',
    totalsText(order),
    copy.showBank
      ? `\nPay by bank transfer using your order ID as the reference:\n${bankText(bank)}`
      : '',
    '',
    'Research use only. 18+.',
  ]
    .filter((line) => line !== '')
    .join('\n')

  return {
    subject: copy.subject(order.id),
    html,
    text,
    bcc: copy.bcc,
  }
}

function resolveOrderEmailEnv(env = process.env) {
  return {
    url: env.VITE_SUPABASE_URL || env.SUPABASE_URL || '',
    serviceKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
    resendKey: env.RESEND_API_KEY || '',
    from: env.RESEND_FROM || '',
    bcc: env.RESEND_BCC || '',
  }
}

async function handleOrderEmail(body, env) {
  const { url, serviceKey, resendKey, from, bcc } = env
  if (!resendKey || !from) {
    return {
      status: 503,
      body: {
        error:
          'Email not configured — set RESEND_API_KEY and RESEND_FROM in .env (and Vercel)',
      },
    }
  }
  if (!url || !serviceKey) {
    return {
      status: 503,
      body: { error: 'Supabase service key missing' },
    }
  }

  const orderId = String(body.orderId || '').trim()
  if (!orderId) {
    return { status: 400, body: { error: 'Missing orderId' } }
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: order, error: orderErr } = await admin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle()
  if (orderErr) return { status: 500, body: { error: orderErr.message } }
  if (!order) return { status: 404, body: { error: 'Order not found' } }

  const to = String(order.customer_email || '').trim()
  if (!to || !to.includes('@')) {
    return { status: 400, body: { error: 'Order has no customer email' } }
  }

  const requested = String(body.status || '').trim()
  const status = STATUS_COPY[requested] ? requested : order.status

  const [{ data: items }, { data: settings }] = await Promise.all([
    admin.from('order_items').select('*').eq('order_id', orderId),
    admin.from('site_settings').select('bank, contact').eq('id', 1).maybeSingle(),
  ])

  const built = buildEmail(order, items || [], settings?.bank || {}, status)
  const payload = {
    from,
    to: [to],
    subject: built.subject,
    html: built.html,
    text: built.text,
  }
  const copyTo = bcc || settings?.contact?.email
  if (built.bcc && copyTo && copyTo.toLowerCase() !== to.toLowerCase()) {
    payload.bcc = [copyTo]
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return {
      status: res.status === 403 ? 503 : 502,
      body: { error: data.message || data.error || 'Resend rejected the email' },
    }
  }

  return { status: 200, body: { ok: true, emailId: data.id, kind: status } }
}

module.exports = { handleOrderEmail, resolveOrderEmailEnv }
