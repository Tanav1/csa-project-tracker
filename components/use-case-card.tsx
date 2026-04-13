import Link from 'next/link'
import type { UseCase, Task } from '@/lib/types'
import { StatusBadge } from './status-badge'
import { PriorityBadge } from './priority-badge'

interface UseCaseCardProps {
  useCase: UseCase
  tasks: Task[]
}

function calcPercent(tasks: Task[]) {
  if (tasks.length === 0) return 0
  return Math.round(tasks.reduce((s, t) => s + t.percent_complete, 0) / tasks.length)
}

function fmtNum(n: number): string {
  if (n % 1 === 0) return String(n)
  return parseFloat(n.toFixed(1)).toString()
}

export function UseCaseCard({ useCase, tasks }: UseCaseCardProps) {
  const percent = calcPercent(tasks)
  const done = tasks.filter(t => t.is_complete || t.percent_complete === 100).length

  const ringColor =
    percent === 100 ? '#175242'
    : percent > 0   ? '#D79F32'
    : '#ECECEC'

  const circumference = 2 * Math.PI * 16 // r=16
  const dash = (percent / 100) * circumference

  return (
    <Link
      href={`/use-cases/${useCase.id}`}
      className="group block bg-white rounded-xl border p-5 hover:shadow-md transition-shadow"
      style={{ borderColor: '#ECECEC' }}
    >
      {/* Top row: badges + mini ring */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex gap-1.5 flex-wrap items-center">
          <PriorityBadge priority={useCase.priority} />
          <StatusBadge status={useCase.status} />
        </div>

        {/* SVG progress ring */}
        <div className="relative flex-shrink-0 w-10 h-10">
          <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#ECECEC" strokeWidth="3.5" />
            <circle
              cx="20" cy="20" r="16"
              fill="none"
              stroke={ringColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              style={{ transition: 'stroke-dasharray 0.4s ease' }}
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center text-xs font-bold"
            style={{ fontFamily: 'Diatype, sans-serif', color: percent === 100 ? '#175242' : '#000' }}
          >
            {percent}%
          </span>
        </div>
      </div>

      {/* Name */}
      <h3
        className="text-sm font-medium leading-snug mb-4"
        style={{ fontFamily: 'Diatype, sans-serif' }}
      >
        {useCase.name}
      </h3>

      {/* Footer */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <span
            className="text-2xl font-bold leading-none"
            style={{ fontFamily: 'Diatype, sans-serif' }}
          >
            {fmtNum(useCase.hours_per_week)}
          </span>
          <span className="text-xs ml-1" style={{ color: '#767676' }}>hrs/wk</span>
        </div>
        <span className="font-caption text-xs" style={{ color: '#B2AAA1' }}>
          {done}/{tasks.length} tasks
        </span>
      </div>
    </Link>
  )
}
