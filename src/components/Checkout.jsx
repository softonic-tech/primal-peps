import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { fmt, imgSrc, listPrice } from '../data/products'
import { LEGAL } from '../data/site'
import { useAuth } from '../context/AuthContext'
import {
  REDEEM_POINTS,
  REDEEM_VALUE,
  useCart,
} from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import TikTokReward from './TikTokReward'

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

function isValidEmail(value) {
  const email = value.trim()
  return email.includes('@') && email.includes('.')
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
  promoCode = 'PRIMAL15',
  redeemDisc = 0,
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
      {promoApplied && disc > 0 && (
        <div className="summary-line discount">
          <span>{promoCode} Discount</span>
          <span>–{fmt(disc)}</span>
        </div>
      )}
      {redeemDisc > 0 && (
        <div className="summary-line discount">
          <span>Points redeem</span>
          <span>–{fmt(redeemDisc)}</span>
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
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M3 10h18" />
            </svg>
            <span>PayID transfer</span>
          </div>
          <div className="trust-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Lab Certified · RUO</span>
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

function BankTransferCard({ reference, amount, toast, bank }) {
  const copy = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value)
      toast(`${label} copied`)
    } catch {
      toast('Could not copy — select the value manually')
    }
  }

  const rows = [
    { label: 'PayID', value: bank.payId },
    { label: 'PayID name', value: bank.accountName },
    ...(amount != null ? [{ label: 'Amount (AUD)', value: fmt(amount) }] : []),
    ...(reference
      ? [{ label: 'Payment reference', value: reference }]
      : []),
  ]

  return (
    <div className="bank-transfer">
      <div className="bank-transfer-head">
        <h3>Pay by PayID</h3>
        <p>
          Open your bank app, select PayID, and transfer the order total.
          Use your order number as the payment reference so we can match it.
        </p>
      </div>
      <dl className="bank-transfer-rows">
        {rows.map((row) => (
          <div key={row.label} className="bank-transfer-row">
            <dt>{row.label}</dt>
            <dd>
              <span>{row.value}</span>
              <button
                type="button"
                className="bank-copy-btn"
                onClick={() => copy(row.label, String(row.value).replace(/^\$/, ''))}
                aria-label={`Copy ${row.label}`}
              >
                Copy
              </button>
            </dd>
          </div>
        ))}
      </dl>
      {!reference && (
        <p className="bank-transfer-note">
          After you submit, you&apos;ll get an order number to use as your
          transfer reference. Orders ship once payment clears.
        </p>
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
    redeemDisc,
    redeemApplied,
    canRedeem,
    setRedeem,
    totalVal,
    earnPts,
    promoApplied,
    promoCode,
    tiktokPromoCode,
    ptsPerDollar,
    applyPromo,
    updateQty,
    placeOrder,
    toast,
  } = useCart()
  const { user, isLoggedIn, openAuth, loading: authLoading } = useAuth()
  const { bank, shipping: shipSettings, promo: promoSettings } = useSettings()
  const welcomePromoCode = String(promoSettings?.code || 'PRIMAL15')
    .trim()
    .toUpperCase()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const onCheckoutRoute = pathname === '/checkout'
  const freeThreshold = Number(shipSettings.freeThreshold) || 150

  const [step, setStep] = useState(1)
  const [promoInput, setPromoInput] = useState(promoApplied ? promoCode : '')
  const [shipping, setShipping] = useState(emptyShipping)
  const [errors, setErrors] = useState({})
  const [legalAck, setLegalAck] = useState(true)
  const [placedOrder, setPlacedOrder] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const prefillsDone = useRef(false)
  const contentRef = useRef(null)
  const formRef = useRef(null)

  const scrollContentTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const focusFirstError = (nextErrors) => {
    const order = [
      'fullName',
      'email',
      'phone',
      'line1',
      'suburb',
      'state',
      'postcode',
    ]
    const firstKey = order.find((key) => nextErrors[key])
    if (!firstKey) return
    requestAnimationFrame(() => {
      const el = formRef.current?.querySelector(`[data-field="${firstKey}"]`)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const focusable =
        el.querySelector('input, button.fancy-select-trigger') || el
      if (typeof focusable.focus === 'function') focusable.focus({ preventScroll: true })
    })
  }

  useEffect(() => {
    if (promoApplied) setPromoInput(promoCode)
  }, [promoApplied, promoCode])

  useEffect(() => {
    setCartOpen(onCheckoutRoute)
  }, [onCheckoutRoute, setCartOpen])

  useEffect(() => {
    if (!cartOpen) return
    scrollContentTop()
  }, [step, cartOpen, placedOrder])

  useEffect(() => {
    if (!cartOpen) {
      setStep(1)
      setErrors({})
      setLegalAck(true)
      setPlacedOrder(null)
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
  const qualifiesFreeShip = totalVal >= freeThreshold
  const shipFee = qualifiesFreeShip ? 0 : method.price
  const orderTotal = totalVal + shipFee
  const shipLabel = qualifiesFreeShip
    ? `Free AU shipping on orders over $${freeThreshold}`
    : method.name

  const orderEarnPts = useMemo(
    () => Math.round(orderTotal * ptsPerDollar),
    [orderTotal, ptsPerDollar],
  )

  const close = () => {
    if (onCheckoutRoute) navigate('/', { replace: true })
    else setCartOpen(false)
  }

  const continueShopping = () => {
    if (onCheckoutRoute) navigate('/#shop', { replace: true })
    else {
      setCartOpen(false)
      navigate('/#shop')
    }
  }

  const setField = (key, value) => {
    setShipping((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const validateShipping = () => {
    const next = {}
    if (!shipping.fullName.trim()) next.fullName = 'Required'
    if (!shipping.email.trim() || !isValidEmail(shipping.email)) {
      next.email = 'Required'
    }
    if (!shipping.phone.trim()) next.phone = 'Required'
    if (!shipping.line1.trim()) next.line1 = 'Required'
    if (!shipping.suburb.trim()) next.suburb = 'Required'
    if (!shipping.state) next.state = 'Required'
    if (!shipping.postcode.trim()) next.postcode = 'Required'
    setErrors(next)
    const ok = Object.keys(next).length === 0
    if (!ok) focusFirstError(next)
    return ok
  }

  const goToStep = (target) => {
    if (placedOrder || submitting) return
    if (target >= step || target < 1) return
    setErrors({})
    setStep(target)
  }

  const goNext = async () => {
    if (placedOrder) {
      close()
      return
    }
    if (step === 1) {
      if (empty) return
      setStep(2)
      return
    }
    if (step === 2) {
      if (!validateShipping()) {
        toast('Fill the highlighted fields to continue')
        return
      }
      setStep(3)
      return
    }
    if (step === 3) {
      if (authLoading) {
        toast('Please wait — checking your session')
        return
      }
      setSubmitting(true)
      try {
        const order = await placeOrder(shipping, { shipFee, keepOpen: true })
        setPlacedOrder(order)
        setShipping(emptyShipping)
        setLegalAck(true)
        toast(
          `Order ${order.id} submitted — transfer funds to confirm. Check spam for emails.`,
        )
      } catch {
        /* toast already shown in placeOrder */
      } finally {
        setSubmitting(false)
      }
    }
  }

  const goBack = () => {
    if (placedOrder) {
      close()
      return
    }
    if (step === 1) {
      continueShopping()
      return
    }
    setErrors({})
    setStep((s) => s - 1)
  }

  const errorCount = Object.values(errors).filter(Boolean).length

  const primaryLabel = placedOrder
    ? 'Done'
    : empty
      ? 'Add items to continue'
      : authLoading && step === 3
        ? 'Checking session…'
        : submitting
          ? 'Submitting…'
          : step === 1
            ? 'Proceed to Shipping'
            : step === 2
              ? 'Continue to Payment'
              : 'Submit order'

  const primarySubmitClass = placedOrder
    ? 'checkout-cta-done'
    : empty
      ? 'checkout-cta-empty'
      : step === 1
        ? 'checkout-cta-dispatch'
        : step === 2
          ? 'checkout-cta-transfer'
          : 'checkout-cta-seal'

  const secondaryLabel = placedOrder
    ? 'Close'
    : step === 1
      ? 'Continue Shopping'
      : 'Back'

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

        <div className="checkout-progress" role="navigation" aria-label="Checkout steps">
          <button
            type="button"
            className={`progress-step${step >= 1 ? ' active' : ''}${step > 1 ? ' completed' : ''}${step > 1 && !placedOrder ? ' clickable' : ''}`}
            onClick={() => goToStep(1)}
            disabled={placedOrder || step <= 1}
            aria-current={step === 1 && !placedOrder ? 'step' : undefined}
          >
            <div className="step-icon" aria-hidden="true">1</div>
            <span>Cart</span>
          </button>
          <div className={`progress-line${step > 1 ? ' filled' : ''}`} aria-hidden="true" />
          <button
            type="button"
            className={`progress-step${step >= 2 ? ' active' : ''}${step > 2 ? ' completed' : ''}${step > 2 && !placedOrder ? ' clickable' : ''}`}
            onClick={() => goToStep(2)}
            disabled={placedOrder || step <= 2}
            aria-current={step === 2 && !placedOrder ? 'step' : undefined}
          >
            <div className="step-icon" aria-hidden="true">2</div>
            <span>Shipping</span>
          </button>
          <div className={`progress-line${step > 2 || placedOrder ? ' filled' : ''}`} aria-hidden="true" />
          <button
            type="button"
            className={`progress-step${step >= 3 || placedOrder ? ' active' : ''}${placedOrder ? ' completed' : ''}`}
            disabled
            aria-current={step === 3 || placedOrder ? 'step' : undefined}
          >
            <div className="step-icon" aria-hidden="true">3</div>
            <span>{placedOrder ? 'Done' : 'Pay'}</span>
          </button>
        </div>

        <div className="checkout-content" ref={contentRef}>
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
                          <div className="ci-price">
                            <span className="sale-was">
                              {fmt(listPrice(i.basePrice ?? i.price) * i.qty)}
                            </span>
                            {fmt(i.price * i.qty)}
                          </div>
                          {i.basePrice != null && i.price < i.basePrice && (
                            <small className="ci-bundle-save">
                              Bundle save on {i.qty}+ vials
                            </small>
                          )}
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
                      placeholder={`${welcomePromoCode} or ${tiktokPromoCode || 'TIKTOK50'}`}
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          applyPromo(promoInput, { email: shipping.email })
                        }
                      }}
                    />
                    <button
                      className="promo-btn"
                      type="button"
                      onClick={() => applyPromo(promoInput, { email: shipping.email })}
                    >
                      Apply
                    </button>
                  </div>
                  <p className="promo-hint muted">
                    TikTok reward? After we approve your video, use{' '}
                    <strong>{tiktokPromoCode || 'TIKTOK50'}</strong> with this
                    email.
                  </p>
                </div>

                {canRedeem && (
                  <div className="promo-section redeem-section">
                    <label>Primal Points</label>
                    <button
                      type="button"
                      className={`redeem-toggle${redeemApplied ? ' active' : ''}`}
                      onClick={() => setRedeem(!redeemApplied)}
                      aria-pressed={redeemApplied}
                    >
                      <span>
                        Redeem {REDEEM_POINTS} pts (−{fmt(REDEEM_VALUE)})
                      </span>
                      <span className="redeem-toggle-state">
                        {redeemApplied ? 'On' : 'Off'}
                      </span>
                    </button>
                    <p className="redeem-hint">
                      You have {user?.points || 0} points. Applied after any
                      welcome promo; total won&apos;t go below $0.
                    </p>
                  </div>
                )}
              </div>

              <div className="checkout-sidebar">
                <OrderSummary
                  sub={sub}
                  disc={disc}
                  promoApplied={promoApplied}
                  promoCode={promoCode}
                  redeemDisc={redeemDisc}
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
                  Australia-wide via Australia Post. Use the address exactly as
                  it appears for AU parcel delivery.
                </p>
                {authLoading ? (
                  <p className="checkout-auth-note">Checking your session…</p>
                ) : isLoggedIn ? (
                  <p className="checkout-auth-note logged-in">
                    Signed in as <strong>{user.email}</strong> — details
                    prefilled from your profile.
                  </p>
                ) : (
                  <p className="checkout-auth-note">
                    Guest checkout —{' '}
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => openAuth('login')}
                    >
                      sign in
                    </button>{' '}
                    to autofill and earn points.
                  </p>
                )}

                {errorCount > 0 && (
                  <div className="checkout-error-banner" role="alert">
                    Fix {errorCount} field{errorCount === 1 ? '' : 's'} highlighted
                    below to continue.
                  </div>
                )}

                <form
                  className="ship-form"
                  ref={formRef}
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault()
                    goNext()
                  }}
                >
                  <div className="ship-grid">
                    <label
                      className={`ship-field${errors.fullName ? ' invalid' : ''}`}
                      data-field="fullName"
                    >
                      <span>Full name</span>
                      <input
                        type="text"
                        autoComplete="name"
                        name="name"
                        enterKeyHint="next"
                        placeholder="Alex Taylor"
                        value={shipping.fullName}
                        onChange={(e) => setField('fullName', e.target.value)}
                      />
                      {errors.fullName && <em>{errors.fullName}</em>}
                    </label>

                    <label
                      className={`ship-field${errors.email ? ' invalid' : ''}`}
                      data-field="email"
                    >
                      <span>Email</span>
                      <input
                        type="email"
                        autoComplete="email"
                        name="email"
                        enterKeyHint="next"
                        inputMode="email"
                        placeholder="you@email.com"
                        value={shipping.email}
                        onChange={(e) => setField('email', e.target.value)}
                      />
                      {errors.email && <em>{errors.email}</em>}
                    </label>

                    <label
                      className={`ship-field${errors.phone ? ' invalid' : ''}`}
                      data-field="phone"
                    >
                      <span>Phone</span>
                      <input
                        type="tel"
                        autoComplete="tel"
                        name="tel"
                        enterKeyHint="next"
                        inputMode="tel"
                        placeholder="04XX XXX XXX"
                        value={shipping.phone}
                        onChange={(e) => setField('phone', e.target.value)}
                      />
                      {errors.phone && <em>{errors.phone}</em>}
                    </label>

                    <label
                      className={`ship-field ship-span-2${errors.line1 ? ' invalid' : ''}`}
                      data-field="line1"
                    >
                      <span>Street address</span>
                      <input
                        type="text"
                        autoComplete="address-line1"
                        name="address-line1"
                        enterKeyHint="next"
                        placeholder="12 Example Street"
                        value={shipping.line1}
                        onChange={(e) => setField('line1', e.target.value)}
                      />
                      {errors.line1 && <em>{errors.line1}</em>}
                    </label>

                    <label className="ship-field ship-span-2">
                      <span>Unit / apartment (optional)</span>
                      <input
                        type="text"
                        autoComplete="address-line2"
                        name="address-line2"
                        enterKeyHint="next"
                        placeholder="Unit 3"
                        value={shipping.line2}
                        onChange={(e) => setField('line2', e.target.value)}
                      />
                    </label>

                    <label
                      className={`ship-field${errors.suburb ? ' invalid' : ''}`}
                      data-field="suburb"
                    >
                      <span>Suburb</span>
                      <input
                        type="text"
                        autoComplete="address-level2"
                        name="address-level2"
                        enterKeyHint="next"
                        placeholder="South Yarra"
                        value={shipping.suburb}
                        onChange={(e) => setField('suburb', e.target.value)}
                      />
                      {errors.suburb && <em>{errors.suburb}</em>}
                    </label>

                    <div
                      className={`ship-field${errors.state ? ' invalid' : ''}`}
                      data-field="state"
                    >
                      <span>State</span>
                      <StateSelect
                        value={shipping.state}
                        invalid={Boolean(errors.state)}
                        onChange={(value) => setField('state', value)}
                      />
                      {errors.state && <em>{errors.state}</em>}
                    </div>

                    <label
                      className={`ship-field${errors.postcode ? ' invalid' : ''}`}
                      data-field="postcode"
                    >
                      <span>Postcode</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        name="postal-code"
                        enterKeyHint="done"
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
                        enterKeyHint="done"
                        placeholder="Leave at front door / access code"
                        value={shipping.notes}
                        onChange={(e) => setField('notes', e.target.value)}
                      />
                    </label>
                  </div>

                  <div className="ship-methods">
                    <h3>Delivery method</h3>
                    {qualifiesFreeShip && (
                      <p className="ship-free-note">
                        Free shipping unlocked — your order is over $
                        {freeThreshold} AUD.
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
                  promoCode={promoCode}
                  redeemDisc={redeemDisc}
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

          {step === 3 && !placedOrder && (
            <div className="checkout-step">
              <div className="checkout-main">
                <h2 className="checkout-title">PAYMENT</h2>
                {authLoading ? (
                  <p className="checkout-auth-note">Checking your session…</p>
                ) : isLoggedIn ? (
                  <p className="checkout-auth-note logged-in">
                    Submitting as <strong>{user.email}</strong>
                  </p>
                ) : (
                  <p className="checkout-auth-note">
                    Guest checkout — points won&apos;t be saved to an account.
                  </p>
                )}
                <p className="ship-intro">
                  Pay by PayID after you submit. Use your order number as the
                  transfer reference so we can match payment quickly.
                </p>
                <BankTransferCard
                  amount={orderTotal}
                  toast={toast}
                  bank={bank}
                />
                <TikTokReward variant="compact" className="checkout-tiktok-reward" />
                <div className="ship-review">
                  <div className="ship-review-head">
                    <h3>Delivering to</h3>
                    <button
                      type="button"
                      className="text-link ship-edit-btn"
                      onClick={() => goToStep(2)}
                    >
                      Edit
                    </button>
                  </div>
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
                    {method.name} —{' '}
                    {qualifiesFreeShip ? 'FREE' : fmt(method.price)}
                  </p>
                </div>
                <div className="checkout-legal">
                  <p className="checkout-legal-banner">
                    <strong>18+ · Research use only</strong>
                    {LEGAL.ruoShort} {LEGAL.ageLine}
                  </p>
                  <label className="checkout-legal-ack">
                    <input
                      type="checkbox"
                      checked={legalAck}
                      onChange={(e) => setLegalAck(e.target.checked)}
                    />
                    <span>{LEGAL.checkoutAck}</span>
                  </label>
                  <p className="checkout-policy-links">
                    <Link to="/terms" onClick={close}>
                      Terms
                    </Link>
                    <Link to="/privacy" onClick={close}>
                      Privacy
                    </Link>
                    <Link to="/shipping-policy" onClick={close}>
                      Shipping
                    </Link>
                    <Link to="/returns" onClick={close}>
                      Returns
                    </Link>
                    <Link to="/legal" onClick={close}>
                      Compliance
                    </Link>
                  </p>
                </div>
              </div>
              <div className="checkout-sidebar">
                <OrderSummary
                  sub={sub}
                  disc={disc}
                  promoApplied={promoApplied}
                  promoCode={promoCode}
                  redeemDisc={redeemDisc}
                  shipFee={shipFee}
                  shipLabel={shipLabel}
                  total={orderTotal}
                  earnPts={orderEarnPts}
                  showTrust
                />
              </div>
            </div>
          )}

          {placedOrder && (
            <div className="checkout-step">
              <div className="checkout-main">
                <h2 className="checkout-title">ORDER SUBMITTED</h2>
                <div className="order-confirm">
                  <p className="order-confirm-id">
                    Order <strong>{placedOrder.id}</strong>
                  </p>
                  <p>
                    Status: <em>{placedOrder.status}</em>. Transfer{' '}
                    <strong>{fmt(placedOrder.total)}</strong> using the details
                    below. Use <strong>{placedOrder.id}</strong> as your payment
                    reference. We&apos;ll dispatch once payment clears.
                  </p>
                  <p className="order-spam-note">
                    We&apos;ve sent a confirmation email with payment details.
                    If you don&apos;t see it, check your <strong>spam / junk</strong>{' '}
                    folder — payment and shipping updates will go there too.
                  </p>
                </div>
                <TikTokReward variant="panel" className="checkout-tiktok-reward" />
                <BankTransferCard
                  reference={placedOrder.id}
                  amount={placedOrder.total}
                  toast={toast}
                  bank={bank}
                />
                <p className="checkout-legal-banner soft">
                  {LEGAL.ruoFull} {LEGAL.ageLine}
                </p>
              </div>
              <div className="checkout-sidebar">
                <div className="summary-card">
                  <h3>What&apos;s next</h3>
                  <ol className="order-next-steps">
                    <li>Open your bank app → PayID</li>
                    <li>Send to PayID <strong>0400001235</strong></li>
                    <li>Enter {placedOrder.id} as the reference</li>
                    <li>We confirm payment and ship your order</li>
                    <li>
                      Check spam/junk for confirmation and shipping emails
                    </li>
                  </ol>
                  {isLoggedIn ? (
                    <p className="bank-transfer-note">
                      Track this order anytime in your{' '}
                      <Link to="/account" onClick={close}>
                        account
                      </Link>
                      .
                    </p>
                  ) : (
                    <p className="bank-transfer-note">
                      Save the order number — or{' '}
                      <button
                        type="button"
                        className="text-link-btn"
                        onClick={() => {
                          close()
                          openAuth('signup')
                        }}
                      >
                        create an account
                      </button>{' '}
                      before your next order.
                    </p>
                  )}
                </div>
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
                  {fmt(
                    placedOrder
                      ? placedOrder.total
                      : step === 1
                        ? totalVal
                        : orderTotal,
                  )}
                </span>
              </div>
              <span className="pts">
                +
                {placedOrder
                  ? placedOrder.pointsEarned
                  : step === 1
                    ? earnPts
                    : orderEarnPts}{' '}
                Primal Points
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
                  {placedOrder ? 'Close' : step === 1 ? 'Shop' : 'Back'}
                </span>
              </button>
              <button
                className={`checkout-next-btn ${primarySubmitClass}`}
                type="button"
                aria-label={primaryLabel}
                disabled={
                  !placedOrder && (empty || submitting || (step === 3 && authLoading))
                }
                onClick={goNext}
              >
                <span className="btn-label-full" aria-hidden="true">
                  {primaryLabel}
                </span>
                <span className="btn-label-short" aria-hidden="true">
                  {placedOrder
                    ? 'Done'
                    : empty
                      ? 'Add items'
                      : step === 1
                        ? 'Shipping'
                        : step === 2
                          ? 'Payment'
                          : 'Submit'}
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
