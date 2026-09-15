import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import StatusLabel from '../components/StatusLabel'
import { sendOrderEmail } from '../lib/orderEmail'
import { productImageUrl } from '../lib/storage'
import {
  ORDER_STATUSES,
  fmtMoney,
  formatDate,
  nextOrderStatus,
  paymentLabel,
  statusTone,
  supabase,
} from '../lib/supabase'

const EMAIL_FLAGS = [
  { status: 'Awaiting payment', flag: 'confirmation_email_sent', label: 'Confirmation' },
  { status: 'Payment received', flag: 'payment_email_sent', label: 'Payment' },
  { status: 'Processing', flag: 'processing_email_sent', label: 'Processing' },
  { status: 'Shipped', flag: 'shipped_email_sent', label: 'Shipped' },
  { status: 'Delivered', flag: 'delivered_email_sent', label: 'Delivered' },
  { status: 'Cancelled', flag: 'cancelled_email_sent', label: 'Cancelled' },
]

function ausPostUrl(trackingNumber) {
  return `https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(trackingNumber)}`
}

function parseAdditionalTracking(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v || '').trim()).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v || '').trim()).filter(Boolean)
      }
    } catch {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    }
  }
  return []
}

async function postOrderEmail(payload) {
  return sendOrderEmail(payload)
}

function CopyButton({ value, label = 'Copy' }) {
  const [done, setDone] = useState(false)
  if (!value) return null
  return (
    <button
      type="button"
      className="copy-btn"
      onClick={async (e) => {
        e.preventDefault()
        try {
          await navigator.clipboard.writeText(String(value))
          setDone(true)
          setTimeout(() => setDone(false), 1500)
        } catch {
          /* ignore */
        }
      }}
    >
      {done ? 'Copied' : label}
    </button>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [adminNotes, setAdminNotes] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [savingTracking, setSavingTracking] = useState(false)
  const [resending, setResending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [statusFlash, setStatusFlash] = useState('')
  const [trackingFlash, setTrackingFlash] = useState('')
  const [notesFlash, setNotesFlash] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      const [{ data: ord, error: oErr }, { data: lines, error: iErr }] =
        await Promise.all([
          supabase.from('orders').select('*').eq('id', id).maybeSingle(),
          supabase.from('order_items').select('*').eq('order_id', id),
        ])

      if (!alive) return
      if (oErr || iErr) {
        setError(oErr?.message || iErr?.message)
        setLoading(false)
        return
      }
      if (!ord) {
        setError('Order not found')
        setLoading(false)
        return
      }
      setOrder(ord)
      setAdminNotes(ord.admin_notes || '')
      setItems(lines || [])
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [id])

  const additionalTracking = useMemo(
    () => parseAdditionalTracking(order?.additional_tracking_numbers),
    [order?.additional_tracking_numbers],
  )

  const flashStatus = (message) => {
    setStatusFlash(message)
    setTimeout(() => setStatusFlash(''), 3200)
  }

  const flashTracking = (message) => {
    setTrackingFlash(message)
    setTimeout(() => setTrackingFlash(''), 3200)
  }

  const setOrderStatus = async (nextStatus) => {
    if (!order || nextStatus === order.status || savingStatus) return
    if (nextStatus === 'Shipped' && !order.tracking_number) {
      setError('Add an Australia Post tracking number before marking as Shipped.')
      return
    }
    setSavingStatus(true)
    setError('')
    setStatusFlash('')
    const { error: err } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', id)
    if (err) {
      setSavingStatus(false)
      setError(err.message)
      return
    }
    setOrder((prev) => ({ ...prev, status: nextStatus }))

    let message = `Status set to ${nextStatus}`
    try {
      const { ok, data } = await postOrderEmail({
        orderId: id,
        status: nextStatus,
      })
      if (!ok) {
        message = `Status set to ${nextStatus} — email could not be sent`
      } else if (data.skipped) {
        message = `Status set to ${nextStatus} — email already sent (not resent)`
      } else {
        message = `Status set to ${nextStatus} — customer emailed`
        const flag = EMAIL_FLAGS.find((f) => f.status === nextStatus)?.flag
        if (flag) {
          setOrder((prev) => ({ ...prev, [flag]: true }))
        }
      }
    } catch {
      message = `Status set to ${nextStatus} — email could not be sent`
    }

    setSavingStatus(false)
    flashStatus(message)
  }

  const shipAndEmail = async () => {
    if (!order || savingTracking) return
    const trimmed = trackingNumber.trim()
    if (!trimmed) {
      setError('Enter an Australia Post tracking number')
      return
    }
    setSavingTracking(true)
    setError('')
    setTrackingFlash('')

    const { error: err } = await supabase
      .from('orders')
      .update({
        tracking_number: trimmed,
        status: 'Shipped',
      })
      .eq('id', id)

    if (err) {
      setSavingTracking(false)
      setError(err.message)
      return
    }

    setOrder((prev) => ({
      ...prev,
      tracking_number: trimmed,
      status: 'Shipped',
    }))
    setTrackingNumber('')

    try {
      const { ok, data } = await postOrderEmail({
        orderId: id,
        status: 'Shipped',
        trackingNumber: trimmed,
      })
      if (!ok) {
        flashTracking('Tracking saved — shipped email could not be sent')
      } else if (data.skipped) {
        flashTracking('Tracking saved — shipped email already sent')
        setOrder((prev) => ({ ...prev, shipped_email_sent: true }))
      } else {
        flashTracking('Shipped — customer emailed with AusPost tracking')
        setOrder((prev) => ({ ...prev, shipped_email_sent: true }))
      }
    } catch {
      flashTracking('Tracking saved — shipped email could not be sent')
    }

    setSavingTracking(false)
  }

  const sendReplacementTracking = async () => {
    if (!order || savingTracking) return
    const trimmed = trackingNumber.trim()
    if (!trimmed) {
      setError('Enter a replacement tracking number')
      return
    }
    if (!order.tracking_number) {
      setError('Add a primary tracking number first')
      return
    }

    setSavingTracking(true)
    setError('')
    setTrackingFlash('')

    const nextAdditional = [...additionalTracking, trimmed]
    const { error: err } = await supabase
      .from('orders')
      .update({ additional_tracking_numbers: nextAdditional })
      .eq('id', id)

    if (err) {
      setSavingTracking(false)
      setError(err.message)
      return
    }

    setOrder((prev) => ({
      ...prev,
      additional_tracking_numbers: nextAdditional,
    }))
    setTrackingNumber('')

    try {
      const { ok } = await postOrderEmail({
        orderId: id,
        kind: 'replacement',
        trackingNumber: trimmed,
      })
      flashTracking(
        ok
          ? 'Replacement tracking emailed to customer'
          : 'Replacement saved — email could not be sent',
      )
    } catch {
      flashTracking('Replacement saved — email could not be sent')
    }

    setSavingTracking(false)
  }

  const resendCurrentEmail = async () => {
    if (!order || resending) return
    setResending(true)
    setError('')
    try {
      const { ok, data } = await postOrderEmail({
        orderId: id,
        status: order.status,
        force: true,
        trackingNumber: order.tracking_number || undefined,
      })
      if (!ok) {
        setError(data.error || 'Resend failed')
      } else {
        const flag = EMAIL_FLAGS.find((f) => f.status === order.status)?.flag
        if (flag) setOrder((prev) => ({ ...prev, [flag]: true }))
        flashStatus(`Resent ${order.status} email`)
      }
    } catch {
      setError('Resend failed')
    }
    setResending(false)
  }

  const saveNotes = async (e) => {
    e?.preventDefault?.()
    if (!order || savingNotes) return
    setSavingNotes(true)
    setError('')
    setNotesFlash('')
    const { error: err } = await supabase
      .from('orders')
      .update({ admin_notes: adminNotes })
      .eq('id', id)
    setSavingNotes(false)
    if (err) {
      setError(err.message)
      return
    }
    setOrder((prev) => ({ ...prev, admin_notes: adminNotes }))
    setNotesFlash('Notes saved')
    setTimeout(() => setNotesFlash(''), 2200)
  }

  const deleteOrder = async () => {
    if (!order || deleting) return
    setDeleting(true)
    setError('')
    const { error: err } = await supabase.from('orders').delete().eq('id', id)
    if (err) {
      setDeleting(false)
      setConfirmDelete(false)
      setError(err.message)
      return
    }
    navigate('/orders')
  }

  const notesDirty = order && adminNotes !== (order.admin_notes || '')
  const next = order ? nextOrderStatus(order.status) : null
  const ship = order?.shipping || {}
  const phone = order?.customer_phone || ship.phone || ''
  const showTrackingPanel =
    order &&
    ['Payment received', 'Processing', 'Shipped', 'Delivered'].includes(
      order.status,
    )

  const ACTION_LABELS = {
    'Payment received': 'Mark payment received',
    Processing: 'Start processing',
    Shipped: 'Mark as shipped',
    Delivered: 'Mark as delivered',
  }

  const pipeline = useMemo(
    () => [
      'Awaiting payment',
      'Payment received',
      'Processing',
      'Shipped',
      'Delivered',
    ],
    [],
  )

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading order…</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="page">
        <p className="form-error banner">{error || 'Order not found'}</p>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => navigate('/orders')}
        >
          Back to orders
        </button>
      </div>
    )
  }

  const activeIdx = pipeline.indexOf(order.status)
  const isCancelled = order.status === 'Cancelled'

  return (
    <div className="page order-detail-page">
      <header className="page-head order-detail-head">
        <div>
          <Link className="back-link" to="/orders">
            ← All orders
          </Link>
          <div className="order-title-row">
            <h1>{order.id}</h1>
            <CopyButton value={order.id} label="Copy ID" />
          </div>
          <p className="page-sub">
            Placed {formatDate(order.created_at)} ·{' '}
            {paymentLabel(order.payment_method)}
          </p>
        </div>
        <div className="head-actions">
          <button
            type="button"
            className="btn-danger"
            disabled={deleting}
            onClick={() => setConfirmDelete(true)}
          >
            Delete order
          </button>
          <span className={`status-pill lg tone-${statusTone(order.status)}`}>
            <StatusLabel status={order.status} />
          </span>
        </div>
      </header>

      {order.status === 'Awaiting payment' && (
        <div className="order-alert warn">
          <div>
            <strong>Waiting on PayID transfer</strong>
            <p>
              Customer should use order ID <code>{order.id}</code> as the
              transfer reference.
            </p>
          </div>
        </div>
      )}

      <div className="detail-grid order-detail-grid">
        <div className="stack">
          <section className="panel">
            <div className="panel-head">
              <h2>Items</h2>
              <span className="muted">
                {items.reduce((n, i) => n + (i.qty || 0), 0)} units
              </span>
            </div>
            <ul className="order-item-list">
              {items.map((item) => (
                <li key={item.id} className="order-item">
                  <div className="order-item-img">
                    {item.img ? (
                      <img src={productImageUrl(item.img)} alt="" />
                    ) : (
                      <span>No img</span>
                    )}
                  </div>
                  <div className="order-item-copy">
                    <strong>{item.name}</strong>
                    <span>{item.variant_label || 'Standard'}</span>
                  </div>
                  <div className="order-item-qty">×{item.qty}</div>
                  <div className="order-item-price">
                    <strong>
                      {Number(item.price) === 0
                        ? 'FREE'
                        : fmtMoney(item.price * item.qty)}
                    </strong>
                    <span>
                      {Number(item.price) === 0
                        ? 'Gift'
                        : `${fmtMoney(item.price)} each`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="totals-box">
              <div>
                <span>Subtotal</span>
                <strong>{fmtMoney(order.subtotal)}</strong>
              </div>
              <div>
                <span>Shipping</span>
                <strong>{fmtMoney(order.shipping_fee)}</strong>
              </div>
              {Number(order.discount) > 0 && (
                <div>
                  <span>Discount</span>
                  <strong>−{fmtMoney(order.discount)}</strong>
                </div>
              )}
              <div className="total">
                <span>Total due</span>
                <strong>{fmtMoney(order.total)}</strong>
              </div>
              {order.points_earned > 0 && (
                <div>
                  <span>Points earned</span>
                  <strong>{order.points_earned}</strong>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="stack">
          <section className="panel">
            <h2>Customer</h2>
            <div className="customer-card">
              <div className="customer-avatar" aria-hidden="true">
                {(order.customer_name || order.customer_email || '?')
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <strong>{order.customer_name || 'Guest'}</strong>
                <div className="customer-contact">
                  {order.customer_email ? (
                    <a href={`mailto:${order.customer_email}`}>
                      {order.customer_email}
                    </a>
                  ) : (
                    <span className="muted">No email</span>
                  )}
                  <CopyButton value={order.customer_email} />
                </div>
                {phone && (
                  <div className="customer-contact">
                    <a href={`tel:${phone}`}>{phone}</a>
                    <CopyButton value={phone} />
                  </div>
                )}
              </div>
            </div>

            <div className="ship-block">
              <span className="ship-block-label">Ship to</span>
              <p>
                {[ship.line1, ship.line2].filter(Boolean).join(', ') || '—'}
                <br />
                {[ship.suburb, ship.state, ship.postcode]
                  .filter(Boolean)
                  .join(' ')}
                {(ship.suburb || ship.state || ship.postcode) && <br />}
                Australia
              </p>
              {ship.method && (
                <p className="muted ship-method">Method: {ship.method}</p>
              )}
            </div>
          </section>

          {showTrackingPanel && (
            <section className="panel tracking-panel">
              <div className="panel-head">
                <h2>Tracking</h2>
                {savingTracking && <span className="muted">Saving…</span>}
              </div>
              <p className="panel-help">
                Add an Australia Post tracking number to mark the order shipped
                and email the customer (peplab-style).
              </p>

              {order.tracking_number && (
                <div className="tracking-list">
                  <div className="tracking-row">
                    <div>
                      <span className="ship-block-label">Original shipment</span>
                      <p className="tracking-mono">{order.tracking_number}</p>
                      <a
                        href={ausPostUrl(order.tracking_number)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tracking-link"
                      >
                        Open AusPost →
                      </a>
                    </div>
                    <span
                      className={`email-chip ${order.shipped_email_sent ? 'sent' : 'pending'}`}
                    >
                      {order.shipped_email_sent ? 'Email sent' : 'Email pending'}
                    </span>
                  </div>
                  {additionalTracking.map((num, idx) => (
                    <div className="tracking-row" key={`${num}-${idx}`}>
                      <div>
                        <span className="ship-block-label">
                          Replacement {idx + 1}
                        </span>
                        <p className="tracking-mono">{num}</p>
                        <a
                          href={ausPostUrl(num)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tracking-link"
                        >
                          Open AusPost →
                        </a>
                      </div>
                      <span className="email-chip sent">Emailed</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="tracking-form">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder={
                    order.tracking_number
                      ? 'Enter replacement tracking number'
                      : 'Enter Australia Post tracking number'
                  }
                />
                {order.tracking_number ? (
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={savingTracking || !trackingNumber.trim()}
                    onClick={sendReplacementTracking}
                  >
                    {savingTracking ? 'Sending…' : 'Send & Email'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={savingTracking || !trackingNumber.trim()}
                    onClick={shipAndEmail}
                  >
                    {savingTracking ? 'Shipping…' : 'Ship & Email'}
                  </button>
                )}
              </div>
              {trackingFlash && (
                <p className="form-ok status-flash">{trackingFlash}</p>
              )}
            </section>
          )}

          <section className="panel status-panel">
            <div className="panel-head">
              <h2>Status</h2>
              {savingStatus && <span className="muted">Updating…</span>}
            </div>

            {next && !isCancelled && (
              <button
                type="button"
                className="btn-primary status-next-btn"
                disabled={savingStatus}
                onClick={() => setOrderStatus(next)}
              >
                {ACTION_LABELS[next] || `Mark as ${next}`}
              </button>
            )}

            <div className="status-picker" role="radiogroup" aria-label="Order status">
              {ORDER_STATUSES.map((s) => {
                const active = order.status === s
                const inFlow = pipeline.includes(s)
                const stepIdx = pipeline.indexOf(s)
                const reached =
                  !isCancelled && inFlow && activeIdx >= 0 && stepIdx <= activeIdx
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={savingStatus || active}
                    className={`status-option tone-${statusTone(s)}${active ? ' active' : ''}${reached && !active ? ' reached' : ''}`}
                    onClick={() => setOrderStatus(s)}
                  >
                    <span className="status-option-check" aria-hidden="true">
                      {active ? '●' : reached ? '○' : ''}
                    </span>
                    <span className="status-option-label">{s}</span>
                  </button>
                )
              })}
            </div>

            <div className="email-log">
              <div className="email-log-head">
                <span className="ship-block-label">Customer emails</span>
                <button
                  type="button"
                  className="btn-ghost email-resend-btn"
                  disabled={resending || isCancelled}
                  onClick={resendCurrentEmail}
                >
                  {resending ? 'Resending…' : 'Resend current'}
                </button>
              </div>
              <div className="email-flag-grid">
                {EMAIL_FLAGS.map(({ flag, label }) => (
                  <span
                    key={flag}
                    className={`email-chip ${order[flag] ? 'sent' : 'pending'}`}
                  >
                    {label}: {order[flag] ? 'Sent' : '—'}
                  </span>
                ))}
              </div>
            </div>

            {statusFlash && <p className="form-ok status-flash">{statusFlash}</p>}
            {error && <p className="form-error">{error}</p>}
          </section>

          <section className="panel notes-panel">
            <h2>Internal notes</h2>
            <p className="panel-help">
              Private — payment refs, pack notes. Tracking lives in the Tracking
              panel above.
            </p>
            <form className="stack-form" onSubmit={saveNotes}>
              <textarea
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Paid — ref 1234 · pack with ice pack…"
              />
              <div className="order-save-row">
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={savingNotes || !notesDirty}
                >
                  {savingNotes ? 'Saving…' : notesDirty ? 'Save notes' : 'Notes saved'}
                </button>
                {notesDirty && (
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setAdminNotes(order.admin_notes || '')}
                  >
                    Discard
                  </button>
                )}
              </div>
              {notesFlash && <p className="form-ok">{notesFlash}</p>}
            </form>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        danger
        busy={deleting}
        title="Delete this order?"
        message={`Order ${order.id} and all of its line items will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete order"
        cancelLabel="Keep order"
        onCancel={() => {
          if (!deleting) setConfirmDelete(false)
        }}
        onConfirm={deleteOrder}
      />
    </div>
  )
}
