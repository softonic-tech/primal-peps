import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  PTS_PER_DOLLAR,
  defaultVariant,
  findVariant,
  fmt,
  imgSrc,
  isInStock,
} from '../data/products'
import { LEGAL } from '../data/site'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProduct, loading } = useProducts()
  const product = getProduct(id)
  const { addToCart, toast } = useCart()
  const {
    getProductReviews,
    canReviewProduct,
    addReview,
    isLoggedIn,
    openAuth,
  } = useAuth()

  const [variantId, setVariantId] = useState('')
  const [reviewBody, setReviewBody] = useState('')
  const [rating, setRating] = useState(5)

  useEffect(() => {
    if (!product) return
    setVariantId((prev) => {
      if (prev && findVariant(product, prev)) return prev
      return defaultVariant(product)?.id || ''
    })
  }, [product])

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

  if (loading) {
    return (
      <div className="pdp-page">
        <div className="wrap pdp-missing">
          <h1>Loading…</h1>
        </div>
      </div>
    )
  }

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

  const inStock = isInStock(variant)

  const handleAdd = () => {
    if (!inStock) {
      toast(`${product.name} (${variant.label}) is out of stock`)
      return
    }
    addToCart(product.id, variant.id)
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      openAuth('login')
      return
    }
    const res = await addReview({
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
            </div>
            <img
              src={imgSrc(variant.img)}
              alt={`${product.name} ${variant.label}`}
            />
          </div>

          <div className="pdp-copy">
            <span className="eyebrow">
              {product.categoryLabel || product.tag}
            </span>
            <h1>{product.name}</h1>
            <p className="pdp-sub">{product.sub}</p>
            {product.aka?.length > 0 && (
              <p className="pdp-aka">
                Also known as {product.aka.join(' · ')}
              </p>
            )}

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
                <strong>{product.purity || '99%+'}</strong>
              </div>
              <div>
                <span>MW</span>
                <strong>{product.mw}</strong>
              </div>
              <div>
                <span>Form</span>
                <strong>{product.form || 'Lyophilised'}</strong>
              </div>
            </div>

            <div className="dose-select dose-select-multi">
              <span className="dose-label">Dose</span>
              <div className="dose-options">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={`dose-chip${variantId === v.id ? ' active' : ''}${
                      isInStock(v) ? '' : ' dose-oos'
                    }`}
                    onClick={() => setVariantId(v.id)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pdp-buy">
              <div>
                {inStock ? (
                  <>
                    <span className="price">{fmt(variant.price)}</span>
                    <span className="pts">
                      +{variant.price * PTS_PER_DOLLAR} pts
                    </span>
                    <span className="stock">In stock</span>
                  </>
                ) : (
                  <span className="stock stock-oos">Out of stock</span>
                )}
              </div>
              <button
                className="btn-primary"
                type="button"
                disabled={!inStock}
                onClick={handleAdd}
              >
                {inStock ? 'Add to cart' : 'Out of stock'}
              </button>
            </div>

            {product.perks?.length > 0 && (
              <ul className="pdp-perks">
                {product.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
            )}

            <aside className="pdp-ruo">
              <strong>18+ · Research use only</strong>
              {LEGAL.ruoShort} {LEGAL.ageLine}
            </aside>
          </div>
        </div>

        <section className="pdp-details" aria-label="Product details">
          <div className="pdp-details-grid">
            <article className="pdp-detail-block">
              <h2>Overview</h2>
              <p>{product.description || product.story}</p>
            </article>

            {product.researchFocus?.length > 0 && (
              <article className="pdp-detail-block">
                <h2>Key research areas</h2>
                <ul className="pdp-focus-list">
                  {product.researchFocus.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            )}

            {product.composition?.length > 0 && (
              <article className="pdp-detail-block">
                <h2>Blend composition</h2>
                <ul className="pdp-comp-list">
                  {product.composition.map((c) => (
                    <li key={c.name}>
                      <strong>{c.name}</strong>
                      <span>{c.amount || c.note || ''}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )}

            <article className="pdp-detail-block">
              <h2>Specifications</h2>
              <dl className="pdp-spec-table">
                <div>
                  <dt>Compound</dt>
                  <dd>
                    {product.name}
                    {variant ? ` (${variant.label})` : ''}
                  </dd>
                </div>
                {product.cas && (
                  <div>
                    <dt>CAS</dt>
                    <dd>{product.cas}</dd>
                  </div>
                )}
                <div>
                  <dt>Category</dt>
                  <dd>{product.categoryLabel || product.cat}</dd>
                </div>
                <div>
                  <dt>Purity</dt>
                  <dd>{product.purity || '99%+'}</dd>
                </div>
                <div>
                  <dt>Form</dt>
                  <dd>{product.form || 'Lyophilised powder'}</dd>
                </div>
                <div>
                  <dt>Molecular weight</dt>
                  <dd>{product.mw}</dd>
                </div>
                <div>
                  <dt>Lot</dt>
                  <dd>{product.lot}</dd>
                </div>
                <div>
                  <dt>Storage (lyophilised)</dt>
                  <dd>{product.storageLyophilised || '-20 °C'}</dd>
                </div>
                <div>
                  <dt>Storage (reconstituted)</dt>
                  <dd>{product.storageReconstituted || '2–8 °C'}</dd>
                </div>
                <div>
                  <dt>Reconstitution</dt>
                  <dd>
                    {product.reconstitution ||
                      'Bacteriostatic water (recommended)'}
                  </dd>
                </div>
              </dl>
            </article>
          </div>
        </section>

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
