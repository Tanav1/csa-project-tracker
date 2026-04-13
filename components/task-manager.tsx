'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Task } from '@/lib/types'
import { ProgressRing } from './progress-ring'

interface TaskManagerProps {
  useCaseId: string
  initialTasks: Task[]
  percent: number
  hoursPerWeek: number
}

const CATEGORIES = [
  'Discovery', 'Backend Setup', 'Backend', 'Frontend Setup', 'Frontend',
  'Core Extraction', 'Matching Logic', 'Integration', 'Security',
  'Deployment', 'Form Mapping', 'Extraction Refinement',
  'Backend / Infra', 'Frontend / UI', 'AI Prioritization',
  'Gmail Integration', 'Slack Integration', 'DocuSign Integration', 'Other',
]

export function TaskManager({ useCaseId, initialTasks, percent, hoursPerWeek }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showAdd, setShowAdd] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  // ── Add task form state
  const [newTask, setNewTask] = useState({
    name: '',
    category: '',
    start_date: '',
    end_date: '',
    percent_complete: 0,
  })

  async function addTask() {
    if (!newTask.name.trim()) return
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        use_case_id: useCaseId,
        name: newTask.name.trim(),
        category: newTask.category || null,
        start_date: newTask.start_date || null,
        end_date: newTask.end_date || null,
        percent_complete: newTask.percent_complete,
        is_complete: newTask.percent_complete === 100,
      } as never)
      .select()
      .single()
    if (!error && data) {
      setTasks(prev => [...prev, data as Task])
      setNewTask({ name: '', category: '', start_date: '', end_date: '', percent_complete: 0 })
      setShowAdd(false)
      startTransition(() => router.refresh())
    }
  }

  async function updateTaskPercent(taskId: string, percent_complete: number) {
    const is_complete = percent_complete === 100
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, percent_complete, is_complete } : t))
    await supabase.from('tasks').update({ percent_complete, is_complete } as never).eq('id', taskId)
    startTransition(() => router.refresh())
  }

  async function deleteTask(taskId: string) {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    await supabase.from('tasks').delete().eq('id', taskId)
    startTransition(() => router.refresh())
  }

  const completedCount = tasks.filter(t => t.is_complete || t.percent_complete === 100).length
  const currentPercent = tasks.length === 0 ? 0
    : Math.round(tasks.reduce((s, t) => s + t.percent_complete, 0) / tasks.length)

  return (
    <div className="bg-white rounded-lg border" style={{ borderColor: '#ECECEC' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#ECECEC' }}>
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold" style={{ fontFamily: 'Diatype, sans-serif' }}>Tasks</h2>
          <span className="font-caption text-xs" style={{ color: '#89837C' }}>
            {completedCount}/{tasks.length} complete · {currentPercent}% · {hoursPerWeek} hrs/wk saved
          </span>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="px-3 py-1.5 rounded text-xs font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#175242', fontFamily: 'Diatype, sans-serif' }}
        >
          {showAdd ? 'Cancel' : '+ Add task'}
        </button>
      </div>

      {/* Add task form */}
      {showAdd && (
        <div className="px-5 py-4 border-b" style={{ borderColor: '#ECECEC', backgroundColor: '#F5F2EC' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="Task name *"
                value={newTask.name}
                onChange={e => setNewTask(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 rounded border text-sm bg-white"
                style={{ borderColor: '#D3CDC4', fontFamily: 'Diatype, sans-serif' }}
              />
            </div>
            <select
              value={newTask.category}
              onChange={e => setNewTask(p => ({ ...p, category: e.target.value }))}
              className="px-3 py-2 rounded border text-sm bg-white"
              style={{ borderColor: '#D3CDC4', fontFamily: 'Diatype, sans-serif', color: newTask.category ? '#000' : '#89837C' }}
            >
              <option value="">Category (optional)</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <label className="font-caption text-xs whitespace-nowrap" style={{ color: '#89837C' }}>
                % complete
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={newTask.percent_complete}
                onChange={e => setNewTask(p => ({ ...p, percent_complete: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                className="w-20 px-3 py-2 rounded border text-sm bg-white"
                style={{ borderColor: '#D3CDC4', fontFamily: 'Diatype, sans-serif' }}
              />
            </div>
            <input
              type="date"
              value={newTask.start_date}
              onChange={e => setNewTask(p => ({ ...p, start_date: e.target.value }))}
              className="px-3 py-2 rounded border text-sm bg-white"
              style={{ borderColor: '#D3CDC4', fontFamily: 'Diatype, sans-serif', color: newTask.start_date ? '#000' : '#89837C' }}
            />
            <input
              type="date"
              value={newTask.end_date}
              onChange={e => setNewTask(p => ({ ...p, end_date: e.target.value }))}
              className="px-3 py-2 rounded border text-sm bg-white"
              style={{ borderColor: '#D3CDC4', fontFamily: 'Diatype, sans-serif', color: newTask.end_date ? '#000' : '#89837C' }}
            />
          </div>
          <button
            onClick={addTask}
            disabled={!newTask.name.trim()}
            className="px-4 py-2 rounded text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: '#175242', fontFamily: 'Diatype, sans-serif' }}
          >
            Add task
          </button>
        </div>
      )}

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="px-5 py-10 text-center font-caption text-xs" style={{ color: '#B2AAA1' }}>
          No tasks yet. Add your first task to track progress.
        </div>
      ) : (
        <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
          {tasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              onUpdatePercent={updateTaskPercent}
              onDelete={deleteTask}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TaskRow({
  task,
  onUpdatePercent,
  onDelete,
}: {
  task: Task
  onUpdatePercent: (id: string, pct: number) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [pct, setPct] = useState(task.percent_complete)

  function handlePctBlur() {
    setEditing(false)
    if (pct !== task.percent_complete) {
      onUpdatePercent(task.id, pct)
    }
  }

  const isComplete = task.is_complete || task.percent_complete === 100

  return (
    <div
      className="flex items-center gap-3 px-5 py-3 group"
      style={{ borderColor: '#ECECEC' }}
    >
      {/* Mini progress ring */}
      <div className="relative flex-shrink-0">
        <ProgressRing percent={task.percent_complete} size={32} strokeWidth={3} />
        <span
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontSize: '8px', fontFamily: 'Diatype, sans-serif', fontWeight: 700 }}
        >
          {task.percent_complete}
        </span>
      </div>

      {/* Task name + category */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm leading-snug"
          style={{
            fontFamily: 'Diatype, sans-serif',
            textDecoration: isComplete ? 'line-through' : 'none',
            color: isComplete ? '#89837C' : '#000000',
          }}
        >
          {task.name}
        </p>
        {task.category && (
          <p className="font-caption text-xs mt-0.5" style={{ color: '#B2AAA1' }}>{task.category}</p>
        )}
      </div>

      {/* Dates */}
      {(task.start_date || task.end_date) && (
        <div className="hidden sm:block font-caption text-xs text-right flex-shrink-0" style={{ color: '#B2AAA1' }}>
          {task.start_date && <div>{formatDate(task.start_date)}</div>}
          {task.end_date && <div>→ {formatDate(task.end_date)}</div>}
        </div>
      )}

      {/* % input */}
      <div className="flex-shrink-0">
        {editing ? (
          <input
            type="number"
            min={0}
            max={100}
            value={pct}
            autoFocus
            onChange={e => setPct(Math.min(100, Math.max(0, Number(e.target.value))))}
            onBlur={handlePctBlur}
            onKeyDown={e => e.key === 'Enter' && handlePctBlur()}
            className="w-16 px-2 py-1 rounded border text-xs text-center"
            style={{ borderColor: '#D3CDC4', fontFamily: 'Diatype, sans-serif' }}
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="px-2 py-1 rounded text-xs font-medium border transition-colors hover:border-black"
            style={{
              borderColor: '#ECECEC',
              fontFamily: 'Diatype, sans-serif',
              color: isComplete ? '#175242' : '#767676',
              minWidth: '3rem',
            }}
          >
            {task.percent_complete}%
          </button>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded hover:bg-red-50"
        style={{ color: '#B63D35' }}
        aria-label="Delete task"
      >
        ✕
      </button>
    </div>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
