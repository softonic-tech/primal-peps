import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { DEFAULT_SETTINGS, mergeSettings } from '../lib/settings'
import { supabase } from '../lib/supabase'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
    setSettings(mergeSettings(data))
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      settings,
      loading,
      refresh,
      bank: settings.bank,
      promo: settings.promo,
      shipping: settings.shipping,
      points: settings.points,
      social: settings.social,
      contact: settings.contact,
      site: settings.site,
    }),
    [settings, loading, refresh],
  )

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
