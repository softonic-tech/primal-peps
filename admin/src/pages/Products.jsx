import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { productImageUrl } from '../lib/storage'
import { fmtMoney, supabase } from '../lib/supabase'

export default function Products() {
  const [products, setProducts] = useState([])
  const [variants, setVariants] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    const [{ data: prods, error: pErr }, { data: vars, error: vErr }] =
      await Promise.all([
        supabase
          .from('products')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase.from('product_variants').select('*'),
      ])
    if (pErr || vErr) setError(pErr?.message || vErr?.message)
    setProducts(prods || [])
    setVariants(vars || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const variantMap = useMemo(() => {
    const map = {}
    variants.forEach((v) => {
      if (!map[v.product_id]) map[v.product_id] = []
      map[v.product_id].push(v)
    })
    Object.values(map).forEach((list) =>
      list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    )
    return map
  }, [variants])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return products
    return products.filter(
      (p) =>
        p.id.toLowerCase().includes(term) ||
        p.name.toLowerCase().includes(term) ||
        (p.cat || '').toLowerCase().includes(term) ||
        (p.category_label || '').toLowerCase().includes(term),
    )
  }, [products, q])

  const toggleActive = async (product) => {
    const { error: err } = await supabase
      .from('products')
      .update({ active: !product.active })
      .eq('id', product.id)
    if (err) {
      setError(err.message)
      return
    }
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, active: !p.active } : p,
      ),
    )
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Catalog</p>
          <h1>Products</h1>
        </div>
        <div className="head-actions">
          <button type="button" className="btn-ghost" onClick={load}>
            Refresh
          </button>
          <Link className="btn-primary" to="/products/new">
            Add product
          </Link>
        </div>
      </header>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search products…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {error && <p className="form-error banner">{error}</p>}

      {loading ? (
        <p className="muted">Loading products…</p>
      ) : filtered.length === 0 ? (
        <section className="panel">
          <p className="muted">
            No products yet. Add one, or seed from the storefront catalog SQL.
          </p>
        </section>
      ) : (
        <div className="product-card-grid">
          {filtered.map((p, index) => {
            const vars = variantMap[p.id] || []
            const minPrice = vars.length
              ? Math.min(...vars.map((v) => Number(v.price)))
              : 0
            const thumb = productImageUrl(vars.find((v) => v.img)?.img)
            const labels = vars
              .filter((v) => v.active !== false)
              .map((v) => v.label)
              .slice(0, 3)

            return (
              <article
                key={p.id}
                className={`admin-product-card${p.active ? '' : ' is-hidden'}`}
              >
                <div className="apc-visual">
                  <span className="apc-series">
                    {(p.category_label || p.cat || 'Research').slice(0, 18)} ·{' '}
                    {String(index + 1).padStart(3, '0')}
                  </span>
                  <span className={`apc-stock${p.active ? '' : ' off'}`}>
                    {p.active ? 'Active' : 'Hidden'}
                  </span>
                  {thumb ? (
                    <img src={thumb} alt={p.name} loading="lazy" />
                  ) : (
                    <div className="apc-placeholder">No image</div>
                  )}
                  {p.tag && <span className="apc-tag">{p.tag}</span>}
                </div>

                <div className="apc-copy">
                  <h3>{p.name}</h3>
                  <p className="apc-sub">{p.sub || 'No summary yet.'}</p>

                  <div className="apc-meta">
                    <span>{vars.length} size{vars.length === 1 ? '' : 's'}</span>
                    <span>{vars.length ? fmtMoney(minPrice) : '—'}</span>
                  </div>

                  {labels.length > 0 && (
                    <div className="apc-doses">
                      {labels.map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                      {vars.length > labels.length && (
                        <span>+{vars.length - labels.length}</span>
                      )}
                    </div>
                  )}

                  <div className="apc-foot">
                    <button
                      type="button"
                      className={`status-pill toggle${p.active ? '' : ' off'}`}
                      onClick={() => toggleActive(p)}
                    >
                      {p.active ? 'Active' : 'Hidden'}
                    </button>
                    <Link className="btn-ghost apc-edit" to={`/products/${p.id}`}>
                      Edit
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
