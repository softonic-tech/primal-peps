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
import { bundleUnitPrice } from '../lib/bundlePricing'
import { hasUsedPromoCode, ordersShowPromoUsed } from '../lib/promo'
import { supabase } from '../lib/supabase'
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
  const {
    user,
    recordOrder,
    isLoggedIn,
    loading: authLoading,
    orders,
  } = useAuth()
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
  const [toastKind, setToastKind] = useState('info')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useMemo(() => ({ current: null }), [])

  const lifetimePoints = user ? user.points || 0 : guestPoints

  const toast = useCallback(
    (msg, kind = 'info') => {
      setToastMsg(msg)
      setToastKind(kind === 'error' ? 'error' : 'info')
      setToastVisible(true)
      clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(
        () => setToastVisible(false),
        kind === 'error' ? 4200 : 2600,
      )
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
          const basePrice = Number(variant.price) || 0
          return {
            ...product,
            key,
            qty,
            variantId: variant.id,
            variantLabel: variant.label,
            basePrice,
            price: bundleUnitPrice(basePrice, qty),
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
    (productId, variantId, qty = 1) => {
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
      const addQty = Math.max(1, Math.floor(Number(qty) || 1))
      const key = cartKey(productId, variant.id)
      setCart((prev) => {
        const nextQty = (prev[key] || 0) + addQty
        return { ...prev, [key]: nextQty }
      })
      const unit = bundleUnitPrice(variant.price, addQty)
      toast(
        `${product.name} (${variant.label}) ×${addQty} added — +${Math.round(unit * addQty * ptsPerDollar)} pts at checkout`,
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
    async (code, { email } = {}) => {
      const trimmed = String(code || '')
        .trim()
        .toUpperCase()
      if (trimmed !== promoCode) {
        if (String(code || '').trim()) {
          toast(`That code isn't valid — try ${promoCode}`)
        }
        return false
      }

      if (ordersShowPromoUsed(orders, promoCode)) {
        toast('This welcome code can only be used once per customer', 'error')
        setPromoApplied(false)
        return false
      }

      const checkEmail = email || user?.email || ''
      const used = await hasUsedPromoCode(promoCode, {
        email: checkEmail,
        userId: user?.id,
      })
      if (used) {
        toast('This welcome code can only be used once per customer', 'error')
        setPromoApplied(false)
        return false
      }

      setPromoApplied(true)
      writeWelcomeOffer({ claimed: true })
      toast(`${promoPercent}% welcome discount applied ✓`)
      return true
    },
    [orders, promoCode, promoPercent, toast, user?.email, user?.id],
  )

  const dismissWelcome = useCallback(() => {
    setWelcomeSeen(true)
    writeWelcomeOffer({ seen: true })
  }, [])

  const completeSignup = useCallback(
    async ({ silent = false } = {}) => {
      setSignedUp(true)
      setWelcomeSeen(true)

      if (ordersShowPromoUsed(orders, promoCode)) {
        setPromoApplied(false)
        writeWelcomeOffer({ seen: true, claimed: false })
        return false
      }

      const used = await hasUsedPromoCode(promoCode, {
        email: user?.email,
        userId: user?.id,
      })
      if (used) {
        setPromoApplied(false)
        writeWelcomeOffer({ seen: true, claimed: false })
        if (!silent) {
          toast('Welcome code already used on a previous order', 'error')
        }
        return false
      }

      setPromoApplied(true)
      writeWelcomeOffer({ seen: true, claimed: true })
      if (!silent) {
        toast(`Welcome to the troop — ${promoCode} applied ✓`)
      }
      return true
    },
    [orders, promoCode, toast, user?.email, user?.id],
  )

  // Logged-in members: never show the popup — apply welcome promo quietly if unused
  useEffect(() => {
    if (authLoading || !isLoggedIn) return
    if (welcomeSeen && signedUp) return
    let cancelled = false
    ;(async () => {
      await completeSignup({ silent: true })
      if (cancelled) return
    })()
    return () => {
      cancelled = true
    }
  }, [authLoading, completeSignup, isLoggedIn, signedUp, welcomeSeen])

  const placeOrder = useCallback(
    async (shipping = null, extras = {}) => {
      if (authLoading) {
        const err = new Error('Please wait — checking your session')
        toast(err.message)
        throw err
      }

      let promoDiscount = promoApplied ? disc : 0
      const shipEmail = shipping?.email || user?.email || ''
      if (promoDiscount > 0) {
        if (ordersShowPromoUsed(orders, promoCode)) {
          setPromoApplied(false)
          const err = new Error(
            'This welcome code can only be used once per customer',
          )
          toast(err.message, 'error')
          throw err
        }
        const used = await hasUsedPromoCode(promoCode, {
          email: shipEmail,
          userId: user?.id,
        })
        if (used === true) {
          setPromoApplied(false)
          const err = new Error(
            'This welcome code can only be used once per customer',
          )
          toast(err.message, 'error')
          throw err
        }
      } else {
        promoDiscount = 0
      }

      const shipFee = extras.shipFee || 0
      const redeeming = redeemApplied && canRedeem
      const redeemAmount = redeeming ? REDEEM_VALUE : 0
      const pointsSpent = redeeming ? REDEEM_POINTS : 0
      const merchandise = Math.max(0, sub - promoDiscount - redeemAmount)
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
        discount: promoDiscount + redeemAmount,
        promoDiscount,
        promoCode: promoDiscount > 0 ? promoCode : null,
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

      try {
        await supabase.functions.invoke('order-email', {
          body: { orderId: order.id },
        })
      } catch {
        /* order is saved even if the confirmation email fails */
      }

      if (!user) {
        setGuestPoints((p) => p + earned)
      }

      setCart({})
      setRedeemApplied(false)
      if (promoDiscount > 0) {
        setPromoApplied(false)
        writeWelcomeOffer({ claimed: false, seen: true })
      }
      if (!extras.keepOpen) {
        setCartOpen(false)
        toast(
          `Order ${order.id} placed — transfer funds to confirm. Check spam for emails.`,
        )
      }
      return order
    },
    [
      authLoading,
      canRedeem,
      cartItems,
      disc,
      orders,
      promoApplied,
      promoCode,
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
    toastKind,
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
