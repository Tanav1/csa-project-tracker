import Link from 'next/link'
import type { UseCase, Task } from '@/lib/types'
import { StatusBadge } from './status-badge'
import { PriorityBadge } from './priority-badge'
import { ProgressRing } from './progress-ring'

interface UseCaseCardProps {
  useCase: UseCase
  tasks: Task[]
}

function calcPercent(tasks: Task[]) {
  if (tasks.length === 0) return 0
  const total = tasks.reduce((sum, t) => sum + t.percent_complete, 0)
  return Math.round(total / tasks.length)
}

export function UseCaseCard({ useCase, tasks }: UseCaseCardProps) {
  const percent = calcPercent(tasks)
  const completedTasks = tasks.filter(t => t.is_complete || t.percent_complete === 100).length

  return (
    <Link
      href={`/use-cases/${useCase.id}`}
      className="group block bg-white rounded-lg border p-5 hover:shadow-md transition-shadow"
      style={{ borderColor: '#ECECEC' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex gap-1.5 flex-wrap">
          <PriorityBadge priority={useCase.priority} />
          <StatusBadge status={useCase.status} />
        </div>
        <div className="relative flex-shrink-0">
          <ProgressRing percent={percent} size={48} strokeWidth={4} />
          <span
            className="absolute inset-0 flex items-center justify-center text-xs font-bold"
            style={{ fontFamily: 'Diatype, sans-serif', color: percent === 100 ? '#175242' : '#000000' }}
          >
            {percent}%
          </span>
        </div>
      </div>

      {/* Name */}
      <h3
        className="text-sm font-medium leading-snug mb-3 group-hover:opacity-80 transition-opacity"
        style={{ fontFamily: 'Diatype, sans-serif' }}
      >
        {useCase.name}
      </h3>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-bold" style={{ fontFamily: 'Diatype, sans-serif' }}>
            {useCase.hours_per_week}
          </span>
          <span className="text-xs ml-1" style={{ color: '#767676' }}>hrs/wk saved</span>
        </div>
        <span className="font-caption text-xs" style={{ color: '#89837C' }}>
          {completedTasks}/{tasks.length} tasks
        </span>
      </div>
    </Link>
  )
}
