import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function WelcomeModal() {
  const { isLoggedIn, loading: authLoading } = useAuth()
  const {
    signedUp,
    welcomeSeen,
    completeSignup,
    dismissWelcome,
    promoPercent,
  } = useCart()
  const [open, setOpen] = useState(false)

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

  const handleSubmit = (e) => {
    e.preventDefault()
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
          Sign up with your email and your {promoPercent}% welcome code is
          applied automatically at checkout.
        </p>
        <form id="modalForm" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="you@email.com"
            required
            aria-label="Email address"
          />
          <button className="btn-primary" type="submit">
            Unlock my {promoPercent}% →
          </button>
        </form>
        <button className="skip" id="modalSkip" type="button" onClick={hide}>
          No thanks, I&apos;ll pay full price
        </button>
      </div>
    </div>
  )
}
