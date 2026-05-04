import { getDueState } from '../lib/dueDate'
import type { Label, Task } from '../types/database'
import type { Filters } from './SearchBar'

interface Props {
  tasks: Task[]
  labels: Label[]
  filters: Filters
  onFiltersChange: (next: Filters) => void
  onManageLabels: () => void
}

export function Sidebar({ tasks, labels, filters, onFiltersChange, onManageLabels }: Props) {
  // Stat counts
  const total = tasks.length
  const inReview = tasks.filter(
    (t) => t.status === 'in_progress' || t.status === 'in_review',
  ).length
  const done = tasks.filter((t) => t.status === 'done').length
  const overdue = tasks.filter(
    (t) => t.status !== 'done' && getDueState(t.due_date) === 'overdue',
  ).length

  function toggleLabelFilter(id: string) {
    if (filters.labelIds.includes(id)) {
      onFiltersChange({ ...filters, labelIds: filters.labelIds.filter((x) => x !== id) })
    } else {
      onFiltersChange({ ...filters, labelIds: [...filters.labelIds, id] })
    }
  }

  return (
    <aside className="sidebar">
      <div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Kanban</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          Personal board
        </div>
      </div>

      <div>
        <div className="section-title">Overview</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <Stat label="Total" value={total} />
          <Stat label="In review" value={inReview} />
          <Stat label="Done" value={done} color="#22c55e" />
          <Stat label="Overdue" value={overdue} color={overdue > 0 ? '#ef4444' : undefined} />
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="section-title" style={{ margin: 0 }}>
            Labels
          </div>
          <button
            type="button"
            onClick={onManageLabels}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 12,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Manage
          </button>
        </div>
        {labels.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            No labels yet. Click <em>Manage</em> to create one.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {labels.map((l) => {
              const active = filters.labelIds.includes(l.id)
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => toggleLabelFilter(l.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 8px',
                    border: 'none',
                    borderRadius: 6,
                    background: active ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                    color: active ? 'white' : 'var(--text-muted)',
                    fontSize: 13,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: l.color,
                    }}
                  />
                  {l.name}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div
      style={{
        background: 'var(--surface-3)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 12px',
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: color || 'var(--text)' }}>{value}</div>
    </div>
  )
}
