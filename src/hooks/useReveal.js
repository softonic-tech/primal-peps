import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export function useReveal(options = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const { threshold = 0.12, once = true } = options

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            setVisible(true)
            if (once) io.unobserve(en.target)
          }
        })
      },
      { threshold },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [threshold, once, visible])

  // React's className overwrites imperative classes on re-render —
  // keep `in` in sync after every commit once revealed.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.toggle('in', visible)
  })

  return ref
}

export function useRevealAll(selector = '.rv', rootRef) {
  useEffect(() => {
    const root = rootRef?.current ?? document
    const els = root.querySelectorAll(selector)
    if (!els.length) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in')
            io.unobserve(en.target)
          }
        })
      },
      { threshold: 0.12 },
    )

    els.forEach((el) => io.observe(el))

    const hairlines = root.querySelectorAll('.hairline')
    const hio = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in')
            hio.unobserve(en.target)
          }
        })
      },
      { threshold: 0.5 },
    )
    hairlines.forEach((el) => hio.observe(el))

    return () => {
      io.disconnect()
      hio.disconnect()
    }
  })
}
