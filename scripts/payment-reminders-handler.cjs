/**
 * Find unpaid orders older than N hours and send one PayID reminder email each.
 */
const { createClient } = require('@supabase/supabase-js')
const {
  handleOrderEmail,
  resolveOrderEmailEnv,
} = require('./order-email-handler.cjs')

function resolveReminderEnv(env = process.env) {
  const hours = Number(env.PAYMENT_REMINDER_HOURS || 4)
  return {
    ...resolveOrderEmailEnv(env),
    hours: Number.isFinite(hours) && hours > 0 ? hours : 4,
    cronSecret: env.CRON_SECRET || '',
  }
}

function isAuthorized(req, cronSecret) {
  if (!cronSecret) {
    // Allow Vercel Cron without secret on Hobby; prefer setting CRON_SECRET in production.
    return Boolean(req.headers['x-vercel-cron']) || process.env.NODE_ENV !== 'production'
  }
  const auth = String(req.headers.authorization || '')
  if (auth === `Bearer ${cronSecret}`) return true
  // Vercel Cron may send this header
  if (req.headers['x-vercel-cron'] === '1') return true
  return false
}

async function handlePaymentReminders(req, env) {
  const { url, serviceKey, hours, cronSecret } = env

  if (!isAuthorized(req, cronSecret)) {
    return { status: 401, body: { error: 'Unauthorized' } }
  }

  if (!url || !serviceKey) {
    return { status: 503, body: { error: 'Supabase service key missing' } }
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  const { data: orders, error } = await admin
    .from('orders')
    .select('id, customer_email, created_at, status, payment_reminder_sent_at')
    .eq('status', 'Awaiting payment')
    .is('payment_reminder_sent_at', null)
    .lt('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(40)

  if (error) {
    const missingCol =
      /payment_reminder_sent_at/i.test(error.message || '') ||
      error.code === '42703'
    return {
      status: 500,
      body: {
        error: missingCol
          ? 'Run admin/supabase/payment-reminders.sql in Supabase first'
          : error.message,
      },
    }
  }

  const results = []
  for (const order of orders || []) {
    const sent = await handleOrderEmail(
      { orderId: order.id, status: 'Payment reminder' },
      env,
    )
    if (sent.status >= 200 && sent.status < 300) {
      const { error: markErr } = await admin
        .from('orders')
        .update({ payment_reminder_sent_at: new Date().toISOString() })
        .eq('id', order.id)
      results.push({
        orderId: order.id,
        ok: true,
        marked: !markErr,
        markError: markErr?.message || null,
      })
    } else {
      results.push({
        orderId: order.id,
        ok: false,
        error: sent.body?.error || 'Email failed',
      })
    }
  }

  return {
    status: 200,
    body: {
      ok: true,
      hours,
      checked: (orders || []).length,
      sent: results.filter((r) => r.ok).length,
      results,
    },
  }
}

module.exports = {
  handlePaymentReminders,
  resolveReminderEnv,
  isAuthorized,
}
