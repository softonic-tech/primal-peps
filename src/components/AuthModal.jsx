import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 3l18 18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M10.6 10.7a2.5 2.5 0 0 0 3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M9.9 5.6A10.5 10.5 0 0 1 12 5.5c5 0 8.8 3.6 10.2 6.5a11.4 11.4 0 0 1-4.1 4.7M6.7 6.7C4.4 8.2 2.8 10.2 1.8 12c1.2 2.4 4.2 6.5 10.2 6.5 1.1 0 2.1-.1 3-.4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  placeholder = '••••••••',
  required = true,
  minLength,
}) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="ship-field auth-pass-field">
      <span>{label}</span>
      <div className="auth-pass-wrap">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
        />
        <button
          type="button"
          className="auth-pass-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          title={visible ? 'Hide password' : 'Show password'}
        >
          <EyeIcon open={visible} />
        </button>
      </div>
    </label>
  )
}

export default function AuthModal() {
  const {
    authOpen,
    authMode,
    setAuthMode,
    closeAuth,
    login,
    signup,
    resetPassword,
  } = useAuth()
  const { toast, completeSignup } = useCart()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [confirmNotice, setConfirmNotice] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!authOpen) return
    setError('')
    setResetSent(false)
    setConfirmNotice(false)
    setPassword('')
    setConfirm('')
    setBusy(false)
  }, [authMode, authOpen])

  if (!authOpen) return null

  const isLogin = authMode === 'login'
  const isSignup = authMode === 'signup'
  const isForgot = authMode === 'forgot'

  const title = isForgot
    ? 'RESET PASSWORD'
    : isLogin
      ? 'WELCOME BACK'
      : 'JOIN THE TROOP'

  const blurb = isForgot
    ? 'Enter your account email and we will send a reset link if an account exists.'
    : isLogin
      ? 'Sign in to sync shipping, points, and order history. Guest checkout still works anytime.'
      : 'Create an account to track points and orders. Shopping without an account is still fine.'

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)

    try {
      if (isForgot) {
        const res = await resetPassword(email)
        if (!res.ok) {
          setError(res.error)
          return
        }
        setResetSent(true)
        toast('Check your email for a reset link')
        return
      }

      if (isLogin) {
        const res = await login(email, password)
        if (!res.ok) {
          setError(res.error)
          return
        }
        toast('Signed in ✓')
        return
      }

      if (password !== confirm) {
        setError('Passwords do not match')
        return
      }
      const res = await signup({ email, password, fullName })
      if (!res.ok) {
        setError(res.error)
        return
      }
      completeSignup()
      if (res.needsConfirmation) {
        setConfirmNotice(true)
        toast('Check your email to confirm your account')
        return
      }
      toast('Account created — welcome to the troop ✓')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="modal-wrap open auth-modal-wrap"
      role="dialog"
      aria-label={title}
    >
      <div className="modal auth-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="x"
          type="button"
          aria-label="Close"
          onClick={closeAuth}
        >
          ✕
        </button>
        <img src="/logo.png" alt="" width={72} height={72} />
        <h3>{title}</h3>
        <p>{blurb}</p>

        <form onSubmit={submit} className="auth-form">
          {isSignup && (
            <label className="ship-field">
              <span>Full name</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
          )}

          <label className="ship-field">
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
            />
          </label>

          {!isForgot && (
            <PasswordField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={6}
            />
          )}

          {isSignup && (
            <PasswordField
              label="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              minLength={6}
            />
          )}

          {isLogin && (
            <div className="auth-row">
              <button
                type="button"
                className="auth-forgot-link"
                onClick={() => {
                  setError('')
                  setAuthMode('forgot')
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}
          {resetSent && isForgot && (
            <p className="auth-success">
              If an account exists for that email, a reset link is on its way.
            </p>
          )}
          {confirmNotice && isSignup && (
            <p className="auth-success">
              Account created. Confirm the link in your email, then sign in.
            </p>
          )}

          <button className="btn-primary" type="submit" disabled={busy}>
            {busy
              ? 'Please wait…'
              : isForgot
                ? 'Send reset link'
                : isLogin
                  ? 'Sign in'
                  : 'Create account'}
          </button>
        </form>

        {isForgot ? (
          <button
            className="skip"
            type="button"
            onClick={() => {
              setError('')
              setAuthMode('login')
            }}
          >
            ← Back to sign in
          </button>
        ) : (
          <button
            className="skip"
            type="button"
            onClick={() => {
              setError('')
              setAuthMode(isLogin ? 'signup' : 'login')
            }}
          >
            {isLogin
              ? 'Need an account? Sign up'
              : 'Already have an account? Sign in'}
          </button>
        )}

        <button className="skip" type="button" onClick={closeAuth}>
          Continue as guest
        </button>
      </div>
      <button
        className="auth-backdrop"
        type="button"
        aria-label="Close"
        onClick={closeAuth}
      />
    </div>
  )
}
