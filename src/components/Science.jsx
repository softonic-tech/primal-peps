import { useReveal } from '../hooks/useReveal'

export default function Science() {
  const hairRef = useReveal({ threshold: 0.5 })
  const gridRef = useReveal()
  const coaRef = useReveal()

  return (
    <section className="science section" id="science">
      <div className="wrap">
        <div className="hairline rv" ref={hairRef} />
        <div className="science-grid rv" style={{ marginTop: 48 }} ref={gridRef}>
          <div className="science-copy">
            <span className="eyebrow">The lab standard</span>
            <h2>
              EVERY BATCH IS VERIFIED.
              <br />
              EVERY VIAL IS NUMBERED.
            </h2>
            <p className="serif">
              We don&apos;t cut corners. Every compound undergoes rigorous
              third-party testing before it reaches your research bench.
            </p>
          </div>
          <div className="cred-grid">
            <div className="cred-tile rv">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 3h6M10 3v6l-5 9a2.4 2.4 0 0 0 2.1 3.6h9.8A2.4 2.4 0 0 0 19 18l-5-9V3" />
              </svg>
              <h4>HPLC Verified</h4>
              <p>High-performance liquid chromatography on every batch</p>
            </div>
            <div className="cred-tile rv">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
              <h4>Mass Spec</h4>
              <p>Molecular weight confirmation via mass spectrometry</p>
            </div>
            <div className="cred-tile rv">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3l8 3v6c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V6l8-3z" />
              </svg>
              <h4>Endotoxin &lt; 5EU</h4>
              <p>LAL testing ensures endotoxin levels below threshold</p>
            </div>
            <div className="cred-tile rv">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
              </svg>
              <h4>99%+ Purity</h4>
              <p>Research-grade purity guaranteed on every vial</p>
            </div>
            <div className="cred-tile rv">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2v6M8 8l-4 4M16 8l4 4M12 22v-6" />
              </svg>
              <h4>USP Water</h4>
              <p>Lyophilized with pharmaceutical-grade USP water</p>
            </div>
            <div className="cred-tile rv">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <h4>Sealed Cold-Chain</h4>
              <p>Vacuum-sealed vials with cold-chain integrity</p>
            </div>
          </div>
        </div>
        <div className="coa-card rv" ref={coaRef}>
          <div className="coa-thumb">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6M9 15l2 2 4-4" />
            </svg>
            <span className="coa-seal">COA</span>
          </div>
          <div>
            <h4>Certificate of Analysis</h4>
            <p>
              Every batch comes with a downloadable COA documenting purity,
              identity, and endotoxin levels.
            </p>
            <a href="#" className="coa-link">
              Download sample COA →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
