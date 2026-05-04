// Helpers for working with due dates on tasks

export type DueState = 'overdue' | 'today' | 'soon' | 'later' | null

export function getDueState(dueDate: string | null): DueState {
  if (!dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  const oneDay = 1000 * 60 * 60 * 24
  const diffDays = Math.round((due.getTime() - today.getTime()) / oneDay)

  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'today'
  if (diffDays <= 3) return 'soon'
  return 'later'
}

export function getDueLabel(dueDate: string | null): string {
  if (!dueDate) return ''
  const state = getDueState(dueDate)
  const due = new Date(dueDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const oneDay = 1000 * 60 * 60 * 24
  const diffDays = Math.round((due.getTime() - today.getTime()) / oneDay)

  if (state === 'overdue') return `${Math.abs(diffDays)}d overdue`
  if (state === 'today') return 'Due today'
  if (state === 'soon') return `Due in ${diffDays}d`
  return due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
