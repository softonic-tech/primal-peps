export const DEFAULT_SETTINGS = {
  bank: {
    accountName: 'Primal Peps',
    bsb: '000-000',
    accountNumber: '00000000',
    bankName: '',
  },
  promo: {
    code: 'PRIMAL15',
    percent: 15,
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
    phone: '',
  },
  site: {
    tagline:
      'Precision compounds. Verified quality. Built for serious research.',
    supportNote: 'AU research peptides — lab tested, discrete shipping.',
  },
}

export function mergeSettings(row) {
  if (!row) return structuredClone(DEFAULT_SETTINGS)
  return {
    bank: { ...DEFAULT_SETTINGS.bank, ...(row.bank || {}) },
    promo: {
      ...DEFAULT_SETTINGS.promo,
      ...(row.promo || {}),
      percent: Number(row.promo?.percent ?? DEFAULT_SETTINGS.promo.percent),
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
    site: { ...DEFAULT_SETTINGS.site, ...(row.site || {}) },
  }
}
