import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UseCaseCard } from '@/components/use-case-card'
import type { UseCase, Task } from '@/lib/types'
import { DashboardFilters } from '@/components/dashboard-filters'

const ADMIN_EMAIL = 'tanav.thanjavuru@savvywealth.com'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; tab?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const filters = await searchParams
  const statusFilter = filters.status ?? 'all'
  const priorityFilter = filters.priority ?? 'all'
  const isAdmin = session.user.email === ADMIN_EMAIL
  const activeTab = isAdmin && filters.tab === 'metrics' ? 'metrics' : 'overview'

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
  const activeCount = allUseCases.filter(u => u.status === 'In Progress').length

  // Tasks for ALL use cases (unfiltered) — needed for aggregate metrics
  const allIds = allUseCases.map(u => u.id)
  const { data: rawAllTasks } = allIds.length > 0
    ? await supabase.from('tasks').select('*').in('use_case_id', allIds)
    : { data: [] }
  const allUseCaseTasks = (rawAllTasks ?? []) as Task[]

  function allTasksFor(id: string): Task[] {
    return allUseCaseTasks.filter(t => t.use_case_id === id)
  }

  const potentialHrs = allUseCases.reduce((s, u) => s + (u.hours_per_week ?? 0), 0)
  const realizedHrs  = allUseCases.reduce((s, u) => {
    const pct = allUseCaseTasks.length > 0
      ? (() => { const t = allTasksFor(u.id); return t.length === 0 ? 0 : Math.round(t.reduce((a, b) => a + b.percent_complete, 0) / t.length) })()
      : 0
    return s + (u.hours_per_week ?? 0) * (pct / 100)
  }, 0)

  // Log this visit (non-blocking — don't await result)
  void supabase.from('dashboard_opens').insert({
    user_email: session.user.email ?? '',
    user_name: session.user.name ?? null,
  })

  // Admin: fetch per-user visit summary for the last 90 days
  let opensByUser: { user_email: string; user_name: string | null; visits: number; last_seen: string }[] = []
  if (isAdmin) {
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    const { data: opensData } = await supabase
      .from('dashboard_opens')
      .select('user_email, user_name, opened_at')
      .gte('opened_at', since)
      .order('opened_at', { ascending: false })

    if (opensData) {
      const map = new Map<string, { user_name: string | null; visits: number; last_seen: string }>()
      for (const row of opensData) {
        const existing = map.get(row.user_email)
        if (!existing) {
          map.set(row.user_email, { user_name: row.user_name, visits: 1, last_seen: row.opened_at })
        } else {
          existing.visits++
          if (row.opened_at > existing.last_seen) existing.last_seen = row.opened_at
        }
      }
      opensByUser = Array.from(map.entries())
        .map(([user_email, v]) => ({ user_email, ...v }))
        .sort((a, b) => b.visits - a.visits)
    }
  }

  function tasksFor(id: string): Task[] {
    return allTasks.filter(t => t.use_case_id === id)
  }

  function calcPercent(tasks: Task[]) {
    if (tasks.length === 0) return 0
    return Math.round(tasks.reduce((s, t) => s + t.percent_complete, 0) / tasks.length)
  }


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

        {/* Metrics — two rows: potential and realized */}
        <div
          className="mb-8 pb-8 border-b animate-fade-up"
          style={{ borderColor: '#ECECEC', animationDelay: '60ms' }}
        >
          {/* Row 1: Potential (at full completion) */}
          <div className="mb-1">
            <p className="font-caption text-xs mb-3" style={{ color: '#B2AAA1' }}>Potential — at full completion</p>
            <div className="flex flex-wrap items-start gap-0">
              <MetricStrip label="hrs / week" value={fmtNum(potentialHrs)} />
              <div className="w-px self-stretch mx-8 hidden sm:block" style={{ backgroundColor: '#ECECEC' }} />
              <MetricStrip label="hrs / quarter" value={fmtNum(potentialHrs * 13)} />
              <div className="w-px self-stretch mx-8 hidden sm:block" style={{ backgroundColor: '#ECECEC' }} />
              <MetricStrip label="hrs / year" value={fmtNum(potentialHrs * 52)} />
              <div className="w-px self-stretch mx-8 hidden sm:block" style={{ backgroundColor: '#ECECEC' }} />
              <MetricStrip label="use cases" value={String(allUseCases.length)} small />
              <div className="w-px self-stretch mx-8 hidden sm:block" style={{ backgroundColor: '#ECECEC' }} />
              <MetricStrip label="in progress" value={String(activeCount)} small />
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 border-t" style={{ borderColor: '#F5F0EB' }} />

          {/* Row 2: Realized today (weighted by completion) */}
          <div>
            <p className="font-caption text-xs mb-3" style={{ color: '#B2AAA1' }}>Realized today — weighted by completion</p>
            <div className="flex flex-wrap items-start gap-0">
              <MetricStrip label="hrs / week" value={fmtNum(realizedHrs)} accent />
              <div className="w-px self-stretch mx-8 hidden sm:block" style={{ backgroundColor: '#ECECEC' }} />
              <MetricStrip label="hrs / quarter" value={fmtNum(realizedHrs * 13)} accent />
              <div className="w-px self-stretch mx-8 hidden sm:block" style={{ backgroundColor: '#ECECEC' }} />
              <MetricStrip label="hrs / year" value={fmtNum(realizedHrs * 52)} accent />
            </div>
          </div>
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <>
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
          </>
        )}

        {/* Metrics tab — admin only */}
        {activeTab === 'metrics' && isAdmin && (
          <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <h2
              className="text-xl font-bold mb-1"
              style={{ fontFamily: 'Diatype, sans-serif', letterSpacing: '-0.03em' }}
            >
              Dashboard opens
            </h2>
            <p className="font-caption text-xs mb-8" style={{ color: '#89837C' }}>Last 90 days — who has viewed this dashboard</p>

            {opensByUser.length === 0 ? (
              <p className="font-caption text-xs" style={{ color: '#B2AAA1' }}>No visits recorded yet. Check back after others have opened the dashboard.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b" style={{ borderColor: '#ECECEC' }}>
                      <th className="text-left font-caption text-xs pb-2 pr-8" style={{ color: '#89837C' }}>User</th>
                      <th className="text-left font-caption text-xs pb-2 pr-8" style={{ color: '#89837C' }}>Email</th>
                      <th className="text-right font-caption text-xs pb-2 pr-8" style={{ color: '#89837C' }}>Visits</th>
                      <th className="text-right font-caption text-xs pb-2" style={{ color: '#89837C' }}>Last seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opensByUser.map(row => (
                      <tr key={row.user_email} className="border-b" style={{ borderColor: '#F5F0EB' }}>
                        <td className="py-3 pr-8" style={{ fontFamily: 'Diatype, sans-serif' }}>
                          {row.user_name ?? '—'}
                        </td>
                        <td className="py-3 pr-8 font-caption text-xs" style={{ color: '#767676' }}>
                          {row.user_email}
                        </td>
                        <td className="py-3 pr-8 text-right font-bold" style={{ fontFamily: 'Diatype, sans-serif' }}>
                          {row.visits}
                        </td>
                        <td className="py-3 text-right font-caption text-xs" style={{ color: '#89837C' }}>
                          {new Date(row.last_seen).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
  accent = false,
  small = false,
}: {
  label: string
  value: string
  accent?: boolean
  small?: boolean
}) {
  return (
    <div className="py-1">
      <p className="font-caption text-xs mb-2" style={{ color: '#89837C' }}>{label}</p>
      <span
        className="font-bold leading-none"
        style={{
          fontFamily: 'Diatype, sans-serif',
          fontSize: small ? '1.5rem' : '2.5rem',
          letterSpacing: '-0.03em',
          color: accent ? '#175242' : '#1A1A1A',
        }}
      >
        {value}
      </span>
    </div>
  )
}
