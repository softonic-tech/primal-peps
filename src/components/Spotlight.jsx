import { useState } from 'react'
import {
  PRODUCTS,
  SPOTLIGHT_IDS,
  defaultVariant,
  fmt,
  imgSrc,
} from '../data/products'
import { useReveal } from '../hooks/useReveal'

export default function Spotlight() {
  const [spotIdx, setSpotIdx] = useState(0)
  const [changing, setChanging] = useState(false)
  const headRef = useReveal()
  const panelRef = useReveal()
  const hairRef = useReveal({ threshold: 0.5 })

  const p = PRODUCTS.find((x) => x.id === SPOTLIGHT_IDS[spotIdx])
  const idx = PRODUCTS.indexOf(p) + 1
  const variant = p ? defaultVariant(p) : null

  const go = (next) => {
    setChanging(true)
    setTimeout(() => setChanging(false), 350)
    setSpotIdx(next)
  }

  const prev = () =>
    go((spotIdx - 1 + SPOTLIGHT_IDS.length) % SPOTLIGHT_IDS.length)
  const next = () => go((spotIdx + 1) % SPOTLIGHT_IDS.length)

  if (!p || !variant) return null

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
              {SPOTLIGHT_IDS.map((id, i) => (
                <button
                  key={id}
                  className={`spot-dot${i === spotIdx ? ' active' : ''}`}
                  data-idx={i}
                  aria-label={`View ${PRODUCTS.find((x) => x.id === id)?.name}`}
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
              {String(PRODUCTS.length).padStart(2, '0')}
            </span>
            <div className="spotlight-stage">
              <div className="spot-emblem" aria-hidden="true">
                <span className="spot-emblem-glow" />
                <span className="spot-emblem-ring spot-emblem-ring-outer" />
                <span className="spot-emblem-ring spot-emblem-ring-mid" />
                <span className="spot-emblem-arc" />
                <span className="spot-emblem-ring spot-emblem-ring-inner" />
                <img className="spot-emblem-logo" src="/logo.png" alt="" />
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
              <span className="spot-stock">
                <span className="dot" /> In stock
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
                <span className="label">From</span>
                <span className="amount" id="spotPrice">
                  {fmt(variant.price)}
                </span>
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
