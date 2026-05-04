import { dueState } from '../lib/dueDate'
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
  const total = tasks.length
  const inProgress = tasks.filter((t) => t.status === 'in_progress' || t.status === 'in_review').length
  const done = tasks.filter((t) => t.status === 'done').length
  const overdue = tasks.filter(
    (t) => t.status !== 'done' && dueState(t.due_date) === 'overdue',
  ).length

  function toggleLabel(id: string) {
    const next = filters.labelIds.includes(id)
      ? filters.labelIds.filter((x) => x !== id)
      : [...filters.labelIds, id]
    onFiltersChange({ ...filters, labelIds: next })
  }

  return (
    <aside className="sidebar">
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: 'linear-gradient(135deg, #5e6ad2 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            K
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            Kanban
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginLeft: 35 }}>
          Personal board
        </div>
      </div>

      <div>
        <div className="sidebar-section-title">Overview</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
          }}
        >
          <Stat label="Total" value={total} />
          <Stat label="In flight" value={inProgress} />
          <Stat label="Done" value={done} accent="var(--success)" />
          <Stat label="Overdue" value={overdue} accent={overdue > 0 ? 'var(--danger)' : undefined} />
        </div>
      </div>

      <div>
        <div className="sidebar-section-title">Priority</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(['all', 'high', 'normal', 'low'] as const).map((p) => {
            const active = filters.priority === p
            const dotColor =
              p === 'high'
                ? 'var(--priority-high)'
                : p === 'normal'
                  ? 'var(--priority-normal)'
                  : p === 'low'
                    ? 'var(--priority-low)'
                    : 'var(--text-subtle)'
            return (
              <button
                key={p}
                type="button"
                onClick={() => onFiltersChange({ ...filters, priority: p })}
                className="filter-pill"
                style={{
                  borderColor: active ? 'var(--accent-border)' : undefined,
                  background: active ? 'var(--accent-bg)' : undefined,
                  color: active ? '#fff' : undefined,
                  textTransform: 'capitalize',
                }}
              >
                {p !== 'all' && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: dotColor,
                    }}
                  />
                )}
                {p === 'all' ? 'All' : p}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <div className="sidebar-section-title" style={{ margin: 0 }}>
            Labels
          </div>
          <button type="button" onClick={onManageLabels} className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: 12 }}>
            Manage
          </button>
        </div>
        {labels.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
            No labels yet. Click <em>Manage</em> to create some.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {labels.map((l) => {
              const active = filters.labelIds.includes(l.id)
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => toggleLabel(l.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid transparent',
                    background: active ? 'var(--accent-bg)' : 'transparent',
                    color: active ? '#fff' : 'var(--text-muted)',
                    fontSize: 13,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 140ms ease, color 140ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = 'var(--surface-3)'
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: l.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.name}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div
      style={{
        background: 'var(--surface-3)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '10px 12px',
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 500, marginBottom: 2 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: accent ?? 'var(--text)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  )
}
