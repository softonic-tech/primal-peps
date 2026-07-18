/** Map Supabase product + variants rows to storefront product shape. */
export function mapProduct(row, variants = []) {
  if (!row) return null
  const activeVariants = (variants || [])
    .filter((v) => v.active !== false)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((v) => ({
      id: v.variant_key,
      label: v.label,
      price: Number(v.price),
      img: v.img || '',
      stock: Number(v.stock ?? 0),
    }))

  return {
    id: row.id,
    name: row.name,
    aka: row.aka || [],
    sub: row.sub || '',
    tag: row.tag || '',
    cat: row.cat || 'metabolic',
    categoryLabel: row.category_label || '',
    cas: row.cas,
    mw: row.mw || '',
    lot: row.lot || '',
    form: row.form || 'Lyophilised powder',
    purity: row.purity || '99%+',
    storageLyophilised: row.storage_lyophilised || '',
    storageReconstituted: row.storage_reconstituted || '',
    reconstitution: row.reconstitution || '',
    composition: row.composition || [],
    perks: row.perks || [],
    researchFocus: row.research_focus || [],
    description: row.description || '',
    story: row.story || '',
    hue: row.hue || '#e8a020',
    variants: activeVariants,
  }
}

export function mapOrder(row) {
  if (!row) return null
  const items = (row.order_items || row.items || []).map((i) => ({
    productId: i.product_id,
    name: i.name,
    variantLabel: i.variant_label,
    qty: i.qty,
    price: Number(i.price),
    img: i.img || '',
  }))
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    paymentMethod: row.payment_method,
    items,
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shipping_fee),
    discount: Number(row.discount || 0),
    total: Number(row.total),
    pointsEarned: row.points_earned || 0,
    shipping: row.shipping || {},
  }
}

export function mapReview(row) {
  if (!row) return null
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    userName: row.user_name,
    rating: row.rating,
    body: row.body,
    createdAt: row.created_at,
    orderId: row.order_id,
  }
}
