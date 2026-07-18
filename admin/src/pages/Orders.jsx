import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StatusLabel from '../components/StatusLabel'
import { EmptyState, LoadingBlock, SearchInput } from '../components/ui'
import {
  ORDER_STATUSES,
  fmtMoney,
  formatDate,
  formatRelative,
  paymentLabel,
  statusShort,
  statusTone,
  supabase,
} from '../lib/supabase'

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('all')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase
      .from('orders')
      .select(
        'id, customer_name, customer_email, customer_phone, status, total, created_at, payment_method, shipping_fee, discount',
      )
      .order('created_at', { ascending: false })

    if (err) setError(err.message)
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const counts = useMemo(() => {
    const map = { all: orders.length }
    ORDER_STATUSES.forEach((s) => {
      map[s] = 0
    })
    orders.forEach((o) => {
      map[o.status] = (map[o.status] || 0) + 1
    })
    return map
  }, [orders])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return orders.filter((o) => {
      if (status !== 'all' && o.status !== status) return false
      if (!term) return true
      return (
        o.id.toLowerCase().includes(term) ||
        (o.customer_name || '').toLowerCase().includes(term) ||
        (o.customer_email || '').toLowerCase().includes(term) ||
        (o.customer_phone || '').toLowerCase().includes(term)
      )
    })
  }, [orders, q, status])

  const awaiting = counts['Awaiting payment'] || 0

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Fulfillment</p>
          <h1>Orders</h1>
          <p className="page-sub">
            Track payments, pack vials, and update shipping status.
          </p>
        </div>
        <div className="head-actions">
          <button type="button" className="btn-ghost" onClick={load}>
            Refresh
          </button>
        </div>
      </header>

      <div className="order-summary-strip">
        <article className="order-summary-card">
          <span>Total orders</span>
          <strong>{counts.all}</strong>
        </article>
        <article className={`order-summary-card${awaiting ? ' accent' : ''}`}>
          <span>Needs payment</span>
          <strong>{awaiting}</strong>
        </article>
        <article className="order-summary-card">
          <span>Showing</span>
          <strong>{filtered.length}</strong>
        </article>
      </div>

      <div className="order-filters">
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Search by order ID, name, email, or phone…"
        />
        <div className="status-chips" role="tablist" aria-label="Filter by status">
          <button
            type="button"
            role="tab"
            aria-selected={status === 'all'}
            className={`status-chip${status === 'all' ? ' active' : ''}`}
            onClick={() => setStatus('all')}
          >
            All <em>{counts.all}</em>
          </button>
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={status === s}
              aria-label={`${s} (${counts[s] || 0})`}
              title={s}
              className={`status-chip tone-${statusTone(s)}${status === s ? ' active' : ''}`}
              onClick={() => setStatus(s)}
            >
              <span className="lbl-full">{s}</span>
              <span className="lbl-short">{statusShort(s)}</span>
              <em>{counts[s] || 0}</em>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="form-error banner">{error}</p>}

      <section className="panel orders-panel">
        {loading ? (
          <LoadingBlock label="Loading orders…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No orders match"
            body={
              orders.length === 0
                ? 'New checkout orders will show up here.'
                : 'Try another status filter or clear the search.'
            }
            action={
              status !== 'all' || q ? (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setStatus('all')
                    setQ('')
                  }}
                >
                  Clear filters
                </button>
              ) : null
            }
          />
        ) : (
          <div className="order-list">
            {filtered.map((o) => (
              <article
                key={o.id}
                className="order-row"
                onClick={() => navigate(`/orders/${o.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/orders/${o.id}`)
                  }
                }}
                role="link"
                tabIndex={0}
              >
                <div className="order-row-main">
                  <div className="order-row-id">
                    <Link
                      to={`/orders/${o.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {o.id}
                    </Link>
                    <span className="order-row-when" title={formatDate(o.created_at)}>
                      {formatRelative(o.created_at)}
                    </span>
                  </div>
                  <div className="order-row-customer">
                    <strong>{o.customer_name || 'Guest'}</strong>
                    <span>{o.customer_email || '—'}</span>
                  </div>
                </div>
                <div className="order-row-meta">
                  <span className="order-pay-tag">{paymentLabel(o.payment_method)}</span>
                  <span className={`status-pill tone-${statusTone(o.status)}`}>
                    <StatusLabel status={o.status} />
                  </span>
                  <strong className="order-row-total">{fmtMoney(o.total)}</strong>
                  <span className="order-row-chevron" aria-hidden="true">
                    →
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
