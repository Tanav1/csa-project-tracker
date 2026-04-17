'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Task } from '@/lib/types'
import { CATEGORIES, CUSTOM_CATEGORY_SENTINEL } from '@/lib/constants'

type Col = 'todo' | 'doing' | 'done'

function taskCol(t: Task): Col {
  if (t.percent_complete === 100 || t.is_complete) return 'done'
  if (t.percent_complete > 0) return 'doing'
  return 'todo'
}

const COLS: { id: Col; label: string; dot: string }[] = [
  { id: 'todo',  label: 'To Do',      dot: '#B2AAA1' },
  { id: 'doing', label: 'In Progress', dot: '#D79F32' },
  { id: 'done',  label: 'Done',        dot: '#175242' },
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
  const [newCatCustom, setNewCatCustom] = useState('')
  const [newHours, setNewHours] = useState('')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
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

  function resolvedNewCat() {
    return newCat === CUSTOM_CATEGORY_SENTINEL ? newCatCustom.trim() : newCat
  }

  async function addTask() {
    if (!addingTo || !newName.trim()) return
    const pct = addingTo === 'todo' ? 0 : addingTo === 'done' ? 100 : 50
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        use_case_id: useCaseId,
        name: newName.trim(),
        category: resolvedNewCat() || null,
        percent_complete: pct,
        is_complete: pct === 100,
        hours: newHours !== '' ? parseFloat(newHours) : null,
      } as never)
      .select()
      .single()
    if (!error && data) {
      setTasks(prev => [...prev, data as Task])
      setNewName('')
      setNewCat('')
      setNewCatCustom('')
      setNewHours('')
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

  async function saveTaskEdit(updated: Partial<Task> & { id: string }) {
    setTasks(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t))
    setEditingTask(null)
    const { id, ...fields } = updated
    await supabase.from('tasks').update(fields as never).eq('id', id)
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
                onClick={() => { setAddingTo(col.id); setNewName(''); setNewCat(''); setNewCatCustom('') }}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 transition-colors text-sm leading-none"
                style={{ color: '#89837C' }}
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
                  onChange={e => {
                    setNewCat(e.target.value)
                    if (e.target.value !== CUSTOM_CATEGORY_SENTINEL) setNewCatCustom('')
                  }}
                  className="text-xs rounded border px-2 py-1 w-full bg-white"
                  style={{ borderColor: '#ECECEC', color: newCat ? '#000' : '#89837C' }}
                >
                  <option value="">Category (optional)</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value={CUSTOM_CATEGORY_SENTINEL}>Custom…</option>
                </select>
                {newCat === CUSTOM_CATEGORY_SENTINEL && (
                  <input
                    autoFocus
                    type="text"
                    placeholder="Enter custom category"
                    value={newCatCustom}
                    onChange={e => setNewCatCustom(e.target.value)}
                    className="text-xs rounded border px-2 py-1 w-full outline-none"
                    style={{ borderColor: '#ECECEC', fontFamily: 'Diatype, sans-serif' }}
                  />
                )}
                <div className="flex items-center gap-1.5">
                  <label className="text-xs whitespace-nowrap" style={{ color: '#89837C', fontFamily: 'Diatype, sans-serif' }}>hrs</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="0"
                    value={newHours}
                    onChange={e => setNewHours(e.target.value)}
                    className="text-xs rounded border px-2 py-1 w-20 bg-white"
                    style={{ borderColor: '#ECECEC', fontFamily: 'Diatype, sans-serif' }}
                  />
                </div>
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

            {/* Task cards */}
            {byCol(col.id).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isDragging={dragging === task.id}
                onDragStart={() => setDragging(task.id)}
                onDragEnd={() => { setDragging(null); setDragOver(null) }}
                onDelete={deleteTask}
                onUpdatePct={updatePct}
                onEdit={() => setEditingTask(task)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Task edit modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onSave={saveTaskEdit}
          onClose={() => setEditingTask(null)}
          onDelete={id => { deleteTask(id); setEditingTask(null) }}
        />
      )}
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
  onEdit,
}: {
  task: Task
  isDragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onDelete: (id: string) => void
  onUpdatePct: (id: string, pct: number) => void
  onEdit: () => void
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
      onClick={onEdit}
      className="group bg-white rounded-lg border px-3 py-2.5 cursor-pointer select-none transition-shadow hover:shadow-sm"
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
          onClick={e => { e.stopPropagation(); onDelete(task.id) }}
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
        <div className="mt-2" onClick={e => e.stopPropagation()}>
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
              onClick={e => { e.stopPropagation(); setEditPct(true) }}
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

function TaskEditModal({
  task,
  onSave,
  onClose,
  onDelete,
}: {
  task: Task
  onSave: (updated: Partial<Task> & { id: string }) => void
  onClose: () => void
  onDelete: (id: string) => void
}) {
  const isCustomInitial = !!(task.category && !CATEGORIES.includes(task.category))
  const [form, setForm] = useState({
    name: task.name,
    category: isCustomInitial ? CUSTOM_CATEGORY_SENTINEL : (task.category ?? ''),
    start_date: task.start_date ?? '',
    end_date: task.end_date ?? '',
    percent_complete: task.percent_complete,
    hours: task.hours != null ? String(task.hours) : '',
  })
  const [customCat, setCustomCat] = useState(isCustomInitial ? (task.category ?? '') : '')

  function resolvedCategory() {
    return form.category === CUSTOM_CATEGORY_SENTINEL ? customCat.trim() : form.category
  }

  function save() {
    if (!form.name.trim()) return
    onSave({
      id: task.id,
      name: form.name.trim(),
      category: resolvedCategory() || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      percent_complete: form.percent_complete,
      is_complete: form.percent_complete === 100,
      hours: form.hours !== '' ? parseFloat(form.hours) : null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col"
        style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.16)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#ECECEC' }}>
          <h3 className="text-sm font-bold" style={{ fontFamily: 'Diatype, sans-serif' }}>
            Edit task
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm"
            style={{ color: '#89837C' }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <TF label="Task name">
            <input
              autoFocus
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') save() }}
              className={ic}
              style={is}
            />
          </TF>

          <TF label="Category">
            <select
              value={form.category}
              onChange={e => {
                setForm(f => ({ ...f, category: e.target.value }))
                if (e.target.value !== CUSTOM_CATEGORY_SENTINEL) setCustomCat('')
              }}
              className={ic}
              style={{ ...is, color: form.category ? '#000' : '#89837C' }}
            >
              <option value="">None</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              <option value={CUSTOM_CATEGORY_SENTINEL}>Custom…</option>
            </select>
          </TF>
          {form.category === CUSTOM_CATEGORY_SENTINEL && (
            <TF label="Custom category name">
              <input
                autoFocus
                type="text"
                placeholder="e.g. Data Pipeline"
                value={customCat}
                onChange={e => setCustomCat(e.target.value)}
                className={ic}
                style={is}
              />
            </TF>
          )}

          <div className="grid grid-cols-2 gap-3">
            <TF label="Start date">
              <input
                type="date"
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className={ic}
                style={is}
              />
            </TF>
            <TF label="End date">
              <input
                type="date"
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className={ic}
                style={is}
              />
            </TF>
          </div>

          <TF label={`Progress — ${form.percent_complete}%`}>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.percent_complete}
              onChange={e => setForm(f => ({ ...f, percent_complete: Number(e.target.value) }))}
              className="w-full accent-green-800"
            />
          </TF>

          <TF label="Hours to complete">
            <input
              type="number"
              min={0}
              step={0.5}
              placeholder="e.g. 4"
              value={form.hours}
              onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
              className={ic}
              style={is}
            />
          </TF>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t" style={{ borderColor: '#ECECEC' }}>
          <button
            onClick={save}
            disabled={!form.name.trim()}
            className="flex-1 py-2 rounded text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: '#175242', fontFamily: 'Diatype, sans-serif' }}
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm border transition-colors hover:bg-gray-50"
            style={{ borderColor: '#ECECEC', color: '#767676' }}
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="px-3 py-2 rounded text-sm transition-colors hover:bg-red-50"
            style={{ color: '#B63D35' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

const ic = 'w-full px-3 py-2 rounded border text-sm bg-white outline-none focus:border-black transition-colors'
const is: React.CSSProperties = { borderColor: '#D3CDC4', fontFamily: 'Diatype, sans-serif' }

function TF({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-caption text-xs mb-1.5" style={{ color: '#89837C' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
