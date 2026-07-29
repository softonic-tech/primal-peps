import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { subscribeNewsletter } from '../lib/newsletter'

export default function WelcomeModal() {
  const { isLoggedIn, loading: authLoading } = useAuth()
  const {
    signedUp,
    welcomeSeen,
    completeSignup,
    dismissWelcome,
    promoPercent,
    toast,
  } = useCart()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Wait for auth; logged-in users get the promo without this modal
    if (authLoading || isLoggedIn || signedUp || welcomeSeen) {
      setOpen(false)
      return
    }
    const t = setTimeout(() => setOpen(true), 6000)
    return () => clearTimeout(t)
  }, [authLoading, isLoggedIn, signedUp, welcomeSeen])

  const hide = () => {
    setOpen(false)
    dismissWelcome()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get('email')
    setSubmitting(true)
    const result = await subscribeNewsletter(email, 'welcome')
    setSubmitting(false)
    if (!result.ok) {
      toast(result.error || 'Could not save your email.')
      return
    }
    completeSignup()
    setOpen(false)
  }

  const show = open && !signedUp && !welcomeSeen && !isLoggedIn && !authLoading

  return (
    <div
      className={`modal-wrap${show ? ' open' : ''}`}
      id="modalWrap"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) hide()
      }}
    >
      <div className="modal">
        <button
          className="x"
          id="modalClose"
          aria-label="Close"
          type="button"
          onClick={hide}
        >
          ✕
        </button>
        <img src="/logo.png" alt="Primal Peps logo" />
        <h3>
          JOIN THE TROOP,
          <br />
          <span className="gold">TAKE {promoPercent}% OFF</span>
        </h3>
        <p>
          Enter your email and your {promoPercent}% welcome discount is applied
          automatically at checkout — no code to wait for.
        </p>
        <form id="modalForm" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="you@email.com"
            required
            aria-label="Email address"
            disabled={submitting}
          />
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : `Unlock my ${promoPercent}% →`}
          </button>
        </form>
        <button className="skip" id="modalSkip" type="button" onClick={hide}>
          No thanks, I&apos;ll pay full price
        </button>
      </div>
    </div>
  )
}
