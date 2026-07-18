import { useEffect, useState } from 'react'
import { LoadingBlock } from '../components/ui'
import { DEFAULT_SETTINGS, mergeSettings } from '../lib/settings'
import { supabase } from '../lib/supabase'

const TABS = [
  { id: 'bank', label: 'Bank', short: 'Bank' },
  { id: 'promo', label: 'Promo & shipping', short: 'Promo' },
  { id: 'social', label: 'Social', short: 'Social' },
  { id: 'contact', label: 'Contact & site', short: 'Contact' },
]

function Field({ label, hint, children }) {
  return (
    <label className="settings-field">
      <span>{label}</span>
      {children}
      {hint && <small className="field-hint">{hint}</small>}
    </label>
  )
}

export default function Settings() {
  const [tab, setTab] = useState('bank')
  const [form, setForm] = useState(structuredClone(DEFAULT_SETTINGS))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (err) {
      setError(
        err.message.includes('site_settings')
          ? 'Settings table missing — run admin/supabase/site-settings.sql in Supabase.'
          : err.message,
      )
      setForm(structuredClone(DEFAULT_SETTINGS))
      setLoading(false)
      return
    }

    if (!data) {
      const seed = structuredClone(DEFAULT_SETTINGS)
      const { error: insErr } = await supabase.from('site_settings').insert({
        id: 1,
        ...seed,
      })
      if (insErr) setError(insErr.message)
      setForm(seed)
    } else {
      setForm(mergeSettings(data))
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const patch = (group, key, value) => {
    setForm((prev) => ({
      ...prev,
      [group]: { ...prev[group], [key]: value },
    }))
    setOk('')
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setOk('')

    const payload = {
      id: 1,
      bank: {
        accountName: form.bank.accountName.trim(),
        bsb: form.bank.bsb.trim(),
        accountNumber: form.bank.accountNumber.trim(),
        bankName: form.bank.bankName.trim(),
      },
      promo: {
        code: (form.promo.code || '').trim().toUpperCase() || 'PRIMAL15',
        percent: Math.min(90, Math.max(0, Number(form.promo.percent) || 0)),
      },
      shipping: {
        freeThreshold: Math.max(0, Number(form.shipping.freeThreshold) || 0),
      },
      points: {
        perDollar: Math.max(0, Number(form.points.perDollar) || 0),
      },
      social: {
        instagram: form.social.instagram.trim(),
        facebook: form.social.facebook.trim(),
        tiktok: form.social.tiktok.trim(),
        youtube: form.social.youtube.trim(),
        x: form.social.x.trim(),
      },
      contact: {
        email: form.contact.email.trim(),
        phone: form.contact.phone.trim(),
      },
      site: {
        tagline: form.site.tagline.trim(),
        supportNote: form.site.supportNote.trim(),
      },
    }

    const { error: err } = await supabase.from('site_settings').upsert(payload)
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    setForm(mergeSettings(payload))
    setOk('Settings saved — storefront will use these on next load.')
  }

  if (loading) {
    return (
      <div className="page">
        <LoadingBlock label="Loading settings…" />
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Configuration</p>
          <h1>Settings</h1>
          <p className="page-sub">
            Bank transfer details, welcome discount, social links, and site
            contact info.
          </p>
        </div>
      </header>

      <div className="form-tabs settings-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`form-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
            title={t.label}
            aria-label={t.label}
          >
            <span className="lbl-full">{t.label}</span>
            <span className="lbl-short">{t.short}</span>
          </button>
        ))}
      </div>

      {error && <p className="form-error banner">{error}</p>}
      {ok && <p className="form-ok banner">{ok}</p>}

      <form className="settings-form" onSubmit={save}>
        {tab === 'bank' && (
          <section className="panel">
            <h2>Bank transfer</h2>
            <p className="panel-help">
              Shown at checkout when customers pay by bank transfer. Use order ID
              as the payment reference.
            </p>
            <div className="form-grid">
              <Field label="Account name">
                <input
                  value={form.bank.accountName}
                  onChange={(e) => patch('bank', 'accountName', e.target.value)}
                  required
                />
              </Field>
              <Field label="Bank name" hint="Optional — leave blank to hide">
                <input
                  value={form.bank.bankName}
                  onChange={(e) => patch('bank', 'bankName', e.target.value)}
                  placeholder="e.g. Commonwealth Bank"
                />
              </Field>
              <Field label="BSB">
                <input
                  value={form.bank.bsb}
                  onChange={(e) => patch('bank', 'bsb', e.target.value)}
                  required
                />
              </Field>
              <Field label="Account number">
                <input
                  value={form.bank.accountNumber}
                  onChange={(e) =>
                    patch('bank', 'accountNumber', e.target.value)
                  }
                  required
                />
              </Field>
            </div>
          </section>
        )}

        {tab === 'promo' && (
          <section className="panel">
            <h2>Promo & shipping</h2>
            <p className="panel-help">
              Welcome offer code and free-shipping threshold used on the
              storefront.
            </p>
            <div className="form-grid">
              <Field label="Promo code">
                <input
                  value={form.promo.code}
                  onChange={(e) => patch('promo', 'code', e.target.value)}
                  required
                />
              </Field>
              <Field label="Discount %" hint="Applied when the code is used">
                <input
                  type="number"
                  min={0}
                  max={90}
                  step={1}
                  value={form.promo.percent}
                  onChange={(e) => patch('promo', 'percent', e.target.value)}
                  required
                />
              </Field>
              <Field
                label="Free shipping over ($)"
                hint="AUD cart total before shipping fee"
              >
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.shipping.freeThreshold}
                  onChange={(e) =>
                    patch('shipping', 'freeThreshold', e.target.value)
                  }
                />
              </Field>
              <Field label="Points per dollar">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.points.perDollar}
                  onChange={(e) => patch('points', 'perDollar', e.target.value)}
                />
              </Field>
            </div>
          </section>
        )}

        {tab === 'social' && (
          <section className="panel">
            <h2>Social media</h2>
            <p className="panel-help">
              Full profile URLs. Empty fields are hidden on the storefront
              footer.
            </p>
            <div className="form-grid">
              {[
                ['instagram', 'Instagram'],
                ['facebook', 'Facebook'],
                ['tiktok', 'TikTok'],
                ['youtube', 'YouTube'],
                ['x', 'X (Twitter)'],
              ].map(([key, label]) => (
                <div key={key} className="span-2">
                  <Field label={label}>
                    <input
                      type="url"
                      value={form.social[key]}
                      onChange={(e) => patch('social', key, e.target.value)}
                      placeholder="https://"
                    />
                  </Field>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'contact' && (
          <section className="panel">
            <h2>Contact & site</h2>
            <p className="panel-help">
              Support details and footer tagline shown on the storefront.
            </p>
            <div className="form-grid">
              <Field label="Support email">
                <input
                  type="email"
                  value={form.contact.email}
                  onChange={(e) => patch('contact', 'email', e.target.value)}
                />
              </Field>
              <Field label="Support phone">
                <input
                  value={form.contact.phone}
                  onChange={(e) => patch('contact', 'phone', e.target.value)}
                  placeholder="+61 …"
                />
              </Field>
              <div className="span-2">
                <Field label="Footer tagline">
                  <textarea
                    rows={3}
                    value={form.site.tagline}
                    onChange={(e) => patch('site', 'tagline', e.target.value)}
                  />
                </Field>
              </div>
              <div className="span-2">
                <Field label="Support note">
                  <textarea
                    rows={2}
                    value={form.site.supportNote}
                    onChange={(e) =>
                      patch('site', 'supportNote', e.target.value)
                    }
                  />
                </Field>
              </div>
            </div>
          </section>
        )}

        <div className="settings-save-bar">
          <p className="muted">
            Changes apply to the live storefront after save.
          </p>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
