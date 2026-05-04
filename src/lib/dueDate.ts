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

export function dueColor(
  state: DueState,
): { bg: string; fg: string; border: string } | null {
  switch (state) {
    case 'overdue':
      return {
        bg: 'rgba(239, 68, 68, 0.15)',
        fg: '#fca5a5',
        border: 'rgba(239, 68, 68, 0.35)',
      }
    case 'today':
      return {
        bg: 'rgba(249, 115, 22, 0.15)',
        fg: '#fdba74',
        border: 'rgba(249, 115, 22, 0.35)',
      }
    case 'soon':
      return {
        bg: 'rgba(234, 179, 8, 0.12)',
        fg: '#fde68a',
        border: 'rgba(234, 179, 8, 0.3)',
      }
    case 'later':
      return {
        bg: 'rgba(161, 161, 170, 0.12)',
        fg: '#d4d4d8',
        border: 'rgba(161, 161, 170, 0.25)',
      }
    default:
      return null
  }
}
