import { useEffect, useMemo, useState } from 'react'
import { EmptyState, LoadingBlock, SearchInput } from '../components/ui'
import { formatDate, formatRelative, fmtMoney, supabase } from '../lib/supabase'

export default function Users() {
  const [users, setUsers] = useState([])
  const [orderStats, setOrderStats] = useState({})
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [pointsEdit, setPointsEdit] = useState('')
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    const [{ data: profiles, error: pErr }, { data: orders, error: oErr }] =
      await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('orders').select('id, user_id, total, status'),
      ])

    if (pErr || oErr) {
      setError(pErr?.message || oErr?.message)
      setUsers([])
      setLoading(false)
      return
    }

    const stats = {}
    ;(orders || []).forEach((o) => {
      if (!o.user_id) return
      if (!stats[o.user_id]) {
        stats[o.user_id] = { count: 0, spent: 0 }
      }
      stats[o.user_id].count += 1
      stats[o.user_id].spent += Number(o.total || 0)
    })

    setOrderStats(stats)
    setUsers(profiles || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return users
    return users.filter(
      (u) =>
        (u.email || '').toLowerCase().includes(term) ||
        (u.full_name || '').toLowerCase().includes(term) ||
        (u.phone || '').toLowerCase().includes(term),
    )
  }, [users, q])

  const openUser = (u) => {
    setSelected(u)
    setPointsEdit(String(u.points ?? 0))
    setFlash('')
    setError('')
  }

  const savePoints = async () => {
    if (!selected) return
    const pts = Math.max(0, Math.floor(Number(pointsEdit) || 0))
    setSaving(true)
    setError('')
    const { error: err } = await supabase
      .from('profiles')
      .update({ points: pts })
      .eq('id', selected.id)
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === selected.id ? { ...u, points: pts } : u)),
    )
    setSelected((prev) => ({ ...prev, points: pts }))
    setFlash('Points updated')
    setTimeout(() => setFlash(''), 2000)
  }

  const ship = selected?.shipping || {}

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Customers</p>
          <h1>Users</h1>
          <p className="page-sub">
            Storefront accounts, points, and shipping profiles.
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
          <span>Members</span>
          <strong>{users.length}</strong>
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
          placeholder="Search name, email, phone…"
        />
      </div>

      {error && !selected && <p className="form-error banner">{error}</p>}

      {loading ? (
        <LoadingBlock label="Loading users…" />
      ) : filtered.length === 0 ? (
        <section className="panel">
          <EmptyState
            title="No users found"
            body={
              users.length === 0
                ? 'Customer accounts appear here after signup.'
                : 'Try a different search.'
            }
            action={
              q ? (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setQ('')}
                >
                  Clear search
                </button>
              ) : null
            }
          />
        </section>
      ) : (
        <div className="users-layout">
          <section className="panel users-list-panel">
            <div className="user-list">
              {filtered.map((u) => {
                const stats = orderStats[u.id] || { count: 0, spent: 0 }
                const active = selected?.id === u.id
                return (
                  <button
                    key={u.id}
                    type="button"
                    className={`user-row${active ? ' active' : ''}`}
                    onClick={() => openUser(u)}
                  >
                    <div className="user-avatar" aria-hidden="true">
                      {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="user-row-copy">
                      <strong>{u.full_name || 'Member'}</strong>
                      <span>{u.email}</span>
                    </div>
                    <div className="user-row-meta">
                      <em>{u.points || 0} pts</em>
                      <span>
                        {stats.count} order{stats.count === 1 ? '' : 's'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="panel user-detail-panel">
            {!selected ? (
              <EmptyState
                title="Select a user"
                body="Pick someone from the list to view profile, points, and shipping."
              />
            ) : (
              <>
                <div className="user-detail-head">
                  <div className="user-avatar lg" aria-hidden="true">
                    {(selected.full_name || selected.email || '?')
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <h2>{selected.full_name || 'Member'}</h2>
                    <p className="muted">{selected.email}</p>
                    <p className="muted tiny">
                      Joined {formatRelative(selected.created_at)} ·{' '}
                      {formatDate(selected.created_at)}
                    </p>
                  </div>
                </div>

                <dl className="spec-list user-specs">
                  <div>
                    <dt>Phone</dt>
                    <dd>{selected.phone || '—'}</dd>
                  </div>
                  <div>
                    <dt>Orders</dt>
                    <dd>
                      {(orderStats[selected.id]?.count || 0).toLocaleString()} ·{' '}
                      {fmtMoney(orderStats[selected.id]?.spent || 0)} spent
                    </dd>
                  </div>
                  <div>
                    <dt>Shipping</dt>
                    <dd>
                      {[ship.line1, ship.line2].filter(Boolean).join(', ') ||
                        '—'}
                      <br />
                      {[ship.suburb, ship.state, ship.postcode]
                        .filter(Boolean)
                        .join(' ') || null}
                    </dd>
                  </div>
                </dl>

                <div className="points-editor">
                  <label>
                    <span>Primal Points</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={pointsEdit}
                      onChange={(e) => setPointsEdit(e.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={saving}
                    onClick={savePoints}
                  >
                    {saving ? 'Saving…' : 'Update points'}
                  </button>
                </div>
                {flash && <p className="form-ok">{flash}</p>}
                {error && selected && <p className="form-error">{error}</p>}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
