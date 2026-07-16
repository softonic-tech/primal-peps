import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Nav({ announceVisible }) {
  const { cartCount, lifetimePoints, setCartOpen } = useCart()
  const { user, isLoggedIn, openAuth } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav
      id="mainNav"
      className={scrolled ? 'scrolled' : ''}
      style={announceVisible ? undefined : { top: 0 }}
    >
      <div className="wrap nav-inner">
        <Link to="/" className="brand">
          <img src="/logo.png" alt="Primal Peps logo" />
          <span className="brand-name">
            PRIMAL <span>PEPS</span>
          </span>
        </Link>
        <div className="nav-links">
          <a href="/#shop">Shop</a>
          <a href="/#science">Science</a>
          <a href="/#points">Rewards</a>
          <a href="/#story">Story</a>
        </div>
        <div className="nav-cta">
          <Link className="points-pill" id="pointsPill" to="/account">
            ⬢ <span id="pointsVal">{lifetimePoints.toLocaleString()}</span> pts
          </Link>
          {isLoggedIn ? (
            <Link
              className="account-btn"
              to="/account"
              aria-label="Account dashboard"
            >
              <span className="account-avatar">
                {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
              </span>
              <span className="account-label">Account</span>
            </Link>
          ) : (
            <button
              className="account-btn"
              type="button"
              aria-label="Sign in"
              onClick={() => openAuth('login')}
            >
              <span className="account-label">Sign in</span>
            </button>
          )}
          <button
            className="cart-btn"
            id="openCart"
            aria-label="Open cart"
            type="button"
            onClick={() => setCartOpen(true)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M4 5h2l1.4 9.1a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 2-1.6L20 8H7" />
              <circle cx="10" cy="19" r="1.2" />
              <circle cx="17" cy="19" r="1.2" />
            </svg>
            <span>Cart</span>
            <span className="cart-count" id="cartCount">
              {cartCount}
            </span>
          </button>
          <button
            className="menu-btn"
            id="menuBtn"
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="mobileMenu"
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <div
        className={`mobile-menu${menuOpen ? ' open' : ''}`}
        id="mobileMenu"
      >
        <a href="/#shop" onClick={closeMenu}>
          Shop
        </a>
        <a href="/#science" onClick={closeMenu}>
          Science
        </a>
        <a href="/#points" onClick={closeMenu}>
          Rewards
        </a>
        <a href="/#story" onClick={closeMenu}>
          Story
        </a>
        <a href="/#offer" onClick={closeMenu}>
          15% Offer
        </a>
        {isLoggedIn ? (
          <Link to="/account" onClick={closeMenu}>
            Account
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              closeMenu()
              openAuth('login')
            }}
          >
            Sign in
          </button>
        )}
      </div>
    </nav>
  )
}
