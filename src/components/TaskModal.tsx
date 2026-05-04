import { useState } from 'react'
import type { Label, Task, TaskPriority, TaskStatus } from '../types/database'
import { Modal } from './Modal'

interface Props {
  mode: 'create' | 'edit'
  task?: Task
  labels: Label[]
  initialLabelIds: string[]
  onClose: () => void
  onSubmit: (values: {
    title: string
    description: string
    priority: TaskPriority
    due_date: string | null
    status: TaskStatus
    labelIds: string[]
  }) => Promise<void>
  onDelete?: () => Promise<void>
}

export function TaskModal({
  mode,
  task,
  labels,
  initialLabelIds,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'normal')
  const [dueDate, setDueDate] = useState(task?.due_date || '')
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'todo')
  const [labelIds, setLabelIds] = useState<string[]>(initialLabelIds)
  const [submitting, setSubmitting] = useState(false)

  function toggleLabel(id: string) {
    if (labelIds.includes(id)) {
      setLabelIds(labelIds.filter((x) => x !== id))
    } else {
      setLabelIds([...labelIds, id])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    await onSubmit({
      title: title.trim(),
      description,
      priority,
      due_date: dueDate || null,
      status,
      labelIds,
    })
    setSubmitting(false)
    onClose()
  }

  return (
    <Modal title={mode === 'create' ? 'New task' : 'Edit task'} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            className="input"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input"
            style={{ resize: 'vertical' }}
          />
        </Field>

        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="input"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
          </Field>
          <Field label="Priority">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="input"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </Field>
          <Field label="Due date">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Labels">
          {labels.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              No labels yet. Use the sidebar to create some.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {labels.map((l) => {
                const active = labelIds.includes(l.id)
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => toggleLabel(l.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      borderRadius: 999,
                      border: '1px solid ' + (active ? l.color : 'var(--border)'),
                      background: active ? l.color : 'var(--surface-3)',
                      color: active ? 'white' : 'var(--text)',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: active ? 'white' : l.color,
                      }}
                    />
                    {l.name}
                  </button>
                )
              })}
            </div>
          )}
        </Field>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 8,
          }}
        >
          <div>
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Delete this task?')) {
                    await onDelete()
                    onClose()
                  }
                }}
                className="btn btn-secondary"
                style={{ color: 'var(--danger)' }}
              >
                Delete
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        flex: 1,
        fontSize: 13,
        color: 'var(--text-muted)',
      }}
    >
      {label}
      {children}
    </label>
  )
}
