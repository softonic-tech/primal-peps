/**
 * Shared order-confirmation email for Vite middleware and Vercel.
 * Sends via Resend after an order exists in Supabase.
 */
const { createClient } = require('@supabase/supabase-js')

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

function buildText(order, items, bank) {
  const lines = (items || [])
    .map(
      (i) =>
        `- ${i.name} (${i.variant_label}) x${i.qty} — ${money(Number(i.price) * Number(i.qty))}`,
    )
    .join('\n')
  const bankLines = [
    bank.accountName && `Account name: ${bank.accountName}`,
    bank.bankName && `Bank: ${bank.bankName}`,
    bank.bsb && `BSB: ${bank.bsb}`,
    bank.accountNumber && `Account number: ${bank.accountNumber}`,
  ]
    .filter(Boolean)
    .join('\n')

  return [
    `Thanks for your order ${order.id}.`,
    '',
    'Items',
    lines || '- (none)',
    '',
    `Subtotal: ${money(order.subtotal)}`,
    Number(order.discount) > 0 ? `Discount: -${money(order.discount)}` : '',
    `Shipping: ${money(order.shipping_fee)}`,
    `Total: ${money(order.total)}`,
    '',
    'Pay by bank transfer using your order ID as the reference:',
    bankLines,
    '',
    'We will confirm payment and ship once funds arrive.',
    'Research use only. 18+.',
  ]
    .filter((line) => line !== '')
    .join('\n')
}

function buildHtml(order, items, bank) {
  const rows = (items || [])
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

  const bankRows = [
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

  return `<!doctype html>
<html><body style="margin:0;background:#050504;color:#ece9e3;font-family:Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050504;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#12100c;border:1px solid #57431c;border-radius:16px;padding:28px">
        <tr><td>
          <p style="margin:0 0 6px;color:#e8a020;letter-spacing:.18em;font-size:11px;text-transform:uppercase">Primal Peps</p>
          <h1 style="margin:0 0 8px;font-size:28px;line-height:1.1;color:#ece9e3">Order confirmed</h1>
          <p style="margin:0 0 22px;color:#9a9184">Order <strong style="color:#f7c04a">${escapeHtml(order.id)}</strong> is awaiting your bank transfer.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">
            <tr><td style="color:#9a9184;padding:4px 0">Subtotal</td><td style="text-align:right;color:#ece9e3">${money(order.subtotal)}</td></tr>
            ${
              Number(order.discount) > 0
                ? `<tr><td style="color:#9a9184;padding:4px 0">Discount</td><td style="text-align:right;color:#ece9e3">-${money(order.discount)}</td></tr>`
                : ''
            }
            <tr><td style="color:#9a9184;padding:4px 0">Shipping</td><td style="text-align:right;color:#ece9e3">${money(order.shipping_fee)}</td></tr>
            <tr><td style="padding:10px 0 0;color:#ece9e3;font-weight:bold">Total</td><td style="padding:10px 0 0;text-align:right;color:#f7c04a;font-weight:bold">${money(order.total)}</td></tr>
          </table>
          <p style="margin:22px 0 8px;color:#e8a020;letter-spacing:.12em;font-size:11px;text-transform:uppercase">Bank transfer</p>
          <p style="margin:0 0 10px;color:#9a9184;font-size:13px">Use <strong style="color:#ece9e3">${escapeHtml(order.id)}</strong> as the payment reference.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${bankRows}</table>
          <p style="margin:22px 0 0;color:#6e675d;font-size:12px">Research use only. 18+.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
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

  const [{ data: items }, { data: settings }] = await Promise.all([
    admin.from('order_items').select('*').eq('order_id', orderId),
    admin.from('site_settings').select('bank, contact').eq('id', 1).maybeSingle(),
  ])

  const bank = settings?.bank || {}
  const html = buildHtml(order, items || [], bank)
  const text = buildText(order, items || [], bank)
  const payload = {
    from,
    to: [to],
    subject: `Order ${order.id} — Primal Peps`,
    html,
    text,
  }
  const copyTo = bcc || settings?.contact?.email
  if (copyTo && copyTo.toLowerCase() !== to.toLowerCase()) {
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

  return { status: 200, body: { ok: true, emailId: data.id } }
}

module.exports = { handleOrderEmail, resolveOrderEmailEnv }
