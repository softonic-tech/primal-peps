import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FILTERS,
  PTS_PER_DOLLAR,
  defaultVariant,
  findVariant,
  fmt,
  imgSrc,
  isInStock,
  productHasStock,
} from '../data/products'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductsContext'
import { useFinePointer, useReducedMotion } from '../hooks/useMedia'
import { useReveal } from '../hooks/useReveal'

function ProductCard({ product, index }) {
  const { addToCart } = useCart()
  const { getProductReviews } = useAuth()
  const [added, setAdded] = useState(false)
  const [variantId, setVariantId] = useState(defaultVariant(product).id)
  const variant = findVariant(product, variantId)
  const cardRef = useReveal()
  const reduceMotion = useReducedMotion()
  const finePointer = useFinePointer()
  const multiVariant = product.variants.length > 1
  const reviewCount = getProductReviews(product.id).length

  useEffect(() => {
    setVariantId(defaultVariant(product).id)
  }, [product])

  useEffect(() => {
    const card = cardRef.current
    if (!card || reduceMotion || !finePointer) return

    const onMove = (e) => {
      const r = card.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      card.style.setProperty('--mx', `${x}px`)
      card.style.setProperty('--my', `${y}px`)
      card.style.setProperty('--rx', `${(y / r.height - 0.5) * -5}deg`)
      card.style.setProperty('--ry', `${(x / r.width - 0.5) * 6}deg`)
    }
    const onLeave = () => {
      card.style.setProperty('--mx', '50%')
      card.style.setProperty('--my', '50%')
      card.style.setProperty('--rx', '0deg')
      card.style.setProperty('--ry', '0deg')
    }
    card.addEventListener('pointermove', onMove)
    card.addEventListener('pointerleave', onLeave)
    return () => {
      card.removeEventListener('pointermove', onMove)
      card.removeEventListener('pointerleave', onLeave)
    }
  }, [cardRef, reduceMotion, finePointer])

  const inStock = isInStock(variant)
  const anyInStock = productHasStock(product)

  const handleAdd = () => {
    if (!inStock) return
    addToCart(product.id, variant.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 1100)
  }

  return (
    <article
      className={`card rv${!anyInStock ? ' card-oos' : ''}`}
      id={`card-${product.id}`}
      data-cat={product.cat}
      ref={cardRef}
    >
      <div className="card-topline">
        <span className="collection">
          {product.categoryLabel || 'Research'} ·{' '}
          {String(index).padStart(3, '0')}
        </span>
        <span className={`stock${inStock ? '' : ' stock-oos'}`}>
          {inStock ? 'In stock' : 'Out of stock'}
        </span>
      </div>
      <div
        className="product-visual"
        data-index={String(index).padStart(2, '0')}
      >
        <div className="card-mark" aria-hidden="true">
          <span className="card-mark-orbit card-mark-orbit-a" />
          <span className="card-mark-orbit card-mark-orbit-b" />
          <span className="card-mark-orbit card-mark-orbit-c" />
          <span className="card-mark-ring" />
          <span className="card-mark-ring card-mark-ring-outer" />
        </div>
        <div className="vial">
          <img
            key={variant.img}
            src={imgSrc(variant.img)}
            alt={`${product.name} ${variant.label}`}
            loading="lazy"
          />
        </div>
        <span className="grade-pill">{product.tag}</span>
        <div className="quick-view">
          <Link to={`/product/${product.id}`}>View details</Link>
        </div>
      </div>
      <div className="card-copy">
        <h3>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <span className="sub">{product.sub}</span>
        {reviewCount > 0 && (
          <Link className="card-reviews" to={`/product/${product.id}#reviews`}>
            {reviewCount} review{reviewCount === 1 ? '' : 's'}
          </Link>
        )}
        <div className="data-strip">
          <span>99%+ purity</span>
          <span>{product.mw}</span>
          <span>{product.lot}</span>
        </div>

        <div
          className={`dose-select${multiVariant ? ' dose-select-multi' : ''}`}
          role="group"
          aria-label={`${product.name} dosage`}
        >
          <span className="dose-label">Dose</span>
          <div className="dose-options">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`dose-chip${variantId === v.id ? ' active' : ''}${
                  isInStock(v) ? '' : ' dose-oos'
                }`}
                aria-pressed={variantId === v.id}
                onClick={() => setVariantId(v.id)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card-foot">
          <div>
            {inStock ? (
              <>
                <span className="price">{fmt(variant.price)}</span>
                <span className="pts">
                  +{variant.price * PTS_PER_DOLLAR} pts
                </span>
              </>
            ) : (
              <span className="price-oos-label">Out of stock</span>
            )}
          </div>
          <button
            className={`add-btn-round add-btn${added ? ' added' : ''}${
              inStock ? '' : ' is-disabled'
            }`}
            data-id={product.id}
            aria-label={
              inStock
                ? `Add ${product.name} ${variant.label} to cart`
                : `${product.name} ${variant.label} out of stock`
            }
            type="button"
            disabled={!inStock}
            onClick={handleAdd}
          >
            {added ? '✓' : inStock ? '+' : '–'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default function Shop() {
  const { products, loading, error } = useProducts()
  const [activeFilter, setActiveFilter] = useState('all')
  const hairRef = useReveal({ threshold: 0.5 })
  const headRef = useReveal()
  const railRef = useReveal()

  const filtered =
    activeFilter === 'all'
      ? products
      : products.filter((p) => p.cat === activeFilter)

  return (
    <section className="section" id="shop">
      <div className="wrap">
        <div className="hairline rv" ref={hairRef} />
        <div className="sec-head rv" style={{ marginTop: 48 }} ref={headRef}>
          <div>
            <span className="eyebrow">The lineup</span>
            <h2>
              PEPTIDES <span className="gold">IN STOCK</span>
            </h2>
          </div>
          <p>
            Every vial ships from stock — no backorders, no waiting. Add to cart
            and earn 2 Primal Points on every dollar.
          </p>
        </div>
        <div className="shop-layout">
          <aside className="filter-rail rv" ref={railRef}>
            <h4>Filter by</h4>
            <div className="filter-chips" id="filterChips">
              {FILTERS.map((f) => (
                <button
                  key={f.cat}
                  className={`filter-chip${activeFilter === f.cat ? ' active' : ''}`}
                  data-cat={f.cat}
                  type="button"
                  onClick={() => setActiveFilter(f.cat)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </aside>
          <div className="grid" id="productGrid">
            {loading && <p className="muted">Loading products…</p>}
            {error && <p className="muted">{error}</p>}
            {!loading && !error && filtered.length === 0 && (
              <p className="muted">No products available yet.</p>
            )}
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i + 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
