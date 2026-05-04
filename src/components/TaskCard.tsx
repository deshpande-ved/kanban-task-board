import { Draggable } from '@hello-pangea/dnd'
import { dueColor, dueLabel, dueState } from '../lib/dueDate'
import type { Label, Task } from '../types/database'

interface Props {
  task: Task
  index: number
  labels: Label[]
  onClick: () => void
}

const PRIORITY_BORDER: Record<string, string> = {
  high: 'var(--priority-high)',
  normal: 'var(--priority-normal)',
  low: 'var(--priority-low)',
}

export function TaskCard({ task, index, labels, onClick }: Props) {
  const ds = dueState(task.due_date)
  const dc = dueColor(ds)
  const borderColor = PRIORITY_BORDER[task.priority] ?? PRIORITY_BORDER.normal

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className="task-card"
          style={{
            position: 'relative',
            padding: '12px 14px 12px 16px',
            marginBottom: 8,
            background: 'var(--surface-3)',
            border: '1px solid var(--border)',
            borderLeft: `3px solid ${borderColor}`,
            borderRadius: 'var(--radius)',
            boxShadow: snapshot.isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
            cursor: 'pointer',
            ...provided.draggableProps.style,
          }}
        >
          {labels.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              {labels.map((l) => (
                <span
                  key={l.id}
                  className="chip"
                  style={{
                    background: hexToTransparent(l.color, 0.18),
                    color: l.color,
                    border: `1px solid ${hexToTransparent(l.color, 0.35)}`,
                  }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          )}

          <div
            style={{
              fontWeight: 500,
              color: 'var(--text)',
              fontSize: 14,
              lineHeight: 1.4,
              letterSpacing: '-0.005em',
            }}
          >
            {task.title}
          </div>

          {task.description && (
            <div
              style={{
                fontSize: 12.5,
                color: 'var(--text-muted)',
                marginTop: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.45,
              }}
            >
              {task.description}
            </div>
          )}

          {dc && (
            <div style={{ marginTop: 10 }}>
              <span
                className="chip"
                style={{
                  background: dc.bg,
                  color: dc.fg,
                  border: `1px solid ${dc.border}`,
                  fontWeight: 600,
                }}
              >
                {dueLabel(task.due_date)}
              </span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}

function hexToTransparent(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
