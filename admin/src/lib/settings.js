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
    saleEnabled: true,
    saleCode: 'HALLOWEEN30',
    salePercent: 30,
    saleLabel: 'Halloween sale',
    saleImage: '/halloween-sale.jpg',
  },
  shipping: {
    freeThreshold: 150,
    freeBacThreshold: 300,
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

/** Storewide seasonal sale (not TikTok-gated). One-time use enforced at checkout. */
export function normalizeSalePromo(promo) {
  const code =
    String(promo?.saleCode ?? DEFAULT_SETTINGS.promo.saleCode)
      .trim()
      .toUpperCase() || 'HALLOWEEN30'
  const percent = Math.min(
    90,
    Math.max(
      1,
      Number(promo?.salePercent ?? DEFAULT_SETTINGS.promo.salePercent) || 30,
    ),
  )
  const label =
    String(promo?.saleLabel ?? DEFAULT_SETTINGS.promo.saleLabel).trim() ||
    'Halloween sale'
  const image =
    String(promo?.saleImage ?? DEFAULT_SETTINGS.promo.saleImage).trim() ||
    '/halloween-sale.jpg'
  const enabled = promo?.saleEnabled !== false && Boolean(code) && percent > 0
  return { enabled, code, percent, label, image }
}

/** Normalize TikTok redeem codes (supports legacy single code fields). */
export function normalizeTikTokCodes(promo) {
  const saleCode = normalizeSalePromo(promo).code
  const raw = Array.isArray(promo?.tiktokCodes) ? promo.tiktokCodes : []
  const fromList = raw
    .map((row) => ({
      label: String(row?.label || '').trim(),
      code: String(row?.code || '')
        .trim()
        .toUpperCase(),
      percent: Math.min(90, Math.max(1, Number(row?.percent) || 50)),
    }))
    .filter((row) => row.code && row.code !== saleCode)

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
  if (code === saleCode) {
    return [{ label: 'TikTok reward', code: 'TIKTOK50', percent: 50 }]
  }
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
  const sale = normalizeSalePromo(promoMerged)
  const promoWithSale = {
    ...promoMerged,
    saleEnabled: sale.enabled,
    saleCode: sale.code,
    salePercent: sale.percent,
    saleLabel: sale.label,
    saleImage: sale.image,
  }
  const tiktokCodes = normalizeTikTokCodes(promoWithSale)
  const primary = tiktokCodes[0]
  return {
    bank: { ...DEFAULT_SETTINGS.bank, ...(row.bank || {}) },
    promo: {
      ...promoWithSale,
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
      freeBacThreshold: Number(
        row.shipping?.freeBacThreshold ??
          DEFAULT_SETTINGS.shipping.freeBacThreshold,
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
