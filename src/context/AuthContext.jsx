import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { DEMO_EMAIL, DEMO_PASS, loadStore, saveStore } from '../lib/storage'

const AuthContext = createContext(null)

function publicUser(record) {
  if (!record) return null
  const { password: _pw, ...rest } = record
  return rest
}

export function AuthProvider({ children }) {
  const [store, setStore] = useState(() => loadStore())
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const persist = useCallback((next) => {
    setStore(next)
    saveStore(next)
  }, [])

  const user = useMemo(() => {
    if (!store.sessionEmail) return null
    return publicUser(store.users[store.sessionEmail] || null)
  }, [store])

  const openAuth = useCallback((mode = 'login') => {
    setAuthMode(mode)
    setAuthOpen(true)
  }, [])

  const closeAuth = useCallback(() => setAuthOpen(false), [])

  const login = useCallback(
    (email, password) => {
      const key = email.trim().toLowerCase()
      const record = store.users[key]
      if (!record || record.password !== password) {
        return { ok: false, error: 'Invalid email or password' }
      }
      persist({ ...store, sessionEmail: key })
      setAuthOpen(false)
      return { ok: true }
    },
    [persist, store],
  )

  const signup = useCallback(
    ({ email, password, fullName }) => {
      const key = email.trim().toLowerCase()
      if (!key || !password || password.length < 6) {
        return { ok: false, error: 'Use a valid email and password (6+ chars)' }
      }
      if (store.users[key]) {
        return { ok: false, error: 'An account with this email already exists' }
      }
      const record = {
        id: `usr_${Date.now()}`,
        email: key,
        password,
        fullName: fullName.trim() || key.split('@')[0],
        phone: '',
        shipping: {
          line1: '',
          line2: '',
          suburb: '',
          state: '',
          postcode: '',
        },
        points: 0,
        orders: [],
        createdAt: new Date().toISOString(),
      }
      persist({
        ...store,
        users: { ...store.users, [key]: record },
        sessionEmail: key,
      })
      setAuthOpen(false)
      return { ok: true }
    },
    [persist, store],
  )

  const logout = useCallback(() => {
    persist({ ...store, sessionEmail: null })
  }, [persist, store])

  const updateProfile = useCallback(
    (fields) => {
      if (!store.sessionEmail) return { ok: false, error: 'Not signed in' }
      const key = store.sessionEmail
      const current = store.users[key]
      const nextUser = {
        ...current,
        fullName: fields.fullName?.trim() ?? current.fullName,
        phone: fields.phone?.trim() ?? current.phone,
      }
      persist({
        ...store,
        users: { ...store.users, [key]: nextUser },
      })
      return { ok: true }
    },
    [persist, store],
  )

  const updateShipping = useCallback(
    (shipping) => {
      if (!store.sessionEmail) return { ok: false, error: 'Not signed in' }
      const key = store.sessionEmail
      const current = store.users[key]
      persist({
        ...store,
        users: {
          ...store.users,
          [key]: { ...current, shipping: { ...current.shipping, ...shipping } },
        },
      })
      return { ok: true }
    },
    [persist, store],
  )

  const updatePassword = useCallback(
    (currentPassword, nextPassword) => {
      if (!store.sessionEmail) return { ok: false, error: 'Not signed in' }
      const key = store.sessionEmail
      const current = store.users[key]
      if (current.password !== currentPassword) {
        return { ok: false, error: 'Current password is incorrect' }
      }
      if (!nextPassword || nextPassword.length < 6) {
        return { ok: false, error: 'New password must be at least 6 characters' }
      }
      persist({
        ...store,
        users: {
          ...store.users,
          [key]: { ...current, password: nextPassword },
        },
      })
      return { ok: true }
    },
    [persist, store],
  )

  const resetPassword = useCallback(
    (email, nextPassword) => {
      const key = email.trim().toLowerCase()
      const current = store.users[key]
      if (!current) {
        return { ok: false, error: 'No account found for that email' }
      }
      if (!nextPassword || nextPassword.length < 6) {
        return { ok: false, error: 'New password must be at least 6 characters' }
      }
      persist({
        ...store,
        users: {
          ...store.users,
          [key]: { ...current, password: nextPassword },
        },
      })
      return { ok: true }
    },
    [persist, store],
  )

  const recordOrder = useCallback(
    (order) => {
      if (!store.sessionEmail) return null
      const key = store.sessionEmail
      const current = store.users[key]
      const shippingProfile = {
        line1: order.shipping.line1 || '',
        line2: order.shipping.line2 || '',
        suburb: order.shipping.suburb || '',
        state: order.shipping.state || '',
        postcode: order.shipping.postcode || '',
      }
      const nextUser = {
        ...current,
        points: (current.points || 0) + (order.pointsEarned || 0),
        phone: order.shipping.phone || current.phone,
        fullName: order.shipping.fullName || current.fullName,
        shipping: { ...current.shipping, ...shippingProfile },
        orders: [order, ...(current.orders || [])],
      }
      persist({
        ...store,
        users: { ...store.users, [key]: nextUser },
      })
      return order
    },
    [persist, store],
  )

  const addReview = useCallback(
    ({ productId, rating, body, orderId }) => {
      if (!store.sessionEmail) return { ok: false, error: 'Sign in to review' }
      const key = store.sessionEmail
      const current = store.users[key]
      const already = (store.reviews || []).some(
        (r) => r.productId === productId && r.userId === current.id,
      )
      if (already) {
        return { ok: false, error: 'You already reviewed this product' }
      }
      const purchased = (current.orders || []).some((o) =>
        o.items.some((i) => i.productId === productId),
      )
      if (!purchased) {
        return { ok: false, error: 'Purchase this product before reviewing' }
      }
      const review = {
        id: `rev_${Date.now()}`,
        productId,
        userId: current.id,
        userName: current.fullName || current.email,
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        body: body.trim(),
        createdAt: new Date().toISOString(),
        orderId: orderId || null,
      }
      persist({
        ...store,
        reviews: [review, ...(store.reviews || [])],
      })
      return { ok: true, review }
    },
    [persist, store],
  )

  const getProductReviews = useCallback(
    (productId) =>
      (store.reviews || []).filter((r) => r.productId === productId),
    [store.reviews],
  )

  const canReviewProduct = useCallback(
    (productId) => {
      if (!user) return false
      const purchased = (user.orders || []).some((o) =>
        o.items.some((i) => i.productId === productId),
      )
      if (!purchased) return false
      return !(store.reviews || []).some(
        (r) => r.productId === productId && r.userId === user.id,
      )
    },
    [store.reviews, user],
  )

  const reviewableProducts = useMemo(() => {
    if (!user) return []
    const bought = new Set()
    ;(user.orders || []).forEach((o) =>
      o.items.forEach((i) => bought.add(i.productId)),
    )
    return [...bought].filter((id) => canReviewProduct(id))
  }, [canReviewProduct, user])

  const value = {
    user,
    isLoggedIn: Boolean(user),
    authOpen,
    authMode,
    setAuthMode,
    openAuth,
    closeAuth,
    login,
    signup,
    logout,
    updateProfile,
    updateShipping,
    updatePassword,
    resetPassword,
    recordOrder,
    addReview,
    getProductReviews,
    canReviewProduct,
    reviewableProducts,
    demoHint: { email: DEMO_EMAIL, password: DEMO_PASS },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
