import { useRef, useState } from 'react'
import { productImageUrl, uploadProductImage } from '../lib/storage'

export default function ImageUpload({
  value,
  onChange,
  productId,
  variantKey,
  label = 'Product image',
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const preview = productImageUrl(value)

  const onFile = async (file) => {
    if (!file) return
    setError('')
    setUploading(true)
    const result = await uploadProductImage(file, { productId, variantKey })
    setUploading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    onChange(result.publicUrl)
  }

  return (
    <div className="image-upload">
      <span className="image-upload-label">{label}</span>
      <div className="image-upload-box">
        <div className={`image-upload-preview${preview ? '' : ' empty'}`}>
          {preview ? (
            <img src={preview} alt="" />
          ) : (
            <span>No image</span>
          )}
        </div>
        <div className="image-upload-actions">
          <button
            type="button"
            className="btn-ghost"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Uploading…' : preview ? 'Replace image' : 'Upload image'}
          </button>
          {preview && (
            <button
              type="button"
              className="btn-danger ghost"
              disabled={uploading}
              onClick={() => onChange('')}
            >
              Remove
            </button>
          )}
          <p className="image-upload-hint">
            PNG, JPG or WebP · max 5MB · stored in Supabase Storage
          </p>
          {error && <p className="form-error">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
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
