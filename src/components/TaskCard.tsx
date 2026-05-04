import { Draggable } from '@hello-pangea/dnd'
import { dueColor, dueLabel, dueState } from '../lib/dueDate'
import type { Label, Task } from '../types/database'

interface Props {
  task: Task
  index: number
  labels: Label[]
  onClick: () => void
}

const PRIORITY_COLOR: Record<string, string> = {
  high: 'var(--priority-high)',
  normal: 'var(--priority-normal)',
  low: 'var(--priority-low)',
}

export function TaskCard({ task, index, labels, onClick }: Props) {
  const ds = dueState(task.due_date)
  const dc = dueColor(ds)

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
            padding: '12px 14px',
            marginBottom: 8,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
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
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: l.color,
                    color: '#fff',
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
            }}
          >
            {task.title}
          </div>

          {task.description && (
            <div
              style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                marginTop: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {task.description}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 10,
              flexWrap: 'wrap',
            }}
          >
            <span
              title={`Priority: ${task.priority}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                color: 'var(--text-muted)',
                textTransform: 'capitalize',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: PRIORITY_COLOR[task.priority] ?? PRIORITY_COLOR.normal,
                }}
              />
              {task.priority}
            </span>

            {dc && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: dc.bg,
                  color: dc.fg,
                }}
              >
                {dueLabel(task.due_date)}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
