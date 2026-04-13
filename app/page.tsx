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

  // Filtered use cases
  let query = supabase.from('use_cases').select('*').order('display_order')
  if (statusFilter !== 'all') query = query.eq('status', statusFilter)
  if (priorityFilter !== 'all') query = query.eq('priority', priorityFilter)
  const { data: rawUseCases } = await query
  const useCases = (rawUseCases ?? []) as UseCase[]

  // Tasks for visible use cases
  const useCaseIds = useCases.map(u => u.id)
  const { data: rawTasks } = useCaseIds.length > 0
    ? await supabase.from('tasks').select('*').in('use_case_id', useCaseIds)
    : { data: [] }
  const allTasks = (rawTasks ?? []) as Task[]

  // Unfiltered totals for metrics header
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
          <span className="text-lg font-bold" style={{ fontFamily: 'Diatype, sans-serif', letterSpacing: '-0.03em' }}>
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

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <p className="font-caption text-xs mb-1" style={{ color: '#89837C' }}>CSA Automation</p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Diatype, sans-serif' }}>
            Efficiency Dashboard
          </h1>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total hrs/wk saved" value={fmtNum(totalHrsPerWeek)} unit="hrs" />
          <MetricCard
            label="Effective hrs/wk"
            value={fmtNum(effectiveHrs)}
            unit="hrs"
            sub="weighted by completion"
          />
          <MetricCard label="Use cases" value={String(allUseCases.length)} unit="total" />
          <MetricCard label="Active projects" value={String(activeCount)} unit="in progress" />
        </div>

        {/* Filters */}
        <DashboardFilters currentStatus={statusFilter} currentPriority={priorityFilter} />

        {/* Grid */}
        {useCases.length === 0 ? (
          <div className="text-center py-16" style={{ color: '#89837C' }}>
            No use cases match the selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {useCases.map(uc => (
              <UseCaseCard key={uc.id} useCase={uc} tasks={tasksFor(uc.id)} />
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

function MetricCard({ label, value, unit, sub }: { label: string; value: string; unit: string; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#ECECEC' }}>
      <p className="font-caption text-xs mb-2" style={{ color: '#89837C' }}>{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold" style={{ fontFamily: 'Diatype, sans-serif' }}>{value}</span>
        <span className="text-xs" style={{ color: '#767676' }}>{unit}</span>
      </div>
      {sub && <p className="font-caption text-xs mt-1" style={{ color: '#B2AAA1' }}>{sub}</p>}
    </div>
  )
}
