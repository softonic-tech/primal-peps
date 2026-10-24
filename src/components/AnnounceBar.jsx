import { useEffect, useMemo, useState } from 'react'
import { ANNOUNCE_MSGS } from '../data/products'
import { useSettings } from '../context/SettingsContext'
import { normalizeSalePromo } from '../lib/settings'

export default function AnnounceBar({ visible, onClose }) {
  const { promo } = useSettings()
  const sale = normalizeSalePromo(promo)
  const messages = useMemo(() => {
    const base = [...ANNOUNCE_MSGS]
    if (sale.enabled) {
      base.unshift(
        `Halloween sale: ${sale.percent}% storewide with code ${sale.code} · once per customer`,
      )
    }
    return base
  }, [sale.code, sale.enabled, sale.percent])
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    setIdx(0)
  }, [messages.length])

  useEffect(() => {
    if (!visible || messages.length < 2) return
    const id = setInterval(() => {
      setFade(true)
      setTimeout(() => {
        setIdx((i) => (i + 1) % messages.length)
        setFade(false)
      }, 400)
    }, 5000)
    return () => clearInterval(id)
  }, [visible, messages.length])

  return (
    <div className={`announce${visible ? '' : ' hidden'}${sale.enabled ? ' announce-halloween' : ''}`} id="announceBar">
      <span className="announce-glyph" aria-hidden="true">
        {sale.enabled ? '🎃' : '🦍'}
      </span>
      <span className={`announce-msg${fade ? ' fade' : ''}`} id="announceMsg">
        {messages[idx % messages.length]}
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
