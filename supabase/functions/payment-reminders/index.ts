/**
 * Supabase Edge Function: unpaid PayID payment reminders.
 *
 * Deploy:
 *   supabase functions deploy payment-reminders --no-verify-jwt
 *
 * Secrets:
 *   supabase secrets set RESEND_API_KEY=... RESEND_FROM="Primal Peps <orders@primalpeps.shop>"
 *   optional: PAYMENT_REMINDER_HOURS=4
 *
 * Schedule with pg_cron — see admin/supabase/payment-reminders.sql
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

function escapeHtml(value: string) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function money(n: number) {
  return `$${Number(n || 0).toFixed(2)}`
}

function whatsappUrl(phone: string) {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : ''
}

function buildReminderEmail(
  order: Record<string, unknown>,
  items: Record<string, unknown>[],
  bank: Record<string, string>,
  contact: Record<string, string>,
) {
  const id = escapeHtml(String(order.id || ''))
  const phone = contact.phone || ''
  const wa = whatsappUrl(phone)
  const email = contact.email || ''

  const itemRows = (items || [])
    .map(
      (i) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #2a241c;color:#ece9e3">
          ${escapeHtml(String(i.name || ''))}<br>
          <span style="color:#9a9184;font-size:12px">${escapeHtml(String(i.variant_label || ''))} × ${escapeHtml(String(i.qty || ''))}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #2a241c;color:#f7c04a;text-align:right;white-space:nowrap">
          ${money(Number(i.price) * Number(i.qty))}
        </td>
      </tr>`,
    )
    .join('')

  const bankRows = [
    ['PayID', bank.payId],
    ['PayID name', bank.accountName],
  ]
    .filter(([, v]) => v)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 0;color:#9a9184">${escapeHtml(label)}</td><td style="padding:4px 0;color:#ece9e3;text-align:right">${escapeHtml(String(value))}</td></tr>`,
    )
    .join('')

  const help = wa || phone || email
    ? `<div style="margin-top:22px;padding:16px;border:1px solid #57431c;border-radius:12px;background:#1a1611">
        <p style="margin:0 0 8px;color:#e8a020;letter-spacing:.12em;font-size:11px;text-transform:uppercase">Need help?</p>
        <p style="margin:0 0 12px;color:#9a9184;font-size:13px;line-height:1.45">
          If you're facing any issue with PayID or payment, message us on WhatsApp — we're happy to help.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${
            wa
              ? `<tr><td style="padding:4px 0;color:#9a9184">WhatsApp</td><td style="padding:4px 0;text-align:right"><a href="${escapeHtml(wa)}" style="color:#f7c04a;text-decoration:none">${escapeHtml(phone || wa)}</a></td></tr>`
              : ''
          }
          ${
            email
              ? `<tr><td style="padding:4px 0;color:#9a9184">Email</td><td style="padding:4px 0;text-align:right"><a href="mailto:${escapeHtml(email)}" style="color:#f7c04a;text-decoration:none">${escapeHtml(email)}</a></td></tr>`
              : ''
          }
        </table>
        ${
          wa
            ? `<p style="margin:14px 0 0"><a href="${escapeHtml(wa)}" style="display:inline-block;padding:10px 16px;background:#25D366;color:#06240f;text-decoration:none;border-radius:10px;font-weight:bold;font-size:13px">Chat on WhatsApp</a></p>`
            : ''
        }
      </div>`
    : ''

  const html = `<!doctype html>
<html><body style="margin:0;background:#050504;color:#ece9e3;font-family:Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050504;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#12100c;border:1px solid #57431c;border-radius:16px;padding:28px">
        <tr><td>
          <p style="margin:0 0 6px;color:#e8a020;letter-spacing:.18em;font-size:11px;text-transform:uppercase">Primal Peps</p>
          <h1 style="margin:0 0 8px;font-size:28px;line-height:1.1;color:#ece9e3">Payment reminder</h1>
          <p style="margin:0 0 22px;color:#9a9184">Just a friendly reminder — order <strong style="color:#f7c04a">${id}</strong> is still awaiting your PayID transfer. Use the details below when you're ready.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows}</table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">
            <tr><td style="color:#9a9184;padding:4px 0">Subtotal</td><td style="text-align:right;color:#ece9e3">${money(Number(order.subtotal))}</td></tr>
            ${
              Number(order.discount) > 0
                ? `<tr><td style="color:#9a9184;padding:4px 0">Discount</td><td style="text-align:right;color:#ece9e3">-${money(Number(order.discount))}</td></tr>`
                : ''
            }
            <tr><td style="color:#9a9184;padding:4px 0">Shipping</td><td style="text-align:right;color:#ece9e3">${money(Number(order.shipping_fee))}</td></tr>
            <tr><td style="padding:10px 0 0;color:#ece9e3;font-weight:bold">Total</td><td style="padding:10px 0 0;text-align:right;color:#f7c04a;font-weight:bold">${money(Number(order.total))}</td></tr>
          </table>
          <p style="margin:22px 0 8px;color:#e8a020;letter-spacing:.12em;font-size:11px;text-transform:uppercase">Pay by PayID</p>
          <p style="margin:0 0 10px;color:#9a9184;font-size:13px">Use <strong style="color:#ece9e3">${id}</strong> as the payment reference.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${bankRows}</table>
          ${help}
          <p style="margin:22px 0 0;color:#6e675d;font-size:12px">Research use only. 18+.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

  const textLines = [
    `Just a friendly reminder — order ${order.id} is still awaiting your PayID transfer.`,
    '',
    `PayID: ${bank.payId || ''}`,
    `PayID name: ${bank.accountName || ''}`,
    `Reference: ${order.id}`,
    `Total: ${money(Number(order.total))}`,
    '',
    wa ? `Need help? WhatsApp: ${wa}` : '',
    email ? `Email: ${email}` : '',
    '',
    'Research use only. 18+.',
  ]

  return {
    subject: `Reminder: PayID for order ${order.id}`,
    html,
    text: textLines.filter(Boolean).join('\n'),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const resendKey = Deno.env.get('RESEND_API_KEY') || ''
    const from = Deno.env.get('RESEND_FROM') || ''
    const hoursRaw = Number(Deno.env.get('PAYMENT_REMINDER_HOURS') || 4)
    const hours = Number.isFinite(hoursRaw) && hoursRaw > 0 ? hoursRaw : 4

    if (!supabaseUrl || !serviceKey) {
      return Response.json(
        { error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' },
        { status: 503, headers: cors },
      )
    }
    if (!resendKey || !from) {
      return Response.json(
        { error: 'Missing RESEND_API_KEY or RESEND_FROM secrets' },
        { status: 503, headers: cors },
      )
    }

    // Allow service-role / cron calls; reject anonymous public hits.
    const auth = req.headers.get('Authorization') || ''
    const anon = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const cronSecret = Deno.env.get('CRON_SECRET') || ''
    const okAuth =
      auth === `Bearer ${serviceKey}` ||
      (cronSecret && auth === `Bearer ${cronSecret}`) ||
      (anon && auth === `Bearer ${anon}`)
    if (!okAuth) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
    const { data: orders, error } = await admin
      .from('orders')
      .select('*')
      .eq('status', 'Awaiting payment')
      .is('payment_reminder_sent_at', null)
      .lt('created_at', cutoff)
      .order('created_at', { ascending: true })
      .limit(40)

    if (error) {
      const missing = /payment_reminder_sent_at/i.test(error.message || '')
      return Response.json(
        {
          error: missing
            ? 'Run admin/supabase/payment-reminders.sql in Supabase first'
            : error.message,
        },
        { status: 500, headers: cors },
      )
    }

    const { data: settings } = await admin
      .from('site_settings')
      .select('bank, contact')
      .eq('id', 1)
      .maybeSingle()

    const bank = (settings?.bank || {}) as Record<string, string>
    const contact = (settings?.contact || {}) as Record<string, string>
    const results: Record<string, unknown>[] = []

    for (const order of orders || []) {
      const { data: items } = await admin
        .from('order_items')
        .select('*')
        .eq('order_id', order.id)

      const to = String(order.customer_email || '').trim()
      if (!to.includes('@')) {
        results.push({ orderId: order.id, ok: false, error: 'No customer email' })
        continue
      }

      const built = buildReminderEmail(order, items || [], bank, contact)
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject: built.subject,
          html: built.html,
          text: built.text,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        results.push({
          orderId: order.id,
          ok: false,
          error: data.message || data.error || 'Resend rejected',
        })
        continue
      }

      const { error: markErr } = await admin
        .from('orders')
        .update({ payment_reminder_sent_at: new Date().toISOString() })
        .eq('id', order.id)

      results.push({
        orderId: order.id,
        ok: true,
        emailId: data.id,
        marked: !markErr,
      })
    }

    return Response.json(
      {
        ok: true,
        hours,
        checked: (orders || []).length,
        sent: results.filter((r) => r.ok).length,
        results,
      },
      { headers: cors },
    )
  } catch (err) {
    return Response.json(
      { error: err?.message || 'Reminder job failed' },
      { status: 500, headers: cors },
    )
  }
})
