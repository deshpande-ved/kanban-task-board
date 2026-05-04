import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { NewTask, Task, TaskStatus, TaskUpdate } from '../types/database'

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done']

export type TasksByStatus = Record<TaskStatus, Task[]>

function groupByStatus(tasks: Task[]): TasksByStatus {
  const grouped: TasksByStatus = {
    todo: [],
    in_progress: [],
    in_review: [],
    done: [],
  }
  for (const t of tasks) grouped[t.status].push(t)
  for (const s of STATUSES) grouped[s].sort((a, b) => a.position - b.position)
  return grouped
}

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('position', { ascending: true })
    if (error) setError(error)
    else setTasks(data ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (!userId) return
    load()
  }, [userId, load])

  const grouped = useMemo(() => groupByStatus(tasks), [tasks])

  const createTask = useCallback(
    async (input: Partial<NewTask> & { title: string }) => {
      const status = input.status ?? 'todo'
      const positionsInColumn = tasks.filter((t) => t.status === status).map((t) => t.position)
      const nextPosition = positionsInColumn.length
        ? Math.max(...positionsInColumn) + 1
        : 0
      const payload = {
        title: input.title,
        description: input.description ?? '',
        status,
        priority: input.priority ?? 'normal',
        due_date: input.due_date ?? null,
        position: input.position ?? nextPosition,
      }
      const { data, error } = await supabase.from('tasks').insert(payload).select().single()
      if (error) {
        setError(error)
        return null
      }
      setTasks((prev) => [...prev, data as Task])
      return data as Task
    },
    [tasks],
  )

  const updateTask = useCallback(async (id: string, patch: TaskUpdate) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      setError(error)
      return null
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? (data as Task) : t)))
    return data as Task
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) {
      setError(error)
      return false
    }
    setTasks((prev) => prev.filter((t) => t.id !== id))
    return true
  }, [])

  const moveTask = useCallback(
    async (
      taskId: string,
      sourceStatus: TaskStatus,
      destStatus: TaskStatus,
      destIndex: number,
    ) => {
      const moving = tasks.find((t) => t.id === taskId)
      if (!moving) return

      const sourceCol = tasks
        .filter((t) => t.status === sourceStatus && t.id !== taskId)
        .sort((a, b) => a.position - b.position)
      const destColBase =
        sourceStatus === destStatus
          ? sourceCol
          : tasks.filter((t) => t.status === destStatus).sort((a, b) => a.position - b.position)

      const destCol = [...destColBase]
      destCol.splice(destIndex, 0, { ...moving, status: destStatus })

      const updates: { id: string; status: TaskStatus; position: number }[] = []
      destCol.forEach((t, i) => {
        if (t.position !== i || t.status !== destStatus) {
          updates.push({ id: t.id, status: destStatus, position: i })
        }
      })
      if (sourceStatus !== destStatus) {
        sourceCol.forEach((t, i) => {
          if (t.position !== i) updates.push({ id: t.id, status: sourceStatus, position: i })
        })
      }

      setTasks((prev) =>
        prev.map((t) => {
          const u = updates.find((x) => x.id === t.id)
          return u ? { ...t, status: u.status, position: u.position } : t
        }),
      )

      await Promise.all(
        updates.map((u) =>
          supabase
            .from('tasks')
            .update({ status: u.status, position: u.position })
            .eq('id', u.id),
        ),
      )
    },
    [tasks],
  )

  return {
    tasks,
    grouped,
    loading,
    error,
    reload: load,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  }
}
