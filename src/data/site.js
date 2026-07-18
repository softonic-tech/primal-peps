/**
 * Site-wide business & legal config.
 * Set VITE_BANK_* in .env for live bank transfer details.
 */
export const BANK_DETAILS = {
  accountName:
    import.meta.env.VITE_BANK_ACCOUNT_NAME || 'Primal Peps',
  bsb: import.meta.env.VITE_BANK_BSB || '000-000',
  accountNumber: import.meta.env.VITE_BANK_ACCOUNT || '00000000',
  bankName: import.meta.env.VITE_BANK_NAME || '',
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
