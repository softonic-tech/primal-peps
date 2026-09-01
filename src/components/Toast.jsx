import { useCart } from '../context/CartContext'

export default function Toast() {
  const { toastMsg, toastKind, toastVisible } = useCart()
  return (
    <div
      className={`toast${toastVisible ? ' show' : ''}${toastKind === 'error' ? ' toast-error' : ''}`}
      id="toast"
      role={toastKind === 'error' ? 'alert' : 'status'}
    >
      {toastMsg}
    </div>
  )
}
