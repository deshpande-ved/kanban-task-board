import type { TaskPriority } from '../types/database'

export interface Filters {
  query: string
  priority: TaskPriority | 'all'
  labelIds: string[]
}

export const EMPTY_FILTERS: Filters = { query: '', priority: 'all', labelIds: [] }
