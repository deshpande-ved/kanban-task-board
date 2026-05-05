import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Sign the user in anonymously if they don't already have a session.
// Each anonymous user is a real row in auth.users.
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Keep our user state in sync with whatever Supabase thinks.
    // This fires on sign-in, sign-out, and token refresh.
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    async function init() {
      const sessionResult = await supabase.auth.getSession()
      const session = sessionResult.data.session

      if (session && session.user) {
        setUser(session.user)
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) {
        setError(error.message)
      } else {
        setUser(data.user)
      }
      setLoading(false)
    }

    init()

    return () => {
      sub.data.subscription.unsubscribe()
    }
  }, [])

  return { user, loading, error }
}
