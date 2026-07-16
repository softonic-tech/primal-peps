import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PRODUCTS, fmt, imgSrc, orderItemImg } from '../data/products'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const TABS = [
  { id: 'overview', label: 'Home', hint: 'Snapshot' },
  { id: 'orders', label: 'Orders', hint: 'History' },
  { id: 'reviews', label: 'Reviews', hint: 'Feedback' },
  { id: 'profile', label: 'Profile', hint: 'Shipping' },
  { id: 'password', label: 'Security', hint: 'Password' },
]

function TabIcon({ id }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  }
  switch (id) {
    case 'overview':
      return (
        <svg {...common}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      )
    case 'orders':
      return (
        <svg {...common}>
          <path d="M7 7V5.5A1.5 1.5 0 0 1 8.5 4h7A1.5 1.5 0 0 1 17 5.5V7" />
          <rect x="4" y="7" width="16" height="13" rx="2" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      )
    case 'reviews':
      return (
        <svg {...common}>
          <path d="M12 3.5 14.4 9l5.8.5-4.4 3.8 1.4 5.7L12 16.2 6.8 19l1.4-5.7L3.8 9.5 9.6 9 12 3.5Z" />
        </svg>
      )
    case 'profile':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 19.5c1.6-3.2 4-4.8 7-4.8s5.4 1.6 7 4.8" />
        </svg>
      )
    case 'password':
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      )
    default:
      return null
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function Stars({ value }) {
  return (
    <span className="dash-stars" aria-label={`${value} out of 5`}>
      {'★'.repeat(value)}
      <span className="dash-stars-empty">{'★'.repeat(5 - value)}</span>
    </span>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { toast } = useCart()
  const {
    user,
    isLoggedIn,
    openAuth,
    logout,
    updateProfile,
    updateShipping,
    updatePassword,
    addReview,
    reviewableProducts,
    getProductReviews,
  } = useAuth()
  const [tab, setTab] = useState('overview')
  const [profile, setProfile] = useState(null)
  const [ship, setShip] = useState(null)
  const [pass, setPass] = useState({ current: '', next: '', confirm: '' })
  const [reviewForm, setReviewForm] = useState({
    productId: '',
    rating: 5,
    body: '',
  })

  const myReviews = useMemo(() => {
    if (!user) return []
    return PRODUCTS.flatMap((p) =>
      getProductReviews(p.id)
        .filter((r) => r.userId === user.id)
        .map((r) => ({ ...r, productName: p.name })),
    )
  }, [getProductReviews, user])

  if (!isLoggedIn || !user) {
    return (
      <div className="dash-page">
        <div className="dash-atmosphere" aria-hidden="true" />
        <div className="wrap">
          <div className="dash-gate">
            <div className="dash-gate-mark">
              <img src="/logo.png" alt="" />
            </div>
            <p className="dash-kicker">Member access</p>
            <h1>Your research HQ</h1>
            <p>
              Track points, orders, and shipping in one place. Shopping as a
              guest still works — an account just makes reorder day easier.
            </p>
            <div className="dash-gate-actions">
              <button
                className="btn-primary"
                type="button"
                onClick={() => openAuth('login')}
              >
                Sign in
              </button>
              <button
                className="btn-ghost"
                type="button"
                onClick={() => openAuth('signup')}
              >
                Create account
              </button>
            </div>
            <Link className="dash-gate-back" to="/">
              ← Back to storefront
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const firstName = user.fullName?.split(' ')[0] || 'Member'
  const initial = (user.fullName || user.email || 'U').charAt(0).toUpperCase()
  const orders = user.orders || []
  const latestOrder = orders[0]
  const profileState = profile ?? {
    fullName: user.fullName || '',
    phone: user.phone || '',
  }
  const shipState = ship ?? {
    line1: user.shipping?.line1 || '',
    line2: user.shipping?.line2 || '',
    suburb: user.shipping?.suburb || '',
    state: user.shipping?.state || '',
    postcode: user.shipping?.postcode || '',
  }

  const saveProfile = (e) => {
    e.preventDefault()
    const res = updateProfile(profileState)
    if (!res.ok) {
      toast(res.error)
      return
    }
    const shipRes = updateShipping(shipState)
    if (!shipRes.ok) {
      toast(shipRes.error)
      return
    }
    setProfile(null)
    setShip(null)
    toast('Profile saved ✓')
  }

  const savePassword = (e) => {
    e.preventDefault()
    if (pass.next !== pass.confirm) {
      toast('New passwords do not match')
      return
    }
    const res = updatePassword(pass.current, pass.next)
    if (!res.ok) {
      toast(res.error)
      return
    }
    setPass({ current: '', next: '', confirm: '' })
    toast('Password updated ✓')
  }

  const submitReview = (e) => {
    e.preventDefault()
    if (!reviewForm.productId || !reviewForm.body.trim()) {
      toast('Choose a product and write a short review')
      return
    }
    const res = addReview(reviewForm)
    if (!res.ok) {
      toast(res.error)
      return
    }
    setReviewForm({ productId: '', rating: 5, body: '' })
    toast('Review published ✓')
  }

  const activeTab = TABS.find((t) => t.id === tab) || TABS[0]

  return (
    <div className="dash-page">
      <div className="dash-atmosphere" aria-hidden="true" />
      <div className="wrap dash-shell">
        <header className="dash-hero">
          <div className="dash-hero-identity">
            <div className="dash-avatar" aria-hidden="true">
              {initial}
            </div>
            <div>
              <p className="dash-kicker">Account</p>
              <h1>{firstName}</h1>
              <p className="dash-hero-email">{user.email}</p>
            </div>
          </div>
          <div className="dash-hero-side">
            <div className="dash-points-chip">
              <span>Primal Points</span>
              <strong>{(user.points || 0).toLocaleString()}</strong>
            </div>
            <div className="dash-hero-actions">
              <Link to="/#shop" className="btn-primary dash-shop-btn">
                Shop lineup
              </Link>
              <button
                className="dash-text-btn"
                type="button"
                onClick={() => {
                  logout()
                  toast('Signed out')
                  navigate('/')
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <nav className="dash-tabs" aria-label="Account sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`dash-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
              aria-label={t.label}
              aria-current={tab === t.id ? 'page' : undefined}
              title={t.label}
            >
              <span className="dash-tab-icon">
                <TabIcon id={t.id} />
              </span>
              <span className="dash-tab-label">{t.label}</span>
              <span className="dash-tab-hint">{t.hint}</span>
            </button>
          ))}
        </nav>

        <div className="dash-stage">
          <div className="dash-stage-head">
            <div className="dash-stage-titles">
              <h2>{activeTab.label}</h2>
              <p>{activeTab.hint}</p>
            </div>
          </div>

          {tab === 'overview' && (
            <section className="dash-section">
              <div className="dash-metric-row">
                <button
                  type="button"
                  className="dash-metric"
                  onClick={() => setTab('orders')}
                >
                  <span className="dash-metric-label">Orders</span>
                  <strong>{orders.length}</strong>
                  <span className="dash-metric-cta">View history →</span>
                </button>
                <button
                  type="button"
                  className="dash-metric accent"
                  onClick={() => setTab('overview')}
                >
                  <span className="dash-metric-label">Points balance</span>
                  <strong>{(user.points || 0).toLocaleString()}</strong>
                  <span className="dash-metric-cta">Earn 2 pts / $1</span>
                </button>
                <button
                  type="button"
                  className="dash-metric"
                  onClick={() => setTab('reviews')}
                >
                  <span className="dash-metric-label">Reviews</span>
                  <strong>{myReviews.length}</strong>
                  <span className="dash-metric-cta">
                    {reviewableProducts.length
                      ? `${reviewableProducts.length} ready to rate`
                      : 'Manage feedback →'}
                  </span>
                </button>
              </div>

              <div className="dash-split">
                <article className="dash-block">
                  <div className="dash-block-head">
                    <h3>Latest order</h3>
                    {latestOrder && (
                      <button
                        type="button"
                        className="dash-text-btn"
                        onClick={() => setTab('orders')}
                      >
                        All orders
                      </button>
                    )}
                  </div>
                  {!latestOrder ? (
                    <div className="dash-empty-state">
                      <p>No orders yet.</p>
                      <Link to="/#shop" className="btn-ghost">
                        Browse peptides →
                      </Link>
                    </div>
                  ) : (
                    <div className="dash-latest">
                      <div className="dash-latest-top">
                        <div>
                          <strong>{latestOrder.id}</strong>
                          <span>{formatDate(latestOrder.createdAt)}</span>
                        </div>
                        <span className="dash-pill">{latestOrder.status}</span>
                      </div>
                      <div className="dash-latest-items">
                        {latestOrder.items.slice(0, 3).map((item, i) => (
                          <div key={`${latestOrder.id}-${i}`} className="dash-thumb-row">
                            <img src={imgSrc(orderItemImg(item))} alt="" />
                            <div>
                              <strong>{item.name}</strong>
                              <span>
                                {item.variantLabel} · Qty {item.qty}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="dash-latest-foot">
                        <span>+{latestOrder.pointsEarned} pts</span>
                        <strong>{fmt(latestOrder.total)}</strong>
                      </div>
                    </div>
                  )}
                </article>

                <article className="dash-block">
                  <div className="dash-block-head">
                    <h3>Saved shipping</h3>
                    <button
                      type="button"
                      className="dash-text-btn"
                      onClick={() => setTab('profile')}
                    >
                      Edit
                    </button>
                  </div>
                  {user.shipping?.line1 ? (
                    <address className="dash-address">
                      <strong>{user.fullName}</strong>
                      <span>{user.shipping.line1}</span>
                      {user.shipping.line2 && <span>{user.shipping.line2}</span>}
                      <span>
                        {user.shipping.suburb} {user.shipping.state}{' '}
                        {user.shipping.postcode}
                      </span>
                      <span>Australia</span>
                    </address>
                  ) : (
                    <div className="dash-empty-state">
                      <p>Add an address once — checkout will autofill it.</p>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => setTab('profile')}
                      >
                        Add shipping →
                      </button>
                    </div>
                  )}
                </article>
              </div>
            </section>
          )}

          {tab === 'orders' && (
            <section className="dash-section">
              {orders.length === 0 ? (
                <div className="dash-empty-state wide">
                  <h3>Nothing shipped yet</h3>
                  <p>When you place an order while signed in, it lands here.</p>
                  <Link to="/#shop" className="btn-primary">
                    Shop the lineup
                  </Link>
                </div>
              ) : (
                <div className="dash-orders">
                  {orders.map((o) => (
                    <article key={o.id} className="dash-order">
                      <div className="dash-order-head">
                        <div>
                          <strong>{o.id}</strong>
                          <span>{formatDate(o.createdAt)}</span>
                        </div>
                        <span className="dash-pill">{o.status}</span>
                      </div>
                      <ul>
                        {o.items.map((item, i) => (
                          <li key={`${o.id}-${i}`}>
                            <img src={imgSrc(orderItemImg(item))} alt="" />
                            <div>
                              <strong>{item.name}</strong>
                              <span>
                                {item.variantLabel} · Qty {item.qty}
                              </span>
                            </div>
                            <em>{fmt(item.price * item.qty)}</em>
                          </li>
                        ))}
                      </ul>
                      <div className="dash-order-foot">
                        <span>+{o.pointsEarned} Primal Points</span>
                        <strong>{fmt(o.total)}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === 'reviews' && (
            <section className="dash-section">
              {reviewableProducts.length > 0 && (
                <form className="dash-composer" onSubmit={submitReview}>
                  <div className="dash-composer-head">
                    <h3>Write a review</h3>
                    <p>Only available after a purchase.</p>
                  </div>
                  <div className="dash-composer-grid">
                    <label className="ship-field">
                      <span>Product</span>
                      <select
                        value={reviewForm.productId}
                        onChange={(e) =>
                          setReviewForm((f) => ({
                            ...f,
                            productId: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select product</option>
                        {reviewableProducts.map((id) => {
                          const p = PRODUCTS.find((x) => x.id === id)
                          return (
                            <option key={id} value={id}>
                              {p?.name || id}
                            </option>
                          )
                        })}
                      </select>
                    </label>
                    <label className="ship-field">
                      <span>Rating</span>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) =>
                          setReviewForm((f) => ({
                            ...f,
                            rating: Number(e.target.value),
                          }))
                        }
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n} star{n > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="ship-field ship-span-2">
                      <span>Your experience</span>
                      <textarea
                        rows={4}
                        value={reviewForm.body}
                        onChange={(e) =>
                          setReviewForm((f) => ({ ...f, body: e.target.value }))
                        }
                        placeholder="Packaging, dispatch speed, labelling clarity…"
                      />
                    </label>
                  </div>
                  <button className="btn-primary" type="submit">
                    Publish review
                  </button>
                </form>
              )}

              {myReviews.length === 0 ? (
                <div className="dash-empty-state wide">
                  <h3>No reviews yet</h3>
                  <p>
                    After your first delivered order, you can rate the product
                    experience here and on its detail page.
                  </p>
                </div>
              ) : (
                <div className="dash-reviews">
                  {myReviews.map((r) => (
                    <article key={r.id} className="dash-review">
                      <div className="dash-review-head">
                        <strong>{r.productName}</strong>
                        <Stars value={r.rating} />
                      </div>
                      <p>{r.body}</p>
                      <div className="dash-review-foot">
                        <time>{formatDate(r.createdAt)}</time>
                        <Link to={`/product/${r.productId}`}>View product →</Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === 'profile' && (
            <section className="dash-section">
              <form className="dash-form-card" onSubmit={saveProfile}>
                <div className="dash-form-section">
                  <h3>Contact</h3>
                  <div className="ship-grid">
                    <label className="ship-field">
                      <span>Full name</span>
                      <input
                        value={profileState.fullName}
                        onChange={(e) =>
                          setProfile({
                            ...profileState,
                            fullName: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label className="ship-field">
                      <span>Phone</span>
                      <input
                        value={profileState.phone}
                        onChange={(e) =>
                          setProfile({
                            ...profileState,
                            phone: e.target.value,
                          })
                        }
                      />
                    </label>
                  </div>
                </div>
                <div className="dash-form-section">
                  <h3>AU shipping address</h3>
                  <p className="dash-form-help">
                    Prefills checkout when you&apos;re signed in. Editable any
                    time.
                  </p>
                  <div className="ship-grid">
                    <label className="ship-field ship-span-2">
                      <span>Address line 1</span>
                      <input
                        value={shipState.line1}
                        onChange={(e) =>
                          setShip({ ...shipState, line1: e.target.value })
                        }
                      />
                    </label>
                    <label className="ship-field ship-span-2">
                      <span>Address line 2</span>
                      <input
                        value={shipState.line2}
                        onChange={(e) =>
                          setShip({ ...shipState, line2: e.target.value })
                        }
                      />
                    </label>
                    <label className="ship-field">
                      <span>Suburb</span>
                      <input
                        value={shipState.suburb}
                        onChange={(e) =>
                          setShip({ ...shipState, suburb: e.target.value })
                        }
                      />
                    </label>
                    <label className="ship-field">
                      <span>State</span>
                      <input
                        value={shipState.state}
                        onChange={(e) =>
                          setShip({ ...shipState, state: e.target.value })
                        }
                        placeholder="VIC"
                      />
                    </label>
                    <label className="ship-field">
                      <span>Postcode</span>
                      <input
                        value={shipState.postcode}
                        onChange={(e) =>
                          setShip({ ...shipState, postcode: e.target.value })
                        }
                      />
                    </label>
                  </div>
                </div>
                <button className="btn-primary" type="submit">
                  Save changes
                </button>
              </form>
            </section>
          )}

          {tab === 'password' && (
            <section className="dash-section">
              <form className="dash-pass-card" onSubmit={savePassword}>
                <div className="dash-pass-intro">
                  <p>
                    Update the password for <strong>{user.email}</strong>.
                    Use at least 6 characters.
                  </p>
                </div>
                <div className="dash-pass-grid">
                  <label className="ship-field dash-pass-current">
                    <span>Current password</span>
                    <input
                      type="password"
                      value={pass.current}
                      onChange={(e) =>
                        setPass((p) => ({ ...p, current: e.target.value }))
                      }
                      required
                      autoComplete="current-password"
                    />
                  </label>
                  <label className="ship-field">
                    <span>New password</span>
                    <input
                      type="password"
                      minLength={6}
                      value={pass.next}
                      onChange={(e) =>
                        setPass((p) => ({ ...p, next: e.target.value }))
                      }
                      required
                      autoComplete="new-password"
                    />
                  </label>
                  <label className="ship-field">
                    <span>Confirm new password</span>
                    <input
                      type="password"
                      minLength={6}
                      value={pass.confirm}
                      onChange={(e) =>
                        setPass((p) => ({ ...p, confirm: e.target.value }))
                      }
                      required
                      autoComplete="new-password"
                    />
                  </label>
                </div>
                <button className="btn-primary" type="submit">
                  Update password
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
