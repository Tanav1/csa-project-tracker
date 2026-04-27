import Link from 'next/link'
import type { UseCase, Task } from '@/lib/types'

const STATUS_ACCENT: Record<string, string> = {
  'Complete':    '#175242',
  'In Progress': '#D79F32',
  'Blocked':     '#B63D35',
  'Not Started': '#D3CDC4',
}

function calcPercent(tasks: Task[]): number {
  if (tasks.length === 0) return 0
  return Math.round(tasks.reduce((s, t) => s + t.percent_complete, 0) / tasks.length)
}

function fmtNum(n: number): string {
  if (n % 1 === 0) return String(n)
  return parseFloat(n.toFixed(1)).toString()
}

export function UseCaseCard({ useCase, tasks }: { useCase: UseCase; tasks: Task[] }) {
  const percent = calcPercent(tasks)
  const done = tasks.filter(t => t.is_complete || t.percent_complete === 100).length
  const accent = STATUS_ACCENT[useCase.status] ?? '#D3CDC4'
  const potential = useCase.hours_per_week ?? 0
  const realized = parseFloat((potential * percent / 100).toFixed(1))

  return (
    <Link
      href={`/use-cases/${useCase.slug ?? useCase.id}`}
      className="group flex flex-col bg-white rounded-xl overflow-hidden card-lift"
    >
      {/* Status accent stripe */}
      <div className="h-[3px] w-full flex-shrink-0" style={{ backgroundColor: accent }} />

      <div className="flex flex-col flex-1 p-5">
        {/* Meta row */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-caption text-xs" style={{ color: '#89837C' }}>
            {useCase.priority} · {useCase.status}
          </span>
          <span className="font-caption text-xs" style={{ color: '#B2AAA1' }}>
            {done}/{tasks.length} tasks
          </span>
        </div>

        {/* Name */}
        <h3
          className="flex-1 text-sm font-medium leading-snug mb-5"
          style={{ fontFamily: 'Diatype, sans-serif' }}
        >
          {useCase.name}
        </h3>

        {/* Metrics: potential + realized */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-caption text-xs mb-0.5" style={{ color: '#B2AAA1' }}>potential</p>
            <div className="flex items-baseline gap-1">
              <span
                className="font-bold leading-none"
                style={{ fontFamily: 'Diatype, sans-serif', fontSize: '1.75rem', letterSpacing: '-0.02em' }}
              >
                {fmtNum(potential)}
              </span>
              <span className="text-xs" style={{ color: '#767676' }}>hrs/wk</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-caption text-xs mb-0.5" style={{ color: '#B2AAA1' }}>realized today</p>
            <div className="flex items-baseline gap-1 justify-end">
              <span
                className="font-bold leading-none"
                style={{
                  fontFamily: 'Diatype, sans-serif',
                  fontSize: '1.25rem',
                  letterSpacing: '-0.02em',
                  color: realized > 0 ? '#175242' : '#D3CDC4',
                }}
              >
                {fmtNum(realized)}
              </span>
              <span className="text-xs" style={{ color: '#B2AAA1' }}>hrs/wk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] w-full flex-shrink-0" style={{ backgroundColor: '#F5F2EC' }}>
        <div
          className="h-full"
          style={{
            width: `${percent}%`,
            backgroundColor: percent === 0 ? 'transparent' : accent,
            transition: 'width 600ms cubic-bezier(0.22,1,0.36,1)',
          }}
        />
      </div>
    </Link>
  )
}
