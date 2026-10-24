export const DEFAULT_SETTINGS = {
  bank: {
    accountName: 'A Akil',
    payId: '0400001235',
  },
  promo: {
    code: 'PRIMAL15',
    percent: 15,
    tiktokCode: 'TIKTOK50',
    tiktokPercent: 50,
    tiktokCodes: [{ label: 'TikTok reward', code: 'TIKTOK50', percent: 50 }],
  },
  shipping: {
    freeThreshold: 150,
  },
  points: {
    perDollar: 2,
  },
  social: {
    instagram: '',
    facebook: '',
    tiktok: '',
    youtube: '',
    x: '',
  },
  contact: {
    email: 'hello@primalpeps.com',
    phone: '+61449979054',
  },
  site: {
    tagline:
      'Precision compounds. Verified quality. Built for serious research.',
    supportNote: 'AU research peptides — lab tested, discrete shipping.',
    storefrontLive: true,
    comingSoonHeadline: 'COMING SOON',
    comingSoonBody:
      'The troop is assembling. Leave your email and we will let you know when Primal Peps goes live.',
  },
}

/** Normalize TikTok redeem codes (supports legacy single code fields). */
export function normalizeTikTokCodes(promo) {
  const raw = Array.isArray(promo?.tiktokCodes) ? promo.tiktokCodes : []
  const fromList = raw
    .map((row) => ({
      label: String(row?.label || '').trim(),
      code: String(row?.code || '')
        .trim()
        .toUpperCase(),
      percent: Math.min(90, Math.max(1, Number(row?.percent) || 50)),
    }))
    .filter((row) => row.code)

  if (fromList.length) {
    const seen = new Set()
    return fromList.filter((row) => {
      if (seen.has(row.code)) return false
      seen.add(row.code)
      return true
    })
  }

  const code =
    String(promo?.tiktokCode || 'TIKTOK50')
      .trim()
      .toUpperCase() || 'TIKTOK50'
  const percent = Math.min(
    90,
    Math.max(1, Number(promo?.tiktokPercent) || 50),
  )
  return [{ label: 'TikTok reward', code, percent }]
}

export function mergeSettings(row) {
  if (!row) return structuredClone(DEFAULT_SETTINGS)
  const rowPromo = row.promo || {}
  const promoMerged = {
    ...DEFAULT_SETTINGS.promo,
    ...rowPromo,
    percent: Number(rowPromo.percent ?? DEFAULT_SETTINGS.promo.percent),
    // Prefer DB list when present; otherwise rebuild from legacy fields only
    tiktokCodes: Array.isArray(rowPromo.tiktokCodes)
      ? rowPromo.tiktokCodes
      : undefined,
  }
  const tiktokCodes = normalizeTikTokCodes(promoMerged)
  const primary = tiktokCodes[0]
  return {
    bank: { ...DEFAULT_SETTINGS.bank, ...(row.bank || {}) },
    promo: {
      ...promoMerged,
      tiktokCodes,
      tiktokCode: primary.code,
      tiktokPercent: primary.percent,
    },
    shipping: {
      ...DEFAULT_SETTINGS.shipping,
      ...(row.shipping || {}),
      freeThreshold: Number(
        row.shipping?.freeThreshold ?? DEFAULT_SETTINGS.shipping.freeThreshold,
      ),
    },
    points: {
      ...DEFAULT_SETTINGS.points,
      ...(row.points || {}),
      perDollar: Number(
        row.points?.perDollar ?? DEFAULT_SETTINGS.points.perDollar,
      ),
    },
    social: { ...DEFAULT_SETTINGS.social, ...(row.social || {}) },
    contact: { ...DEFAULT_SETTINGS.contact, ...(row.contact || {}) },
    site: {
      ...DEFAULT_SETTINGS.site,
      ...(row.site || {}),
      storefrontLive:
        row.site?.storefrontLive ?? DEFAULT_SETTINGS.site.storefrontLive,
    },
  }
}
