import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PROMO, fmt, imgSrc } from '../data/products'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const AU_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' },
]

const SHIP_METHODS = [
  {
    id: 'standard',
    name: 'Standard Parcel Post',
    eta: '3–7 business days across Australia',
    price: 9.95,
  },
  {
    id: 'express',
    name: 'Express Post',
    eta: '1–3 business days to major cities',
    price: 14.95,
  },
]

const emptyShipping = {
  fullName: '',
  email: '',
  phone: '',
  line1: '',
  line2: '',
  suburb: '',
  state: '',
  postcode: '',
  method: 'standard',
  notes: '',
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 8 && digits.length <= 15
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function StateSelect({ value, onChange, invalid }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const selected = AU_STATES.find((s) => s.value === value)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      className={`fancy-select${open ? ' open' : ''}${invalid ? ' invalid' : ''}${value ? ' has-value' : ''}`}
      ref={rootRef}
    >
      <button
        type="button"
        className="fancy-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="fancy-select-value">
          {selected ? (
            <>
              <strong>{selected.value}</strong>
              <span>{selected.label}</span>
            </>
          ) : (
            <span className="fancy-select-placeholder">Select state</span>
          )}
        </span>
        <svg
          className="fancy-select-caret"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul className="fancy-select-menu" role="listbox">
          {AU_STATES.map((s) => (
            <li key={s.value}>
              <button
                type="button"
                role="option"
                aria-selected={value === s.value}
                className={`fancy-select-option${value === s.value ? ' active' : ''}`}
                onClick={() => {
                  onChange(s.value)
                  setOpen(false)
                }}
              >
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function OrderSummary({
  sub,
  disc,
  promoApplied,
  shipFee,
  shipLabel,
  total,
  earnPts,
  showTrust = false,
}) {
  return (
    <div className="summary-card">
      <h3>Order Summary</h3>
      <div className="summary-line">
        <span>Subtotal</span>
        <span>{fmt(sub)}</span>
      </div>
      {promoApplied && sub > 0 && (
        <div className="summary-line discount">
          <span>PRIMAL15 Discount</span>
          <span>–{fmt(disc)}</span>
        </div>
      )}
      <div className="summary-line">
        <span>Shipping</span>
        <span>
          {shipFee === null
            ? 'Next step'
            : shipFee === 0
              ? 'FREE'
              : fmt(shipFee)}
        </span>
      </div>
      {shipLabel && (
        <div className="summary-line summary-note">
          <span>{shipLabel}</span>
        </div>
      )}
      <div className="summary-divider" />
      <div className="summary-total">
        <span>Total (AUD)</span>
        <span>{fmt(total)}</span>
      </div>

      <div className="points-badge">
        <div className="points-icon">⬢</div>
        <div>
          <div className="points-label">You&apos;ll Earn</div>
          <div className="points-value">{earnPts} Points</div>
        </div>
      </div>

      {showTrust && (
        <div className="trust-badges">
          <div className="trust-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Secure Checkout</span>
          </div>
          <div className="trust-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Lab Certified</span>
          </div>
          <div className="trust-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Discreet AU Shipping</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Checkout() {
  const {
    cartOpen,
    setCartOpen,
    cartItems,
    sub,
    disc,
    totalVal,
    earnPts,
    promoApplied,
    applyPromo,
    updateQty,
    placeOrder,
    toast,
  } = useCart()
  const { user, isLoggedIn, openAuth } = useAuth()

  const [step, setStep] = useState(1)
  const [promoInput, setPromoInput] = useState(promoApplied ? PROMO : '')
  const [shipping, setShipping] = useState(emptyShipping)
  const [errors, setErrors] = useState({})
  const prefillsDone = useRef(false)

  useEffect(() => {
    if (promoApplied) setPromoInput(PROMO)
  }, [promoApplied])

  useEffect(() => {
    if (!cartOpen) {
      setStep(1)
      setErrors({})
      prefillsDone.current = false
      return
    }
    if (prefillsDone.current || !isLoggedIn || !user) return
    setShipping((prev) => ({
      ...prev,
      fullName: user.fullName || prev.fullName,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
      line1: user.shipping?.line1 || prev.line1,
      line2: user.shipping?.line2 || prev.line2,
      suburb: user.shipping?.suburb || prev.suburb,
      state: user.shipping?.state || prev.state,
      postcode: user.shipping?.postcode || prev.postcode,
    }))
    prefillsDone.current = true
  }, [cartOpen, isLoggedIn, user])

  const empty = !cartItems.length

  const method = SHIP_METHODS.find((m) => m.id === shipping.method) || SHIP_METHODS[0]
  const qualifiesFreeShip = totalVal >= 150
  const shipFee = qualifiesFreeShip ? 0 : method.price
  const orderTotal = totalVal + shipFee
  const shipLabel = qualifiesFreeShip
    ? 'Free AU shipping on orders over $150'
    : method.name

  const orderEarnPts = useMemo(
    () => Math.round(orderTotal * 2),
    [orderTotal],
  )

  const close = () => setCartOpen(false)

  const continueShopping = () => {
    close()
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
  }

  const setField = (key, value) => {
    setShipping((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const validateShipping = () => {
    const next = {}
    if (!shipping.fullName.trim()) next.fullName = 'Enter your full name'
    if (!isValidEmail(shipping.email)) next.email = 'Enter a valid email'
    if (!isValidPhone(shipping.phone)) {
      next.phone = 'Enter a valid phone number'
    }
    if (!shipping.line1.trim()) next.line1 = 'Enter your street address'
    if (!shipping.suburb.trim()) next.suburb = 'Enter your suburb'
    if (!shipping.state) next.state = 'Select your state or territory'
    if (!/^\d{4}$/.test(shipping.postcode.trim())) {
      next.postcode = 'Enter a valid 4-digit postcode'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const goNext = () => {
    if (step === 1) {
      if (empty) return
      setStep(2)
      return
    }
    if (step === 2) {
      if (!validateShipping()) {
        toast('Please complete your Australian shipping details')
        return
      }
      setStep(3)
      return
    }
    if (step === 3) {
      placeOrder(shipping, { shipFee })
      setShipping(emptyShipping)
      setStep(1)
    }
  }

  const goBack = () => {
    if (step === 1) {
      continueShopping()
      return
    }
    setStep((s) => s - 1)
  }

  const primaryLabel = empty
    ? 'Add items to continue'
    : step === 1
      ? 'Proceed to Shipping'
      : step === 2
        ? 'Continue to Payment'
        : 'Place Order'

  const secondaryLabel = step === 1 ? 'Continue Shopping' : 'Back'

  return (
    <>
      <div
        className={`checkout-overlay${cartOpen ? ' open' : ''}`}
        id="overlay"
        onClick={close}
      />
      <div
        className={`checkout-modal${cartOpen ? ' open' : ''}`}
        id="drawer"
        role="dialog"
        aria-label="Checkout"
      >
        <button
          className="checkout-close"
          id="closeCart"
          aria-label="Close checkout"
          type="button"
          onClick={close}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="checkout-progress">
          <div className={`progress-step${step >= 1 ? ' active' : ''}${step > 1 ? ' completed' : ''}`}>
            <div className="step-icon">🛒</div>
            <span>Cart</span>
          </div>
          <div className="progress-line" />
          <div className={`progress-step${step >= 2 ? ' active' : ''}${step > 2 ? ' completed' : ''}`}>
            <div className="step-icon">📦</div>
            <span>Shipping</span>
          </div>
          <div className="progress-line" />
          <div className={`progress-step${step >= 3 ? ' active' : ''}`}>
            <div className="step-icon">💳</div>
            <span>Payment</span>
          </div>
        </div>

        <div className="checkout-content">
          {step === 1 && (
            <div className="checkout-step">
              <div className="checkout-main">
                <h2 className="checkout-title">YOUR CART</h2>
                <div className="cart-items">
                  {empty ? (
                    <p className="empty-cart">
                      Your cart is empty.
                      <br />
                      Time to level up. 🦍
                    </p>
                  ) : (
                    cartItems.map((i) => (
                      <div className="ci" key={i.key}>
                        <div className="ci-thumb">
                          <img
                            src={imgSrc(i.img)}
                            alt={`${i.name} ${i.variantLabel}`}
                          />
                        </div>
                        <div>
                          <h4>
                            {i.name}{' '}
                            <span className="ci-dose">{i.variantLabel}</span>
                          </h4>
                          <small>{i.sub}</small>
                          <div className="qty">
                            <button type="button" onClick={() => updateQty(i.key, 'dec')}>
                              −
                            </button>
                            <span>{i.qty}</span>
                            <button type="button" onClick={() => updateQty(i.key, 'inc')}>
                              +
                            </button>
                          </div>
                        </div>
                        <div>
                          <div className="ci-price">{fmt(i.price * i.qty)}</div>
                          <button
                            className="rm"
                            type="button"
                            onClick={() => updateQty(i.key, 'rm')}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="promo-section">
                  <label>Promo Code</label>
                  <div className="promo-input-group">
                    <input
                      placeholder="Enter code"
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          applyPromo(promoInput)
                        }
                      }}
                    />
                    <button
                      className="promo-btn"
                      type="button"
                      onClick={() => applyPromo(promoInput)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              <div className="checkout-sidebar">
                <OrderSummary
                  sub={sub}
                  disc={disc}
                  promoApplied={promoApplied}
                  shipFee={qualifiesFreeShip ? 0 : null}
                  shipLabel={
                    qualifiesFreeShip
                      ? 'Free AU shipping unlocked'
                      : 'AU shipping calculated next'
                  }
                  total={totalVal}
                  earnPts={earnPts}
                  showTrust
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="checkout-step">
              <div className="checkout-main">
                <h2 className="checkout-title">SHIP TO AUSTRALIA</h2>
                <p className="ship-intro">
                  We currently deliver Australia-wide via Australia Post. Enter
                  your delivery details exactly as they appear for AU parcel
                  delivery.
                </p>
                {isLoggedIn ? (
                  <p className="checkout-auth-note logged-in">
                    Signed in as <strong>{user.email}</strong> — shipping
                    details prefilled from your profile. Edit anything before
                    continuing.
                  </p>
                ) : (
                  <p className="checkout-auth-note">
                    Checking out as a guest.{' '}
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => openAuth('login')}
                    >
                      Sign in
                    </button>{' '}
                    to autofill saved shipping, or{' '}
                    <Link to="/account" onClick={close}>
                      create an account
                    </Link>{' '}
                    after your order.
                  </p>
                )}

                <form
                  className="ship-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    goNext()
                  }}
                >
                  <div className="ship-grid">
                    <label className={`ship-field${errors.fullName ? ' invalid' : ''}`}>
                      <span>Full name</span>
                      <input
                        type="text"
                        autoComplete="name"
                        placeholder="Alex Taylor"
                        value={shipping.fullName}
                        onChange={(e) => setField('fullName', e.target.value)}
                      />
                      {errors.fullName && <em>{errors.fullName}</em>}
                    </label>

                    <label className={`ship-field${errors.email ? ' invalid' : ''}`}>
                      <span>Email</span>
                      <input
                        type="email"
                        autoComplete="email"
                        placeholder="you@email.com"
                        value={shipping.email}
                        onChange={(e) => setField('email', e.target.value)}
                      />
                      {errors.email && <em>{errors.email}</em>}
                    </label>

                    <label className={`ship-field${errors.phone ? ' invalid' : ''}`}>
                      <span>Phone number</span>
                      <input
                        type="tel"
                        autoComplete="tel"
                        placeholder="+61 4XX XXX XXX"
                        value={shipping.phone}
                        onChange={(e) => setField('phone', e.target.value)}
                      />
                      {errors.phone && <em>{errors.phone}</em>}
                    </label>

                    <label className={`ship-field ship-span-2${errors.line1 ? ' invalid' : ''}`}>
                      <span>Street address</span>
                      <input
                        type="text"
                        autoComplete="address-line1"
                        placeholder="12 Example Street"
                        value={shipping.line1}
                        onChange={(e) => setField('line1', e.target.value)}
                      />
                      {errors.line1 && <em>{errors.line1}</em>}
                    </label>

                    <label className="ship-field ship-span-2">
                      <span>Apartment / unit / suite (optional)</span>
                      <input
                        type="text"
                        autoComplete="address-line2"
                        placeholder="Unit 3, Level 2"
                        value={shipping.line2}
                        onChange={(e) => setField('line2', e.target.value)}
                      />
                    </label>

                    <label className={`ship-field${errors.suburb ? ' invalid' : ''}`}>
                      <span>Suburb</span>
                      <input
                        type="text"
                        autoComplete="address-level2"
                        placeholder="South Yarra"
                        value={shipping.suburb}
                        onChange={(e) => setField('suburb', e.target.value)}
                      />
                      {errors.suburb && <em>{errors.suburb}</em>}
                    </label>

                    <div className={`ship-field${errors.state ? ' invalid' : ''}`}>
                      <span>State / Territory</span>
                      <StateSelect
                        value={shipping.state}
                        invalid={Boolean(errors.state)}
                        onChange={(value) => setField('state', value)}
                      />
                      {errors.state && <em>{errors.state}</em>}
                    </div>

                    <label className={`ship-field${errors.postcode ? ' invalid' : ''}`}>
                      <span>Postcode</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        maxLength={4}
                        placeholder="3141"
                        value={shipping.postcode}
                        onChange={(e) =>
                          setField(
                            'postcode',
                            e.target.value.replace(/\D/g, '').slice(0, 4),
                          )
                        }
                      />
                      {errors.postcode && <em>{errors.postcode}</em>}
                    </label>

                    <label className="ship-field ship-span-2">
                      <span>Delivery notes (optional)</span>
                      <input
                        type="text"
                        placeholder="Leave at front door / building access code"
                        value={shipping.notes}
                        onChange={(e) => setField('notes', e.target.value)}
                      />
                    </label>
                  </div>

                  <div className="ship-methods">
                    <h3>Delivery method</h3>
                    {qualifiesFreeShip && (
                      <p className="ship-free-note">
                        Free shipping unlocked — your order is over $150 AUD.
                      </p>
                    )}
                    <div className="ship-method-list">
                      {SHIP_METHODS.map((m) => (
                        <label
                          key={m.id}
                          className={`ship-method${shipping.method === m.id ? ' active' : ''}`}
                        >
                          <input
                            type="radio"
                            name="shipMethod"
                            checked={shipping.method === m.id}
                            onChange={() => setField('method', m.id)}
                          />
                          <div>
                            <strong>{m.name}</strong>
                            <small>{m.eta}</small>
                          </div>
                          <span className="ship-method-price">
                            {qualifiesFreeShip ? 'FREE' : fmt(m.price)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              <div className="checkout-sidebar">
                <OrderSummary
                  sub={sub}
                  disc={disc}
                  promoApplied={promoApplied}
                  shipFee={shipFee}
                  shipLabel={shipLabel}
                  total={orderTotal}
                  earnPts={orderEarnPts}
                />
                {(shipping.suburb || shipping.state || shipping.postcode) && (
                  <div className="ship-preview">
                    <h4>Delivering to</h4>
                    <p>
                      {[shipping.suburb, shipping.state, shipping.postcode]
                        .filter(Boolean)
                        .join(' ')}
                      <br />
                      Australia
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="checkout-step">
              <div className="checkout-main">
                <h2 className="checkout-title">PAYMENT</h2>
                <div className="ship-review">
                  <h3>Shipping summary</h3>
                  <p>
                    <strong>{shipping.fullName}</strong>
                    <br />
                    {shipping.line1}
                    {shipping.line2 ? `, ${shipping.line2}` : ''}
                    <br />
                    {shipping.suburb} {shipping.state} {shipping.postcode}
                    <br />
                    Australia
                    <br />
                    {shipping.phone} · {shipping.email}
                  </p>
                  <p className="ship-review-method">
                    {method.name} — {qualifiesFreeShip ? 'FREE' : fmt(method.price)}
                  </p>
                </div>
                <p className="ship-intro">
                  Payment processing (Stripe / PayPal) can be connected next.
                  For now, confirm to place this demo order with your Australian
                  shipping details saved for fulfilment.
                </p>
              </div>
              <div className="checkout-sidebar">
                <OrderSummary
                  sub={sub}
                  disc={disc}
                  promoApplied={promoApplied}
                  shipFee={shipFee}
                  shipLabel={shipLabel}
                  total={orderTotal}
                  earnPts={orderEarnPts}
                  showTrust
                />
              </div>
            </div>
          )}
        </div>

        <div className="checkout-footer">
          <div className="checkout-footer-inner">
            <div className="checkout-footer-total">
              <div className="checkout-footer-total-main">
                <span className="label">Order total (AUD)</span>
                <span className="amount">
                  {fmt(step === 1 ? totalVal : orderTotal)}
                </span>
              </div>
              <span className="pts">
                +{step === 1 ? earnPts : orderEarnPts} Primal Points
              </span>
            </div>
            <div className="checkout-footer-actions">
              <button
                className="checkout-shop-btn"
                type="button"
                aria-label={secondaryLabel}
                onClick={goBack}
              >
                <span className="btn-label-full" aria-hidden="true">
                  {secondaryLabel}
                </span>
                <span className="btn-label-short" aria-hidden="true">
                  {step === 1 ? 'Shop' : 'Back'}
                </span>
              </button>
              <button
                className="checkout-next-btn"
                type="button"
                aria-label={primaryLabel}
                disabled={empty}
                onClick={goNext}
              >
                <span className="btn-label-full" aria-hidden="true">
                  {primaryLabel}
                </span>
                <span className="btn-label-short" aria-hidden="true">
                  {empty
                    ? 'Add items'
                    : step === 1
                      ? 'Shipping'
                      : step === 2
                        ? 'Payment'
                        : 'Place order'}
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
