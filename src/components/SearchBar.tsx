import type { Label, TaskPriority } from '../types/database'

export interface Filters {
  query: string
  priority: TaskPriority | 'all'
  labelIds: string[]
}

export const EMPTY_FILTERS: Filters = { query: '', priority: 'all', labelIds: [] }

interface Props {
  filters: Filters
  labels: Label[]
  onChange: (next: Filters) => void
}

export function SearchBar({ filters, labels, onChange }: Props) {
  function toggleLabel(id: string) {
    const next = filters.labelIds.includes(id)
      ? filters.labelIds.filter((x) => x !== id)
      : [...filters.labelIds, id]
    onChange({ ...filters, labelIds: next })
  }

  const hasFilters =
    filters.query !== '' || filters.priority !== 'all' || filters.labelIds.length > 0

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
        marginBottom: 16,
        padding: 10,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
    >
      <input
        value={filters.query}
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
        placeholder="Search tasks…"
        className="input"
        style={{ flex: '1 1 220px', minWidth: 200 }}
      />

      <select
        value={filters.priority}
        onChange={(e) =>
          onChange({ ...filters, priority: e.target.value as TaskPriority | 'all' })
        }
        className="input"
        style={{ width: 'auto' }}
      >
        <option value="all">All priorities</option>
        <option value="high">High</option>
        <option value="normal">Normal</option>
        <option value="low">Low</option>
      </select>

      {labels.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {labels.map((l) => {
            const active = filters.labelIds.includes(l.id)
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => toggleLabel(l.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 999,
                  border: `1px solid ${active ? l.color : 'var(--border)'}`,
                  background: active ? l.color : 'var(--surface)',
                  color: active ? '#fff' : 'var(--text)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 120ms, border-color 120ms',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: active ? '#fff' : l.color,
                  }}
                />
                {l.name}
              </button>
            )
          })}
        </div>
      )}

      {hasFilters && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: 13 }}
        >
          Clear
        </button>
      )}
    </div>
  )
}
