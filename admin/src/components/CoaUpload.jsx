import { useRef, useState } from 'react'
import { coaDocumentUrl, uploadCoaDocument } from '../lib/storage'

export default function CoaUpload({
  value,
  onChange,
  productId,
  label = 'Certificate of Analysis (COA)',
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const href = coaDocumentUrl(value)

  const onFile = async (file) => {
    if (!file) return
    setError('')
    setUploading(true)
    const result = await uploadCoaDocument(file, { productId })
    setUploading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    onChange(result.publicUrl)
  }

  return (
    <div className="image-upload coa-upload">
      <span className="image-upload-label">{label}</span>
      <div className="image-upload-box">
        <div className={`image-upload-preview coa-upload-preview${href ? '' : ' empty'}`}>
          {href ? (
            <span className="coa-upload-badge">PDF</span>
          ) : (
            <span>No COA</span>
          )}
        </div>
        <div className="image-upload-actions">
          <button
            type="button"
            className="btn-ghost"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Uploading…' : href ? 'Replace COA' : 'Upload COA'}
          </button>
          {href && (
            <>
              <a
                className="btn-ghost"
                href={href}
                target="_blank"
                rel="noreferrer"
              >
                View PDF
              </a>
              <button
                type="button"
                className="btn-danger ghost"
                disabled={uploading}
                onClick={() => onChange('')}
              >
                Remove
              </button>
            </>
          )}
          <p className="image-upload-hint">
            PDF only · max 10MB · stored in Supabase Storage (`coa-documents`)
          </p>
          {error && <p className="form-error">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          onFile(file)
        }}
      />
    </div>
  )
}
