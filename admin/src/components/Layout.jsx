import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/', label: 'Home', short: 'Home', end: true, icon: HomeIcon },
  { to: '/orders', label: 'Orders', short: 'Orders', icon: OrdersIcon },
  { to: '/products', label: 'Products', short: 'Shop', icon: ProductsIcon },
  { to: '/users', label: 'Users', short: 'Users', icon: UsersIcon },
  { to: '/reviews', label: 'Reviews', short: 'Reviews', icon: ReviewsIcon },
  { to: '/settings', label: 'Settings', short: 'Setup', icon: SettingsIcon },
]

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function OrdersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 7V5.5A1.5 1.5 0 0 1 8.5 4h7A1.5 1.5 0 0 1 17 5.5V7"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect x="4" y="7" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function ProductsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M12 20v-7M4 8.5l8 4.5 8-4.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3.5 19c.9-3 3-4.5 5.5-4.5S13.6 16 14.5 19"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M16 8.5a2.5 2.5 0 1 1 0 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M17 14.5c2 .3 3.5 1.5 4 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ReviewsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5 14.4 9l5.8.5-4.4 3.8 1.4 5.7L12 16.2 6.8 19l1.4-5.7L3.8 9.5 9.6 9 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6.2 6.2l1.6 1.6M16.2 16.2l1.6 1.6M17.8 6.2l-1.6 1.6M7.8 16.2l-1.6 1.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/logo.png" alt="" />
          <div>
            <strong>PRIMAL PEPS</strong>
            <span>Admin</span>
          </div>
        </div>

        <nav className="admin-nav desktop-nav">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <item.icon />
              <span className="lbl-full">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <p>{user?.email}</p>
          <button type="button" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <div className="admin-brand compact">
            <img src="/logo.png" alt="" />
            <strong>Admin</strong>
          </div>
          <button type="button" className="topbar-logout" onClick={logout}>
            Sign out
          </button>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>

      <nav className="admin-bottom-nav" aria-label="Admin sections">
        <div className="admin-bottom-nav-track">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              aria-label={item.label}
              title={item.label}
            >
              <item.icon />
              <span className="lbl-short">{item.short}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
