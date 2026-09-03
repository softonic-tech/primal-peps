import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LEGAL } from '../data/site'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { useReveal } from '../hooks/useReveal'
import { subscribeNewsletter } from '../lib/newsletter'
import Faq from './Faq'
import Footer from './Footer'
import Signup from './Signup'

const PILLARS = [
  {
    title: 'HPLC verified',
    body: 'Every batch is quantified by reverse-phase HPLC so you know the main peak, not a marketing number.',
  },
  {
    title: 'Mass spec identity',
    body: 'Molecular weight confirmation so the vial matches the sequence on the label — purity without identity is not enough.',
  },
  {
    title: 'Batch COA',
    body: 'A certificate of analysis is tied to the lot. Open it on the product page before you order.',
  },
  {
    title: 'Research framing',
    body: 'Compounds are described by pathway and published research use — not protocols, not prescriptions, not results claims.',
  },
]

const STEPS = [
  { n: '01', title: 'Choose a compound', body: 'Open the shop and pick a lyophilised research peptide. Each product has specs, lot data, and a COA.' },
  { n: '02', title: 'Order & pay via PayID', body: 'Pay instantly via PayID. Use your order number as the reference. We dispatch once payment clears.' },
  { n: '03', title: 'Sealed, tracked, 24h', body: 'Vacuum-sealed vials, discreet packaging, tracking on every shipment. Research use only · 18+.' },
]

function LandingHero({ waitlist, onNotify }) {
  const copyRef = useReveal()
  const artRef = useReveal()

  return (
    <header className="lp-hero" id="top">
      <div className="wrap lp-hero-grid">
        <div className="lp-hero-copy rv" ref={copyRef}>
          <span className="eyebrow">Research catalog</span>
          <h1>
            PEPTIDES BUILT
            <br />
            FOR THE <span className="gold">BENCH.</span>
          </h1>
          <p className="lp-lede">
            Lab-tested lyophilised compounds for metabolic, recovery, growth, and
            cellular research. Every batch HPLC-verified. Every vial numbered.
            Nothing here is a medicine, a protocol, or a promise.
          </p>
          <div className="lp-hero-actions">
            {waitlist ? (
              <button className="btn-primary" type="button" onClick={onNotify}>
                Join the waitlist →
              </button>
            ) : (
              <>
                <a className="btn-primary" href="/#shop">
                  Open the shop →
                </a>
                <a className="btn-ghost" href="#about">
                  What is Primal Peps
                </a>
              </>
            )}
          </div>
          <ul className="lp-hero-stats">
            <li>
              <strong>99%+</strong>
              <span>HPLC purity</span>
            </li>
            <li>
              <strong>COA</strong>
              <span>Per product</span>
            </li>
            <li>
              <strong>24h</strong>
              <span>Dispatch</span>
            </li>
            <li>
              <strong>18+</strong>
              <span>Research only</span>
            </li>
          </ul>
        </div>
        <div className="lp-hero-art rv" ref={artRef} aria-hidden="true">
          <div className="lp-orbit lp-orbit-a" />
          <div className="lp-orbit lp-orbit-b" />
          <div className="lp-hero-logo">
            <img src="/logo.png" alt="" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default function Landing({ waitlist = false }) {
  const { toast } = useCart()
  const { contact } = useSettings()
  const [joined, setJoined] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const aboutRef = useReveal()
  const pillarsRef = useReveal()
  const stepsRef = useReveal()

  useEffect(() => {
    const prev = document.title
    document.title = 'Primal Peps — Research catalog'
    return () => {
      document.title = prev
    }
  }, [])

  const scrollNotify = () => {
    document.getElementById('lp-waitlist')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }

  const handleWaitlist = async (e) => {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get('email')
    setSubmitting(true)
    const result = await subscribeNewsletter(email, 'landing')
    setSubmitting(false)
    if (!result.ok) {
      toast(result.error || 'Could not save your email.', 'error')
      return
    }
    setJoined(true)
    toast('You are on the list — we will be in touch ✓')
  }

  return (
    <div className="lp-page">
      {waitlist && (
        <header className="lp-wait-nav">
          <Link to="/landing" className="brand">
            <img src="/logo.png" alt="Primal Peps logo" />
            <span className="brand-name">
              PRIMAL <span>PEPS</span>
            </span>
          </Link>
          {contact.email ? (
            <a className="lp-wait-mail" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          ) : null}
        </header>
      )}

      <LandingHero waitlist={waitlist} onNotify={scrollNotify} />

      <section className="lp-about section" id="about">
        <div className="wrap lp-about-grid rv" ref={aboutRef}>
          <div>
            <span className="eyebrow">The standard</span>
            <h2>
              WHAT IS
              <br />
              PRIMAL PEPS?
            </h2>
          </div>
          <div className="lp-about-copy">
            <p className="serif">
              Primal Peps is an Australian research-peptide catalog. We supply
              lyophilised compounds for laboratory work — identity confirmed,
              purity measured, documentation attached.
            </p>
            <p>
              We do not write protocols. We do not rank peptides by
              &ldquo;results.&rdquo; Each entry is described by the pathways and
              models it is studied in, with a downloadable certificate of
              analysis for the batch on the vial.
            </p>
            <p className="lp-ruo">{LEGAL.ruoFull}</p>
          </div>
        </div>
      </section>

      <section className="lp-pillars section" id="quality">
        <div className="wrap">
          <div className="lp-sec-head rv" ref={pillarsRef}>
            <span className="eyebrow">Quality</span>
            <h2>HOW WE VERIFY A BATCH</h2>
            <p>
              A purity claim without identity and a lot number is marketing.
              These are the checks we run before a compound is listed.
            </p>
          </div>
          <div className="lp-pillar-grid">
            {PILLARS.map((item) => (
              <article key={item.title} className="lp-pillar">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-steps section" id="how">
        <div className="wrap">
          <div className="lp-sec-head rv" ref={stepsRef}>
            <span className="eyebrow">Fulfillment</span>
            <h2>FROM CATALOG TO BENCH</h2>
          </div>
          <div className="lp-step-grid">
            {STEPS.map((step) => (
              <article key={step.n} className="lp-step">
                <span>{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Faq />

      {waitlist ? (
        <section className="signup section" id="lp-waitlist">
          <div className="wrap">
            <div className="signup-box">
              <span className="eyebrow" style={{ justifyContent: 'center' }}>
                Waitlist
              </span>
              <h2>
                THE CATALOG IS
                <br />
                ALMOST LIVE.
              </h2>
              <p>
                Leave your email. We will tell you when Primal Peps opens for
                orders — research use only, 18+.
              </p>
              {joined ? (
                <p className="coming-soon-ok">You are on the list. We will be in touch.</p>
              ) : (
                <form className="email-glass" onSubmit={handleWaitlist}>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@email.com"
                    required
                    aria-label="Email address"
                    disabled={submitting}
                  />
                  <button className="btn-primary" type="submit" disabled={submitting}>
                    {submitting ? 'Saving…' : 'Notify me'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      ) : (
        <Signup />
      )}

      <Footer />
    </div>
  )
}
