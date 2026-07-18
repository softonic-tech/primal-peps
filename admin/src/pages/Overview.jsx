import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatusLabel from '../components/StatusLabel'
import { fmtMoney, statusTone, supabase } from '../lib/supabase'

export default function Overview() {
  const [stats, setStats] = useState({
    orders: 0,
    awaiting: 0,
    products: 0,
    revenue: 0,
  })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [ordersRes, productsRes, awaitingRes, recentRes] = await Promise.all([
        supabase.from('orders').select('id, total', { count: 'exact' }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'Awaiting payment'),
        supabase
          .from('orders')
          .select('id, customer_name, total, status, created_at')
          .order('created_at', { ascending: false })
          .limit(6),
      ])

      if (!alive) return

      const revenue = (ordersRes.data || []).reduce(
        (sum, o) => sum + Number(o.total || 0),
        0,
      )

      setStats({
        orders: ordersRes.count || 0,
        awaiting: awaitingRes.count || 0,
        products: productsRes.count || 0,
        revenue,
      })
      setRecent(recentRes.data || [])
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Dashboard</p>
          <h1>Overview</h1>
        </div>
      </header>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <>
          <div className="stat-grid">
            <article className="stat-card">
              <span>Orders</span>
              <strong>{stats.orders}</strong>
            </article>
            <article className="stat-card accent">
              <span>Awaiting payment</span>
              <strong>{stats.awaiting}</strong>
            </article>
            <article className="stat-card">
              <span>Products</span>
              <strong>{stats.products}</strong>
            </article>
            <article className="stat-card">
              <span>Gross total</span>
              <strong>{fmtMoney(stats.revenue)}</strong>
            </article>
          </div>

          <section className="panel">
            <div className="panel-head">
              <h2>Recent orders</h2>
              <Link to="/orders">View all</Link>
            </div>
            {recent.length === 0 ? (
              <p className="muted">No orders yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <Link to={`/orders/${o.id}`}>{o.id}</Link>
                      </td>
                      <td>{o.customer_name || '—'}</td>
                      <td>
                        <span className={`status-pill tone-${statusTone(o.status)}`}>
                          <StatusLabel status={o.status} />
                        </span>
                      </td>
                      <td>{fmtMoney(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  )
}
