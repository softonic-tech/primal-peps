import { useEffect, useMemo, useState } from 'react'
import {
  SPOTLIGHT_IDS,
  defaultVariant,
  fmt,
  imgSrc,
  isInStock,
  productHasStock,
} from '../data/products'
import { useProducts } from '../context/ProductsContext'
import { useReveal } from '../hooks/useReveal'

export default function Spotlight() {
  const { products, loading } = useProducts()
  const [spotIdx, setSpotIdx] = useState(0)
  const [changing, setChanging] = useState(false)
  const headRef = useReveal()
  const panelRef = useReveal()
  const hairRef = useReveal({ threshold: 0.5 })

  const spotlight = useMemo(() => {
    const byId = Object.fromEntries(products.map((p) => [p.id, p]))
    const curated = SPOTLIGHT_IDS.map((id) => byId[id])
      .filter(Boolean)
      .filter(productHasStock)
    if (curated.length) return curated
    const inStock = products.filter(productHasStock)
    return (inStock.length ? inStock : products).slice(0, 4)
  }, [products])

  useEffect(() => {
    if (spotIdx >= spotlight.length) setSpotIdx(0)
  }, [spotlight.length, spotIdx])

  const p = spotlight[spotIdx] || spotlight[0]
  const idx = p ? spotlight.indexOf(p) + 1 : 0
  const variant = p ? defaultVariant(p) : null
  const variantInStock = isInStock(variant)
  const total = spotlight.length || 1

  const go = (next) => {
    setChanging(true)
    setTimeout(() => setChanging(false), 350)
    setSpotIdx(next)
  }

  const prev = () => go((spotIdx - 1 + total) % total)
  const next = () => go((spotIdx + 1) % total)

  if (loading || !p || !variant) return null

  return (
    <section className="spotlight" id="spotlight">
      <div className="wrap">
        <div className="hairline rv" ref={hairRef} />
        <div className="spotlight-head rv" style={{ marginTop: 40 }} ref={headRef}>
          <span className="eyebrow">Curated selection</span>
          <div className="spotlight-head-row">
            <h2>
              FEATURED <span className="gold">DROP</span>
            </h2>
            <div
              className="spotlight-dots"
              id="spotDots"
              role="tablist"
              aria-label="Featured products"
            >
              {spotlight.map((item, i) => (
                <button
                  key={item.id}
                  className={`spot-dot${i === spotIdx ? ' active' : ''}`}
                  data-idx={i}
                  aria-label={`View ${item.name}`}
                  role="tab"
                  type="button"
                  onClick={() => go(i)}
                />
              ))}
            </div>
          </div>
        </div>
        <div
          className="spotlight-panel rv"
          id="spotPanel"
          ref={panelRef}
          data-changing={changing ? '' : undefined}
        >
          <div className="spotlight-visual">
            <span className="spotlight-index" id="spotIndex">
              {String(idx).padStart(2, '0')} /{' '}
              {String(total).padStart(2, '0')}
            </span>
            <div className="spotlight-stage">
              <div className="spot-emblem" aria-hidden="true">
                <span className="spot-emblem-glow" />
                <span className="spot-emblem-ring spot-emblem-ring-outer" />
                <span className="spot-emblem-ring spot-emblem-ring-mid" />
                <span className="spot-emblem-arc" />
                <span className="spot-emblem-ring spot-emblem-ring-inner" />
              </div>
              <div className="spotlight-vial" id="spotVial">
                <img
                  src={imgSrc(variant.img)}
                  alt={`${p.name} ${variant.label}`}
                />
              </div>
            </div>
          </div>
          <div className="spotlight-copy">
            <div className="spotlight-meta">
              <span className="spot-tag" id="spotTag">
                {p.tag}
              </span>
              <span className={`spot-stock${variantInStock ? '' : ' spot-stock-oos'}`}>
                <span className="dot" />{' '}
                {variantInStock ? 'In stock' : 'Out of stock'}
              </span>
            </div>
            <h3 id="spotName">{p.name.toUpperCase()}</h3>
            <p className="spot-sub" id="spotSub">
              {p.sub}
            </p>
            <p className="spotlight-story" id="spotStory">
              {p.story}
            </p>
            <div className="spotlight-data" id="spotMetrics">
              <div className="metric-chip">
                <strong>Purity</strong>99%+
              </div>
              <div className="metric-chip">
                <strong>Dose</strong>
                {variant.label}
              </div>
              <div className="metric-chip">
                <strong>Lot</strong>
                {p.lot}
              </div>
            </div>
            <div className="spotlight-foot">
              <div className="spot-price">
                {variantInStock ? (
                  <>
                    <span className="label">From</span>
                    <span className="amount" id="spotPrice">
                      {fmt(variant.price)}
                    </span>
                  </>
                ) : (
                  <span className="amount price-oos-label" id="spotPrice">
                    Out of stock
                  </span>
                )}
              </div>
              <div className="spotlight-actions">
                <button
                  className="spot-nav-btn"
                  id="spotPrev"
                  aria-label="Previous product"
                  type="button"
                  onClick={prev}
                >
                  ←
                </button>
                <a className="btn-primary magnetic" href="#shop" id="spotCta">
                  Shop {p.name}
                </a>
                <button
                  className="spot-nav-btn"
                  id="spotNext"
                  aria-label="Next product"
                  type="button"
                  onClick={next}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
