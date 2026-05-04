import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Label, TaskLabel } from '../types/database'

export function useLabels(userId: string | undefined) {
  const [labels, setLabels] = useState<Label[]>([])
  const [taskLabels, setTaskLabels] = useState<TaskLabel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const [{ data: ls, error: e1 }, { data: tls, error: e2 }] = await Promise.all([
      supabase.from('labels').select('*').order('created_at', { ascending: true }),
      supabase.from('task_labels').select('*'),
    ])
    if (e1) setError(e1)
    else setLabels(ls ?? [])
    if (e2) setError(e2)
    else setTaskLabels(tls ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (!userId) return
    load()
  }, [userId, load])

  const createLabel = useCallback(async (name: string, color: string) => {
    const { data, error } = await supabase
      .from('labels')
      .insert({ name, color })
      .select()
      .single()
    if (error) {
      setError(error)
      return null
    }
    setLabels((prev) => [...prev, data as Label])
    return data as Label
  }, [])

  const deleteLabel = useCallback(async (id: string) => {
    const { error } = await supabase.from('labels').delete().eq('id', id)
    if (error) {
      setError(error)
      return false
    }
    setLabels((prev) => prev.filter((l) => l.id !== id))
    setTaskLabels((prev) => prev.filter((tl) => tl.label_id !== id))
    return true
  }, [])

  const setTaskLabelIds = useCallback(
    async (taskId: string, newIds: string[]) => {
      const current = taskLabels.filter((tl) => tl.task_id === taskId).map((tl) => tl.label_id)
      const toAdd = newIds.filter((id) => !current.includes(id))
      const toRemove = current.filter((id) => !newIds.includes(id))

      if (toAdd.length) {
        const rows = toAdd.map((label_id) => ({ task_id: taskId, label_id }))
        const { error } = await supabase.from('task_labels').insert(rows)
        if (error) {
          setError(error)
          return false
        }
      }
      if (toRemove.length) {
        const { error } = await supabase
          .from('task_labels')
          .delete()
          .eq('task_id', taskId)
          .in('label_id', toRemove)
        if (error) {
          setError(error)
          return false
        }
      }

      setTaskLabels((prev) => {
        const others = prev.filter((tl) => tl.task_id !== taskId)
        return [...others, ...newIds.map((label_id) => ({ task_id: taskId, label_id }))]
      })
      return true
    },
    [taskLabels],
  )

  const labelsForTask = useCallback(
    (taskId: string): Label[] => {
      const ids = new Set(
        taskLabels.filter((tl) => tl.task_id === taskId).map((tl) => tl.label_id),
      )
      return labels.filter((l) => ids.has(l.id))
    },
    [labels, taskLabels],
  )

  return {
    labels,
    taskLabels,
    loading,
    error,
    reload: load,
    createLabel,
    deleteLabel,
    setTaskLabelIds,
    labelsForTask,
  }
}
