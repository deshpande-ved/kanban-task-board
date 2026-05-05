import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { useState } from 'react'
import { useLabels } from '../hooks/useLabels'
import { useTasks } from '../hooks/useTasks'
import type { Task, TaskPriority, TaskStatus } from '../types/database'
import { Column } from './Column'
import { LabelManager } from './LabelManager'
import { EMPTY_FILTERS, type Filters } from './SearchBar'
import { Sidebar } from './Sidebar'
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

export function Board({ userId }: Props) {
  const {
    tasks,
    grouped,
    loading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useTasks(userId)

  const {
    labels,
    taskLabels,
    loading: labelsLoading,
    createLabel,
    deleteLabel,
    setTaskLabelIds,
    labelsForTask,
  } = useLabels(userId)

  // Modal state — which modal is open, if any
  const [showCreate, setShowCreate] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showLabels, setShowLabels] = useState(false)

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)

  // Filter the grouped tasks based on the current filters
  const filteredGrouped: typeof grouped = {
    todo: filterTasks(grouped.todo),
    in_progress: filterTasks(grouped.in_progress),
    in_review: filterTasks(grouped.in_review),
    done: filterTasks(grouped.done),
  }

  function filterTasks(list: Task[]): Task[] {
    const q = filters.query.trim().toLowerCase()
    return list.filter((task) => {
      if (q) {
        const matchesQuery =
          task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q)
        if (!matchesQuery) return false
      }
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false
      if (filters.labelIds.length > 0) {
        const taskLabelIds = taskLabels
          .filter((tl) => tl.task_id === task.id)
          .map((tl) => tl.label_id)
        for (const id of filters.labelIds) {
          if (!taskLabelIds.includes(id)) return false
        }
      }
      return true
    })
  }

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
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }
    moveTask(
      draggableId,
      source.droppableId as TaskStatus,
      destination.droppableId as TaskStatus,
      destination.index,
    )
  }

  if (tasksLoading || labelsLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <div className="shell">
      <Sidebar
        userId={userId}
        tasks={tasks}
        labels={labels}
        filters={filters}
        onFiltersChange={setFilters}
        onManageLabels={() => setShowLabels(true)}
      />

      <div className="main">
        <div className="main-header">
          <input
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            placeholder="Search tasks..."
            className="input"
            style={{ flex: '1 1 280px', maxWidth: 480 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value as TaskPriority | 'all' })
              }
              className="input"
              style={{ width: 'auto' }}
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
            {filtersActive && (
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="btn btn-secondary"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowCreate(true)}
            >
              + New task
            </button>
          </div>
        </div>

        <div className="main-content">
          {tasksError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 6,
                padding: '10px 14px',
                marginBottom: 12,
                fontSize: 13,
              }}
            >
              {tasksError}
            </div>
          )}

          {filtersActive && (
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginBottom: 12,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '8px 12px',
              }}
            >
              Showing {totalVisible} of {tasks.length} tasks. Drag-and-drop is paused while
              filters are active.
            </div>
          )}

          <DragDropContext onDragEnd={onDragEnd}>
            <div
              className="board-row"
              style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}
            >
              {COLUMNS.map((c) => (
                <Column
                  key={c.status}
                  status={c.status}
                  title={c.title}
                  tasks={filteredGrouped[c.status]}
                  labelsForTask={labelsForTask}
                  onTaskClick={(task) => setEditingTask(task)}
                />
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>

      {showCreate && (
        <TaskModal
          mode="create"
          labels={labels}
          initialLabelIds={[]}
          onClose={() => setShowCreate(false)}
          onSubmit={async (values) => {
            const created = await createTask({
              title: values.title,
              description: values.description,
              priority: values.priority,
              due_date: values.due_date,
              status: values.status,
            })
            if (created && values.labelIds.length > 0) {
              await setTaskLabelIds(created.id, values.labelIds)
            }
          }}
        />
      )}

      {editingTask && (
        <TaskModal
          mode="edit"
          task={editingTask}
          labels={labels}
          initialLabelIds={labelsForTask(editingTask.id).map((l) => l.id)}
          onClose={() => setEditingTask(null)}
          onSubmit={async (values) => {
            await updateTask(editingTask.id, {
              title: values.title,
              description: values.description,
              priority: values.priority,
              due_date: values.due_date,
              status: values.status,
            })
            await setTaskLabelIds(editingTask.id, values.labelIds)
          }}
          onDelete={async () => {
            await deleteTask(editingTask.id)
          }}
        />
      )}

      {showLabels && (
        <LabelManager
          labels={labels}
          onCreate={createLabel}
          onDelete={deleteLabel}
          onClose={() => setShowLabels(false)}
        />
      )}
    </div>
  )
}
