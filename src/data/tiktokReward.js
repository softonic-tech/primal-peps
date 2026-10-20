/** TikTok UGC reward — pay first, then post + DM for 50% off next order. */

export const TIKTOK_REWARD_PERCENT = 50

/** Default handle when site settings.social.tiktok is empty */
export const DEFAULT_TIKTOK_HANDLE = '@primalpepsaus'

export function normalizeTikTokHandle(raw) {
  const s = String(raw || '').trim()
  if (!s) return DEFAULT_TIKTOK_HANDLE
  if (s.startsWith('http')) {
    try {
      const path = new URL(s).pathname.replace(/\/+$/, '')
      const user = path.split('/').filter(Boolean).pop()
      if (user) return user.startsWith('@') ? user : `@${user}`
    } catch {
      /* ignore */
    }
  }
  return s.startsWith('@') ? s : `@${s.replace(/^@/, '')}`
}

export function tiktokProfileUrl(handle) {
  const h = normalizeTikTokHandle(handle).replace(/^@/, '')
  return `https://www.tiktok.com/@${h}`
}

export function whatsappDmUrl(phone, handle = DEFAULT_TIKTOK_HANDLE) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''
  const tag = normalizeTikTokHandle(handle)
  const text = encodeURIComponent(
    `Hi Primal Peps — I completed my first order and posted a TikTok tagging ${tag}. Here's my video link: `,
  )
  return `https://wa.me/${digits}?text=${text}`
}

export const TIKTOK_REWARD = {
  eyebrow: 'TikTok reward',
  title: '50% off your next order',
  short:
    'Pay for your first order, then post a TikTok tagging us and DM the link — get 50% off your next order.',
  announce:
    'TikTok tip: pay first → post & tag us → DM the link → 50% off your next order',
  lead:
    'Place and pay for your first order. After it arrives, film a short TikTok showing your Primal Peps order, recommend us, and tag our account. Then DM us the video link — once we confirm, your next order is 50% off.',
  steps: [
    {
      n: '1',
      title: 'Pay & receive',
      body: 'Complete checkout and wait until your first order arrives.',
    },
    {
      n: '2',
      title: 'Post on TikTok',
      body: 'Show your order, recommend us, and tag our TikTok.',
    },
    {
      n: '3',
      title: 'DM the link',
      body: 'Message us on WhatsApp with your TikTok video link for manual review.',
    },
    {
      n: '4',
      title: 'Save 50%',
      body: 'After we approve, your next order gets 50% off.',
    },
  ],
  footnote:
    'Reward applies to your next paid order after approval. Video must be public and tag us. Offer may be withdrawn anytime.',
}

/** Plain-text block for emails */
export function tiktokRewardEmailText(handle = DEFAULT_TIKTOK_HANDLE) {
  const tag = normalizeTikTokHandle(handle)
  return [
    '— TikTok reward —',
    'Get 50% off your NEXT order:',
    '1) Pay for this order and wait until it arrives',
    `2) Post a TikTok showing your order, recommend us, and tag ${tag}`,
    '3) DM us the video link on WhatsApp for manual review',
    '4) Once approved, your next order is 50% off',
    'Important: you must pay first — the discount is for a future order only.',
  ].join('\n')
}

export function tiktokRewardEmailHtml(handle = DEFAULT_TIKTOK_HANDLE) {
  const tag = normalizeTikTokHandle(handle)
  return `
    <div style="margin:22px 0 0;padding:16px;border:1px solid #57431c;border-radius:12px;background:#0c0b09">
      <p style="margin:0 0 6px;color:#e8a020;letter-spacing:.12em;font-size:11px;text-transform:uppercase">TikTok reward</p>
      <p style="margin:0 0 10px;color:#ece9e3;font-size:16px;font-weight:700">Get 50% off your next order</p>
      <p style="margin:0 0 12px;color:#9a9184;font-size:13px;line-height:1.55">
        Pay for this order first and wait until it arrives. Then post a TikTok showing your Primal Peps order, recommend us, and tag <strong style="color:#f7c04a">${tag}</strong>.
        DM us the video link on WhatsApp — after we manually confirm, your <strong style="color:#ece9e3">next</strong> order is 50% off.
      </p>
      <p style="margin:0;color:#6e675d;font-size:12px;line-height:1.45">
        Important: this is not a free first order. Pay now → post after delivery → discount on order #2+.
      </p>
    </div>`
}
