import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { useState } from 'react'
import { useLabels } from '../hooks/useLabels'
import { useTasks } from '../hooks/useTasks'
import type { Task, TaskStatus } from '../types/database'
import { Column } from './Column'
import { LabelManager } from './LabelManager'
import { TaskModal } from './TaskModal'

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'todo', title: 'To Do' },
  { status: 'in_progress', title: 'In Progress' },
  { status: 'in_review', title: 'In Review' },
  { status: 'done', title: 'Done' },
]

interface Props {
  userId: string
}

type ModalState =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'edit'; task: Task }
  | { kind: 'labels' }

export function Board({ userId }: Props) {
  const tasksApi = useTasks(userId)
  const labelsApi = useLabels(userId)
  const [modal, setModal] = useState<ModalState>({ kind: 'none' })

  const { grouped, loading: tasksLoading, error: tasksError, createTask, updateTask, deleteTask, moveTask } = tasksApi
  const { labels, loading: labelsLoading, createLabel, deleteLabel, setTaskLabelIds, labelsForTask } = labelsApi

  function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return
    moveTask(
      draggableId,
      source.droppableId as TaskStatus,
      destination.droppableId as TaskStatus,
      destination.index,
    )
  }

  if (tasksLoading || labelsLoading) return <div style={{ padding: 24 }}>Loading…</div>

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, margin: 0, color: '#08060d' }}>Kanban</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setModal({ kind: 'labels' })}
            style={{
              padding: '8px 14px',
              background: '#fff',
              color: '#08060d',
              border: '1px solid #e5e4e7',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Labels
          </button>
          <button
            type="button"
            onClick={() => setModal({ kind: 'create' })}
            style={{
              padding: '8px 14px',
              background: '#aa3bff',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            + New task
          </button>
        </div>
      </div>

      {tasksError && (
        <div style={{ color: '#b91c1c', marginBottom: 12, fontSize: 13 }}>{tasksError.message}</div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
          {COLUMNS.map((c) => (
            <Column
              key={c.status}
              status={c.status}
              title={c.title}
              tasks={grouped[c.status]}
              labelsForTask={labelsForTask}
              onTaskClick={(task) => setModal({ kind: 'edit', task })}
            />
          ))}
        </div>
      </DragDropContext>

      {modal.kind === 'create' && (
        <TaskModal
          mode="create"
          labels={labels}
          initialLabelIds={[]}
          onClose={() => setModal({ kind: 'none' })}
          onSubmit={async (values) => {
            const created = await createTask({
              title: values.title,
              description: values.description,
              priority: values.priority,
              due_date: values.due_date,
              status: values.status,
            })
            if (created && values.labelIds.length) {
              await setTaskLabelIds(created.id, values.labelIds)
            }
          }}
        />
      )}

      {modal.kind === 'edit' && (
        <TaskModal
          mode="edit"
          task={modal.task}
          labels={labels}
          initialLabelIds={labelsForTask(modal.task.id).map((l) => l.id)}
          onClose={() => setModal({ kind: 'none' })}
          onSubmit={async (values) => {
            await updateTask(modal.task.id, {
              title: values.title,
              description: values.description,
              priority: values.priority,
              due_date: values.due_date,
              status: values.status,
            })
            await setTaskLabelIds(modal.task.id, values.labelIds)
          }}
          onDelete={async () => {
            await deleteTask(modal.task.id)
          }}
        />
      )}

      {modal.kind === 'labels' && (
        <LabelManager
          labels={labels}
          onCreate={createLabel}
          onDelete={deleteLabel}
          onClose={() => setModal({ kind: 'none' })}
        />
      )}
    </div>
  )
}
