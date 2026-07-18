import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ImageUpload from '../components/ImageUpload'
import { productImageUrl } from '../lib/storage'
import { PRODUCT_CATEGORIES, fmtMoney, supabase } from '../lib/supabase'

const TABS = [
  { id: 'basics', label: 'Basics' },
  { id: 'variants', label: 'Variants & images' },
  { id: 'copy', label: 'Description' },
  { id: 'specs', label: 'Specifications' },
]

const emptyProduct = {
  id: '',
  name: '',
  aka: '',
  sub: '',
  tag: '',
  cat: 'metabolic',
  category_label: '',
  cas: '',
  mw: '',
  lot: '',
  form: 'Lyophilised powder',
  purity: '99%+',
  storage_lyophilised: '-20 °C — protect from light & moisture',
  storage_reconstituted: '2–8 °C — use within 28 days',
  reconstitution: 'Bacteriostatic water (recommended)',
  composition_text: '',
  perks: '',
  research_focus: '',
  description: '',
  story: '',
  hue: '#e8a020',
  active: true,
  sort_order: 0,
}

const emptyVariant = () => ({
  id: null,
  variant_key: '',
  label: '',
  price: '',
  img: '',
  stock: 100,
  active: true,
  sort_order: 0,
  _delete: false,
})

function linesToArray(text) {
  return String(text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

function arrayToLines(arr) {
  return (arr || []).join('\n')
}

function parseComposition(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, amount] = line.split('|').map((s) => s.trim())
      return amount ? { name, amount } : { name, note: '' }
    })
}

function compositionToText(comp) {
  return (comp || [])
    .map((c) => (c.amount ? `${c.name} | ${c.amount}` : c.name))
    .join('\n')
}

function slugifyId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}

function keyFromLabel(label) {
  return label
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_-]/g, '')
}

export default function ProductForm() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const [tab, setTab] = useState('basics')
  const [form, setForm] = useState(emptyProduct)
  const [variants, setVariants] = useState([emptyVariant()])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isNew) return
    let alive = true
    ;(async () => {
      const [{ data: product, error: pErr }, { data: vars, error: vErr }] =
        await Promise.all([
          supabase.from('products').select('*').eq('id', id).maybeSingle(),
          supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', id)
            .order('sort_order', { ascending: true }),
        ])
      if (!alive) return
      if (pErr || vErr || !product) {
        setError(pErr?.message || vErr?.message || 'Product not found')
        setLoading(false)
        return
      }
      setForm({
        ...emptyProduct,
        ...product,
        aka: (product.aka || []).join(', '),
        perks: arrayToLines(product.perks),
        research_focus: arrayToLines(product.research_focus),
        composition_text: compositionToText(product.composition),
        cas: product.cas || '',
      })
      setVariants(
        (vars || []).length
          ? vars.map((v) => ({
              id: v.id,
              variant_key: v.variant_key,
              label: v.label,
              price: String(v.price),
              img: v.img || '',
              stock: v.stock,
              active: v.active,
              sort_order: v.sort_order,
              _delete: false,
            }))
          : [emptyVariant()],
      )
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [id, isNew])

  const setField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'name' && isNew && !prev.id) {
        next.id = slugifyId(value)
      }
      if (key === 'cat' && !prev.category_label) {
        next.category_label =
          PRODUCT_CATEGORIES.find((c) => c.value === value)?.label || value
      }
      return next
    })
  }

  const setVariant = (index, key, value) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v
        const next = { ...v, [key]: value }
        if (key === 'label' && (!v.variant_key || v.variant_key === keyFromLabel(v.label))) {
          next.variant_key = keyFromLabel(value)
        }
        return next
      }),
    )
  }

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()])

  const removeVariant = (index) => {
    setVariants((prev) => {
      const row = prev[index]
      if (row.id) {
        return prev.map((v, i) =>
          i === index ? { ...v, _delete: true } : v,
        )
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const visibleVariants = useMemo(
    () => variants.map((v, i) => ({ v, i })).filter(({ v }) => !v._delete),
    [variants],
  )

  const productIdForUpload = (isNew ? form.id : id) || 'draft'

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const productId = (isNew ? form.id : id).trim().toLowerCase()
    if (!/^[a-z0-9_-]+$/.test(productId)) {
      setError('Product ID must be lowercase letters, numbers, _ or -')
      setTab('basics')
      setSaving(false)
      return
    }

    const payload = {
      id: productId,
      name: form.name.trim(),
      aka: form.aka
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      sub: form.sub.trim(),
      tag: form.tag.trim(),
      cat: form.cat,
      category_label:
        form.category_label.trim() ||
        PRODUCT_CATEGORIES.find((c) => c.value === form.cat)?.label ||
        form.cat,
      cas: form.cas.trim() || null,
      mw: form.mw.trim(),
      lot: form.lot.trim(),
      form: form.form.trim(),
      purity: form.purity.trim(),
      storage_lyophilised: form.storage_lyophilised.trim(),
      storage_reconstituted: form.storage_reconstituted.trim(),
      reconstitution: form.reconstitution.trim(),
      composition: parseComposition(form.composition_text),
      perks: linesToArray(form.perks),
      research_focus: linesToArray(form.research_focus),
      description: form.description.trim(),
      story: form.story.trim(),
      hue: form.hue.trim() || '#e8a020',
      active: form.active,
      sort_order: Number(form.sort_order) || 0,
    }

    if (!payload.name) {
      setError('Name is required')
      setTab('basics')
      setSaving(false)
      return
    }

    const activeVariants = variants.filter((v) => !v._delete)
    if (!activeVariants.length) {
      setError('Add at least one size / variant')
      setTab('variants')
      setSaving(false)
      return
    }

    for (const v of activeVariants) {
      if (!v.variant_key.trim() || !v.label.trim() || v.price === '') {
        setError('Each variant needs a size label and price')
        setTab('variants')
        setSaving(false)
        return
      }
    }

    let writeErr = null
    if (isNew) {
      const { error: err } = await supabase.from('products').insert(payload)
      writeErr = err
    } else {
      const { id: _omit, ...update } = payload
      const { error: err } = await supabase
        .from('products')
        .update(update)
        .eq('id', productId)
      writeErr = err
    }

    if (writeErr) {
      setError(writeErr.message)
      setSaving(false)
      return
    }

    for (const v of variants) {
      if (v._delete && v.id) {
        const { error: err } = await supabase
          .from('product_variants')
          .delete()
          .eq('id', v.id)
        if (err) {
          setError(err.message)
          setSaving(false)
          return
        }
        continue
      }
      if (v._delete) continue

      const row = {
        product_id: productId,
        variant_key: v.variant_key.trim(),
        label: v.label.trim(),
        price: Number(v.price),
        img: v.img.trim(),
        stock: Number(v.stock) || 0,
        active: Boolean(v.active),
        sort_order: Number(v.sort_order) || 0,
      }

      if (v.id) {
        const { error: err } = await supabase
          .from('product_variants')
          .update(row)
          .eq('id', v.id)
        if (err) {
          setError(err.message)
          setSaving(false)
          return
        }
      } else {
        const { error: err } = await supabase
          .from('product_variants')
          .insert(row)
        if (err) {
          setError(err.message)
          setSaving(false)
          return
        }
      }
    }

    setSaving(false)
    setMessage('Product saved')
    if (isNew) navigate(`/products/${productId}`, { replace: true })
  }

  const deleteProduct = async () => {
    if (!confirm(`Delete product "${id}" and all variants?`)) return
    const { error: err } = await supabase.from('products').delete().eq('id', id)
    if (err) {
      setError(err.message)
      return
    }
    navigate('/products')
  }

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading product…</p>
      </div>
    )
  }

  return (
    <div className="page product-page">
      <header className="page-head">
        <div>
          <Link className="back-link" to="/products">
            ← Products
          </Link>
          <h1>{isNew ? 'New product' : form.name || id}</h1>
          <p className="muted">
            {isNew
              ? 'Add catalog details, sizes, and upload images to Supabase Storage.'
              : `Editing · ${id}`}
          </p>
        </div>
        <div className="head-actions">
          {!isNew && (
            <button type="button" className="btn-danger" onClick={deleteProduct}>
              Delete
            </button>
          )}
          <button
            className="btn-primary"
            type="submit"
            form="product-form"
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save product'}
          </button>
        </div>
      </header>

      <div className="form-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            className={`form-tab${tab === t.id ? ' active' : ''}`}
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.id === 'variants' && (
              <em>{visibleVariants.length}</em>
            )}
          </button>
        ))}
      </div>

      {error && <p className="form-error banner">{error}</p>}
      {message && <p className="form-ok banner">{message}</p>}

      <form id="product-form" className="product-form" onSubmit={onSubmit}>
        {tab === 'basics' && (
          <section className="panel">
            <h2>Product basics</h2>
            <p className="panel-help">
              Name and category show in the shop. Product ID is used in URLs and
              cannot change after create.
            </p>
            <div className="form-grid">
              <label className="span-2">
                <span>Product name</span>
                <input
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="Retatrutide"
                  required
                />
              </label>
              <label>
                <span>Product ID</span>
                <input
                  value={form.id}
                  onChange={(e) => setField('id', e.target.value)}
                  disabled={!isNew}
                  placeholder="reta"
                  required
                />
              </label>
              <label>
                <span>Badge / tag</span>
                <input
                  value={form.tag}
                  onChange={(e) => setField('tag', e.target.value)}
                  placeholder="Best seller"
                />
              </label>
              <label>
                <span>Category</span>
                <select
                  value={form.cat}
                  onChange={(e) => setField('cat', e.target.value)}
                >
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Category label (display)</span>
                <input
                  value={form.category_label}
                  onChange={(e) => setField('category_label', e.target.value)}
                  placeholder="Metabolic Research"
                />
              </label>
              <label className="span-2">
                <span>Short summary (shop card)</span>
                <input
                  value={form.sub}
                  onChange={(e) => setField('sub', e.target.value)}
                  placeholder="One-line research summary"
                />
              </label>
              <label className="span-2">
                <span>Also known as</span>
                <input
                  value={form.aka}
                  onChange={(e) => setField('aka', e.target.value)}
                  placeholder="Reta, LY3437943"
                />
              </label>
              <label>
                <span>Visibility</span>
                <select
                  value={form.active ? 'yes' : 'no'}
                  onChange={(e) => setField('active', e.target.value === 'yes')}
                >
                  <option value="yes">Active (visible in shop)</option>
                  <option value="no">Hidden</option>
                </select>
              </label>
              <label>
                <span>Sort order</span>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setField('sort_order', e.target.value)}
                />
              </label>
            </div>
            <div className="tab-nav">
              <span />
              <button
                type="button"
                className="btn-primary"
                onClick={() => setTab('variants')}
              >
                Next: Variants & images →
              </button>
            </div>
          </section>
        )}

        {tab === 'variants' && (
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Sizes & images</h2>
                <p className="panel-help" style={{ margin: '8px 0 0' }}>
                  Each size can have its own price, stock, and image. Images
                  upload to the <code>product-images</code> Supabase bucket.
                </p>
              </div>
              <button type="button" className="btn-ghost" onClick={addVariant}>
                + Add size
              </button>
            </div>

            {!form.id && isNew && (
              <p className="form-error banner">
                Tip: set the product name/ID on Basics first so uploads are
                organized by product folder.
              </p>
            )}

            <div className="variant-cards">
              {visibleVariants.map(({ v, i }, displayIndex) => (
                <article className="variant-card" key={v.id || `new-${i}`}>
                  <header className="variant-card-head">
                    <strong>Size {displayIndex + 1}</strong>
                    <button
                      type="button"
                      className="btn-danger ghost"
                      onClick={() => removeVariant(i)}
                    >
                      Remove
                    </button>
                  </header>

                  <ImageUpload
                    value={v.img}
                    productId={productIdForUpload}
                    variantKey={v.variant_key || `size-${displayIndex + 1}`}
                    label="Variant image"
                    onChange={(url) => setVariant(i, 'img', url)}
                  />

                  <div className="form-grid">
                    <label>
                      <span>Size label</span>
                      <input
                        value={v.label}
                        onChange={(e) => setVariant(i, 'label', e.target.value)}
                        placeholder="10MG"
                      />
                    </label>
                    <label>
                      <span>Internal key</span>
                      <input
                        value={v.variant_key}
                        onChange={(e) =>
                          setVariant(i, 'variant_key', e.target.value)
                        }
                        placeholder="10mg"
                      />
                    </label>
                    <label>
                      <span>Price (AUD)</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={v.price}
                        onChange={(e) => setVariant(i, 'price', e.target.value)}
                        placeholder="99.00"
                      />
                    </label>
                    <label>
                      <span>Stock</span>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => setVariant(i, 'stock', e.target.value)}
                      />
                    </label>
                    <label>
                      <span>Active</span>
                      <select
                        value={v.active ? 'yes' : 'no'}
                        onChange={(e) =>
                          setVariant(i, 'active', e.target.value === 'yes')
                        }
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </label>
                    {v.price !== '' && (
                      <div className="variant-price-preview">
                        <span>Preview</span>
                        <strong>
                          {v.label || 'Size'} · {fmtMoney(Number(v.price) || 0)}
                        </strong>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <div className="tab-nav">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setTab('basics')}
              >
                ← Basics
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setTab('copy')}
              >
                Next: Description →
              </button>
            </div>
          </section>
        )}

        {tab === 'copy' && (
          <section className="panel">
            <h2>Description & research copy</h2>
            <p className="panel-help">
              Shown on the product detail page. Use one perk / research point
              per line.
            </p>
            <div className="form-grid">
              <label className="span-2">
                <span>Short story</span>
                <textarea
                  rows={2}
                  value={form.story}
                  onChange={(e) => setField('story', e.target.value)}
                />
              </label>
              <label className="span-2">
                <span>Full description</span>
                <textarea
                  rows={6}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                />
              </label>
              <label>
                <span>Perks (one per line)</span>
                <textarea
                  rows={5}
                  value={form.perks}
                  onChange={(e) => setField('perks', e.target.value)}
                  placeholder="Triple-receptor signalling"
                />
              </label>
              <label>
                <span>Research focus (one per line)</span>
                <textarea
                  rows={5}
                  value={form.research_focus}
                  onChange={(e) => setField('research_focus', e.target.value)}
                />
              </label>
              <label className="span-2">
                <span>Blend composition</span>
                <textarea
                  rows={3}
                  value={form.composition_text}
                  onChange={(e) => setField('composition_text', e.target.value)}
                  placeholder="GHK-Cu | 50 mg"
                />
                <small className="field-hint">Format: Name | amount</small>
              </label>
            </div>
            <div className="tab-nav">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setTab('variants')}
              >
                ← Variants
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setTab('specs')}
              >
                Next: Specs →
              </button>
            </div>
          </section>
        )}

        {tab === 'specs' && (
          <section className="panel">
            <h2>Lab specifications</h2>
            <div className="form-grid">
              <label>
                <span>CAS</span>
                <input
                  value={form.cas}
                  onChange={(e) => setField('cas', e.target.value)}
                />
              </label>
              <label>
                <span>Molecular weight</span>
                <input
                  value={form.mw}
                  onChange={(e) => setField('mw', e.target.value)}
                />
              </label>
              <label>
                <span>Lot</span>
                <input
                  value={form.lot}
                  onChange={(e) => setField('lot', e.target.value)}
                />
              </label>
              <label>
                <span>Purity</span>
                <input
                  value={form.purity}
                  onChange={(e) => setField('purity', e.target.value)}
                />
              </label>
              <label>
                <span>Form</span>
                <input
                  value={form.form}
                  onChange={(e) => setField('form', e.target.value)}
                />
              </label>
              <label>
                <span>Accent hue</span>
                <div className="color-field">
                  <input
                    type="color"
                    value={form.hue || '#e8a020'}
                    onChange={(e) => setField('hue', e.target.value)}
                  />
                  <input
                    value={form.hue}
                    onChange={(e) => setField('hue', e.target.value)}
                  />
                </div>
              </label>
              <label className="span-2">
                <span>Storage (lyophilised)</span>
                <input
                  value={form.storage_lyophilised}
                  onChange={(e) =>
                    setField('storage_lyophilised', e.target.value)
                  }
                />
              </label>
              <label className="span-2">
                <span>Storage (reconstituted)</span>
                <input
                  value={form.storage_reconstituted}
                  onChange={(e) =>
                    setField('storage_reconstituted', e.target.value)
                  }
                />
              </label>
              <label className="span-2">
                <span>Reconstitution</span>
                <input
                  value={form.reconstitution}
                  onChange={(e) => setField('reconstitution', e.target.value)}
                />
              </label>
            </div>

            <div className="save-summary">
              <div className="save-summary-thumbs">
                {visibleVariants.slice(0, 3).map(({ v, i }) => (
                  <div key={v.id || i} className="save-thumb">
                    {v.img ? (
                      <img src={productImageUrl(v.img)} alt="" />
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <strong>{form.name || 'Untitled product'}</strong>
                <p className="muted">
                  {visibleVariants.length} size
                  {visibleVariants.length === 1 ? '' : 's'} ·{' '}
                  {form.active ? 'Active' : 'Hidden'}
                </p>
              </div>
              <button className="btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save product'}
              </button>
            </div>

            <div className="tab-nav">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setTab('copy')}
              >
                ← Description
              </button>
            </div>
          </section>
        )}
      </form>
    </div>
  )
}
