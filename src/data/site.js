/**
 * Site-wide business & legal config.
 * PayID is the primary payment method.
 */

export const SITE_URL = 'https://www.primalpeps.shop'
export const SITE_NAME = 'Primal Peps'
export const DEFAULT_TITLE = 'Primal Peps — Premium Research Peptides'
export const DEFAULT_DESCRIPTION =
  'Primal Peps — premium research peptides. Lab-tested vials, Australian PayID checkout, discreet shipping. Research use only · 18+.'
export const OG_IMAGE = `${SITE_URL}/og-image.png`
export const OG_IMAGE_ALT =
  'Primal Peps logo — roaring gorilla above metallic PRIMAL PEPS wordmark'

export const BANK_DETAILS = {
  accountName:
    import.meta.env.VITE_BANK_ACCOUNT_NAME || 'A Akil',
  payId: import.meta.env.VITE_PAY_ID || '0400001235',
}

export const LEGAL = {
  ageLine: 'You must be 18 years of age or older to purchase from Primal Peps.',
  ruoShort:
    'Not for human or veterinary consumption. Research use only.',
  ruoFull:
    'All products sold by Primal Peps are intended strictly for laboratory and research use only. They are not medicines, supplements, or therapeutic goods and are not intended for human or veterinary consumption or use.',
  checkoutAck:
    'I confirm I am 18 years of age or older, and that these products are for laboratory research use only — not for human or veterinary consumption.',
}
