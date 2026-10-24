import { useSettings } from '../context/SettingsContext'
import { normalizeSalePromo } from '../lib/settings'
import { useReveal } from '../hooks/useReveal'

export default function HalloweenSale() {
  const { promo } = useSettings()
  const sale = normalizeSalePromo(promo)
  const layoutRef = useReveal()

  if (!sale.enabled) return null

  return (
    <section className="halloween-sale-sec" id="halloween" aria-labelledby="halloween-heading">
      <div className="wrap halloween-sale-layout rv" ref={layoutRef}>
        <div className="halloween-sale-visual">
          <img
            src={sale.image}
            alt={`${sale.label} — ${sale.percent}% storewide`}
            width={900}
            height={1200}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="halloween-sale-copy">
          <p className="eyebrow">Limited time</p>
          <h2 id="halloween-heading" className="halloween-sale-title">
            Halloween <span className="gold">Sale</span>
          </h2>
          <p className="halloween-sale-lead">
            {sale.percent}% storewide. Use code{' '}
            <strong className="halloween-sale-code">{sale.code}</strong> at
            checkout — once per customer.
          </p>
          <div className="halloween-sale-actions">
            <a className="btn-primary" href="#shop">
              Shop {sale.percent}% off
            </a>
          </div>
          <p className="halloween-sale-foot">
            One-time use per email. Not a TikTok reward — no approval needed.
          </p>
        </div>
      </div>
    </section>
  )
}
