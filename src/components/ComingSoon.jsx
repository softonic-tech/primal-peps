import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { subscribeNewsletter } from '../lib/newsletter'

const SOCIAL_LABELS = [
  ['instagram', 'Instagram'],
  ['facebook', 'Facebook'],
  ['tiktok', 'TikTok'],
  ['youtube', 'YouTube'],
  ['x', 'X'],
]

export default function ComingSoon() {
  const { toast } = useCart()
  const { site, social, contact } = useSettings()
  const [submitting, setSubmitting] = useState(false)
  const [joined, setJoined] = useState(false)

  const headline = site.comingSoonHeadline || 'COMING SOON'
  const body =
    site.comingSoonBody ||
    'The troop is assembling. Leave your email and we will let you know when Primal Peps goes live.'
  const links = SOCIAL_LABELS.filter(([key]) => social[key]?.trim())

  const handleSubmit = async (e) => {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get('email')
    setSubmitting(true)
    const result = await subscribeNewsletter(email, 'coming-soon')
    setSubmitting(false)
    if (!result.ok) {
      toast(result.error || 'Could not save your email.', 'error')
      return
    }
    setJoined(true)
    toast('You are on the list — we will be in touch ✓')
  }

  return (
    <main className="coming-soon">
      <div className="coming-soon-glow" aria-hidden="true" />
      <div className="coming-soon-inner">
        <img src="/logo.png" alt="Primal Peps" width={88} height={88} />
        <span className="eyebrow" style={{ justifyContent: 'center' }}>
          Primal Peps
        </span>
        <h1>{headline}</h1>
        <p>{body}</p>

        {joined ? (
          <p className="coming-soon-ok">You are on the list. We will be in touch.</p>
        ) : (
          <form className="email-glass coming-soon-form" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="you@email.com"
              required
              aria-label="Email address"
              disabled={submitting}
            />
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Notify me'}
            </button>
          </form>
        )}

        {links.length > 0 && (
          <div className="coming-soon-social">
            {links.map(([key, label]) => (
              <a key={key} href={social[key]} target="_blank" rel="noreferrer">
                {label}
              </a>
            ))}
          </div>
        )}

        {contact.email && (
          <a className="coming-soon-mail" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        )}
      </div>
    </main>
  )
}
