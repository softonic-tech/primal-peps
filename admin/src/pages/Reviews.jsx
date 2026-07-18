import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  EmptyState,
  LoadingBlock,
  SearchInput,
  SelectField,
  Stars,
} from '../components/ui'
import { formatDate, formatRelative, supabase } from '../lib/supabase'

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [products, setProducts] = useState({})
  const [q, setQ] = useState('')
  const [rating, setRating] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    const [{ data: rows, error: rErr }, { data: prods, error: pErr }] =
      await Promise.all([
        supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('products').select('id, name'),
      ])
    if (rErr || pErr) {
      setError(rErr?.message || pErr?.message)
      setReviews([])
      setLoading(false)
      return
    }
    const map = {}
    ;(prods || []).forEach((p) => {
      map[p.id] = p.name
    })
    setProducts(map)
    setReviews(rows || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return reviews.filter((r) => {
      if (rating !== 'all' && String(r.rating) !== rating) return false
      if (!term) return true
      const pname = (products[r.product_id] || '').toLowerCase()
      return (
        (r.user_name || '').toLowerCase().includes(term) ||
        (r.body || '').toLowerCase().includes(term) ||
        pname.includes(term) ||
        (r.product_id || '').toLowerCase().includes(term)
      )
    })
  }, [reviews, q, rating, products])

  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length

  const remove = async (id) => {
    if (!confirm('Delete this review? This cannot be undone.')) return
    setBusyId(id)
    setError('')
    const { error: err } = await supabase.from('reviews').delete().eq('id', id)
    setBusyId('')
    if (err) {
      setError(err.message)
      return
    }
    setReviews((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Feedback</p>
          <h1>Reviews</h1>
          <p className="page-sub">
            Moderate customer reviews shown on the storefront.
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
          <span>Total reviews</span>
          <strong>{reviews.length}</strong>
        </article>
        <article className="order-summary-card accent">
          <span>Average rating</span>
          <strong>{avg ? avg.toFixed(1) : '—'}</strong>
        </article>
        <article className="order-summary-card">
          <span>Showing</span>
          <strong>{filtered.length}</strong>
        </article>
      </div>

      <div className="toolbar reviews-toolbar">
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Search reviewer, product, or text…"
        />
        <SelectField
          label="Rating"
          value={rating}
          onChange={setRating}
          options={[
            { value: 'all', label: 'All ratings' },
            { value: '5', label: '5 stars' },
            { value: '4', label: '4 stars' },
            { value: '3', label: '3 stars' },
            { value: '2', label: '2 stars' },
            { value: '1', label: '1 star' },
          ]}
        />
      </div>

      {error && <p className="form-error banner">{error}</p>}

      <section className="panel">
        {loading ? (
          <LoadingBlock label="Loading reviews…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No reviews match"
            body={
              reviews.length === 0
                ? 'Reviews appear after customers leave feedback on purchased products.'
                : 'Try another rating filter or clear search.'
            }
          />
        ) : (
          <div className="review-admin-list">
            {filtered.map((r) => (
              <article key={r.id} className="review-admin-card">
                <div className="review-admin-top">
                  <div>
                    <Stars value={r.rating} />
                    <h3>{products[r.product_id] || r.product_id}</h3>
                    <p className="muted">
                      {r.user_name || 'Customer'} ·{' '}
                      <span title={formatDate(r.created_at)}>
                        {formatRelative(r.created_at)}
                      </span>
                    </p>
                  </div>
                  <div className="review-admin-actions">
                    <Link
                      className="btn-ghost btn-sm"
                      to={`/products/${r.product_id}`}
                    >
                      Product
                    </Link>
                    <button
                      type="button"
                      className="btn-danger btn-sm"
                      disabled={busyId === r.id}
                      onClick={() => remove(r.id)}
                    >
                      {busyId === r.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
                <p className="review-admin-body">{r.body || '—'}</p>
                {r.order_id && (
                  <p className="muted tiny">
                    Order{' '}
                    <Link to={`/orders/${r.order_id}`}>{r.order_id}</Link>
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
