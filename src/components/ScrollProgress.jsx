import { useEffect } from 'react'

export default function ScrollProgress() {
  useEffect(() => {
    const progress = document.getElementById('scrollProgress')
    if (!progress) return

    let scrollTicking = false
    let scrollTimeout

    function paintProgress() {
      const max =
        document.documentElement.scrollHeight - window.innerHeight
      progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
      progress.classList.add('visible')
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => progress.classList.remove('visible'), 800)
      scrollTicking = false
    }

    const onScroll = () => {
      if (!scrollTicking) {
        requestAnimationFrame(paintProgress)
        scrollTicking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    paintProgress()
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  return (
    <div className="scroll-progress" id="scrollProgress" aria-hidden="true" />
  )
}
