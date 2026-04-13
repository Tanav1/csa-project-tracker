import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/status-badge'
import { PriorityBadge } from '@/components/priority-badge'
import { ProgressRing } from '@/components/progress-ring'
import { TaskManager } from '@/components/task-manager'
import type { UseCase, Task, UseCaseStatus } from '@/lib/types'
import Link from 'next/link'

export default async function UseCasePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')

  const supabase = createClient()

  const [{ data: rawUseCase }, { data: rawTasks }] = await Promise.all([
    supabase.from('use_cases').select('*').eq('id', id).single(),
    supabase.from('tasks').select('*').eq('use_case_id', id).order('created_at'),
  ])

  if (!rawUseCase) notFound()

  const useCase = rawUseCase as UseCase
  const taskList = (rawTasks ?? []) as Task[]
  const percent = taskList.length === 0 ? 0
    : Math.round(taskList.reduce((s, t) => s + t.percent_complete, 0) / taskList.length)

  async function updateStatus(formData: FormData) {
    'use server'
    const newStatus = formData.get('status') as UseCaseStatus
    const { createClient: mk } = await import('@/lib/supabase/server')
    await mk().from('use_cases').update({ status: newStatus } as never).eq('id', id)
    redirect(`/use-cases/${id}`)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F1' }}>
      {/* Nav */}
      <header className="bg-white border-b" style={{ borderColor: '#ECECEC' }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="font-caption text-xs transition-opacity hover:opacity-60"
            style={{ color: '#89837C' }}
          >
            ← Dashboard
          </Link>
          <span style={{ color: '#ECECEC' }}>·</span>
          <span className="text-lg font-bold" style={{ fontFamily: 'Diatype, sans-serif', letterSpacing: '-0.03em' }}>
            savvy
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header card */}
        <div className="bg-white rounded-lg border p-6 mb-6" style={{ borderColor: '#ECECEC' }}>
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <ProgressRing percent={percent} size={72} strokeWidth={5} />
              <span
                className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                style={{ fontFamily: 'Diatype, sans-serif', color: percent === 100 ? '#175242' : '#000000' }}
              >
                {percent}%
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <PriorityBadge priority={useCase.priority} />
                <StatusBadge status={useCase.status} />
              </div>
              <h1 className="text-xl font-bold leading-snug mb-1" style={{ fontFamily: 'Diatype, sans-serif' }}>
                {useCase.name}
              </h1>
              {useCase.problem && (
                <p className="text-sm leading-relaxed mb-1" style={{ color: '#767676' }}>
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
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t" style={{ borderColor: '#ECECEC' }}>
            <Metric label="hrs/wk saved" value={String(useCase.hours_per_week)} />
            <Metric label="hrs/qtr saved" value={String(useCase.hours_per_quarter)} />
            <Metric label="build hrs" value={String(useCase.build_hours)} />
            <Metric label="ROI" value={useCase.roi != null ? `${useCase.roi}x` : '—'} />
          </div>

          {/* Status toggle */}
          <div className="mt-4 pt-4 border-t flex items-center gap-3 flex-wrap" style={{ borderColor: '#ECECEC' }}>
            <span className="font-caption text-xs" style={{ color: '#89837C' }}>Update status</span>
            <form action={updateStatus} className="flex gap-2 flex-wrap">
              {(['Not Started', 'In Progress', 'Blocked', 'Complete'] as UseCaseStatus[]).map(s => (
                <button
                  key={s}
                  type="submit"
                  name="status"
                  value={s}
                  className="px-3 py-1 rounded text-xs font-medium border transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: useCase.status === s ? '#000000' : '#FFFFFF',
                    color: useCase.status === s ? '#FFFFFF' : '#767676',
                    borderColor: useCase.status === s ? '#000000' : '#ECECEC',
                    fontFamily: 'Diatype, sans-serif',
                  }}
                >
                  {s}
                </button>
              ))}
            </form>
          </div>
        </div>

        <TaskManager
          useCaseId={id}
          initialTasks={taskList}
          percent={percent}
          hoursPerWeek={useCase.hours_per_week}
        />
      </main>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-caption text-xs mb-0.5" style={{ color: '#89837C' }}>{label}</p>
      <p className="text-xl font-bold" style={{ fontFamily: 'Diatype, sans-serif' }}>{value}</p>
    </div>
  )
}
