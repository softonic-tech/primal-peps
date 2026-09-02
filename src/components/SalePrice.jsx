import { SALE_OFF_PERCENT, fmt, listPrice } from '../data/products'

export default function SalePrice({
  price,
  className = 'price',
  showBadge = true,
  id,
}) {
  const current = Number(price) || 0
  const was = listPrice(current)

  return (
    <span className="sale-price" id={id}>
      <span className="sale-was">{fmt(was)}</span>
      <span className={className}>{fmt(current)}</span>
      {showBadge ? <span className="sale-off">{SALE_OFF_PERCENT}% off</span> : null}
    </span>
  )
}
