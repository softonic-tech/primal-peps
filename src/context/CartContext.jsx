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
import {
  getTikTokRewardEntitlement,
  hasUsedPromoCode,
  ordersShowPromoUsed,
  redeemTikTokReward,
  resolveTikTokPromoCode,
  resolveTikTokPromoPercent,
} from '../lib/promo'
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
  const welcomeCode = (promo.code || 'PRIMAL15').toUpperCase()
  const welcomePercent = Number(promo.percent) || 0
  const tiktokCode = resolveTikTokPromoCode(promo)
  const tiktokSettingsPercent = resolveTikTokPromoPercent(promo)
  const ptsPerDollar = Number(points.perDollar) || 0

  const initialWelcome = useMemo(() => readWelcomeOffer(), [])
  const [cart, setCart] = useState({})
  const [promoApplied, setPromoApplied] = useState(initialWelcome.claimed)
  const [appliedPromoCode, setAppliedPromoCode] = useState(
    initialWelcome.claimed ? welcomeCode : null,
  )
  const [appliedPromoPercent, setAppliedPromoPercent] = useState(
    initialWelcome.claimed ? welcomePercent : 0,
  )
  const [tiktokRewardId, setTiktokRewardId] = useState(null)
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

  const promoCode = promoApplied && appliedPromoCode ? appliedPromoCode : welcomeCode
  const promoPercent =
    promoApplied && appliedPromoPercent > 0
      ? appliedPromoPercent
      : welcomePercent
  const disc = promoApplied ? sub * (promoPercent / 100) : 0
  const canRedeem =
    isLoggedIn && (user?.points || 0) >= REDEEM_POINTS && sub > 0
  const redeemDisc = redeemApplied && canRedeem ? REDEEM_VALUE : 0
  const totalVal = Math.max(0, sub - disc - redeemDisc)
  const earnPts = Math.round(totalVal * ptsPerDollar)

  const clearPromo = useCallback(() => {
    setPromoApplied(false)
    setAppliedPromoCode(null)
    setAppliedPromoPercent(0)
    setTiktokRewardId(null)
  }, [])

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
      if (!trimmed) {
        return {
          ok: false,
          reason: 'empty',
          message: 'Enter a promo code first',
        }
      }

      const checkEmail = String(email || user?.email || '')
        .trim()
        .toLowerCase()

      if (trimmed === tiktokCode) {
        if (!checkEmail || !checkEmail.includes('@')) {
          const message =
            'Enter your email on the Shipping step first, then come back to Payment and apply your TikTok code.'
          toast(message, 'error')
          return { ok: false, reason: 'need_email', message }
        }
        const entitlement = await getTikTokRewardEntitlement({
          email: checkEmail,
          userId: user?.id,
        })
        if (!entitlement) {
          const message = `This email is not approved for the TikTok reward yet. Post your video, tag us, DM the link on WhatsApp — once we approve ${checkEmail}, ${tiktokCode} will unlock ${tiktokSettingsPercent}% off.`
          toast(message, 'error')
          clearPromo()
          return { ok: false, reason: 'not_approved', message }
        }
        const pct = entitlement.percent || tiktokSettingsPercent
        setPromoApplied(true)
        setAppliedPromoCode(tiktokCode)
        setAppliedPromoPercent(pct)
        setTiktokRewardId(entitlement.id)
        writeWelcomeOffer({ claimed: false })
        const message = `${pct}% TikTok reward applied for ${checkEmail} ✓`
        toast(message)
        return { ok: true, reason: 'tiktok', message }
      }

      if (trimmed !== welcomeCode) {
        const message = `That code is not valid — try ${welcomeCode} (welcome) or ${tiktokCode} (TikTok reward)`
        toast(message, 'error')
        return { ok: false, reason: 'invalid', message }
      }

      if (ordersShowPromoUsed(orders, welcomeCode)) {
        const message = 'This welcome code can only be used once per customer'
        toast(message, 'error')
        clearPromo()
        return { ok: false, reason: 'welcome_used', message }
      }

      const used = await hasUsedPromoCode(welcomeCode, {
        email: checkEmail,
        userId: user?.id,
      })
      if (used) {
        const message = 'This welcome code can only be used once per customer'
        toast(message, 'error')
        clearPromo()
        return { ok: false, reason: 'welcome_used', message }
      }

      setPromoApplied(true)
      setAppliedPromoCode(welcomeCode)
      setAppliedPromoPercent(welcomePercent)
      setTiktokRewardId(null)
      writeWelcomeOffer({ claimed: true })
      const message = `${welcomePercent}% welcome discount applied ✓`
      toast(message)
      return { ok: true, reason: 'welcome', message }
    },
    [
      clearPromo,
      orders,
      tiktokCode,
      tiktokSettingsPercent,
      toast,
      user?.email,
      user?.id,
      welcomeCode,
      welcomePercent,
    ],
  )

  const dismissWelcome = useCallback(() => {
    setWelcomeSeen(true)
    writeWelcomeOffer({ seen: true })
  }, [])

  const completeSignup = useCallback(
    async ({ silent = false } = {}) => {
      setSignedUp(true)
      setWelcomeSeen(true)

      if (ordersShowPromoUsed(orders, welcomeCode)) {
        clearPromo()
        writeWelcomeOffer({ seen: true, claimed: false })
        return false
      }

      const used = await hasUsedPromoCode(welcomeCode, {
        email: user?.email,
        userId: user?.id,
      })
      if (used) {
        clearPromo()
        writeWelcomeOffer({ seen: true, claimed: false })
        if (!silent) {
          toast('Welcome code already used on a previous order', 'error')
        }
        return false
      }

      setPromoApplied(true)
      setAppliedPromoCode(welcomeCode)
      setAppliedPromoPercent(welcomePercent)
      setTiktokRewardId(null)
      writeWelcomeOffer({ seen: true, claimed: true })
      if (!silent) {
        toast(`Welcome to the troop — ${welcomeCode} applied ✓`)
      }
      return true
    },
    [
      clearPromo,
      orders,
      toast,
      user?.email,
      user?.id,
      welcomeCode,
      welcomePercent,
    ],
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
      const activeCode = appliedPromoCode || welcomeCode
      const isTikTokPromo =
        Boolean(tiktokRewardId) && activeCode === tiktokCode

      if (promoDiscount > 0) {
        if (isTikTokPromo) {
          const entitlement = await getTikTokRewardEntitlement({
            email: shipEmail,
            userId: user?.id,
          })
          if (!entitlement || entitlement.id !== tiktokRewardId) {
            clearPromo()
            const err = new Error(
              'TikTok reward is no longer available for this email',
            )
            toast(err.message, 'error')
            throw err
          }
        } else {
          if (ordersShowPromoUsed(orders, welcomeCode)) {
            clearPromo()
            const err = new Error(
              'This welcome code can only be used once per customer',
            )
            toast(err.message, 'error')
            throw err
          }
          const used = await hasUsedPromoCode(welcomeCode, {
            email: shipEmail,
            userId: user?.id,
          })
          if (used === true) {
            clearPromo()
            const err = new Error(
              'This welcome code can only be used once per customer',
            )
            toast(err.message, 'error')
            throw err
          }
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
        promoCode: promoDiscount > 0 ? activeCode : null,
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

      if (promoDiscount > 0 && isTikTokPromo && tiktokRewardId) {
        await redeemTikTokReward(tiktokRewardId, shipEmail, order.id)
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
        clearPromo()
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
      appliedPromoCode,
      authLoading,
      canRedeem,
      cartItems,
      clearPromo,
      disc,
      orders,
      promoApplied,
      ptsPerDollar,
      recordOrder,
      redeemApplied,
      sub,
      tiktokCode,
      tiktokRewardId,
      toast,
      user,
      welcomeCode,
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
    tiktokPromoCode: tiktokCode,
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
