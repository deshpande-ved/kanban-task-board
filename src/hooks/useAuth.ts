import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        if (!cancelled) {
          setUser(session.user)
          setLoading(false)
        }
        return
      }

      const { data, error: signInError } = await supabase.auth.signInAnonymously()
      if (cancelled) return

      if (signInError) {
        setError(signInError)
      } else {
        setUser(data.user ?? null)
      }
      setLoading(false)
    }

    init().catch((e) => {
      if (!cancelled) {
        setError(e instanceof Error ? e : new Error(String(e)))
        setLoading(false)
      }
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      cancelled = true
      subscription.subscription.unsubscribe()
    }
  }, [])

  return { user, loading, error }
}
