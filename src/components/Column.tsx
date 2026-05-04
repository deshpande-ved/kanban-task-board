import { Droppable } from '@hello-pangea/dnd'
import type { Label, Task, TaskStatus } from '../types/database'
import { TaskCard } from './TaskCard'

interface Props {
  status: TaskStatus
  title: string
  tasks: Task[]
  labelsForTask: (taskId: string) => Label[]
  onTaskClick: (task: Task) => void
}

function statusColor(status: TaskStatus) {
  if (status === 'todo') return '#a1a1aa'
  if (status === 'in_progress') return '#6366f1'
  if (status === 'in_review') return '#eab308'
  return '#22c55e'
}

export function Column({ status, title, tasks, labelsForTask, onTaskClick }: Props) {
  const accent = statusColor(status)

  return (
    <div
      className="board-column"
      style={{
        flex: 1,
        minWidth: 280,
        background: 'var(--surface-2)',
        borderRadius: 10,
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ height: 3, background: accent }} />
      <div style={{ padding: '12px 14px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{ width: 8, height: 8, borderRadius: '50%', background: accent }}
          />
          <span style={{ fontWeight: 600, fontSize: 13 }}>{title}</span>
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              background: 'var(--surface-3)',
              padding: '1px 7px',
              borderRadius: 999,
              fontWeight: 600,
            }}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          position: 'relative',
          padding: '0 10px 10px',
        }}
      >
        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                minHeight: 400,
                background: snapshot.isDraggingOver ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                borderRadius: 6,
                padding: 4,
                transition: 'background 120ms',
              }}
            >
              {tasks.map((t, i) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  index={i}
                  labels={labelsForTask(t.id)}
                  onClick={() => onTaskClick(t)}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        {tasks.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: 32,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          >
            No tasks
          </div>
        )}
      </div>
    </div>
  )
}
