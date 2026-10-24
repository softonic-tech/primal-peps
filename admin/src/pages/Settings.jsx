import { useEffect, useState } from 'react'
import { LoadingBlock } from '../components/ui'
import {
  DEFAULT_SETTINGS,
  mergeSettings,
  normalizeTikTokCodes,
} from '../lib/settings'
import { supabase } from '../lib/supabase'

const TABS = [
  { id: 'storefront', label: 'Storefront', short: 'Live' },
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
  const [tab, setTab] = useState('storefront')
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

  const tiktokCodes = normalizeTikTokCodes(form.promo)

  const patchTikTokCode = (index, key, value) => {
    setForm((prev) => {
      const list = normalizeTikTokCodes(prev.promo).map((row) => ({ ...row }))
      if (!list[index]) return prev
      list[index] = { ...list[index], [key]: value }
      const primary = list[0]
      return {
        ...prev,
        promo: {
          ...prev.promo,
          tiktokCodes: list,
          tiktokCode: primary?.code || 'TIKTOK50',
          tiktokPercent: primary?.percent || 50,
        },
      }
    })
    setOk('')
  }

  const addTikTokCode = (preset = null) => {
    setForm((prev) => {
      const list = normalizeTikTokCodes(prev.promo).map((row) => ({ ...row }))
      list.push(
        preset || {
          label: 'New TikTok code',
          code: '',
          percent: 30,
        },
      )
      return {
        ...prev,
        promo: { ...prev.promo, tiktokCodes: list },
      }
    })
    setOk('')
  }

  const removeTikTokCode = (index) => {
    setForm((prev) => {
      const list = normalizeTikTokCodes(prev.promo).filter((_, i) => i !== index)
      const next = list.length
        ? list
        : [{ label: 'TikTok reward', code: 'TIKTOK50', percent: 50 }]
      const primary = next[0]
      return {
        ...prev,
        promo: {
          ...prev.promo,
          tiktokCodes: next,
          tiktokCode: primary.code,
          tiktokPercent: primary.percent,
        },
      }
    })
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
        payId: form.bank.payId.trim(),
      },
      promo: (() => {
        const tiktokCodes = normalizeTikTokCodes({
          tiktokCodes: form.promo.tiktokCodes,
        })
        const primary = tiktokCodes[0] || {
          code: 'TIKTOK50',
          percent: 50,
        }
        return {
          code: (form.promo.code || '').trim().toUpperCase() || 'PRIMAL15',
          percent: Math.min(90, Math.max(0, Number(form.promo.percent) || 0)),
          tiktokCodes,
          tiktokCode: primary.code,
          tiktokPercent: primary.percent,
        }
      })(),
      shipping: {
        freeThreshold: Math.max(0, Number(form.shipping.freeThreshold) || 0),
        freeBacThreshold: Math.max(
          0,
          Number(form.shipping.freeBacThreshold) || 0,
        ),
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
        storefrontLive: Boolean(form.site.storefrontLive),
        comingSoonHeadline:
          (form.site.comingSoonHeadline || '').trim() || 'COMING SOON',
        comingSoonBody: (form.site.comingSoonBody || '').trim(),
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
            Turn the public shop on or off, then edit bank, promo, social, and
            contact details.
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
      {!form.site.storefrontLive && (
        <p className="form-warn banner">
          The public shop is in coming soon mode. Turn it Live on the Storefront
          tab when you are ready.
        </p>
      )}

      <form className="settings-form" onSubmit={save}>
        {tab === 'storefront' && (
          <section className="panel">
            <h2>Storefront visibility</h2>
            <p className="panel-help">
              When coming soon is on, visitors see a branded waitlist page
              instead of the homepage, products, and checkout. Admin stays
              available.
            </p>
            <div className="storefront-live-card">
              <div>
                <strong>
                  {form.site.storefrontLive ? 'Shop is live' : 'Coming soon mode'}
                </strong>
                <span>
                  {form.site.storefrontLive
                    ? 'Customers can browse and order as normal.'
                    : 'The public site is hidden behind the coming soon page.'}
                </span>
              </div>
              <div className="live-switch" role="group" aria-label="Storefront mode">
                <button
                  type="button"
                  className={form.site.storefrontLive ? 'active live' : ''}
                  onClick={() => patch('site', 'storefrontLive', true)}
                >
                  Live
                </button>
                <button
                  type="button"
                  className={!form.site.storefrontLive ? 'active soon' : ''}
                  onClick={() => patch('site', 'storefrontLive', false)}
                >
                  Coming soon
                </button>
              </div>
            </div>
            <div className="form-grid" style={{ marginTop: 18 }}>
              <div className="span-2">
                <Field
                  label="Coming soon headline"
                  hint="Shown in large type on the waitlist page"
                >
                  <input
                    value={form.site.comingSoonHeadline}
                    onChange={(e) =>
                      patch('site', 'comingSoonHeadline', e.target.value)
                    }
                    placeholder="COMING SOON"
                  />
                </Field>
              </div>
              <div className="span-2">
                <Field
                  label="Coming soon message"
                  hint="Short note under the headline. Email capture is included automatically."
                >
                  <textarea
                    rows={3}
                    value={form.site.comingSoonBody}
                    onChange={(e) =>
                      patch('site', 'comingSoonBody', e.target.value)
                    }
                  />
                </Field>
              </div>
            </div>
          </section>
        )}

        {tab === 'bank' && (
          <section className="panel">
            <h2>Bank transfer</h2>
            <p className="panel-help">
              Shown at checkout when customers pay by PayID. Use order ID
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
              <Field label="PayID (phone number)">
                <input
                  value={form.bank.payId}
                  onChange={(e) => patch('bank', 'payId', e.target.value)}
                  placeholder="0400001235"
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
              Welcome offer, TikTok UGC redeem code, and free-shipping threshold
              used on the storefront.
            </p>
            <div className="form-grid">
              <Field label="Welcome promo code">
                <input
                  value={form.promo.code}
                  onChange={(e) => patch('promo', 'code', e.target.value)}
                  required
                />
              </Field>
              <Field label="Welcome discount %" hint="Applied when the welcome code is used">
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
              <div className="span-2">
                <div className="tiktok-codes-head">
                  <div>
                    <strong>TikTok redeem codes</strong>
                    <p className="panel-help" style={{ margin: '6px 0 0' }}>
                      Add seasonal codes (e.g. Halloween) without replacing the
                      main one. Customers still need email approval under TikTok,
                      then enter one of these codes at checkout.
                    </p>
                  </div>
                  <div className="tiktok-codes-actions">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() =>
                        addTikTokCode({
                          label: 'Halloween special',
                          code: 'HALLOWEEN30',
                          percent: 30,
                        })
                      }
                    >
                      + Halloween 30%
                    </button>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => addTikTokCode()}
                    >
                      + Add code
                    </button>
                  </div>
                </div>
                <div className="tiktok-codes-list">
                  {tiktokCodes.map((row, index) => (
                    <div key={`tiktok-code-${index}`} className="tiktok-code-row">
                      <label className="settings-field">
                        <span>Label</span>
                        <input
                          value={row.label}
                          onChange={(e) =>
                            patchTikTokCode(index, 'label', e.target.value)
                          }
                          placeholder="Halloween special"
                        />
                      </label>
                      <label className="settings-field">
                        <span>Code</span>
                        <input
                          value={row.code}
                          onChange={(e) =>
                            patchTikTokCode(index, 'code', e.target.value)
                          }
                          placeholder="HALLOWEEN30"
                          required
                        />
                      </label>
                      <label className="settings-field">
                        <span>Discount %</span>
                        <input
                          type="number"
                          min={1}
                          max={90}
                          step={1}
                          value={row.percent}
                          onChange={(e) =>
                            patchTikTokCode(index, 'percent', e.target.value)
                          }
                          required
                        />
                      </label>
                      <button
                        type="button"
                        className="btn-ghost tiktok-code-remove"
                        onClick={() => removeTikTokCode(index)}
                        disabled={tiktokCodes.length <= 1}
                        title={
                          tiktokCodes.length <= 1
                            ? 'Keep at least one TikTok code'
                            : 'Remove code'
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
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
              <Field
                label="Free BAC Water over ($)"
                hint="Adds a complimentary BAC Water vial when merchandise total reaches this amount"
              >
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.shipping.freeBacThreshold}
                  onChange={(e) =>
                    patch('shipping', 'freeBacThreshold', e.target.value)
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
                ['instagram', 'Instagram', 'https://'],
                ['facebook', 'Facebook', 'https://'],
                ['tiktok', 'TikTok', '@primalpepsaus or https://tiktok.com/@…'],
                ['youtube', 'YouTube', 'https://'],
                ['x', 'X (Twitter)', 'https://'],
              ].map(([key, label, placeholder]) => (
                <div key={key} className="span-2">
                  <Field
                    label={label}
                    hint={
                      key === 'tiktok'
                        ? 'Handle or profile URL used on the TikTok reward section'
                        : undefined
                    }
                  >
                    <input
                      type={key === 'tiktok' ? 'text' : 'url'}
                      value={form.social[key]}
                      onChange={(e) => patch('social', key, e.target.value)}
                      placeholder={placeholder}
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
