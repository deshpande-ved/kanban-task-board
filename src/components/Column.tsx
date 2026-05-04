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

const STATUS_COLOR: Record<TaskStatus, string> = {
  todo: 'var(--status-todo)',
  in_progress: 'var(--status-in-progress)',
  in_review: 'var(--status-in-review)',
  done: 'var(--status-done)',
}

export function Column({ status, title, tasks, labelsForTask, onTaskClick }: Props) {
  const accent = STATUS_COLOR[status]
  return (
    <div
      className="board-column"
      style={{
        flex: 1,
        minWidth: 280,
        background: 'var(--surface-2)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: 3,
          background: accent,
          opacity: 0.85,
        }}
      />
      <div style={{ padding: '12px 14px 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: accent,
              }}
            />
            <span
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: 'var(--text)',
                letterSpacing: '-0.005em',
              }}
            >
              {title}
            </span>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                background: 'var(--surface-4)',
                padding: '1px 7px',
                borderRadius: 999,
                fontWeight: 600,
              }}
            >
              {tasks.length}
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          padding: '0 10px 10px',
        }}
      >
        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                flex: 1,
                minHeight: 400,
                background: snapshot.isDraggingOver ? 'var(--accent-bg)' : 'transparent',
                borderRadius: 'var(--radius)',
                padding: 4,
                transition: 'background 140ms ease',
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
              color: 'var(--text-faint)',
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
