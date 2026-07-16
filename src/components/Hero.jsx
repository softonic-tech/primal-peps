import { useEffect, useRef, useState } from 'react'
import { useFinePointer, useReducedMotion } from '../hooks/useMedia'
import { useReveal } from '../hooks/useReveal'

function typeInto(el, text, speed) {
  return new Promise((resolve) => {
    let i = 0
    const tick = () => {
      el.textContent = text.slice(0, ++i)
      if (i < text.length) setTimeout(tick, speed)
      else resolve()
    }
    tick()
  })
}

function countInto(el, value, duration = 900) {
  const target = parseInt(value, 10)
  const suffix = value.replace(String(target), '')
  const start = performance.now()
  el.textContent = `0${suffix}`
  function frame(now) {
    const progress = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - progress, 3)
    el.textContent = `${Math.round(target * eased)}${suffix}`
    if (progress < 1) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

export default function Hero() {
  const reduceMotion = useReducedMotion()
  const finePointer = useFinePointer()
  const artRef = useReveal()
  const parallaxRef = useRef(null)
  const line1Ref = useRef(null)
  const line2Ref = useRef(null)
  const cursorRef = useRef(null)
  const statsRef = useRef(null)
  const [typed, setTyped] = useState(false)

  useEffect(() => {
    if (reduceMotion || typed) return
    let cancelled = false

    async function run() {
      const lines = [line1Ref.current, line2Ref.current]
      const stats = statsRef.current
        ? [...statsRef.current.querySelectorAll('.display[data-value]')]
        : []
      lines.forEach((el) => {
        if (el) el.textContent = ''
      })
      stats.forEach((el) => {
        const target = parseInt(el.dataset.value, 10)
        el.textContent = `0${el.dataset.value.replace(String(target), '')}`
      })
      await typeInto(lines[0], lines[0].dataset.text, 68)
      if (cancelled) return
      await new Promise((r) => setTimeout(r, 130))
      if (cancelled) return
      await typeInto(lines[1], lines[1].dataset.text, 62)
      if (cancelled) return
      await new Promise((r) => setTimeout(r, 180))
      if (cancelled) return
      stats.forEach((el, i) =>
        setTimeout(() => countInto(el, el.dataset.value, 850), i * 140),
      )
      setTimeout(() => cursorRef.current?.classList.add('done'), 1200)
      setTyped(true)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [reduceMotion, typed])

  useEffect(() => {
    if (!finePointer || reduceMotion) return
    const btns = document.querySelectorAll('.btn-primary.magnetic')
    const handlers = []
    btns.forEach((btn) => {
      const onMove = (e) => {
        const r = btn.getBoundingClientRect()
        const x = (e.clientX - r.left - r.width / 2) * 0.15
        const y = (e.clientY - r.top - r.height / 2) * 0.15
        btn.style.transform = `translate(${x}px,${y}px)`
      }
      const onLeave = () => {
        btn.style.transform = ''
      }
      btn.addEventListener('pointermove', onMove)
      btn.addEventListener('pointerleave', onLeave)
      handlers.push({ btn, onMove, onLeave })
    })
    return () => {
      handlers.forEach(({ btn, onMove, onLeave }) => {
        btn.removeEventListener('pointermove', onMove)
        btn.removeEventListener('pointerleave', onLeave)
      })
    }
  }, [finePointer, reduceMotion])

  useEffect(() => {
    if (reduceMotion || !parallaxRef.current) return
    const stage = parallaxRef.current
    const onMove = (e) => {
      const r = stage.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      stage.style.setProperty('--tilt-x', `${(-py * 7).toFixed(2)}deg`)
      stage.style.setProperty('--tilt-y', `${(px * 9).toFixed(2)}deg`)
      stage.style.setProperty('--shift-x', `${(px * 14).toFixed(1)}px`)
      stage.style.setProperty('--shift-y', `${(py * 10).toFixed(1)}px`)
    }
    const onLeave = () => {
      stage.style.setProperty('--tilt-x', '0deg')
      stage.style.setProperty('--tilt-y', '0deg')
      stage.style.setProperty('--shift-x', '0px')
      stage.style.setProperty('--shift-y', '0px')
    }
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerleave', onLeave)
    return () => {
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerleave', onLeave)
    }
  }, [reduceMotion])

  return (
    <header className="hero" id="story">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Premium research peptides</span>
          <h1 aria-label="Unleash your primal potential">
            <span
              className="type-line"
              data-text="UNLEASH YOUR"
              ref={line1Ref}
            >
              UNLEASH YOUR
            </span>
            <br />
            <span
              className="gold type-line"
              data-text="PRIMAL POTENTIAL"
              ref={line2Ref}
            >
              PRIMAL POTENTIAL
            </span>
            <span className="type-cursor" aria-hidden="true" ref={cursorRef} />
          </h1>
          <p className="hero-lede">
            Lab-tested, research-backed peptides — in stock and ready to ship.
            Level up your recovery, performance, and wellness with the strongest
            lineup in the game.
          </p>
          <div className="hero-actions">
            <a className="btn-primary magnetic" href="#shop">
              Shop the lineup →
            </a>
            <a className="btn-ghost" href="#points">
              Earn Primal Points
            </a>
          </div>
          <div className="hero-stats" ref={statsRef}>
            <div className="hstat">
              <span className="display" data-value="13+">
                13+
              </span>
              <small>Peptides in stock</small>
            </div>
            <div className="hstat">
              <span className="display" data-value="99%+">
                99%+
              </span>
              <small>Lab-tested purity</small>
            </div>
            <div className="hstat">
              <span className="display" data-value="24H">
                24H
              </span>
              <small>Dispatch time</small>
            </div>
            <div className="hstat">
              <span className="display" data-value="2×">
                2×
              </span>
              <small>Points per $1</small>
            </div>
          </div>
        </div>
        <div className="hero-art rv" id="heroArt" ref={artRef}>
          <div className="hero-stage" ref={parallaxRef}>
            <div className="hero-orbit hero-orbit-a" aria-hidden="true" />
            <div className="hero-orbit hero-orbit-b" aria-hidden="true" />
            <div className="hero-orbit hero-orbit-c" aria-hidden="true" />
            <div className="hero-glow" aria-hidden="true" />
            <div className="hero-spark hero-spark-1" aria-hidden="true" />
            <div className="hero-spark hero-spark-2" aria-hidden="true" />
            <div className="hero-spark hero-spark-3" aria-hidden="true" />
            <div className="hero-art-main hero-showcase" id="heroParallax">
              <div className="hero-logo-wrap">
                <span className="hero-logo-ring" aria-hidden="true" />
                <span className="hero-logo-ring hero-logo-ring-outer" aria-hidden="true" />
                <img
                  className="hero-logo"
                  src="/logo.png"
                  alt="Primal Peps"
                />
              </div>
              <div className="hero-ground" aria-hidden="true" />
            </div>
          </div>
          <div className="hero-badge">
            <span className="dot" /> In stock &amp; ready to ship
          </div>
        </div>
      </div>
      <div className="scroll-hint" aria-hidden="true">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
        Scroll to explore
      </div>
    </header>
  )
}
