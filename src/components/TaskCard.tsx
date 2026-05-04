import { Draggable } from '@hello-pangea/dnd'
import { getDueLabel, getDueState } from '../lib/dueDate'
import type { Label, Task } from '../types/database'

interface Props {
  task: Task
  index: number
  labels: Label[]
  onClick: () => void
}

// Priority shows up as a colored left border on the card
function priorityColor(priority: string) {
  if (priority === 'high') return '#ef4444'
  if (priority === 'low') return '#22c55e'
  return '#eab308'
}

// Style the due-date badge based on how urgent it is
function dueBadgeStyle(dueDate: string | null) {
  const state = getDueState(dueDate)
  if (state === 'overdue') {
    return { background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }
  }
  if (state === 'today') {
    return { background: 'rgba(249, 115, 22, 0.15)', color: '#fdba74' }
  }
  if (state === 'soon') {
    return { background: 'rgba(234, 179, 8, 0.12)', color: '#fde68a' }
  }
  if (state === 'later') {
    return { background: 'rgba(161, 161, 170, 0.12)', color: '#d4d4d8' }
  }
  return null
}

export function TaskCard({ task, index, labels, onClick }: Props) {
  const badgeStyle = dueBadgeStyle(task.due_date)

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
            padding: '12px 14px 12px 16px',
            marginBottom: 8,
            background: 'var(--surface-3)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid ' + priorityColor(task.priority),
            borderRadius: 8,
            cursor: 'pointer',
            boxShadow: snapshot.isDragging ? '0 6px 16px rgba(0, 0, 0, 0.4)' : 'none',
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
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: l.color,
                    color: 'white',
                    fontWeight: 500,
                  }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          )}

          <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)' }}>{task.title}</div>

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
              }}
            >
              {task.description}
            </div>
          )}

          {badgeStyle && (
            <div style={{ marginTop: 10 }}>
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontWeight: 500,
                  ...badgeStyle,
                }}
              >
                {getDueLabel(task.due_date)}
              </span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}
