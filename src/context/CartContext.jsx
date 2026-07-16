import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  PRODUCTS,
  PROMO,
  PTS_PER_DOLLAR,
  cartKey,
  defaultVariant,
  findVariant,
  parseCartKey,
} from '../data/products'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user, recordOrder } = useAuth()
  const [cart, setCart] = useState({})
  const [promoApplied, setPromoApplied] = useState(false)
  const [signedUp, setSignedUp] = useState(false)
  const [guestPoints, setGuestPoints] = useState(0)
  const [cartOpen, setCartOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useMemo(() => ({ current: null }), [])

  const lifetimePoints = user ? user.points || 0 : guestPoints

  const toast = useCallback(
    (msg) => {
      setToastMsg(msg)
      setToastVisible(true)
      clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToastVisible(false), 2600)
    },
    [toastTimer],
  )

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([key, qty]) => {
          const { productId, variantId } = parseCartKey(key)
          const product = PRODUCTS.find((p) => p.id === productId)
          if (!product) return null
          const variant = findVariant(product, variantId)
          return {
            ...product,
            key,
            qty,
            variantId: variant.id,
            variantLabel: variant.label,
            price: variant.price,
            img: variant.img,
          }
        })
        .filter(Boolean),
    [cart],
  )

  const cartCount = useMemo(
    () => cartItems.reduce((s, i) => s + i.qty, 0),
    [cartItems],
  )

  const sub = useMemo(
    () => cartItems.reduce((s, i) => s + i.price * i.qty, 0),
    [cartItems],
  )

  const disc = promoApplied ? sub * 0.15 : 0
  const totalVal = sub - disc
  const earnPts = Math.round(totalVal * PTS_PER_DOLLAR)

  const addToCart = useCallback(
    (productId, variantId) => {
      const product = PRODUCTS.find((x) => x.id === productId)
      if (!product) return
      const variant = findVariant(
        product,
        variantId || defaultVariant(product).id,
      )
      const key = cartKey(productId, variant.id)
      setCart((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }))
      toast(
        `${product.name} (${variant.label}) added — +${variant.price * PTS_PER_DOLLAR} pts at checkout`,
      )
    },
    [toast],
  )

  const updateQty = useCallback((key, act) => {
    setCart((prev) => {
      const next = { ...prev }
      if (act === 'inc') next[key] = (next[key] || 0) + 1
      if (act === 'dec') {
        next[key] = (next[key] || 0) - 1
        if (next[key] <= 0) delete next[key]
      }
      if (act === 'rm') delete next[key]
      return next
    })
  }, [])

  const applyPromo = useCallback(
    (code) => {
      if (code.trim().toUpperCase() === PROMO) {
        setPromoApplied(true)
        toast('15% welcome discount applied ✓')
        return true
      }
      if (code.trim()) {
        toast("That code isn't valid — try PRIMAL15")
      }
      return false
    },
    [toast],
  )

  const completeSignup = useCallback(() => {
    if (signedUp) return
    setSignedUp(true)
    setPromoApplied(true)
    toast('Welcome to the troop — PRIMAL15 applied ✓')
  }, [signedUp, toast])

  const placeOrder = useCallback(
    (shipping = null, extras = {}) => {
      const shipFee = extras.shipFee || 0
      const orderTotal = totalVal + shipFee
      const earned = Math.round(orderTotal * PTS_PER_DOLLAR)
      const order = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        status: 'Processing',
        items: cartItems.map((i) => ({
          productId: i.id,
          name: i.name,
          variantLabel: i.variantLabel,
          qty: i.qty,
          price: i.price,
          img: i.img,
        })),
        subtotal: totalVal,
        shippingFee: shipFee,
        total: orderTotal,
        pointsEarned: earned,
        shipping: shipping || {},
      }

      if (user) {
        recordOrder(order)
      } else {
        setGuestPoints((p) => p + earned)
      }

      setCart({})
      setCartOpen(false)
      toast(
        user
          ? `Order ${order.id} placed — +${earned} pts saved to your account`
          : `Order placed 🦍 You earned ${earned} Primal Points`,
      )
      return order
    },
    [cartItems, recordOrder, toast, totalVal, user],
  )

  const value = {
    cart,
    cartItems,
    cartCount,
    sub,
    disc,
    totalVal,
    earnPts,
    promoApplied,
    signedUp,
    lifetimePoints,
    cartOpen,
    setCartOpen,
    toastMsg,
    toastVisible,
    toast,
    addToCart,
    updateQty,
    applyPromo,
    completeSignup,
    placeOrder,
    setPromoApplied,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
