/**
 * Edge Function: order-email
 *
 * Builds + sends Primal Peps order emails via Resend (peplab-style).
 * Called from admin / storefront with supabase.functions.invoke — no CORS to storefront.
 *
 * Deploy:
 *   npx supabase functions deploy order-email --no-verify-jwt
 *
 * Secrets:
 *   RESEND_API_KEY
 *   RESEND_FROM_EMAIL   (or RESEND_FROM)
 *   optional RESEND_BCC
 *
 * SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are provided automatically.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const STATUS_FLAG: Record<string, string> = {
  'Awaiting payment': 'confirmation_email_sent',
  'Payment received': 'payment_email_sent',
  Processing: 'processing_email_sent',
  Shipped: 'shipped_email_sent',
  Delivered: 'delivered_email_sent',
  Cancelled: 'cancelled_email_sent',
}

type StatusCopy = {
  subject: (id: string) => string
  heading: string
  intro: (id: string) => string
  introText: (id: string) => string
  showBank: boolean
  bcc: boolean
}

const STATUS_COPY: Record<string, StatusCopy> = {
  'Awaiting payment': {
    subject: (id) => `Order ${id} — Primal Peps`,
    heading: 'Order confirmed',
    intro: (id) =>
      `Order <strong style="color:#f7c04a">${id}</strong> is awaiting your PayID transfer.`,
    introText: (id) => `Order ${id} is awaiting your PayID transfer.`,
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
      `Order <strong style="color:#f7c04a">${id}</strong> has shipped.`,
    introText: (id) => `Order ${id} has shipped.`,
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

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function escapeHtml(value: unknown) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function money(n: unknown) {
  return `$${Number(n || 0).toFixed(2)}`
}

function ausPostUrl(trackingNumber: string) {
  return `https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(trackingNumber)}`
}

function itemRows(items: Record<string, unknown>[]) {
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

function itemLines(items: Record<string, unknown>[]) {
  return (items || [])
    .map(
      (i) =>
        `- ${i.name} (${i.variant_label}) x${i.qty} — ${money(Number(i.price) * Number(i.qty))}`,
    )
    .join('\n')
}

function totalsHtml(order: Record<string, unknown>) {
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

function totalsText(order: Record<string, unknown>) {
  return [
    `Subtotal: ${money(order.subtotal)}`,
    Number(order.discount) > 0 ? `Discount: -${money(order.discount)}` : '',
    `Shipping: ${money(order.shipping_fee)}`,
    `Total: ${money(order.total)}`,
  ]
    .filter(Boolean)
    .join('\n')
}

function bankHtml(order: Record<string, unknown>, bank: Record<string, string>) {
  const rows = [
    ['PayID', bank.payId],
    ['PayID name', bank.accountName],
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

function bankText(bank: Record<string, string>) {
  return [
    bank.payId && `PayID: ${bank.payId}`,
    bank.accountName && `PayID name: ${bank.accountName}`,
  ]
    .filter(Boolean)
    .join('\n')
}

function trackingHtml(trackingNumber: string | null | undefined, replacement = false) {
  if (!trackingNumber) {
    return `<p style="margin:18px 0 0;color:#9a9184;font-size:13px">Tracking will follow shortly.</p>`
  }
  const url = ausPostUrl(trackingNumber)
  const label = replacement ? 'Updated tracking' : 'Tracking'
  return `
    <div style="margin:18px 0 0;padding:16px;border:1px solid #57431c;border-radius:12px;background:#0c0b09;text-align:center">
      <p style="margin:0 0 6px;color:#9a9184;font-size:11px;letter-spacing:.12em;text-transform:uppercase">${label}</p>
      <p style="margin:0 0 8px;color:#f7c04a;font-size:20px;font-weight:800;font-family:ui-monospace,Menlo,Consolas,monospace;letter-spacing:.03em">${escapeHtml(trackingNumber)}</p>
      <p style="margin:0 0 14px;color:#9a9184;font-size:13px">Carrier: <strong style="color:#ece9e3">Australia Post</strong></p>
      <a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 18px;background:linear-gradient(135deg,#f7c04a,#e8a020);color:#140d02;text-decoration:none;font-weight:700;border-radius:10px">Track shipment</a>
    </div>
    <p style="margin:14px 0 0;text-align:center;color:#9a9184;font-size:13px">Typical delivery: <strong style="color:#ece9e3">2–4 business days</strong> (Express) or <strong style="color:#ece9e3">5–8</strong> (Standard).</p>
  `
}

function trackingText(trackingNumber: string | null | undefined, replacement = false) {
  if (!trackingNumber) return 'Tracking will follow shortly.'
  const label = replacement ? 'Updated tracking' : 'Tracking'
  return [
    `${label}: ${trackingNumber}`,
    'Carrier: Australia Post',
    `Track: ${ausPostUrl(trackingNumber)}`,
  ].join('\n')
}

function wrapHtml(heading: string, introHtml: string, bodyHtml: string) {
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

function buildStatusEmail(
  order: Record<string, unknown>,
  items: Record<string, unknown>[],
  bank: Record<string, string>,
  status: string,
) {
  const copy = STATUS_COPY[status] || STATUS_COPY['Awaiting payment']
  const id = escapeHtml(order.id)
  const includeTracking = status === 'Shipped'
  const tracking = includeTracking
    ? trackingHtml(String(order.tracking_number || '') || null)
    : ''
  const trackingPlain = includeTracking
    ? trackingText(String(order.tracking_number || '') || null)
    : ''

  const html = wrapHtml(
    copy.heading,
    copy.intro(id),
    `${tracking}
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows(items)}</table>
     ${totalsHtml(order)}
     ${copy.showBank ? bankHtml(order, bank) : ''}`,
  )
  const text = [
    copy.introText(String(order.id)),
    trackingPlain,
    '',
    'Items',
    itemLines(items) || '- (none)',
    '',
    totalsText(order),
    copy.showBank
      ? `\nPay by PayID using your order ID as the reference:\n${bankText(bank)}`
      : '',
    '',
    'Research use only. 18+.',
  ]
    .filter((line) => line !== '')
    .join('\n')

  return {
    subject: copy.subject(String(order.id)),
    html,
    text,
    bcc: copy.bcc,
    kind: status,
    flag: STATUS_FLAG[status] || null,
  }
}

function buildReplacementEmail(order: Record<string, unknown>, trackingNumber: string) {
  const tn = String(trackingNumber || '').trim()
  const id = escapeHtml(order.id)
  return {
    subject: `Updated tracking — ${order.id}`,
    html: wrapHtml(
      'Updated tracking',
      `Here's an updated tracking number for order <strong style="color:#f7c04a">${id}</strong>.`,
      trackingHtml(tn, true),
    ),
    text: [
      `Updated tracking for order ${order.id}.`,
      '',
      trackingText(tn, true),
      '',
      'Research use only. 18+.',
    ].join('\n'),
    bcc: false,
    kind: 'replacement',
    flag: null as string | null,
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  try {
    const resendKey = Deno.env.get('RESEND_API_KEY') || ''
    const from =
      Deno.env.get('RESEND_FROM_EMAIL') ||
      Deno.env.get('RESEND_FROM') ||
      ''
    const bcc = Deno.env.get('RESEND_BCC') || ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    if (!resendKey || !from) {
      return json(503, {
        error:
          'Missing RESEND_API_KEY or RESEND_FROM_EMAIL on the function secrets',
      })
    }
    if (!supabaseUrl || !serviceKey) {
      return json(503, { error: 'Supabase service env missing on function' })
    }

    const body = (await req.json().catch(() => ({}))) as {
      orderId?: string
      status?: string
      kind?: string
      force?: boolean
      trackingNumber?: string
    }

    const orderId = String(body.orderId || '').trim()
    if (!orderId) return json(400, { error: 'Missing orderId' })

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: order, error: orderErr } = await admin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle()
    if (orderErr) return json(500, { error: orderErr.message })
    if (!order) return json(404, { error: 'Order not found' })

    const to = String(order.customer_email || '').trim()
    if (!to || !to.includes('@')) {
      return json(400, { error: 'Order has no customer email' })
    }

    const kind = String(body.kind || '').trim().toLowerCase()
    const force = Boolean(body.force)
    const overrideTracking = String(body.trackingNumber || '').trim()

    const [{ data: items }, { data: settings }] = await Promise.all([
      admin.from('order_items').select('*').eq('order_id', orderId),
      admin.from('site_settings').select('bank, contact').eq('id', 1).maybeSingle(),
    ])

    const bank = (settings?.bank || {}) as Record<string, string>
    let built: ReturnType<typeof buildStatusEmail>

    if (kind === 'replacement') {
      if (!overrideTracking) {
        return json(400, { error: 'Missing trackingNumber for replacement email' })
      }
      built = buildReplacementEmail(order, overrideTracking)
    } else {
      const requested = String(body.status || '').trim()
      const status = STATUS_COPY[requested] ? requested : String(order.status)
      const orderForEmail =
        status === 'Shipped' && overrideTracking
          ? { ...order, tracking_number: overrideTracking }
          : order
      built = buildStatusEmail(orderForEmail, items || [], bank, status)

      if (built.flag && order[built.flag] && !force) {
        return json(200, {
          ok: true,
          skipped: true,
          reason: 'already_sent',
          kind: built.kind,
          flag: built.flag,
        })
      }
    }

    const payload: Record<string, unknown> = {
      from,
      to: [to],
      subject: built.subject,
      html: built.html,
      text: built.text,
    }
    const copyTo = bcc || (settings?.contact as { email?: string } | null)?.email
    if (
      built.bcc &&
      copyTo &&
      String(copyTo).toLowerCase() !== to.toLowerCase()
    ) {
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
      return json(res.status === 403 ? 503 : 502, {
        error: data.message || data.error || 'Resend rejected the email',
      })
    }

    if (built.flag) {
      const { error: flagErr } = await admin
        .from('orders')
        .update({ [built.flag]: true })
        .eq('id', orderId)
      if (flagErr) {
        console.warn('[order-email] flag update failed:', flagErr.message)
      }
    }

    return json(200, {
      ok: true,
      emailId: data.id,
      kind: built.kind,
      flag: built.flag || null,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return json(500, { error: msg })
  }
})
