import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/status-badge'
import { PriorityBadge } from '@/components/priority-badge'
import { KanbanBoard } from '@/components/kanban-board'
import { EditUseCaseForm } from '@/components/edit-use-case-form'
import type { UseCase, Task } from '@/lib/types'
import Link from 'next/link'

export default async function UseCasePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')

  const supabase = createClient()

  const { data: rawUseCase } = await supabase
    .from('use_cases').select('*').eq('slug', slug).single()

  if (!rawUseCase) notFound()

  const useCase = rawUseCase as UseCase

  const { data: rawTasks } = await supabase
    .from('tasks').select('*').eq('use_case_id', useCase.id).order('created_at')

  const taskList = (rawTasks ?? []) as Task[]

  const percent =
    taskList.length === 0
      ? 0
      : Math.round(taskList.reduce((s, t) => s + t.percent_complete, 0) / taskList.length)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F1' }}>
      {/* Nav */}
      <header className="bg-white border-b" style={{ borderColor: '#ECECEC' }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-caption text-xs transition-opacity hover:opacity-60"
              style={{ color: '#89837C' }}
            >
              ← Dashboard
            </Link>
            <span style={{ color: '#ECECEC' }}>·</span>
            <span
              className="text-lg font-bold"
              style={{ fontFamily: 'Diatype, sans-serif', letterSpacing: '-0.03em' }}
            >
              savvy
            </span>
          </div>
          <EditUseCaseForm useCase={useCase} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header card */}
        <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#ECECEC' }}>
          {/* Badges + title */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <PriorityBadge priority={useCase.priority} />
            <StatusBadge status={useCase.status} />
          </div>
          <h1
            className="text-xl font-bold leading-snug mb-3"
            style={{ fontFamily: 'Diatype, sans-serif' }}
          >
            {useCase.name}
          </h1>

          {/* Problem / solution */}
          {(useCase.problem || useCase.solution) && (
            <div className="space-y-1 mb-5">
              {useCase.problem && (
                <p className="text-sm leading-relaxed" style={{ color: '#767676' }}>
                  {useCase.problem}
                </p>
              )}
              {useCase.solution && (
                <p className="text-sm leading-relaxed" style={{ color: '#89837C' }}>
                  <span className="font-medium text-black">Solution: </span>
                  {useCase.solution}
                </p>
              )}
            </div>
          )}

          {/* Metrics row */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t"
            style={{ borderColor: '#ECECEC' }}
          >
            <Metric label="hrs/wk saved" value={fmtNum(useCase.hours_per_week)} />
            <Metric label="hrs/qtr saved" value={fmtNum(useCase.hours_per_quarter)} />
            <Metric label="build hrs" value={fmtNum(useCase.build_hours)} />
            <Metric label="ROI" value={useCase.roi != null ? `${useCase.roi}x` : '—'} />
          </div>

          {/* Progress bar */}
          <div className="mt-5 pt-5 border-t" style={{ borderColor: '#ECECEC' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-caption text-xs" style={{ color: '#89837C' }}>
                Overall progress
              </span>
              <span
                className="text-sm font-bold"
                style={{ fontFamily: 'Diatype, sans-serif', color: percent === 100 ? '#175242' : '#000' }}
              >
                {percent}%
              </span>
            </div>
            <div className="h-1.5 rounded-full w-full" style={{ backgroundColor: '#ECECEC' }}>
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${percent}%`,
                  backgroundColor: percent === 100 ? '#175242' : percent > 0 ? '#D79F32' : '#ECECEC',
                }}
              />
            </div>
          </div>
        </div>

        {/* Kanban board */}
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#ECECEC' }}>
          <KanbanBoard
            useCaseId={useCase.id}
            initialTasks={taskList}
            hoursPerWeek={useCase.hours_per_week}
          />
        </div>
      </main>
    </div>
  )
}

function fmtNum(n: number | null | undefined): string {
  if (n == null) return '—'
  return n % 1 === 0 ? String(n) : n.toFixed(1)
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-caption text-xs mb-0.5" style={{ color: '#89837C' }}>{label}</p>
      <p className="text-xl font-bold" style={{ fontFamily: 'Diatype, sans-serif' }}>{value}</p>
    </div>
  )
}
