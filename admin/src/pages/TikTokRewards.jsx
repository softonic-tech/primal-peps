import { useEffect, useMemo, useState } from 'react'
import { EmptyState, LoadingBlock, SearchInput } from '../components/ui'
import { formatDate, formatRelative, supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'approved', label: 'Approved' },
  { id: 'redeemed', label: 'Redeemed' },
  { id: 'revoked', label: 'Revoked' },
]

const emptyForm = () => ({
  email: '',
  percent: '50',
  tiktokUrl: '',
  notes: '',
})

export default function TikTokRewards() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('approved')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    setLoading(true)
    setError('')
    let query = supabase
      .from('tiktok_rewards')
      .select('*')
      .order('approved_at', { ascending: false })
      .limit(200)

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error: err } = await query
    if (err) {
      setError(
        err.message.includes('tiktok_rewards')
          ? 'TikTok rewards table missing — run supabase/migrations/20261022200000_tiktok_rewards.sql (or admin/supabase/tiktok-rewards.sql) in Supabase.'
          : err.message,
      )
      setRows([])
    } else {
      setRows(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [status])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return rows
    return rows.filter(
      (r) =>
        (r.customer_email || '').toLowerCase().includes(term) ||
        (r.notes || '').toLowerCase().includes(term) ||
        (r.tiktok_url || '').toLowerCase().includes(term) ||
        (r.redeemed_order_id || '').toLowerCase().includes(term),
    )
  }, [rows, q])

  const counts = useMemo(() => {
    const base = { approved: 0, redeemed: 0, revoked: 0 }
    rows.forEach((r) => {
      if (base[r.status] != null) base[r.status] += 1
    })
    return base
  }, [rows])

  const approve = async (e) => {
    e.preventDefault()
    const email = form.email.trim().toLowerCase()
    const percent = Math.min(90, Math.max(1, Number(form.percent) || 50))
    if (!email || !email.includes('@')) {
      setError('Enter a valid customer email')
      return
    }

    setSaving(true)
    setError('')
    setOk('')

    const { error: err } = await supabase.from('tiktok_rewards').insert({
      customer_email: email,
      percent,
      status: 'approved',
      tiktok_url: form.tiktokUrl.trim() || null,
      notes: form.notes.trim() || null,
      approved_by: user?.email || null,
      approved_at: new Date().toISOString(),
    })

    setSaving(false)
    if (err) {
      setError(
        err.message.includes('tiktok_rewards_one_approved_email') ||
          err.code === '23505'
          ? 'This email already has an unused approved TikTok reward. Revoke or wait until they redeem it.'
          : err.message,
      )
      return
    }

    setForm(emptyForm())
    setOk(`Approved ${percent}% TikTok discount for ${email}`)
    setTimeout(() => setOk(''), 3500)
    if (status !== 'approved' && status !== 'all') setStatus('approved')
    else load()
  }

  const setRowStatus = async (row, nextStatus) => {
    setError('')
    const { error: err } = await supabase
      .from('tiktok_rewards')
      .update({ status: nextStatus })
      .eq('id', row.id)
    if (err) {
      setError(err.message)
      return
    }
    setOk(
      nextStatus === 'revoked'
        ? `Revoked ${row.customer_email}`
        : `Updated ${row.customer_email}`,
    )
    setTimeout(() => setOk(''), 2500)
    load()
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">UGC reward</p>
          <h1>TikTok discounts</h1>
          <p className="page-sub">
            After you confirm their video on WhatsApp, approve their email here.
            They redeem once at checkout with the TikTok promo code from Settings
            (default TIKTOK50).
          </p>
        </div>
        <div className="head-actions">
          <button type="button" className="btn-ghost" onClick={load}>
            Refresh
          </button>
        </div>
      </header>

      <div className="order-summary-strip users-strip">
        <article className="order-summary-card">
          <span>Approved (list)</span>
          <strong>{counts.approved}</strong>
        </article>
        <article className="order-summary-card">
          <span>Redeemed</span>
          <strong>{counts.redeemed}</strong>
        </article>
        <article className="order-summary-card">
          <span>Revoked</span>
          <strong>{counts.revoked}</strong>
        </article>
      </div>

      <section className="panel" style={{ marginBottom: 18 }}>
        <h2>Approve reward</h2>
        <p className="panel-help">
          Enter the customer email from their order / WhatsApp DM. Tell them to
          use the TikTok code on their next paid order.
        </p>
        <form className="settings-form" onSubmit={approve}>
          <div className="form-grid">
            <div className="span-2">
              <label className="settings-field">
                <span>Customer email</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="customer@email.com"
                />
              </label>
            </div>
            <label className="settings-field">
              <span>Discount %</span>
              <input
                type="number"
                min={1}
                max={90}
                step={1}
                value={form.percent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, percent: e.target.value }))
                }
                required
              />
            </label>
            <div className="span-2">
              <label className="settings-field">
                <span>TikTok video URL (optional)</span>
                <input
                  type="url"
                  value={form.tiktokUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tiktokUrl: e.target.value }))
                  }
                  placeholder="https://www.tiktok.com/…"
                />
              </label>
            </div>
            <div className="span-2">
              <label className="settings-field">
                <span>Notes (optional)</span>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="WhatsApp handle, order ID, review notes…"
                />
              </label>
            </div>
          </div>
          <div className="settings-save-bar" style={{ marginTop: 14 }}>
            <p className="muted">Creates an unused approved entitlement.</p>
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving
                ? 'Approving…'
                : `Approve ${Math.min(90, Math.max(1, Number(form.percent) || 50))}% reward`}
            </button>
          </div>
        </form>
      </section>

      {error && <p className="form-error banner">{error}</p>}
      {ok && <p className="form-ok banner">{ok}</p>}

      <div className="order-filters" style={{ gap: 12 }}>
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Search email, notes, video, order…"
        />
        <div className="form-tabs settings-tabs" role="tablist">
          {STATUS_FILTERS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={status === t.id}
              className={`form-tab${status === t.id ? ' active' : ''}`}
              onClick={() => setStatus(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingBlock label="Loading TikTok rewards…" />
      ) : filtered.length === 0 ? (
        <section className="panel">
          <EmptyState
            title="No rewards yet"
            body={
              rows.length === 0
                ? 'Approve a customer email after you verify their TikTok video.'
                : 'Try a different search or status filter.'
            }
          />
        </section>
      ) : (
        <section className="panel" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>%</th>
                <th>Status</th>
                <th>Video / notes</th>
                <th>Approved</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.customer_email}</strong>
                    {r.redeemed_order_id ? (
                      <div className="muted tiny">
                        Order {r.redeemed_order_id}
                      </div>
                    ) : null}
                  </td>
                  <td>{r.percent}%</td>
                  <td>
                    <span
                      className={`status-pill tone-${
                        r.status === 'approved'
                          ? 'ok'
                          : r.status === 'redeemed'
                            ? 'info'
                            : 'danger'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.tiktok_url ? (
                      <a
                        href={r.tiktok_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Video
                      </a>
                    ) : (
                      <span className="muted">—</span>
                    )}
                    {r.notes ? (
                      <div className="muted tiny">{r.notes}</div>
                    ) : null}
                  </td>
                  <td>
                    <div>{formatRelative(r.approved_at)}</div>
                    <div className="muted tiny">
                      {formatDate(r.approved_at)}
                      {r.approved_by ? ` · ${r.approved_by}` : ''}
                    </div>
                  </td>
                  <td>
                    {r.status === 'approved' ? (
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => setRowStatus(r, 'revoked')}
                      >
                        Revoke
                      </button>
                    ) : r.status === 'revoked' ? (
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => setRowStatus(r, 'approved')}
                      >
                        Re-approve
                      </button>
                    ) : (
                      <span className="muted tiny">Used</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
