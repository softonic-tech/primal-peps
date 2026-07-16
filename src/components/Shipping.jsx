import { useReveal } from '../hooks/useReveal'

export default function Shipping() {
  const hairRef = useReveal({ threshold: 0.5 })
  const headRef = useReveal()
  const timelineRef = useReveal()
  const noteRef = useReveal()

  return (
    <section className="shipping section">
      <div className="wrap">
        <div className="hairline rv" ref={hairRef} />
        <div className="shipping-head rv" style={{ marginTop: 48 }} ref={headRef}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>
            Fulfillment
          </span>
          <h2>HOW IT SHIPS</h2>
        </div>
        <div className="timeline rv" ref={timelineRef}>
          <div className="tl-step">
            <div className="tl-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div className="tl-num">01</div>
            <h4>Order</h4>
            <p>Place your order — we process within hours, not days.</p>
          </div>
          <div className="tl-step">
            <div className="tl-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </div>
            <div className="tl-num">02</div>
            <h4>Lab-Sealed</h4>
            <p>Every vial is vacuum-sealed and packed with care.</p>
          </div>
          <div className="tl-step">
            <div className="tl-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
                <circle cx="7" cy="18" r="1.8" />
                <circle cx="17.5" cy="18" r="1.8" />
              </svg>
            </div>
            <div className="tl-num">03</div>
            <h4>Discreet 24h Dispatch</h4>
            <p>Plain packaging, tracked delivery, ships within 24 hours.</p>
          </div>
        </div>
        <p className="shipping-note rv" ref={noteRef}>
          Tracking on every order — no exceptions.
        </p>
      </div>
    </section>
  )
}
