import { useSettings } from '../context/SettingsContext'
import { useReveal } from '../hooks/useReveal'
import {
  DEFAULT_TIKTOK_HANDLE,
  normalizeTikTokHandle,
  tiktokProfileUrl,
  whatsappDmUrl,
  TIKTOK_REWARD,
} from '../data/tiktokReward'

/**
 * @param {'section' | 'panel' | 'compact'} variant
 */
export default function TikTokReward({ variant = 'section', className = '' }) {
  const { social, contact } = useSettings()
  const handle = normalizeTikTokHandle(social?.tiktok || DEFAULT_TIKTOK_HANDLE)
  const tiktokUrl = tiktokProfileUrl(handle)
  const dmUrl = whatsappDmUrl(contact?.phone, handle)
  const hairRef = useReveal({ threshold: 0.5 })
  const bodyRef = useReveal()

  if (variant === 'compact') {
    return (
      <aside className={`tiktok-reward tiktok-reward-compact ${className}`.trim()}>
        <p className="tiktok-reward-kicker">{TIKTOK_REWARD.eyebrow}</p>
        <p className="tiktok-reward-compact-title">{TIKTOK_REWARD.title}</p>
        <p className="tiktok-reward-compact-body">{TIKTOK_REWARD.short}</p>
        <p className="tiktok-reward-compact-note">
          Pay first → receive → post &amp; tag {handle} → DM us → 50% off next order
        </p>
        <div className="tiktok-reward-actions">
          <a
            className="btn-primary tiktok-reward-btn"
            href={tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open TikTok {handle}
          </a>
          {dmUrl ? (
            <a
              className="btn-ghost tiktok-reward-btn"
              href={dmUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              DM on WhatsApp
            </a>
          ) : null}
        </div>
      </aside>
    )
  }

  if (variant === 'panel') {
    return (
      <aside className={`tiktok-reward tiktok-reward-panel ${className}`.trim()}>
        <span className="eyebrow">{TIKTOK_REWARD.eyebrow}</span>
        <h3>{TIKTOK_REWARD.title}</h3>
        <p>{TIKTOK_REWARD.lead}</p>
        <ol className="tiktok-reward-steps compact">
          {TIKTOK_REWARD.steps.map((s) => (
            <li key={s.n}>
              <strong>
                {s.n}. {s.title}
              </strong>
              <span>{s.body}</span>
            </li>
          ))}
        </ol>
        <div className="tiktok-reward-actions">
          <a
            className="btn-primary tiktok-reward-btn"
            href={tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Tag {handle}
          </a>
          {dmUrl ? (
            <a
              className="btn-ghost tiktok-reward-btn"
              href={dmUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Send video via WhatsApp
            </a>
          ) : null}
        </div>
        <p className="tiktok-reward-foot">{TIKTOK_REWARD.footnote}</p>
      </aside>
    )
  }

  return (
    <section className={`tiktok-reward-sec section ${className}`.trim()} id="tiktok-reward">
      <div className="wrap">
        <div className="hairline rv" ref={hairRef} />
        <div className="tiktok-reward-layout rv" ref={bodyRef}>
          <div className="tiktok-reward-copy">
            <span className="eyebrow">{TIKTOK_REWARD.eyebrow}</span>
            <h2 className="display tiktok-reward-display">
              POST ON TIKTOK.{' '}
              <span className="gold">SAVE 50%</span>
            </h2>
            <p>{TIKTOK_REWARD.lead}</p>
            <div className="tiktok-reward-actions">
              <a
                className="btn-primary tiktok-reward-btn"
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Follow {handle}
              </a>
              {dmUrl ? (
                <a
                  className="btn-ghost tiktok-reward-btn"
                  href={dmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  DM your video
                </a>
              ) : null}
            </div>
            <p className="tiktok-reward-foot">{TIKTOK_REWARD.footnote}</p>
          </div>
          <ol className="tiktok-reward-steps">
            {TIKTOK_REWARD.steps.map((s) => (
              <li key={s.n}>
                <span className="n" aria-hidden="true">
                  {s.n}
                </span>
                <div>
                  <b>{s.title}</b>
                  <span>{s.body}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
