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
          fontSize: 14,
        }}
      >
        Signing in…
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
          flexDirection: 'column',
          gap: 8,
          color: 'var(--danger)',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600 }}>Couldn't sign in</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {error?.message ?? 'No user session.'}
        </div>
      </div>
    )
  }

  return <Board userId={user.id} />
}

export default App
