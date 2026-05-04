import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { useMemo, useState } from 'react'
import { useLabels } from '../hooks/useLabels'
import { useTasks } from '../hooks/useTasks'
import type { Task, TaskStatus } from '../types/database'
import { Column } from './Column'
import { LabelManager } from './LabelManager'
import { EMPTY_FILTERS, SearchBar, type Filters } from './SearchBar'
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
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)

  const {
    tasks,
    grouped,
    loading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = tasksApi
  const {
    labels,
    taskLabels,
    loading: labelsLoading,
    createLabel,
    deleteLabel,
    setTaskLabelIds,
    labelsForTask,
  } = labelsApi

  const filteredGrouped = useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    const matches = (task: Task) => {
      if (
        q &&
        !task.title.toLowerCase().includes(q) &&
        !task.description.toLowerCase().includes(q)
      ) {
        return false
      }
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false
      if (filters.labelIds.length > 0) {
        const tlIds = new Set(
          taskLabels.filter((tl) => tl.task_id === task.id).map((tl) => tl.label_id),
        )
        if (!filters.labelIds.every((id) => tlIds.has(id))) return false
      }
      return true
    }
    const out: typeof grouped = { todo: [], in_progress: [], in_review: [], done: [] }
    for (const status of Object.keys(grouped) as TaskStatus[]) {
      out[status] = grouped[status].filter(matches)
    }
    return out
  }, [grouped, filters, taskLabels])

  const filtersActive =
    filters.query !== '' || filters.priority !== 'all' || filters.labelIds.length > 0
  const totalVisible =
    filteredGrouped.todo.length +
    filteredGrouped.in_progress.length +
    filteredGrouped.in_review.length +
    filteredGrouped.done.length

  function onDragEnd(result: DropResult) {
    if (filtersActive) return
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

  if (tasksLoading || labelsLoading) {
    return <BoardSkeleton />
  }

  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: 1400, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              margin: 0,
              color: 'var(--text)',
              letterSpacing: '-0.01em',
            }}
          >
            Kanban
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setModal({ kind: 'labels' })}
          >
            Labels
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setModal({ kind: 'create' })}
          >
            + New task
          </button>
        </div>
      </div>

      {tasksError && (
        <div
          style={{
            background: '#fef2f2',
            color: 'var(--danger)',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius)',
            padding: '8px 12px',
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          {tasksError.message}
        </div>
      )}

      <SearchBar filters={filters} labels={labels} onChange={setFilters} />

      {filtersActive && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          Showing {totalVisible} of {tasks.length} tasks · drag-and-drop is paused while filters
          are active
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-row" style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
          {COLUMNS.map((c) => (
            <Column
              key={c.status}
              status={c.status}
              title={c.title}
              tasks={filteredGrouped[c.status]}
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

function BoardSkeleton() {
  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div className="skeleton" style={{ width: 140, height: 26, marginBottom: 24 }} />
      <div style={{ display: 'flex', gap: 12 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              minWidth: 240,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 12,
              minHeight: 400,
            }}
          >
            <div className="skeleton" style={{ width: 80, height: 14, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 60, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 60, marginBottom: 8 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
