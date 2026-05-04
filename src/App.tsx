import { Board } from './components/Board'
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, loading, error } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        Signing in...
      </div>
    )
  }

  if (error || !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--danger)',
          padding: 24,
          textAlign: 'center',
        }}
      >
        Could not sign in: {error || 'no user'}
      </div>
    )
  }

  return <Board userId={user.id} />
}

export default App
