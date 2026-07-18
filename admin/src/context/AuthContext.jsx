import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const checkAdmin = useCallback(async (user) => {
    if (!user) {
      setIsAdmin(false)
      return false
    }
    const { data, error: qErr } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', user.email)
      .maybeSingle()

    if (qErr) {
      console.error(qErr)
      setIsAdmin(false)
      return false
    }

    const ok = Boolean(data)
    setIsAdmin(ok)
    return ok
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setSession(data.session)
      await checkAdmin(data.session?.user)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, next) => {
        setSession(next)
        await checkAdmin(next?.user)
        setLoading(false)
      },
    )

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [checkAdmin])

  const login = useCallback(async (email, password) => {
    setError('')
    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (authErr) {
      setError(authErr.message)
      return { ok: false, error: authErr.message }
    }
    const adminOk = await checkAdmin(data.user)
    if (!adminOk) {
      await supabase.auth.signOut()
      const msg = 'This account is not authorised for admin access.'
      setError(msg)
      return { ok: false, error: msg }
    }
    return { ok: true }
  }, [checkAdmin])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAdmin,
      loading,
      error,
      login,
      logout,
      setError,
    }),
    [session, isAdmin, loading, error, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
