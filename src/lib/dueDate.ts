export type DueState = 'overdue' | 'today' | 'soon' | 'later' | null

export function dueState(dueDate: string | null): DueState {
  if (!dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff <= 3) return 'soon'
  return 'later'
}

export function dueLabel(dueDate: string | null): string {
  if (!dueDate) return ''
  const state = dueState(dueDate)
  const due = new Date(dueDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (state === 'overdue') return `${Math.abs(diff)}d overdue`
  if (state === 'today') return 'Due today'
  if (state === 'soon') return `Due in ${diff}d`
  return due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function dueColor(state: DueState): { bg: string; fg: string } | null {
  switch (state) {
    case 'overdue':
      return { bg: '#fef2f2', fg: '#dc2626' }
    case 'today':
      return { bg: '#fff7ed', fg: '#c2410c' }
    case 'soon':
      return { bg: '#fefce8', fg: '#a16207' }
    case 'later':
      return { bg: '#f4f4f5', fg: '#52525b' }
    default:
      return null
  }
}
