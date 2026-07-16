import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  PRODUCTS,
  PTS_PER_DOLLAR,
  defaultVariant,
  findVariant,
  fmt,
  imgSrc,
} from '../data/products'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const product = PRODUCTS.find((p) => p.id === id)
  const { addToCart, toast } = useCart()
  const {
    getProductReviews,
    canReviewProduct,
    addReview,
    isLoggedIn,
    openAuth,
  } = useAuth()

  const [variantId, setVariantId] = useState(
    product ? defaultVariant(product).id : '',
  )
  const [reviewBody, setReviewBody] = useState('')
  const [rating, setRating] = useState(5)

  const variant = product ? findVariant(product, variantId) : null
  const reviews = useMemo(
    () => (product ? getProductReviews(product.id) : []),
    [getProductReviews, product],
  )
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0
  const canReview = product ? canReviewProduct(product.id) : false

  if (!product || !variant) {
    return (
      <div className="pdp-page">
        <div className="wrap pdp-missing">
          <h1>Product not found</h1>
          <Link to="/#shop" className="btn-primary">
            Back to shop
          </Link>
        </div>
      </div>
    )
  }

  const handleAdd = () => {
    addToCart(product.id, variant.id)
  }

  const submitReview = (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      openAuth('login')
      return
    }
    const res = addReview({
      productId: product.id,
      rating,
      body: reviewBody,
    })
    if (!res.ok) {
      toast(res.error)
      return
    }
    setReviewBody('')
    toast('Thanks for the review ✓')
  }

  return (
    <div className="pdp-page">
      <div className="wrap">
        <button
          className="pdp-back"
          type="button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="pdp-grid">
          <div className="pdp-visual">
            <div className="spot-emblem pdp-emblem" aria-hidden="true">
              <span className="spot-emblem-glow" />
              <span className="spot-emblem-ring spot-emblem-ring-outer" />
              <span className="spot-emblem-ring spot-emblem-ring-mid" />
              <span className="spot-emblem-arc" />
              <span className="spot-emblem-ring spot-emblem-ring-inner" />
              <img className="spot-emblem-logo" src="/logo.png" alt="" />
            </div>
            <img
              src={imgSrc(variant.img)}
              alt={`${product.name} ${variant.label}`}
            />
          </div>

          <div className="pdp-copy">
            <span className="eyebrow">{product.tag}</span>
            <h1>{product.name}</h1>
            <p className="pdp-sub">{product.sub}</p>

            <div className="pdp-rating">
              {reviews.length > 0 ? (
                <>
                  <strong>{avg.toFixed(1)}</strong>
                  <span className="pdp-stars">
                    {'★'.repeat(Math.round(avg))}
                    {'☆'.repeat(5 - Math.round(avg))}
                  </span>
                  <a href="#reviews">
                    {reviews.length} review{reviews.length === 1 ? '' : 's'}
                  </a>
                </>
              ) : (
                <span className="pdp-no-reviews">No reviews yet</span>
              )}
            </div>

            <p className="pdp-story">{product.story}</p>

            <div className="pdp-meta">
              <div>
                <span>Purity</span>
                <strong>99%+</strong>
              </div>
              <div>
                <span>MW</span>
                <strong>{product.mw}</strong>
              </div>
              <div>
                <span>Lot</span>
                <strong>{product.lot}</strong>
              </div>
            </div>

            <div className="dose-select dose-select-multi">
              <span className="dose-label">Dose</span>
              <div className="dose-options">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={`dose-chip${variantId === v.id ? ' active' : ''}`}
                    onClick={() => setVariantId(v.id)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pdp-buy">
              <div>
                <span className="price">{fmt(variant.price)}</span>
                <span className="pts">
                  +{variant.price * PTS_PER_DOLLAR} pts
                </span>
              </div>
              <button className="btn-primary" type="button" onClick={handleAdd}>
                Add to cart
              </button>
            </div>

            {product.perks?.length > 0 && (
              <ul className="pdp-perks">
                {product.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <section className="pdp-reviews" id="reviews">
          <div className="pdp-reviews-head">
            <h2>Reviews</h2>
            <span>
              {reviews.length} review{reviews.length === 1 ? '' : 's'}
              {reviews.length > 0 ? ` · ${avg.toFixed(1)} avg` : ''}
            </span>
          </div>

          {canReview && (
            <form className="dash-composer" onSubmit={submitReview}>
              <div className="dash-composer-head">
                <h3>Write a review</h3>
                <p>Available after you purchase this product while signed in.</p>
              </div>
              <div className="dash-composer-grid">
                <label className="ship-field">
                  <span>Rating</span>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} stars
                      </option>
                    ))}
                  </select>
                </label>
                <label className="ship-field ship-span-2">
                  <span>Your review</span>
                  <textarea
                    rows={3}
                    required
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    placeholder="How was packaging, dispatch speed, labelling?"
                  />
                </label>
              </div>
              <button className="btn-primary" type="submit">
                Submit review
              </button>
            </form>
          )}

          {!canReview && !isLoggedIn && (
            <p className="dash-form-help">
              <button
                type="button"
                className="text-link"
                onClick={() => openAuth('login')}
              >
                Sign in
              </button>{' '}
              after purchasing to leave a review.
            </p>
          )}

          {reviews.length === 0 ? (
            <div className="dash-empty-state wide">
              <h3>No reviews yet</h3>
              <p>Be the first to review this product after purchase.</p>
            </div>
          ) : (
            <div className="pdp-review-list">
              {reviews.map((r) => (
                <article key={r.id} className="pdp-review">
                  <div className="pdp-review-top">
                    <strong>{r.userName}</strong>
                    <span>{'★'.repeat(r.rating)}</span>
                  </div>
                  <p>{r.body}</p>
                  <time>
                    {new Date(r.createdAt).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </time>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
