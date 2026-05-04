import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, TaskPriority, TaskStatus } from '../types/database'

interface NewTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string | null
}

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('position', { ascending: true })
    if (error) {
      setError(error.message)
    } else {
      setTasks(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (userId) {
      loadTasks()
    }
  }, [userId])

  // Group tasks by their status column
  const grouped = {
    todo: tasks.filter((t) => t.status === 'todo').sort((a, b) => a.position - b.position),
    in_progress: tasks
      .filter((t) => t.status === 'in_progress')
      .sort((a, b) => a.position - b.position),
    in_review: tasks
      .filter((t) => t.status === 'in_review')
      .sort((a, b) => a.position - b.position),
    done: tasks.filter((t) => t.status === 'done').sort((a, b) => a.position - b.position),
  }

  async function createTask(input: NewTaskInput) {
    const status = input.status || 'todo'
    const tasksInColumn = tasks.filter((t) => t.status === status)
    const nextPosition = tasksInColumn.length

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: input.title,
        description: input.description || '',
        status,
        priority: input.priority || 'normal',
        due_date: input.due_date || null,
        position: nextPosition,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      return null
    }
    await loadTasks()
    return data as Task
  }

  async function updateTask(id: string, patch: Partial<Task>) {
    const { error } = await supabase.from('tasks').update(patch).eq('id', id)
    if (error) setError(error.message)
    await loadTasks()
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) setError(error.message)
    await loadTasks()
  }

  // Move a task to a new column and/or position.
  // Recomputes positions in both source and destination columns.
  async function moveTask(
    taskId: string,
    sourceStatus: TaskStatus,
    destStatus: TaskStatus,
    destIndex: number,
  ) {
    const moving = tasks.find((t) => t.id === taskId)
    if (!moving) return

    // Build the new ordering for the destination column
    const destTasks = tasks
      .filter((t) => t.status === destStatus && t.id !== taskId)
      .sort((a, b) => a.position - b.position)
    destTasks.splice(destIndex, 0, moving)

    // Update each task's position to its new index
    for (let i = 0; i < destTasks.length; i++) {
      await supabase
        .from('tasks')
        .update({ status: destStatus, position: i })
        .eq('id', destTasks[i].id)
    }

    // If we moved between columns, also re-pack the source column
    if (sourceStatus !== destStatus) {
      const sourceTasks = tasks
        .filter((t) => t.status === sourceStatus && t.id !== taskId)
        .sort((a, b) => a.position - b.position)
      for (let i = 0; i < sourceTasks.length; i++) {
        await supabase.from('tasks').update({ position: i }).eq('id', sourceTasks[i].id)
      }
    }

    await loadTasks()
  }

  return {
    tasks,
    grouped,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  }
}
