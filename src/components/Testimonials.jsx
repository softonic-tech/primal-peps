import { useReveal } from '../hooks/useReveal'

export default function Testimonials() {
  const hairRef = useReveal({ threshold: 0.5 })
  const statRef = useReveal()
  const q1 = useReveal()
  const q2 = useReveal()
  const q3 = useReveal()

  return (
    <section className="testimonials section">
      <div className="wrap">
        <div className="hairline rv" ref={hairRef} />
        <div className="testi-stat rv" style={{ marginTop: 48 }} ref={statRef}>
          <div className="display">10,000+</div>
          <p>Researchers trust Primal Peps for their work</p>
        </div>
        <div className="quote-grid">
          <div className="quote-card rv" ref={q1}>
            <blockquote>
              &quot;The purity is unmatched. Every COA I&apos;ve received has
              been spot-on. This is the standard I set for all my research
              suppliers.&quot;
            </blockquote>
            <cite>— Dr. M.K., Metabolic Research</cite>
          </div>
          <div className="quote-card rv" ref={q2}>
            <blockquote>
              &quot;Fast shipping, discreet packaging, and the Primal Points
              program actually makes reordering worth it. Top-tier
              operation.&quot;
            </blockquote>
            <cite>— J.R., Independent Lab</cite>
          </div>
          <div className="quote-card rv" ref={q3}>
            <blockquote>
              &quot;Finally a supplier that takes research-grade seriously. The
              vials arrive sealed, labeled, and documented. No
              compromises.&quot;
            </blockquote>
            <cite>— A.T., Cellular Biology</cite>
          </div>
        </div>
      </div>
    </section>
  )
}
