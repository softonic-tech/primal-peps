import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  cartKey,
  defaultVariant,
  findVariant,
  isInStock,
  parseCartKey,
} from '../data/products'
import { useAuth } from './AuthContext'
import { useProducts } from './ProductsContext'
import { useSettings } from './SettingsContext'

const CartContext = createContext(null)
const WELCOME_KEY = 'pp_welcome_offer'
export const REDEEM_POINTS = 500
export const REDEEM_VALUE = 10

function readWelcomeOffer() {
  try {
    const raw = localStorage.getItem(WELCOME_KEY)
    if (!raw) return { seen: false, claimed: false }
    const parsed = JSON.parse(raw)
    return {
      seen: Boolean(parsed?.seen),
      claimed: Boolean(parsed?.claimed),
    }
  } catch {
    return { seen: false, claimed: false }
  }
}

function writeWelcomeOffer(next) {
  try {
    const prev = readWelcomeOffer()
    localStorage.setItem(
      WELCOME_KEY,
      JSON.stringify({ ...prev, ...next }),
    )
  } catch {
    /* ignore quota / private mode */
  }
}

export function CartProvider({ children }) {
  const { user, recordOrder, isLoggedIn, loading: authLoading } = useAuth()
  const { products, getProduct } = useProducts()
  const { promo, points } = useSettings()
  const promoCode = (promo.code || 'PRIMAL15').toUpperCase()
  const promoPercent = Number(promo.percent) || 0
  const ptsPerDollar = Number(points.perDollar) || 0

  const initialWelcome = useMemo(() => readWelcomeOffer(), [])
  const [cart, setCart] = useState({})
  const [promoApplied, setPromoApplied] = useState(initialWelcome.claimed)
  const [signedUp, setSignedUp] = useState(initialWelcome.claimed)
  const [welcomeSeen, setWelcomeSeen] = useState(initialWelcome.seen)
  const [redeemApplied, setRedeemApplied] = useState(false)
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
          const product = getProduct(productId)
          if (!product) return null
          const variant = findVariant(product, variantId)
          if (!variant) return null
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
    [cart, getProduct, products],
  )

  const cartCount = useMemo(
    () => cartItems.reduce((s, i) => s + i.qty, 0),
    [cartItems],
  )

  const sub = useMemo(
    () => cartItems.reduce((s, i) => s + i.price * i.qty, 0),
    [cartItems],
  )

  const disc = promoApplied ? sub * (promoPercent / 100) : 0
  const canRedeem =
    isLoggedIn && (user?.points || 0) >= REDEEM_POINTS && sub > 0
  const redeemDisc = redeemApplied && canRedeem ? REDEEM_VALUE : 0
  const totalVal = Math.max(0, sub - disc - redeemDisc)
  const earnPts = Math.round(totalVal * ptsPerDollar)

  // Drop redeem if user logs out or no longer has enough points
  useEffect(() => {
    if (!canRedeem && redeemApplied) setRedeemApplied(false)
  }, [canRedeem, redeemApplied])

  const setRedeem = useCallback(
    (on) => {
      if (on && !canRedeem) {
        toast(
          isLoggedIn
            ? `Need ${REDEEM_POINTS} points to redeem $${REDEEM_VALUE} off`
            : 'Sign in to redeem Primal Points',
        )
        return
      }
      setRedeemApplied(Boolean(on))
      if (on) {
        toast(`Redeemed ${REDEEM_POINTS} pts — $${REDEEM_VALUE} off ✓`)
      }
    },
    [canRedeem, isLoggedIn, toast],
  )

  const addToCart = useCallback(
    (productId, variantId) => {
      const product = getProduct(productId)
      if (!product) {
        toast('Product unavailable')
        return
      }
      const variant = findVariant(
        product,
        variantId || defaultVariant(product)?.id,
      )
      if (!variant) return
      if (!isInStock(variant)) {
        toast(`${product.name} (${variant.label}) is out of stock`)
        return
      }
      const key = cartKey(productId, variant.id)
      setCart((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }))
      toast(
        `${product.name} (${variant.label}) added — +${variant.price * ptsPerDollar} pts at checkout`,
      )
    },
    [getProduct, ptsPerDollar, toast],
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
      if (code.trim().toUpperCase() === promoCode) {
        setPromoApplied(true)
        toast(`${promoPercent}% welcome discount applied ✓`)
        return true
      }
      if (code.trim()) {
        toast(`That code isn't valid — try ${promoCode}`)
      }
      return false
    },
    [promoCode, promoPercent, toast],
  )

  const dismissWelcome = useCallback(() => {
    setWelcomeSeen(true)
    writeWelcomeOffer({ seen: true })
  }, [])

  const completeSignup = useCallback(
    ({ silent = false } = {}) => {
      setSignedUp(true)
      setPromoApplied(true)
      setWelcomeSeen(true)
      writeWelcomeOffer({ seen: true, claimed: true })
      if (!silent) {
        toast(`Welcome to the troop — ${promoCode} applied ✓`)
      }
    },
    [promoCode, toast],
  )

  // Logged-in members: never show the popup — apply welcome promo quietly
  useEffect(() => {
    if (authLoading || !isLoggedIn) return
    if (promoApplied && welcomeSeen && signedUp) return
    completeSignup({ silent: true })
  }, [
    authLoading,
    completeSignup,
    isLoggedIn,
    promoApplied,
    signedUp,
    welcomeSeen,
  ])

  const placeOrder = useCallback(
    async (shipping = null, extras = {}) => {
      if (authLoading) {
        const err = new Error('Please wait — checking your session')
        toast(err.message)
        throw err
      }
      const shipFee = extras.shipFee || 0
      const redeeming = redeemApplied && canRedeem
      const redeemAmount = redeeming ? REDEEM_VALUE : 0
      const pointsSpent = redeeming ? REDEEM_POINTS : 0
      const merchandise = Math.max(0, sub - disc - redeemAmount)
      const orderTotal = merchandise + shipFee
      const earned = Math.round(orderTotal * ptsPerDollar)
      const order = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        status: 'Awaiting payment',
        paymentMethod: 'bank_transfer',
        items: cartItems.map((i) => ({
          productId: i.id,
          name: i.name,
          variantLabel: i.variantLabel,
          qty: i.qty,
          price: i.price,
          img: i.img,
        })),
        subtotal: sub,
        discount: disc + redeemAmount,
        promoDiscount: disc,
        redeemDiscount: redeemAmount,
        pointsRedeemed: pointsSpent,
        shippingFee: shipFee,
        total: orderTotal,
        pointsEarned: earned,
        shipping: shipping || {},
      }

      try {
        await recordOrder(order)
      } catch (err) {
        toast(err.message || 'Could not place order')
        throw err
      }

      if (!user) {
        setGuestPoints((p) => p + earned)
      }

      setCart({})
      setRedeemApplied(false)
      if (!extras.keepOpen) {
        setCartOpen(false)
        toast(`Order ${order.id} placed — transfer funds to confirm`)
      }
      return order
    },
    [
      authLoading,
      canRedeem,
      cartItems,
      disc,
      ptsPerDollar,
      recordOrder,
      redeemApplied,
      sub,
      toast,
      user,
    ],
  )

  const value = {
    cart,
    cartItems,
    cartCount,
    sub,
    disc,
    redeemDisc,
    redeemApplied,
    canRedeem,
    totalVal,
    earnPts,
    promoApplied,
    promoCode,
    promoPercent,
    ptsPerDollar,
    signedUp,
    welcomeSeen,
    authLoading,
    lifetimePoints,
    cartOpen,
    setCartOpen,
    toastMsg,
    toastVisible,
    toast,
    addToCart,
    updateQty,
    applyPromo,
    setRedeem,
    completeSignup,
    dismissWelcome,
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
