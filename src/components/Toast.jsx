import { useCart } from '../context/CartContext'

export default function Toast() {
  const { toastMsg, toastVisible } = useCart()
  return (
    <div className={`toast${toastVisible ? ' show' : ''}`} id="toast">
      {toastMsg}
    </div>
  )
}
