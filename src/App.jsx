import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ProductsProvider } from './context/ProductsContext'
import { SettingsProvider } from './context/SettingsContext'
import AnnounceBar from './components/AnnounceBar'
import ScrollProgress from './components/ScrollProgress'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Spotlight from './components/Spotlight'
import Shop from './components/Shop'
import Science from './components/Science'
import Shipping from './components/Shipping'
import Points from './components/Points'
import Testimonials from './components/Testimonials'
import Faq from './components/Faq'
import Signup from './components/Signup'
import Footer from './components/Footer'
import Checkout from './components/Checkout'
import WelcomeModal from './components/WelcomeModal'
import AuthModal from './components/AuthModal'
import Toast from './components/Toast'
import Dashboard from './components/Dashboard'
import ProductDetail from './components/ProductDetail'
import './styles.css'

function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in')
            io.unobserve(en.target)
          }
        })
      },
      { threshold: 0.12 },
    )

    const hio = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in')
            hio.unobserve(en.target)
          }
        })
      },
      { threshold: 0.5 },
    )

    const observeAll = () => {
      document.querySelectorAll('.rv:not(.in)').forEach((el) => io.observe(el))
      document
        .querySelectorAll('.hairline:not(.in)')
        .forEach((el) => hio.observe(el))
    }

    observeAll()
    const mo = new MutationObserver(observeAll)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      hio.disconnect()
      mo.disconnect()
    }
  }, [])

  return null
}

/** Reset scroll on route change (RR keeps prior page Y by default). */
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      // Wait a frame so the new page has painted
      const t = window.setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          window.scrollTo(0, 0)
        }
      }, 50)
      return () => clearTimeout(t)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function HomePage() {
  const [announceVisible, setAnnounceVisible] = useState(true)

  useEffect(() => {
    document.body.classList.toggle('announce-visible', announceVisible)
    return () => document.body.classList.remove('announce-visible')
  }, [announceVisible])

  return (
    <>
      <RevealObserver />
      <ScrollProgress />
      <AnnounceBar
        visible={announceVisible}
        onClose={() => setAnnounceVisible(false)}
      />
      <Nav announceVisible={announceVisible} />
      <Hero />
      <Marquee />
      <Spotlight />
      <Shop />
      <Science />
      <Shipping />
      <Points />
      <Testimonials />
      <Faq />
      <Signup />
      <Footer />
    </>
  )
}

function AppLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  useEffect(() => {
    if (!isHome) {
      document.body.classList.remove('announce-visible')
      document.body.classList.add('subpage')
    } else {
      document.body.classList.remove('subpage')
    }
    return () => document.body.classList.remove('subpage')
  }, [isHome])

  return (
    <>
      <ScrollToTop />
      {!isHome && <Nav announceVisible={false} />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/account" element={<Dashboard />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Checkout />
      <WelcomeModal />
      <AuthModal />
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <ProductsProvider>
            <CartProvider>
              <AppLayout />
            </CartProvider>
          </ProductsProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
