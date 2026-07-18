import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import StatusLabel from '../components/StatusLabel'
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
  const [loading, setLoading] = useState(true)
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [statusFlash, setStatusFlash] = useState('')
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

  const setOrderStatus = async (nextStatus) => {
    if (!order || nextStatus === order.status || savingStatus) return
    setSavingStatus(true)
    setError('')
    setStatusFlash('')
    const { error: err } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', id)
    setSavingStatus(false)
    if (err) {
      setError(err.message)
      return
    }
    setOrder((prev) => ({ ...prev, status: nextStatus }))
    setStatusFlash(`Status set to ${nextStatus}`)
    setTimeout(() => setStatusFlash(''), 2200)
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

  const notesDirty = order && adminNotes !== (order.admin_notes || '')
  const next = order ? nextOrderStatus(order.status) : null
  const ship = order?.shipping || {}
  const phone = order?.customer_phone || ship.phone || ''

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
        <span className={`status-pill lg tone-${statusTone(order.status)}`}>
          <StatusLabel status={order.status} />
        </span>
      </header>

      {order.status === 'Awaiting payment' && (
        <div className="order-alert warn">
          <div>
            <strong>Waiting on bank transfer</strong>
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
                    <strong>{fmtMoney(item.price * item.qty)}</strong>
                    <span>{fmtMoney(item.price)} each</span>
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

            {statusFlash && <p className="form-ok status-flash">{statusFlash}</p>}
            {error && <p className="form-error">{error}</p>}
          </section>

          <section className="panel notes-panel">
            <h2>Internal notes</h2>
            <p className="panel-help">
              Private — payment refs, tracking, pack notes. Not shown to the customer.
            </p>
            <form className="stack-form" onSubmit={saveNotes}>
              <textarea
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Paid — ref 1234 · AusPost tracking…"
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
    </div>
  )
}
