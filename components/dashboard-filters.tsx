'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const STATUS_OPTIONS = ['all', 'Not Started', 'In Progress', 'Blocked', 'Complete']
const PRIORITY_OPTIONS = ['all', 'P0', 'P1', 'P2']

function Filters({ currentStatus, currentPriority }: { currentStatus: string; currentPriority: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status filter */}
      <div className="flex items-center gap-2">
        <span className="font-caption text-xs" style={{ color: '#89837C' }}>Status</span>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => updateFilter('status', s)}
              className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
              style={{
                backgroundColor: currentStatus === s ? '#000000' : '#FFFFFF',
                color: currentStatus === s ? '#FFFFFF' : '#767676',
                border: `1px solid ${currentStatus === s ? '#000000' : '#ECECEC'}`,
                fontFamily: 'Diatype, sans-serif',
              }}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="w-px h-4" style={{ backgroundColor: '#ECECEC' }} />

      {/* Priority filter */}
      <div className="flex items-center gap-2">
        <span className="font-caption text-xs" style={{ color: '#89837C' }}>Priority</span>
        <div className="flex gap-1">
          {PRIORITY_OPTIONS.map(p => (
            <button
              key={p}
              onClick={() => updateFilter('priority', p)}
              className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
              style={{
                backgroundColor: currentPriority === p ? '#000000' : '#FFFFFF',
                color: currentPriority === p ? '#FFFFFF' : '#767676',
                border: `1px solid ${currentPriority === p ? '#000000' : '#ECECEC'}`,
                fontFamily: 'Diatype, sans-serif',
              }}
            >
              {p === 'all' ? 'All' : p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DashboardFilters({ currentStatus, currentPriority }: { currentStatus: string; currentPriority: string }) {
  return (
    <Suspense fallback={<div className="h-8" />}>
      <Filters currentStatus={currentStatus} currentPriority={currentPriority} />
    </Suspense>
  )
}
