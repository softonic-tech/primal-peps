import { useCart } from '../context/CartContext'
import { useReveal } from '../hooks/useReveal'

export default function Signup() {
  const { signedUp, completeSignup } = useCart()
  const boxRef = useReveal()

  const handleSubmit = (e) => {
    e.preventDefault()
    completeSignup()
    document.getElementById('revealCode')?.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    })
  }

  return (
    <section className="signup section" id="offer">
      <div className="wrap">
        <div className="signup-box rv" ref={boxRef}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>
            Welcome offer
          </span>
          <h2>
            JOIN THE PACK.
            <br />
            TAKE <span className="big-gold">15% OFF</span>
          </h2>
          <p>
            Drop your email and we&apos;ll send you a 15% welcome code, plus
            first access to restocks, new peptides, and members-only deals.
          </p>
          <form className="email-glass" id="signupForm" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="you@email.com"
              required
              aria-label="Email address"
            />
            <button className="btn-primary magnetic" type="submit">
              Claim 15% off
            </button>
          </form>
          <div
            className="reveal-code"
            id="revealCode"
            style={{ display: signedUp ? 'block' : undefined }}
          >
            <small>Your welcome code — auto-applied at checkout</small>
            <div className="code">PRIMAL15</div>
          </div>
          <p className="fine">
            No spam. Unsubscribe anytime. One welcome code per customer.
          </p>
        </div>
      </div>
    </section>
  )
}
