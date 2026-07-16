import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'

export default function WelcomeModal() {
  const { signedUp, completeSignup } = useCart()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (signedUp) return
    const t = setTimeout(() => setOpen(true), 6000)
    return () => clearTimeout(t)
  }, [signedUp])

  const hide = () => setOpen(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    completeSignup()
    hide()
  }

  return (
    <div
      className={`modal-wrap${open && !signedUp ? ' open' : ''}`}
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
          <span className="gold">TAKE 15% OFF</span>
        </h3>
        <p>
          Sign up with your email and your 15% welcome code is applied
          automatically at checkout.
        </p>
        <form id="modalForm" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="you@email.com"
            required
            aria-label="Email address"
          />
          <button className="btn-primary" type="submit">
            Unlock my 15% →
          </button>
        </form>
        <button className="skip" id="modalSkip" type="button" onClick={hide}>
          No thanks, I&apos;ll pay full price
        </button>
      </div>
    </div>
  )
}
