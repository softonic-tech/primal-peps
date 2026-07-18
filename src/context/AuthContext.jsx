import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { mapOrder, mapReview } from '../lib/mapProduct'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

function mapProfile(row, authUser) {
  if (!row && !authUser) return null
  const shipping = row?.shipping || {}
  return {
    id: row?.id || authUser?.id,
    email: row?.email || authUser?.email || '',
    fullName:
      row?.full_name ||
      authUser?.user_metadata?.full_name ||
      (authUser?.email || '').split('@')[0],
    phone: row?.phone || '',
    shipping: {
      line1: shipping.line1 || '',
      line2: shipping.line2 || '',
      suburb: shipping.suburb || '',
      state: shipping.state || '',
      postcode: shipping.postcode || '',
    },
    points: row?.points || 0,
    orders: [],
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [reviews, setReviews] = useState([])
  const [publicReviews, setPublicReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [passwordRecovery, setPasswordRecovery] = useState(false)

  const refreshPublicReviews = useCallback(async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
    setPublicReviews((data || []).map(mapReview))
  }, [])

  const loadUserData = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null)
      setOrders([])
      setReviews([])
      return
    }

    const [{ data: prof }, { data: orderRows }, { data: reviewRows }] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle(),
        supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('reviews')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false }),
      ])

    if (!prof) {
      await supabase.from('profiles').upsert({
        id: authUser.id,
        email: authUser.email,
        full_name:
          authUser.user_metadata?.full_name ||
          authUser.email?.split('@')[0] ||
          '',
      })
      const { data: created } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()
      setProfile(mapProfile(created, authUser))
    } else {
      setProfile(mapProfile(prof, authUser))
    }

    setOrders((orderRows || []).map(mapOrder))
    setReviews((reviewRows || []).map(mapReview))
  }, [])

  useEffect(() => {
    let mounted = true

    refreshPublicReviews()

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setSession(data.session)
      await loadUserData(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, next) => {
        if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true)
        setSession(next)
        await loadUserData(next?.user ?? null)
        setLoading(false)
      },
    )

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [loadUserData, refreshPublicReviews])

  const user = useMemo(() => {
    if (!profile) return null
    return { ...profile, orders }
  }, [profile, orders])

  const openAuth = useCallback((mode = 'login') => {
    setAuthMode(mode)
    setAuthOpen(true)
  }, [])

  const closeAuth = useCallback(() => setAuthOpen(false), [])

  const login = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) {
      const msg = error.message || 'Sign in failed'
      if (/email not confirmed/i.test(msg)) {
        return {
          ok: false,
          error:
            'Confirm your email before signing in — check your inbox (and spam).',
        }
      }
      return { ok: false, error: msg }
    }
    setAuthOpen(false)
    return { ok: true }
  }, [])

  const signup = useCallback(async ({ email, password, fullName }) => {
    const key = email.trim().toLowerCase()
    const name = fullName?.trim() || key.split('@')[0]
    if (!key || !password || password.length < 6) {
      return { ok: false, error: 'Use a valid email and password (6+ chars)' }
    }

    // Preferred path (dev / vite): create confirmed user via service-role API
    // so we skip confirmation emails (and their rate limits).
    try {
      const apiRes = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: key, password, fullName: name }),
      })
      if (apiRes.ok) {
        const { error: loginErr } = await supabase.auth.signInWithPassword({
          email: key,
          password,
        })
        if (loginErr) return { ok: false, error: loginErr.message }
        setAuthOpen(false)
        return { ok: true }
      }
      if (apiRes.status !== 404 && apiRes.status !== 503) {
        const payload = await apiRes.json().catch(() => ({}))
        const msg = payload.error || 'Could not create account'
        if (/already|registered|exists/i.test(msg)) {
          return {
            ok: false,
            error: 'An account with this email already exists. Sign in instead.',
          }
        }
        return { ok: false, error: msg }
      }
    } catch {
      /* fall through to client signUp */
    }

    // Fallback: direct Supabase signUp (needs Confirm email OFF, or inbox confirm)
    const { data, error } = await supabase.auth.signUp({
      email: key,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/account`,
      },
    })
    if (error) return { ok: false, error: error.message }

    if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
      return {
        ok: false,
        error: 'An account with this email already exists. Sign in instead.',
      }
    }

    if (data.session) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: key,
        full_name: name,
      })
      setAuthOpen(false)
      return { ok: true }
    }

    // User created but email confirmation required — try signing in anyway
    // (works if a DB trigger already confirmed them).
    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email: key,
      password,
    })
    if (!loginErr) {
      setAuthOpen(false)
      return { ok: true }
    }

    return {
      ok: true,
      needsConfirmation: true,
      error: null,
    }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setOrders([])
    setReviews([])
  }, [])

  const updateProfile = useCallback(
    async (fields) => {
      if (!session?.user) return { ok: false, error: 'Not signed in' }
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fields.fullName?.trim() ?? profile?.fullName,
          phone: fields.phone?.trim() ?? profile?.phone,
        })
        .eq('id', session.user.id)
      if (error) return { ok: false, error: error.message }
      await loadUserData(session.user)
      return { ok: true }
    },
    [loadUserData, profile, session],
  )

  const updateShipping = useCallback(
    async (shipping) => {
      if (!session?.user) return { ok: false, error: 'Not signed in' }
      const nextShipping = { ...(profile?.shipping || {}), ...shipping }
      const { error } = await supabase
        .from('profiles')
        .update({ shipping: nextShipping })
        .eq('id', session.user.id)
      if (error) return { ok: false, error: error.message }
      await loadUserData(session.user)
      return { ok: true }
    },
    [loadUserData, profile, session],
  )

  const updatePassword = useCallback(
    async (currentPassword, nextPassword) => {
      if (!session?.user?.email) return { ok: false, error: 'Not signed in' }
      if (!nextPassword || nextPassword.length < 6) {
        return { ok: false, error: 'New password must be at least 6 characters' }
      }
      if (!passwordRecovery) {
        const { error: checkErr } = await supabase.auth.signInWithPassword({
          email: session.user.email,
          password: currentPassword,
        })
        if (checkErr) return { ok: false, error: 'Current password is incorrect' }
      }
      const { error } = await supabase.auth.updateUser({ password: nextPassword })
      if (error) return { ok: false, error: error.message }
      setPasswordRecovery(false)
      return { ok: true }
    },
    [passwordRecovery, session],
  )

  const resetPassword = useCallback(async (email) => {
    const key = email.trim().toLowerCase()
    if (!key) return { ok: false, error: 'Enter your account email' }
    const redirectTo = `${window.location.origin}/account`
    const { error } = await supabase.auth.resetPasswordForEmail(key, {
      redirectTo,
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }, [])

  const recordOrder = useCallback(
    async (order) => {
      const shipping = order.shipping || {}
      const payload = {
        id: order.id,
        status: order.status || 'Awaiting payment',
        payment_method: order.paymentMethod || 'bank_transfer',
        customer_email: shipping.email || session?.user?.email || '',
        customer_name: shipping.fullName || profile?.fullName || '',
        customer_phone: shipping.phone || profile?.phone || '',
        shipping,
        subtotal: order.subtotal,
        shipping_fee: order.shippingFee || 0,
        discount: order.discount || 0,
        total: order.total,
        points_earned: order.pointsEarned || 0,
        user_id: session?.user?.id || null,
      }

      const { error: orderErr } = await supabase.from('orders').insert(payload)
      if (orderErr) throw new Error(orderErr.message)

      const lines = (order.items || []).map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        name: i.name,
        variant_label: i.variantLabel,
        qty: i.qty,
        price: i.price,
        img: i.img || '',
      }))
      if (lines.length) {
        const { error: itemsErr } = await supabase
          .from('order_items')
          .insert(lines)
        if (itemsErr) throw new Error(itemsErr.message)
      }

      if (session?.user) {
        const shippingProfile = {
          line1: shipping.line1 || '',
          line2: shipping.line2 || '',
          suburb: shipping.suburb || '',
          state: shipping.state || '',
          postcode: shipping.postcode || '',
        }
        await supabase
          .from('profiles')
          .update({
            points: (profile?.points || 0) + (order.pointsEarned || 0),
            phone: shipping.phone || profile?.phone || '',
            full_name: shipping.fullName || profile?.fullName || '',
            shipping: { ...(profile?.shipping || {}), ...shippingProfile },
          })
          .eq('id', session.user.id)
        await loadUserData(session.user)
      }

      return order
    },
    [loadUserData, profile, session],
  )

  const addReview = useCallback(
    async ({ productId, rating, body, orderId }) => {
      if (!session?.user || !profile) {
        return { ok: false, error: 'Sign in to review' }
      }
      const already = reviews.some((r) => r.productId === productId)
      if (already) {
        return { ok: false, error: 'You already reviewed this product' }
      }
      const purchased = orders.some((o) =>
        o.items.some((i) => i.productId === productId),
      )
      if (!purchased) {
        return { ok: false, error: 'Purchase this product before reviewing' }
      }
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: session.user.id,
          user_name: profile.fullName || profile.email,
          rating: Math.min(5, Math.max(1, Number(rating) || 5)),
          body: body.trim(),
          order_id: orderId || null,
        })
        .select('*')
        .single()
      if (error) return { ok: false, error: error.message }
      const review = mapReview(data)
      setReviews((prev) => [review, ...prev])
      setPublicReviews((prev) => [review, ...prev])
      return { ok: true, review }
    },
    [orders, profile, reviews, session],
  )

  const getProductReviews = useCallback(
    (productId) =>
      publicReviews.filter((r) => r.productId === productId),
    [publicReviews],
  )

  const canReviewProduct = useCallback(
    (productId) => {
      if (!user) return false
      const purchased = orders.some((o) =>
        o.items.some((i) => i.productId === productId),
      )
      if (!purchased) return false
      return !reviews.some((r) => r.productId === productId)
    },
    [orders, reviews, user],
  )

  const reviewableProducts = useMemo(() => {
    if (!user) return []
    const bought = new Set()
    orders.forEach((o) => o.items.forEach((i) => bought.add(i.productId)))
    return [...bought].filter((id) => canReviewProduct(id))
  }, [canReviewProduct, orders, user])

  const value = {
    user,
    session,
    loading,
    isLoggedIn: Boolean(session?.user && profile),
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
    passwordRecovery,
    clearPasswordRecovery: () => setPasswordRecovery(false),
    refreshUser: () => loadUserData(session?.user ?? null),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
