import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FILTERS,
  SPOTLIGHT_IDS,
  defaultVariant,
  fmt,
  imgSrc,
  isInStock,
  listPrice,
  productHasStock,
} from '../data/products'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import { useReveal } from '../hooks/useReveal'

const CATEGORIES = FILTERS.filter((f) => f.cat !== 'all')

function CatalogCard({ product }) {
  const { addToCart, setCartOpen } = useCart()
  const [added, setAdded] = useState(false)
  const variant = defaultVariant(product)
  const inStock = isInStock(variant)
  const price = variant?.price ?? 0
  const was = listPrice(price)

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock || !variant) return
    addToCart(product.id, variant.id, 1)
    setCartOpen(true)
    setAdded(true)
    setTimeout(() => setAdded(false), 1100)
  }

  return (
    <article className={`catalog-card${!inStock ? ' is-oos' : ''}`}>
      <Link
        className="catalog-card-media"
        to={`/product/${product.id}`}
        aria-label={`View ${product.name}`}
      >
        <img
          src={imgSrc(variant?.img)}
          alt={`${product.name} ${variant?.label || ''}`}
          loading="lazy"
        />
        <span className="catalog-card-tag">{product.tag || 'Research'}</span>
      </Link>
      <div className="catalog-card-body">
        <div className="catalog-card-top">
          <h3>
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <p>{product.sub}</p>
        </div>
        <div className="catalog-card-meta">
          <span>{variant?.label || '—'}</span>
          <span className={inStock ? '' : 'is-oos'}>
            {inStock ? 'In stock' : 'Out of stock'}
          </span>
        </div>
        <div className="catalog-card-foot">
          <div className="catalog-card-price">
            {inStock ? (
              <>
                <span className="sale-was">{fmt(was)}</span>
                <strong>{fmt(price)}</strong>
              </>
            ) : (
              <strong className="price-oos-label">Unavailable</strong>
            )}
          </div>
          <div className="catalog-card-actions">
            <Link className="catalog-view" to={`/product/${product.id}`}>
              View
            </Link>
            <button
              type="button"
              className={`catalog-add${added ? ' added' : ''}`}
              disabled={!inStock}
              onClick={handleAdd}
            >
              {added ? 'Added' : inStock ? 'Add' : '—'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function Spotlight() {
  const { products, loading } = useProducts()
  const headRef = useReveal()
  const gridRef = useReveal()
  const hairRef = useReveal({ threshold: 0.5 })

  const catalogue = useMemo(() => {
    const byId = Object.fromEntries(products.map((p) => [p.id, p]))
    const featured = SPOTLIGHT_IDS.map((id) => byId[id]).filter(Boolean)
    const rest = products.filter((p) => !SPOTLIGHT_IDS.includes(p.id))
    const ordered = [...featured, ...rest]
    const inStock = ordered.filter(productHasStock)
    const pool = inStock.length ? inStock : ordered
    return pool.slice(0, 8)
  }, [products])

  if (loading) {
    return (
      <section className="catalogue" id="catalogue">
        <div className="wrap">
          <p className="muted">Loading catalogue…</p>
        </div>
      </section>
    )
  }

  if (!catalogue.length) return null

  return (
    <section className="catalogue" id="catalogue">
      <div className="wrap">
        <div className="hairline rv" ref={hairRef} />
        <div className="catalogue-head rv" ref={headRef}>
          <div>
            <span className="eyebrow">Start here</span>
            <h2>
              PRODUCT <span className="gold">CATALOGUE</span>
            </h2>
            <p>
              Pick a product below, or jump to a category. Full shop with packs
              and filters is one click away.
            </p>
          </div>
          <a className="btn-primary" href="#shop">
            Full shop →
          </a>
        </div>

        <div className="catalogue-cats" aria-label="Catalogue categories">
          <a className="catalogue-cat active" href="#shop">
            All
          </a>
          {CATEGORIES.map((f) => (
            <a
              key={f.cat}
              className="catalogue-cat"
              href={`/?cat=${f.cat}#shop`}
            >
              {f.label}
            </a>
          ))}
        </div>

        <div className="catalogue-grid rv" ref={gridRef}>
          {catalogue.map((product) => (
            <CatalogCard key={product.id} product={product} />
          ))}
        </div>

        <div className="catalogue-more">
          <a className="btn-ghost" href="#shop">
            See all products in the shop →
          </a>
        </div>
      </div>
    </section>
  )
}
