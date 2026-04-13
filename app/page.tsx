import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UseCaseCard } from '@/components/use-case-card'
import type { UseCase, Task } from '@/lib/types'
import { DashboardFilters } from '@/components/dashboard-filters'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const filters = await searchParams
  const statusFilter = filters.status ?? 'all'
  const priorityFilter = filters.priority ?? 'all'

  const supabase = createClient()

  let query = supabase.from('use_cases').select('*').order('display_order')
  if (statusFilter !== 'all') query = query.eq('status', statusFilter)
  if (priorityFilter !== 'all') query = query.eq('priority', priorityFilter)
  const { data: rawUseCases } = await query
  const useCases = (rawUseCases ?? []) as UseCase[]

  const useCaseIds = useCases.map(u => u.id)
  const { data: rawTasks } = useCaseIds.length > 0
    ? await supabase.from('tasks').select('*').in('use_case_id', useCaseIds)
    : { data: [] }
  const allTasks = (rawTasks ?? []) as Task[]

  const { data: rawAll } = await supabase.from('use_cases').select('*')
  const allUseCases = (rawAll ?? []) as UseCase[]
  const totalHrsPerWeek = allUseCases.reduce((s, u) => s + (u.hours_per_week ?? 0), 0)
  const activeCount = allUseCases.filter(u => u.status === 'In Progress').length

  function tasksFor(id: string): Task[] {
    return allTasks.filter(t => t.use_case_id === id)
  }

  function calcPercent(tasks: Task[]) {
    if (tasks.length === 0) return 0
    return Math.round(tasks.reduce((s, t) => s + t.percent_complete, 0) / tasks.length)
  }

  const effectiveHrs = useCases.reduce((s, u) => {
    return s + (u.hours_per_week ?? 0) * (calcPercent(tasksFor(u.id)) / 100)
  }, 0)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F1' }}>
      {/* Nav */}
      <header className="bg-white border-b" style={{ borderColor: '#ECECEC' }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span
            className="text-lg font-bold"
            style={{ fontFamily: 'Diatype, sans-serif', letterSpacing: '-0.03em' }}
          >
            savvy
          </span>
          <div className="flex items-center gap-4">
            <span className="font-caption text-xs hidden sm:block" style={{ color: '#89837C' }}>
              {session.user.email}
            </span>
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/login' })
              }}
            >
              <button
                type="submit"
                className="font-caption text-xs px-3 py-1.5 rounded border transition-colors hover:bg-gray-50"
                style={{ borderColor: '#ECECEC', color: '#767676' }}
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Editorial title */}
        <div className="mb-8 animate-fade-up">
          <p className="font-caption text-xs mb-2" style={{ color: '#89837C' }}>CSA Automation</p>
          <h1
            className="text-3xl font-bold leading-tight"
            style={{ fontFamily: 'Diatype, sans-serif', letterSpacing: '-0.03em' }}
          >
            Efficiency Dashboard
          </h1>
        </div>

        {/* Metrics strip — editorial, no boxes */}
        <div
          className="flex flex-wrap items-start gap-0 mb-8 pb-8 border-b animate-fade-up"
          style={{ borderColor: '#ECECEC', animationDelay: '60ms' }}
        >
          <MetricStrip
            label="Total hrs/wk saved"
            value={fmtNum(totalHrsPerWeek)}
            unit="hrs"
          />
          <div className="w-px self-stretch mx-8 hidden sm:block" style={{ backgroundColor: '#ECECEC' }} />
          <MetricStrip
            label="Effective hrs/wk"
            value={fmtNum(effectiveHrs)}
            unit="hrs"
            sub="weighted by completion"
          />
          <div className="w-px self-stretch mx-8 hidden sm:block" style={{ backgroundColor: '#ECECEC' }} />
          <MetricStrip
            label="Use cases"
            value={String(allUseCases.length)}
            unit="total"
          />
          <div className="w-px self-stretch mx-8 hidden sm:block" style={{ backgroundColor: '#ECECEC' }} />
          <MetricStrip
            label="Active"
            value={String(activeCount)}
            unit="in progress"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <DashboardFilters currentStatus={statusFilter} currentPriority={priorityFilter} />
        </div>

        {/* Grid */}
        {useCases.length === 0 ? (
          <div
            className="text-center py-20 font-caption text-xs animate-fade-up"
            style={{ color: '#89837C', animationDelay: '140ms' }}
          >
            No use cases match the selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc, i) => (
              <div
                key={uc.id}
                className="animate-fade-up"
                style={{ animationDelay: `${140 + i * 40}ms` }}
              >
                <UseCaseCard useCase={uc} tasks={tasksFor(uc.id)} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function fmtNum(n: number): string {
  if (n % 1 === 0) return String(n)
  return parseFloat(n.toFixed(1)).toString()
}

function MetricStrip({
  label,
  value,
  unit,
  sub,
}: {
  label: string
  value: string
  unit: string
  sub?: string
}) {
  return (
    <div className="py-1">
      <p className="font-caption text-xs mb-2" style={{ color: '#89837C' }}>{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span
          className="font-bold leading-none"
          style={{ fontFamily: 'Diatype, sans-serif', fontSize: '2.5rem', letterSpacing: '-0.03em' }}
        >
          {value}
        </span>
        <span className="text-sm" style={{ color: '#767676' }}>{unit}</span>
      </div>
      {sub && (
        <p className="font-caption text-xs mt-1" style={{ color: '#B2AAA1' }}>{sub}</p>
      )}
    </div>
  )
}
