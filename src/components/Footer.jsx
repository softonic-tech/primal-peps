import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { LEGAL } from '../data/site'

const SOCIAL_LABELS = [
  ['instagram', 'Instagram'],
  ['facebook', 'Facebook'],
  ['tiktok', 'TikTok'],
  ['youtube', 'YouTube'],
  ['x', 'X'],
]

export default function Footer() {
  const { toast, promoPercent } = useCart()
  const { site, social, contact } = useSettings()

  const handleNewsletter = (e) => {
    e.preventDefault()
    toast('Subscribed ✓')
  }

  const links = SOCIAL_LABELS.filter(([key]) => social[key]?.trim())

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <span className="brand-name" style={{ fontSize: '1.7rem' }}>
              PRIMAL <span style={{ color: 'var(--gold)' }}>PEPS</span>
            </span>
            <p className="mission">{site.tagline}</p>
            <div className="foot-badges">
              <span className="foot-badge">Lab tested</span>
              <span className="foot-badge">18+ only</span>
              <span className="foot-badge">Research use only</span>
            </div>
            {links.length > 0 && (
              <div className="foot-social">
                {links.map(([key, label]) => (
                  <a
                    key={key}
                    href={social[key]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
            <form className="foot-newsletter" onSubmit={handleNewsletter}>
              <input
                type="email"
                placeholder="Email for updates"
                aria-label="Newsletter email"
              />
              <button type="submit">Join</button>
            </form>
          </div>
          <div className="foot-col">
            <h5>Shop</h5>
            <div className="foot-links">
              <a href="#shop">All peptides</a>
              <a href="#shop">Recovery</a>
              <a href="#shop">Metabolic</a>
              <a href="#shop">Skin &amp; glow</a>
            </div>
          </div>
          <div className="foot-col">
            <h5>Rewards</h5>
            <div className="foot-links">
              <a href="#points">Primal Points</a>
              <a href="#offer">{promoPercent}% welcome offer</a>
              <a href="#points">Tiers &amp; perks</a>
            </div>
          </div>
          <div className="foot-col foot-support">
            <h5>Support</h5>
            <div className="foot-links">
              <a href="#shipping">Shipping &amp; delivery</a>
              <a href="#faq">FAQ</a>
              <a href="#disclaimer">Legal disclaimer</a>
              {contact.email && (
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`}>{contact.phone}</a>
              )}
            </div>
          </div>
        </div>

        <section
          className="foot-legal"
          id="disclaimer"
          aria-label="Research use and age disclaimer"
        >
          <div className="foot-legal-rail" aria-hidden="true" />
          <header className="foot-legal-head">
            <span className="foot-legal-kicker">Important notice</span>
            <h3>Laboratory research compounds</h3>
          </header>

          <div className="foot-legal-grid">
            <article className="foot-legal-card">
              <div className="foot-legal-mark">
                <span className="foot-legal-code">RUO</span>
                <span className="foot-legal-title">Research use only</span>
              </div>
              <p>{LEGAL.ruoFull}</p>
            </article>

            <article className="foot-legal-card">
              <div className="foot-legal-mark">
                <span className="foot-legal-code">18+</span>
                <span className="foot-legal-title">Age requirement</span>
              </div>
              <p>
                {LEGAL.ageLine} By purchasing, you acknowledge that you meet
                this requirement. We do not verify age at checkout beyond your
                acknowledgement.
              </p>
            </article>
          </div>

          <p className="foot-legal-foot">
            {site.supportNote ||
              'Not for human or veterinary consumption or use.'}
          </p>
        </section>

        <div className="legal">
          <span>© 2026 Primal Peps. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
