import { useSettings } from '../context/SettingsContext'
import { normalizeSalePromo } from '../lib/settings'
import { useReveal } from '../hooks/useReveal'

export default function BlackFridaySale() {
  const { promo } = useSettings()
  const sale = normalizeSalePromo(promo)
  const layoutRef = useReveal()

  if (!sale.enabled) return null

  return (
    <section
      className="bf-sale-sec"
      id="black-friday"
      aria-labelledby="bf-sale-heading"
    >
      <div className="bf-sale-plane" aria-hidden="true" />
      <div className="wrap bf-sale-layout rv" ref={layoutRef}>
        {sale.image ? (
          <div className="bf-sale-visual">
            <img
              src={sale.image}
              alt={`${sale.label} — ${sale.percent}% storewide`}
              width={1200}
              height={800}
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : (
          <div className="bf-sale-mark" aria-hidden="true">
            <span className="bf-sale-mark-kicker">Primal Peps</span>
            <span className="bf-sale-mark-pct">{sale.percent}%</span>
            <span className="bf-sale-mark-off">OFF</span>
          </div>
        )}
        <div className="bf-sale-copy">
          <p className="eyebrow">Limited time</p>
          <h2 id="bf-sale-heading" className="bf-sale-title">
            Black Friday <span className="gold">Sale</span>
          </h2>
          <p className="bf-sale-lead">
            {sale.percent}% storewide. Use code{' '}
            <strong className="bf-sale-code">{sale.code}</strong> at checkout —
            once per customer.
          </p>
          <div className="bf-sale-actions">
            <a className="btn-primary" href="#shop">
              Shop {sale.percent}% off
            </a>
          </div>
          <p className="bf-sale-foot">
            One-time use per email. Not a TikTok reward — no approval needed.
          </p>
        </div>
      </div>
    </section>
  )
}
