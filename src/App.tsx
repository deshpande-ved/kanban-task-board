import { Board } from './components/Board'
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, loading, error } = useAuth()

  if (loading) {
    return <div style={{ padding: 24 }}>Signing in…</div>
  }

  if (error || !user) {
    return (
      <div style={{ padding: 24, color: '#b91c1c' }}>
        Auth error: {error?.message ?? 'no user'}
      </div>
    )
  }

  return <Board userId={user.id} />
}

export default App
