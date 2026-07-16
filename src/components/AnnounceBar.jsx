import { useEffect, useState } from 'react'
import { ANNOUNCE_MSGS } from '../data/products'

export default function AnnounceBar({ visible, onClose }) {
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    if (!visible) return
    const id = setInterval(() => {
      setFade(true)
      setTimeout(() => {
        setIdx((i) => (i + 1) % ANNOUNCE_MSGS.length)
        setFade(false)
      }, 400)
    }, 5000)
    return () => clearInterval(id)
  }, [visible])

  return (
    <div className={`announce${visible ? '' : ' hidden'}`} id="announceBar">
      <span className="announce-glyph" aria-hidden="true">
        🦍
      </span>
      <span className={`announce-msg${fade ? ' fade' : ''}`} id="announceMsg">
        {ANNOUNCE_MSGS[idx]}
      </span>
      <button
        className="announce-close"
        id="announceClose"
        aria-label="Dismiss announcement"
        onClick={onClose}
        type="button"
      >
        ✕
      </button>
    </div>
  )
}
