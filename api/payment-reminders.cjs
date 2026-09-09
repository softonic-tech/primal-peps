/**
 * Vercel cron / GET|POST /api/payment-reminders
 * Sends PayID reminder emails for unpaid orders after PAYMENT_REMINDER_HOURS (default 4).
 */
const {
  handlePaymentReminders,
  resolveReminderEnv,
} = require('../scripts/payment-reminders-handler.cjs')

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const result = await handlePaymentReminders(
      req,
      resolveReminderEnv(process.env),
    )
    return res.status(result.status).json(result.body)
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Reminder job failed' })
  }
}
