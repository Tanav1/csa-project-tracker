'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Task } from '@/lib/types'

type Col = 'todo' | 'doing' | 'done'

function taskCol(t: Task): Col {
  if (t.percent_complete === 100 || t.is_complete) return 'done'
  if (t.percent_complete > 0) return 'doing'
  return 'todo'
}

const COLS: { id: Col; label: string; dot: string }[] = [
  { id: 'todo',  label: 'To Do',       dot: '#B2AAA1' },
  { id: 'doing', label: 'In Progress',  dot: '#D79F32' },
  { id: 'done',  label: 'Done',         dot: '#175242' },
]

const CATEGORIES = [
  'Discovery', 'Backend', 'Frontend', 'Integration',
  'Security', 'Deployment', 'AI', 'Other',
]

interface Props {
  useCaseId: string
  initialTasks: Task[]
  hoursPerWeek: number
}

export function KanbanBoard({ useCaseId, initialTasks, hoursPerWeek }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<Col | null>(null)
  const [addingTo, setAddingTo] = useState<Col | null>(null)
  const [newName, setNewName] = useState('')
  const [newCat, setNewCat] = useState('')
  const [, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  const byCol = (col: Col) => tasks.filter(t => taskCol(t) === col)

  async function moveTask(taskId: string, toCol: Col) {
    const task = tasks.find(t => t.id === taskId)
    if (!task || taskCol(task) === toCol) return
    const pct =
      toCol === 'todo' ? 0
      : toCol === 'done' ? 100
      : task.percent_complete > 0 && task.percent_complete < 100
        ? task.percent_complete
        : 50
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, percent_complete: pct, is_complete: pct === 100 } : t)
    )
    await supabase
      .from('tasks')
      .update({ percent_complete: pct, is_complete: pct === 100 } as never)
      .eq('id', taskId)
    startTransition(() => router.refresh())
  }

  async function addTask() {
    if (!addingTo || !newName.trim()) return
    const pct = addingTo === 'todo' ? 0 : addingTo === 'done' ? 100 : 50
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        use_case_id: useCaseId,
        name: newName.trim(),
        category: newCat || null,
        percent_complete: pct,
        is_complete: pct === 100,
      } as never)
      .select()
      .single()
    if (!error && data) {
      setTasks(prev => [...prev, data as Task])
      setNewName('')
      setNewCat('')
      setAddingTo(null)
      startTransition(() => router.refresh())
    }
  }

  async function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from('tasks').delete().eq('id', id)
    startTransition(() => router.refresh())
  }

  async function updatePct(taskId: string, pct: number) {
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, percent_complete: pct, is_complete: pct === 100 } : t)
    )
    await supabase
      .from('tasks')
      .update({ percent_complete: pct, is_complete: pct === 100 } as never)
      .eq('id', taskId)
    startTransition(() => router.refresh())
  }

  const done = tasks.filter(t => t.percent_complete === 100 || t.is_complete).length
  const overallPct = tasks.length === 0
    ? 0
    : Math.round(tasks.reduce((s, t) => s + t.percent_complete, 0) / tasks.length)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold" style={{ fontFamily: 'Diatype, sans-serif' }}>Tasks</h2>
        <span className="font-caption text-xs" style={{ color: '#89837C' }}>
          {done}/{tasks.length} done · {overallPct}% · {hoursPerWeek} hrs/wk
        </span>
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-3">
        {COLS.map(col => (
          <div
            key={col.id}
            onDragOver={e => { e.preventDefault(); setDragOver(col.id) }}
            onDragLeave={e => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null)
            }}
            onDrop={e => {
              e.preventDefault()
              if (dragging) moveTask(dragging, col.id)
              setDragOver(null)
            }}
            className="rounded-xl min-h-[220px] p-3 flex flex-col gap-2 transition-colors"
            style={{
              backgroundColor: dragOver === col.id ? '#F0EDE8' : '#F5F2EC',
              border: `2px solid ${dragOver === col.id ? '#C7BCA1' : 'transparent'}`,
            }}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col.dot }} />
                <span className="font-caption text-xs font-medium" style={{ color: '#000' }}>
                  {col.label}
                </span>
                <span className="font-caption text-xs" style={{ color: '#B2AAA1' }}>
                  {byCol(col.id).length}
                </span>
              </div>
              <button
                onClick={() => { setAddingTo(col.id); setNewName(''); setNewCat('') }}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 transition-colors text-sm leading-none"
                style={{ color: '#89837C' }}
                title={`Add to ${col.label}`}
              >
                +
              </button>
            </div>

            {/* Inline add form */}
            {addingTo === col.id && (
              <div className="bg-white rounded-lg border p-3 flex flex-col gap-2" style={{ borderColor: '#ECECEC' }}>
                <input
                  autoFocus
                  type="text"
                  placeholder="Task name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') addTask()
                    if (e.key === 'Escape') setAddingTo(null)
                  }}
                  className="text-xs outline-none w-full"
                  style={{ fontFamily: 'Diatype, sans-serif' }}
                />
                <select
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  className="text-xs rounded border px-2 py-1 w-full bg-white"
                  style={{ borderColor: '#ECECEC', color: newCat ? '#000' : '#89837C' }}
                >
                  <option value="">Category (optional)</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="flex gap-1.5">
                  <button
                    onClick={addTask}
                    disabled={!newName.trim()}
                    className="flex-1 py-1.5 rounded text-xs font-medium text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#175242', fontFamily: 'Diatype, sans-serif' }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setAddingTo(null)}
                    className="px-2 py-1 rounded text-xs"
                    style={{ color: '#89837C' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Cards */}
            {byCol(col.id).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isDragging={dragging === task.id}
                onDragStart={() => setDragging(task.id)}
                onDragEnd={() => { setDragging(null); setDragOver(null) }}
                onDelete={deleteTask}
                onUpdatePct={updatePct}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function TaskCard({
  task,
  isDragging,
  onDragStart,
  onDragEnd,
  onDelete,
  onUpdatePct,
}: {
  task: Task
  isDragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onDelete: (id: string) => void
  onUpdatePct: (id: string, pct: number) => void
}) {
  const [editPct, setEditPct] = useState(false)
  const [pct, setPct] = useState(task.percent_complete)
  const inProgress = task.percent_complete > 0 && task.percent_complete < 100

  function commitPct() {
    setEditPct(false)
    if (pct !== task.percent_complete) onUpdatePct(task.id, pct)
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="group bg-white rounded-lg border px-3 py-2.5 cursor-grab active:cursor-grabbing select-none transition-shadow hover:shadow-sm"
      style={{
        borderColor: '#ECECEC',
        opacity: isDragging ? 0.35 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs leading-snug flex-1 min-w-0" style={{ fontFamily: 'Diatype, sans-serif' }}>
          {task.name}
        </p>
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-4 h-4 flex items-center justify-center rounded hover:bg-red-50 text-xs"
          style={{ color: '#B63D35' }}
        >
          ✕
        </button>
      </div>

      {task.category && (
        <p className="font-caption text-xs mt-1" style={{ color: '#B2AAA1' }}>{task.category}</p>
      )}

      {inProgress && (
        <div className="mt-2">
          {editPct ? (
            <input
              autoFocus
              type="number"
              min={0}
              max={100}
              value={pct}
              onChange={e => setPct(Math.min(100, Math.max(0, Number(e.target.value))))}
              onBlur={commitPct}
              onKeyDown={e => { if (e.key === 'Enter') commitPct() }}
              className="w-14 text-xs border rounded px-1.5 py-0.5 text-center"
              style={{ borderColor: '#D3CDC4', fontFamily: 'Diatype, sans-serif' }}
            />
          ) : (
            <button
              onClick={() => setEditPct(true)}
              className="font-caption text-xs px-1.5 py-0.5 rounded transition-colors hover:opacity-80"
              style={{ backgroundColor: '#FEF9C3', color: '#92400E' }}
            >
              {task.percent_complete}%
            </button>
          )}
        </div>
      )}
    </div>
  )
}
