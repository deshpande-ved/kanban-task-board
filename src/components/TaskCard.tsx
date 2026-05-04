import { Draggable } from '@hello-pangea/dnd'
import type { Label, Task } from '../types/database'

interface Props {
  task: Task
  index: number
  labels: Label[]
  onClick: () => void
}

export function TaskCard({ task, index, labels, onClick }: Props) {
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
            padding: '10px 12px',
            marginBottom: 8,
            background: '#fff',
            border: '1px solid #e5e4e7',
            borderRadius: 6,
            boxShadow: snapshot.isDragging ? '0 6px 16px rgba(0,0,0,0.12)' : 'none',
            cursor: 'pointer',
            ...provided.draggableProps.style,
          }}
        >
          <div style={{ fontWeight: 500, color: '#08060d' }}>{task.title}</div>
          {task.description && (
            <div
              style={{
                fontSize: 13,
                color: '#6b6375',
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
          {labels.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {labels.map((l) => (
                <span
                  key={l.id}
                  style={{
                    fontSize: 11,
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
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
            {task.priority}
            {task.due_date ? ` · due ${task.due_date}` : ''}
          </div>
        </div>
      )}
    </Draggable>
  )
}
