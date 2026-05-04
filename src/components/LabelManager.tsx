import { useState } from 'react'
import type { Label } from '../types/database'
import { Modal } from './Modal'

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
  '#6b7280',
]

interface Props {
  labels: Label[]
  onCreate: (name: string, color: string) => Promise<Label | null>
  onDelete: (id: string) => Promise<void>
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
    <Modal title="Manage labels" onClose={onClose}>
      <form
        onSubmit={handleCreate}
        style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Label name"
            className="input"
          />
          <button type="submit" className="btn btn-primary">
            Add label
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 4 }}>Color</span>
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
                border: color === c ? '2px solid white' : '2px solid transparent',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      </form>

      {labels.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No labels yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {labels.map((l) => (
            <div
              key={l.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                background: 'var(--surface-3)',
                border: '1px solid var(--border)',
                borderRadius: 6,
              }}
            >
              <span
                style={{ width: 14, height: 14, borderRadius: '50%', background: l.color }}
              />
              <span style={{ flex: 1, fontSize: 14 }}>{l.name}</span>
              <button
                type="button"
                onClick={() => onDelete(l.id)}
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: '4px 10px', color: 'var(--danger)' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
