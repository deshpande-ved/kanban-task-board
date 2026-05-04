import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Label, TaskLabel } from '../types/database'

export function useLabels(userId: string | undefined) {
  const [labels, setLabels] = useState<Label[]>([])
  const [taskLabels, setTaskLabels] = useState<TaskLabel[]>([])
  const [loading, setLoading] = useState(true)

  async function loadLabels() {
    const labelsResult = await supabase
      .from('labels')
      .select('*')
      .order('created_at', { ascending: true })
    const taskLabelsResult = await supabase.from('task_labels').select('*')
    if (labelsResult.data) setLabels(labelsResult.data)
    if (taskLabelsResult.data) setTaskLabels(taskLabelsResult.data)
    setLoading(false)
  }

  useEffect(() => {
    if (userId) {
      loadLabels()
    }
  }, [userId])

  async function createLabel(name: string, color: string) {
    const { data, error } = await supabase
      .from('labels')
      .insert({ name, color })
      .select()
      .single()
    if (error) return null
    await loadLabels()
    return data as Label
  }

  async function deleteLabel(id: string) {
    await supabase.from('labels').delete().eq('id', id)
    await loadLabels()
  }

  // Replace the labels assigned to a task.
  // Easiest approach: clear all existing rows for that task, then insert the new set.
  async function setTaskLabelIds(taskId: string, newIds: string[]) {
    await supabase.from('task_labels').delete().eq('task_id', taskId)
    if (newIds.length > 0) {
      const rows = newIds.map((labelId) => ({ task_id: taskId, label_id: labelId }))
      await supabase.from('task_labels').insert(rows)
    }
    await loadLabels()
  }

  function labelsForTask(taskId: string): Label[] {
    const ids = taskLabels.filter((tl) => tl.task_id === taskId).map((tl) => tl.label_id)
    return labels.filter((l) => ids.includes(l.id))
  }

  return {
    labels,
    taskLabels,
    loading,
    createLabel,
    deleteLabel,
    setTaskLabelIds,
    labelsForTask,
  }
}
