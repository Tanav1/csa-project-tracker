'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface EditableMetricProps {
  label: string
  value: number
  unit: string
  sub?: string
  definition?: string
  settingsKey: string
  canEdit: boolean
}

export function EditableMetric({ label, value: initialValue, unit, sub, definition, settingsKey, canEdit }: EditableMetricProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  const [draft, setDraft] = useState(String(initialValue))
  const supabase = createClient()

  function fmtNum(n: number) {
    if (n % 1 === 0) return String(n)
    return parseFloat(n.toFixed(1)).toString()
  }

  async function save() {
    const parsed = parseFloat(draft)
    if (!isNaN(parsed)) {
      setValue(parsed)
      await supabase
        .from('dashboard_settings')
        .upsert({ key: settingsKey, value: parsed })
    }
    setEditing(false)
  }

  return (
    <div className="py-1 group/metric">
      <div className="flex items-center gap-1 mb-2">
        <p className="font-caption text-xs" style={{ color: '#89837C' }}>{label}</p>
        {definition && (
          <div className="relative group/tip">
            <span
              className="font-caption text-xs leading-none cursor-default select-none"
              style={{ color: '#C8C2BB' }}
            >
              ?
            </span>
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 rounded-lg text-xs leading-snug opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity duration-150 z-20"
              style={{ backgroundColor: '#1A1A1A', color: '#F5F2EC' }}
            >
              {definition}
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #1A1A1A' }}
              />
            </div>
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        {editing ? (
          <input
            autoFocus
            type="number"
            min={0}
            step={0.5}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
            className="w-24 rounded border px-2 py-0.5 text-right leading-none"
            style={{
              fontFamily: 'Diatype, sans-serif',
              fontSize: '2.5rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              borderColor: '#175242',
              outline: 'none',
            }}
          />
        ) : (
          <button
            onClick={() => canEdit && setEditing(true)}
            className={canEdit ? 'cursor-text' : 'cursor-default'}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <span
              className="font-bold leading-none"
              style={{ fontFamily: 'Diatype, sans-serif', fontSize: '2.5rem', letterSpacing: '-0.03em' }}
            >
              {fmtNum(value)}
            </span>
          </button>
        )}
        <span className="text-sm" style={{ color: '#767676' }}>{unit}</span>
        {canEdit && !editing && (
          <span
            className="opacity-0 group-hover/metric:opacity-100 transition-opacity text-xs ml-1 cursor-pointer"
            style={{ color: '#89837C' }}
            onClick={() => setEditing(true)}
          >
            edit
          </span>
        )}
      </div>
      {sub && (
        <p className="font-caption text-xs mt-1" style={{ color: '#B2AAA1' }}>{sub}</p>
      )}
    </div>
  )
}
