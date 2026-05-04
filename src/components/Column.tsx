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

export function Column({ status, title, tasks, labelsForTask, onTaskClick }: Props) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 240,
        background: '#f4f3ec',
        borderRadius: 8,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8, color: '#08060d' }}>
        {title} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({tasks.length})</span>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              flex: 1,
              minHeight: 400,
              background: snapshot.isDraggingOver ? '#eceadf' : 'transparent',
              borderRadius: 6,
              transition: 'background 120ms',
              padding: 4,
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
            {tasks.length === 0 && (
              <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: 16 }}>
                Drop tasks here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
