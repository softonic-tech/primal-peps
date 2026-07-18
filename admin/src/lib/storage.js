import { supabase } from './supabase'

export const PRODUCT_IMAGE_BUCKET = 'product-images'

/** Resolve a stored img value to a displayable URL. */
export function productImageUrl(img) {
  if (!img) return ''
  if (/^https?:\/\//i.test(img)) return img
  if (img.startsWith('blob:')) return img
  // Supabase storage path
  if (!img.includes('/') || img.startsWith('products/')) {
    // legacy local path — leave as-is for storefront public folder
    if (img.startsWith('products/')) return `/${img}`
  }
  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(img)
  return data?.publicUrl || img
}

function extFromFile(file) {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && fromName.length <= 5) return fromName
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  return map[file.type] || 'jpg'
}

/**
 * Upload a product image to Supabase Storage.
 * Returns { path, publicUrl } on success.
 */
export async function uploadProductImage(file, { productId, variantKey }) {
  if (!file) return { error: 'No file selected' }
  if (!file.type.startsWith('image/')) {
    return { error: 'Please choose an image file (PNG, JPG, WebP)' }
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Image must be under 5MB' }
  }

  const folder = (productId || 'draft').replace(/[^a-z0-9_-]/gi, '-').toLowerCase()
  const key = (variantKey || 'image')
    .replace(/[^a-z0-9_-]/gi, '-')
    .toLowerCase()
  const path = `${folder}/${key}-${Date.now()}.${extFromFile(file)}`

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    })

  if (error) return { error: error.message }

  const { data } = supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(path)

  return { path, publicUrl: data.publicUrl }
}
