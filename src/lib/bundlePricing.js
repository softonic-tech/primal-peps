/** Volume bundle tiers — highest matching qty wins. */
export const BUNDLE_TIERS = [
  { qty: 1, savePercent: 0, tag: 'Single' },
  { qty: 2, savePercent: 5, tag: 'Save 5%' },
  { qty: 5, savePercent: 10, tag: 'Save 10%' },
  { qty: 10, savePercent: 20, tag: 'Save 20%', bestValue: true },
]

function round2(n) {
  return Math.round(Number(n) * 100) / 100
}

/** Save % for a line quantity (highest matching tier). */
export function bundleSavePercent(qty) {
  const q = Math.floor(Math.max(0, Number(qty) || 0))
  let save = 0
  for (const tier of BUNDLE_TIERS) {
    if (q >= tier.qty) save = tier.savePercent
  }
  return save
}

/** Per-vial price after volume discount. */
export function bundleUnitPrice(basePrice, qty) {
  const base = Number(basePrice) || 0
  const save = bundleSavePercent(qty)
  return round2(base * (1 - save / 100))
}

/** Line total after volume discount. */
export function bundleLineTotal(basePrice, qty) {
  const q = Math.floor(Math.max(0, Number(qty) || 0))
  return round2(bundleUnitPrice(basePrice, q) * q)
}

export function getBundleTier(qty) {
  const q = Math.floor(Math.max(1, Number(qty) || 1))
  let match = BUNDLE_TIERS[0]
  for (const tier of BUNDLE_TIERS) {
    if (q >= tier.qty) match = tier
  }
  return match
}
