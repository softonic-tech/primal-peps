import { useState } from 'react'
import { useReveal } from '../hooks/useReveal'

const FAQS = [
  {
    q: 'How fast does shipping take?',
    a: 'Orders are dispatched within 24 hours. Domestic delivery typically takes 2–5 business days. All orders include tracking.',
  },
  {
    q: 'Are these for human consumption?',
    a: 'No. All Primal Peps products are sold strictly for laboratory research purposes only. Not for human or veterinary use.',
  },
  {
    q: 'How should I store peptides?',
    a: 'Lyophilized peptides should be stored at -20°C or below. Once reconstituted, store at 2–8°C and use within 30 days for optimal stability.',
  },
  {
    q: 'What purity level do you guarantee?',
    a: 'Every vial is guaranteed at 99%+ purity, verified by HPLC and mass spectrometry. A Certificate of Analysis is available for every batch.',
  },
  {
    q: 'Can I reorder the same lot?',
    a: "Yes. Contact support with your previous order number and we'll match you to the same batch when available.",
  },
  {
    q: 'How do Primal Points work?',
    a: 'Earn 2 points per $1 spent. Points never expire. Redeem at 500 points for $10 off, or climb to Silverback for free vial gifts and VIP perks.',
  },
]

export default function Faq() {
  const [openIdx, setOpenIdx] = useState(null)
  const hairRef = useReveal({ threshold: 0.5 })
  const headRef = useReveal()
  const listRef = useReveal()

  return (
    <section className="faq section">
      <div className="wrap">
        <div className="hairline rv" ref={hairRef} />
        <div
          className="sec-head rv"
          style={{ marginTop: 48, justifyContent: 'center', textAlign: 'center' }}
          ref={headRef}
        >
          <div>
            <span className="eyebrow" style={{ justifyContent: 'center' }}>
              Support
            </span>
            <h2>FREQUENTLY ASKED</h2>
          </div>
        </div>
        <div className="faq-list rv" ref={listRef}>
          {FAQS.map((item, i) => (
            <div
              key={item.q}
              className={`faq-item${openIdx === i ? ' open' : ''}`}
            >
              <button
                className="faq-q"
                type="button"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                {item.q}
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
