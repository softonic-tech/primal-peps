import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function CoaDialog({ open, onClose, productName, variantLabel, coaUrl }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open || !coaUrl) return null

  return createPortal(
    <div
      className="coa-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coa-dialog-title"
      onClick={onClose}
    >
      <div className="coa-dialog" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="coa-dialog-close" aria-label="Close COA preview" onClick={onClose}>
          <CloseIcon />
        </button>

        <header className="coa-dialog-head">
          <div className="coa-dialog-seal" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6M9 15l2 2 4-4" />
            </svg>
            <span>COA</span>
          </div>
          <div className="coa-dialog-copy">
            <span className="eyebrow">Certificate of Analysis</span>
            <h3 id="coa-dialog-title">
              {productName} <span className="gold">{variantLabel}</span>
            </h3>
            <p>Lab-verified identity, purity, and batch documentation for this vial.</p>
          </div>
        </header>

        <div className="coa-dialog-rule" />

        <div className="coa-dialog-stage">
          <iframe
            src={coaUrl}
            title={`${productName} ${variantLabel} COA`}
            className="coa-dialog-frame"
          />
        </div>

        <footer className="coa-dialog-foot">
          <span className="coa-dialog-meta">Primal Peps · Research use only</span>
          <div className="coa-dialog-actions">
            <a
              href={coaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost coa-dialog-open"
            >
              Open PDF →
            </a>
            <button type="button" className="btn-primary coa-dialog-dismiss" onClick={onClose}>
              Close preview
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  )
}

export function CoaAction({ productName, variant, className = 'coa-row' }) {
  const [open, setOpen] = useState(false)
  const hasCoa = Boolean(variant?.coaUrl)

  useEffect(() => {
    if (open && !hasCoa) setOpen(false)
  }, [hasCoa, open])

  if (!variant) return null

  return (
    <>
      <div className={className}>
        {hasCoa ? (
          <button
            type="button"
            className="coa-btn"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(true)
            }}
          >
            View COA
          </button>
        ) : (
          <span className="coa-pending">COA Pending</span>
        )}
      </div>
      <CoaDialog
        open={open}
        onClose={() => setOpen(false)}
        productName={productName}
        variantLabel={variant.label}
        coaUrl={variant.coaUrl}
      />
    </>
  )
}
