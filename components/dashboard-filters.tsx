'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const STATUS_OPTIONS = ['all', 'Not Started', 'In Progress', 'Blocked', 'Complete']
const PRIORITY_OPTIONS = ['all', 'P0', 'P1', 'P2']

const STATUS_DOT: Record<string, string> = {
  'Not Started': '#D3CDC4',
  'In Progress': '#D79F32',
  'Blocked':     '#B63D35',
  'Complete':    '#175242',
}

function Filters({
  currentStatus,
  currentPriority,
}: {
  currentStatus: string
  currentPriority: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    value === 'all' ? params.delete(key) : params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Status */}
      <div className="flex items-center gap-1.5">
        {STATUS_OPTIONS.map(s => {
          const active = currentStatus === s
          return (
            <button
              key={s}
              onClick={() => updateFilter('status', s)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
              style={{
                fontFamily: 'Diatype, sans-serif',
                backgroundColor: active ? '#000000' : 'transparent',
                color: active ? '#FFFFFF' : '#89837C',
                border: `1.5px solid ${active ? '#000000' : '#ECECEC'}`,
              }}
            >
              {s !== 'all' && (
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: active ? '#FFFFFF' : STATUS_DOT[s] ?? '#ECECEC', opacity: active ? 0.7 : 1 }}
                />
              )}
              {s === 'all' ? 'All' : s}
            </button>
          )
        })}
      </div>

      <div className="w-px h-4 hidden sm:block" style={{ backgroundColor: '#ECECEC' }} />

      {/* Priority */}
      <div className="flex items-center gap-1.5">
        {PRIORITY_OPTIONS.map(p => {
          const active = currentPriority === p
          return (
            <button
              key={p}
              onClick={() => updateFilter('priority', p)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
              style={{
                fontFamily: 'Diatype, sans-serif',
                backgroundColor: active ? '#000000' : 'transparent',
                color: active ? '#FFFFFF' : '#89837C',
                border: `1.5px solid ${active ? '#000000' : '#ECECEC'}`,
              }}
            >
              {p === 'all' ? 'All' : p}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DashboardFilters({
  currentStatus,
  currentPriority,
}: {
  currentStatus: string
  currentPriority: string
}) {
  return (
    <Suspense fallback={<div className="h-8" />}>
      <Filters currentStatus={currentStatus} currentPriority={currentPriority} />
    </Suspense>
  )
}
