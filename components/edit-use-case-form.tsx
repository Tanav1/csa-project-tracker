'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UseCase, Priority, UseCaseStatus } from '@/lib/types'

export function EditUseCaseForm({ useCase }: { useCase: UseCase }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: useCase.name,
    problem: useCase.problem ?? '',
    solution: useCase.solution ?? '',
    priority: useCase.priority as Priority,
    status: useCase.status as UseCaseStatus,
    hours_per_week: String(useCase.hours_per_week),
    hours_per_quarter: String(useCase.hours_per_quarter),
    build_hours: String(useCase.build_hours),
    roi: useCase.roi != null ? String(useCase.roi) : '',
    confidence: useCase.confidence ?? '',
    type: useCase.type ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  function reset() {
    setForm({
      name: useCase.name,
      problem: useCase.problem ?? '',
      solution: useCase.solution ?? '',
      priority: useCase.priority,
      status: useCase.status,
      hours_per_week: String(useCase.hours_per_week),
      hours_per_quarter: String(useCase.hours_per_quarter),
      build_hours: String(useCase.build_hours),
      roi: useCase.roi != null ? String(useCase.roi) : '',
      confidence: useCase.confidence ?? '',
      type: useCase.type ?? '',
    })
    setOpen(false)
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('use_cases')
      .update({
        name: form.name.trim(),
        problem: form.problem.trim() || null,
        solution: form.solution.trim() || null,
        priority: form.priority,
        status: form.status,
        hours_per_week: parseFloat(form.hours_per_week) || 0,
        hours_per_quarter: parseFloat(form.hours_per_quarter) || 0,
        build_hours: parseFloat(form.build_hours) || 0,
        roi: form.roi !== '' ? parseFloat(form.roi) : null,
        confidence: form.confidence || null,
        type: form.type || null,
      } as never)
      .eq('id', useCase.id)
    setSaving(false)
    setOpen(false)
    startTransition(() => router.refresh())
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded text-xs font-medium border transition-colors hover:bg-gray-50"
        style={{ borderColor: '#ECECEC', color: '#767676', fontFamily: 'Diatype, sans-serif' }}
      >
        Edit details
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex" style={{ isolation: 'isolate' }}>
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
            onClick={reset}
          />

          {/* Slide-over panel */}
          <aside
            className="relative ml-auto h-full w-full flex flex-col bg-white shadow-2xl"
            style={{ maxWidth: '440px' }}
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
              style={{ borderColor: '#ECECEC' }}
            >
              <h2 className="text-sm font-bold" style={{ fontFamily: 'Diatype, sans-serif' }}>
                Edit details
              </h2>
              <button
                onClick={reset}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-sm"
                style={{ color: '#89837C' }}
              >
                ✕
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <F label="Name">
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={ic}
                  style={is}
                />
              </F>

              <F label="Problem">
                <textarea
                  value={form.problem}
                  onChange={e => setForm(f => ({ ...f, problem: e.target.value }))}
                  rows={3}
                  placeholder="What problem does this solve?"
                  className={ic}
                  style={is}
                />
              </F>

              <F label="Solution">
                <textarea
                  value={form.solution}
                  onChange={e => setForm(f => ({ ...f, solution: e.target.value }))}
                  rows={3}
                  placeholder="How are we solving it?"
                  className={ic}
                  style={is}
                />
              </F>

              <div className="grid grid-cols-2 gap-3">
                <F label="Priority">
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                    className={ic}
                    style={is}
                  >
                    <option>P0</option>
                    <option>P1</option>
                    <option>P2</option>
                  </select>
                </F>

                <F label="Status">
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as UseCaseStatus }))}
                    className={ic}
                    style={is}
                  >
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>Blocked</option>
                    <option>Complete</option>
                  </select>
                </F>
              </div>

              <div className="pt-1 pb-0.5">
                <p className="font-caption text-xs mb-3" style={{ color: '#89837C', letterSpacing: '0.06em' }}>
                  METRICS
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <F label="Hrs / week saved">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={form.hours_per_week}
                      onChange={e => setForm(f => ({ ...f, hours_per_week: e.target.value }))}
                      className={ic}
                      style={is}
                    />
                  </F>

                  <F label="Hrs / quarter saved">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={form.hours_per_quarter}
                      onChange={e => setForm(f => ({ ...f, hours_per_quarter: e.target.value }))}
                      className={ic}
                      style={is}
                    />
                  </F>

                  <F label="Build hours">
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={form.build_hours}
                      onChange={e => setForm(f => ({ ...f, build_hours: e.target.value }))}
                      className={ic}
                      style={is}
                    />
                  </F>

                  <F label="ROI (x)">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={form.roi}
                      onChange={e => setForm(f => ({ ...f, roi: e.target.value }))}
                      placeholder="—"
                      className={ic}
                      style={is}
                    />
                  </F>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <F label="Confidence">
                  <select
                    value={form.confidence}
                    onChange={e => setForm(f => ({ ...f, confidence: e.target.value }))}
                    className={ic}
                    style={is}
                  >
                    <option value="">—</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </F>

                <F label="Type">
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className={ic}
                    style={is}
                  >
                    <option value="">—</option>
                    <option>Automation</option>
                    <option>AI Agent</option>
                    <option>Integration</option>
                    <option>Tool</option>
                    <option>Other</option>
                  </select>
                </F>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex gap-3 px-6 py-4 border-t flex-shrink-0"
              style={{ borderColor: '#ECECEC' }}
            >
              <button
                onClick={save}
                disabled={saving || !form.name.trim()}
                className="flex-1 py-2.5 rounded text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: '#175242', fontFamily: 'Diatype, sans-serif' }}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button
                onClick={reset}
                className="px-4 py-2.5 rounded text-sm border transition-colors hover:bg-gray-50"
                style={{ borderColor: '#ECECEC', color: '#767676', fontFamily: 'Diatype, sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}

// Helpers
const ic = 'w-full px-3 py-2 rounded border text-sm bg-white resize-none outline-none focus:border-black transition-colors'
const is: React.CSSProperties = { borderColor: '#D3CDC4', fontFamily: 'Diatype, sans-serif' }

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-caption text-xs mb-1.5" style={{ color: '#89837C' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
