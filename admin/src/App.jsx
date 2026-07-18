import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { LoadingBlock } from './components/ui'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import OrderDetail from './pages/OrderDetail'
import Orders from './pages/Orders'
import Overview from './pages/Overview'
import ProductForm from './pages/ProductForm'
import Products from './pages/Products'
import Reviews from './pages/Reviews'
import Settings from './pages/Settings'
import Users from './pages/Users'

function Protected({ children }) {
  const { loading, isAdmin } = useAuth()
  if (loading) {
    return (
      <div className="login-page">
        <LoadingBlock label="Loading session…" />
      </div>
    )
  }
  if (!isAdmin) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Overview />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductForm />} />
        <Route path="users" element={<Users />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
