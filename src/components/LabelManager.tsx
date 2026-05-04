import { useState } from 'react'
import type { Label } from '../types/database'

const PRESET_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#6b7280']

interface Props {
  labels: Label[]
  onCreate: (name: string, color: string) => Promise<Label | null>
  onDelete: (id: string) => Promise<boolean>
  onClose: () => void
}

export function LabelManager({ labels, onCreate, onDelete, onClose }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await onCreate(name.trim(), color)
    setName('')
  }

  return (
    <ModalShell title="Manage labels" onClose={onClose}>
      <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Label name…"
            style={inputStyle}
          />
          <button type="submit" style={primaryBtn}>Add label</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#6b6375', marginRight: 4 }}>Color:</span>
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: c,
                border: color === c ? '2px solid #08060d' : '2px solid transparent',
                cursor: 'pointer',
                padding: 0,
              }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </form>

      {labels.length === 0 ? (
        <div style={{ color: '#9ca3af', fontSize: 13 }}>No labels yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {labels.map((l) => (
            <li
              key={l.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 8px',
                border: '1px solid #e5e4e7',
                borderRadius: 6,
              }}
            >
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: l.color }} />
              <span style={{ flex: 1, fontSize: 14 }}>{l.name}</span>
              <button
                type="button"
                onClick={() => onDelete(l.id)}
                style={{ ...secondaryBtn, fontSize: 12, padding: '4px 8px' }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </ModalShell>
  )
}

export function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: 520,
          padding: 22,
          boxShadow: 'var(--shadow-lg)',
          margin: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{title}</h2>
          <button type="button" onClick={onClose} style={{ ...secondaryBtn, padding: '4px 10px' }}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 12px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  fontSize: 14,
  background: 'var(--surface)',
  color: 'var(--text)',
}

const primaryBtn: React.CSSProperties = {
  padding: '8px 16px',
  background: 'var(--accent)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius)',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
}

const secondaryBtn: React.CSSProperties = {
  padding: '6px 12px',
  background: 'var(--surface)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
}

export { inputStyle, primaryBtn, secondaryBtn }
