import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { mapProduct } from '../lib/mapProduct'
import { supabase } from '../lib/supabase'

const ProductsContext = createContext(null)

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    const [{ data: rows, error: pErr }, { data: variants, error: vErr }] =
      await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true }),
        supabase
          .from('product_variants')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true }),
      ])

    if (pErr || vErr) {
      setError(pErr?.message || vErr?.message || 'Failed to load products')
      setProducts([])
      setLoading(false)
      return
    }

    const byProduct = {}
    ;(variants || []).forEach((v) => {
      if (!byProduct[v.product_id]) byProduct[v.product_id] = []
      byProduct[v.product_id].push(v)
    })

    const mapped = (rows || [])
      .map((row) => mapProduct(row, byProduct[row.id] || []))
      .filter((p) => p.variants.length > 0)

    setProducts(mapped)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const getProduct = useCallback(
    (id) => products.find((p) => p.id === id) || null,
    [products],
  )

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      refresh,
      getProduct,
    }),
    [products, loading, error, refresh, getProduct],
  )

  return (
    <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider')
  return ctx
}
