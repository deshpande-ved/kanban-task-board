import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Sign the user in anonymously if they don't have a session yet.
// Each anonymous user gets their own row in auth.users.
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function signIn() {
      const sessionResult = await supabase.auth.getSession()
      const session = sessionResult.data.session

      if (session) {
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

    signIn()
  }, [])

  return { user, loading, error }
}
