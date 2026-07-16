import { useCart } from '../context/CartContext'

export default function Footer() {
  const { toast } = useCart()

  const handleNewsletter = (e) => {
    e.preventDefault()
    toast('Subscribed ✓')
  }

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <span className="brand-name" style={{ fontSize: '1.7rem' }}>
              PRIMAL <span style={{ color: 'var(--gold)' }}>PEPS</span>
            </span>
            <p className="mission">
              Precision compounds. Verified quality. Built for serious research.
            </p>
            <div className="foot-badges">
              <span className="foot-badge">Lab tested</span>
              <span className="foot-badge">Secure shipping</span>
            </div>
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
              <a href="#offer">15% welcome offer</a>
              <a href="#points">Tiers &amp; perks</a>
            </div>
          </div>
          <div className="foot-col foot-support">
            <h5>Support</h5>
            <div className="foot-links">
              <a href="#">Shipping &amp; delivery</a>
              <a href="#">Contact us</a>
              <a href="#">FAQ</a>
              <a href="#">Terms &amp; privacy</a>
            </div>
          </div>
        </div>

        <div
          className="foot-ruo"
          id="disclaimer"
          aria-label="Research use disclaimer"
        >
          <span className="foot-ruo-badge" aria-hidden="true">
            RUO
          </span>
          <div className="foot-ruo-copy">
            <strong>Research Use Only</strong>
            <p>
              All products sold by Primal Peps are intended strictly for
              laboratory and research use only. They are not medicines,
              supplements, or therapeutic goods and are not intended for human
              or animal consumption.
            </p>
          </div>
        </div>

        <div className="legal">
          <span>© 2026 Primal Peps. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
