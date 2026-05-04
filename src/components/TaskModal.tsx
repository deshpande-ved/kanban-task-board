import { useEffect, useState } from 'react'
import type { Label, Task, TaskPriority, TaskStatus } from '../types/database'
import { ModalShell, inputStyle, primaryBtn, secondaryBtn } from './LabelManager'

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
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'normal')
  const [dueDate, setDueDate] = useState<string>(task?.due_date ?? '')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'todo')
  const [labelIds, setLabelIds] = useState<string[]>(initialLabelIds)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLabelIds(initialLabelIds)
  }, [initialLabelIds])

  function toggleLabel(id: string) {
    setLabelIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
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
    <ModalShell title={mode === 'create' ? 'New task' : 'Edit task'} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            style={inputStyle}
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </Field>

        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              style={inputStyle}
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
              style={inputStyle}
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
              style={inputStyle}
            />
          </Field>
        </div>

        <Field label="Labels">
          {labels.length === 0 ? (
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              No labels yet — create some from the Labels button.
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
                      border: `1px solid ${active ? l.color : '#e5e4e7'}`,
                      background: active ? l.color : '#fff',
                      color: active ? '#fff' : '#08060d',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: active ? '#fff' : l.color,
                      }}
                    />
                    {l.name}
                  </button>
                )
              })}
            </div>
          )}
        </Field>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
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
                style={{ ...secondaryBtn, color: '#b91c1c', borderColor: '#fca5a5' }}
              >
                Delete
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onClose} style={secondaryBtn}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={primaryBtn}>
              {submitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </ModalShell>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, fontSize: 13, color: '#6b6375' }}>
      {label}
      {children}
    </label>
  )
}
