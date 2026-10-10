import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ausPostUrl,
  formatMoney,
  formatShippingMethod,
  formatTrackDate,
  isCancelled,
  lookupOrderTracking,
  resolveCurrentStageIndex,
  TRACKING_STAGES,
} from '../lib/trackOrder'

function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase()
  let tone = 'info'
  if (s === 'cancelled') tone = 'danger'
  else if (s === 'delivered' || s === 'shipped') tone = 'ok'
  else if (s === 'awaiting payment') tone = 'warn'
  return (
    <span className={`track-badge tone-${tone}`}>
      <span className="track-badge-dot" aria-hidden="true" />
      {status}
    </span>
  )
}

function Timeline({ currentStage, createdAt }) {
  return (
    <ol className="track-timeline" aria-label="Order progress">
      {TRACKING_STAGES.map((stage, idx) => {
        const done = currentStage >= idx
        const current = currentStage === idx
        return (
          <li
            key={stage.key}
            className={`track-stage${done ? ' done' : ''}${current ? ' current' : ''}`}
          >
            <span className="track-stage-mark" aria-hidden="true">
              {done ? '✓' : idx + 1}
            </span>
            <div className="track-stage-copy">
              <strong>
                {stage.label}
                {current ? <em>Current</em> : null}
              </strong>
              <p>{stage.description}</p>
              {idx === 0 && createdAt ? (
                <span className="track-stage-time">{formatTrackDate(createdAt)}</span>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default function TrackOrder() {
  const location = useLocation()
  const [orderInput, setOrderInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search || '')
    const o = params.get('order')
    const e = params.get('email')
    if (o) setOrderInput(o)
    if (e) setEmailInput(e)
  }, [location.search])

  const currentStage = useMemo(
    () => (result ? resolveCurrentStageIndex(result) : -1),
    [result],
  )
  const cancelled = useMemo(() => (result ? isCancelled(result) : false), [result])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setSubmitting(true)
    try {
      const { data, error: err } = await lookupOrderTracking(orderInput, emailInput)
      if (err) {
        setError(err)
        return
      }
      setResult(data)
    } finally {
      setSubmitting(false)
    }
  }

  const copyOrderNumber = async () => {
    if (!result?.order_number) return
    try {
      await navigator.clipboard.writeText(result.order_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <main className="track-page">
      <div className="wrap track-wrap">
        <header className="track-hero">
          <span className="eyebrow">Order tracking</span>
          <h1>
            Track your <span className="gold">order</span>
          </h1>
          <p>
            Enter your order ID and the email you used at checkout. Find both in
            your confirmation email.
          </p>
        </header>

        <form className="track-form panel" onSubmit={onSubmit}>
          <div className="track-form-grid">
            <label className="track-field">
              <span>Order ID</span>
              <input
                type="text"
                name="order"
                autoComplete="off"
                spellCheck={false}
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
                placeholder="e.g. ORD-925890"
                disabled={submitting}
                required
              />
            </label>
            <label className="track-field">
              <span>Email used at checkout</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@example.com"
                disabled={submitting}
                required
              />
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary track-submit"
            disabled={submitting}
          >
            {submitting ? 'Looking up…' : 'Track order'}
          </button>

          {error ? (
            <div className="track-alert" role="alert">
              {error}
            </div>
          ) : null}

          <p className="track-privacy">
            We only show status and shipping details — no billing information.
          </p>
        </form>

        {result ? (
          <section className="track-result panel" aria-live="polite">
            <div className="track-result-head">
              <div>
                <span className="eyebrow">Order</span>
                <div className="track-order-id-row">
                  <strong className="track-order-id">{result.order_number}</strong>
                  <button
                    type="button"
                    className="track-copy"
                    onClick={copyOrderNumber}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                {result.created_at ? (
                  <p className="muted">Placed {formatTrackDate(result.created_at)}</p>
                ) : null}
              </div>
              <StatusBadge status={result.status} />
            </div>

            {cancelled ? (
              <div className="track-cancelled">
                <strong>This order was cancelled</strong>
                <p>
                  If you already transferred funds, reply to your confirmation
                  email and we’ll help.
                </p>
              </div>
            ) : (
              <Timeline currentStage={currentStage} createdAt={result.created_at} />
            )}

            {!cancelled && result.tracking_number ? (
              <div className="track-shipment">
                <span className="eyebrow">Shipment</span>
                <p className="track-mono">{result.tracking_number}</p>
                {result.shipping_method ? (
                  <p className="muted">
                    Via {formatShippingMethod(result.shipping_method)}
                  </p>
                ) : (
                  <p className="muted">Australia Post</p>
                )}
                <a
                  className="btn-primary track-auspost"
                  href={ausPostUrl(result.tracking_number)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Track on AusPost →
                </a>
              </div>
            ) : null}

            <div className="track-items">
              <h2>Items</h2>
              <ul>
                {(result.items || []).map((item, idx) => (
                  <li key={`${item.name}-${idx}`}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {item.variant_label || 'Standard'}
                        {item.qty ? ` · Qty ${item.qty}` : ''}
                      </span>
                    </div>
                    <em>
                      {item.is_free ? 'FREE' : formatMoney(Number(item.price) * Number(item.qty || 1))}
                    </em>
                  </li>
                ))}
              </ul>
            </div>

            <div className="track-totals">
              <div>
                <span>Subtotal</span>
                <strong>{formatMoney(result.subtotal)}</strong>
              </div>
              <div>
                <span>Shipping</span>
                <strong>{formatMoney(result.shipping_fee)}</strong>
              </div>
              {Number(result.discount) > 0 ? (
                <div>
                  <span>Discount</span>
                  <strong>−{formatMoney(result.discount)}</strong>
                </div>
              ) : null}
              <div className="total">
                <span>Total</span>
                <strong>{formatMoney(result.total)}</strong>
              </div>
            </div>
          </section>
        ) : null}

        <p className="track-back">
          <Link to="/">← Back to shop</Link>
        </p>
      </div>
    </main>
  )
}
