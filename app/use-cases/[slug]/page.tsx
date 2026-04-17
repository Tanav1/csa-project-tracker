import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createRetoolClient } from '@/lib/supabase/retool'
import { createFormFillingClient } from '@/lib/supabase/form-filling'
import { StatusBadge } from '@/components/status-badge'
import { PriorityBadge } from '@/components/priority-badge'
import { KanbanBoard } from '@/components/kanban-board'
import { EditUseCaseForm } from '@/components/edit-use-case-form'
import { FormFillingLive, type FormFillingStats } from '@/components/form-filling-live'
import { RetoolLive, type RetoolStats } from '@/components/retool-live'
import type { UseCase, Task } from '@/lib/types'
import Link from 'next/link'

const FORM_FILLING_NAME = 'Ops Internal Form Preparation Tool'
const RETOOL_NAME       = 'Ops Tasking Prioritization Tool'

async function fetchFormFillingStats(): Promise<FormFillingStats> {
  const ff = createFormFillingClient()
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo  = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: events } = await ff
    .from('analytics_events')
    .select('event, user_email, session_id, ts, props, form_title, folder')
    .gte('ts', thirtyDaysAgo)
    .limit(10000)

  if (!events) return {
    logins_30d: 0, active_users_7d: 0, forms_opened_30d: 0,
    forms_matched_30d: 0, forms_downloaded_30d: 0, fill_rate: 0,
    dropoff_rate: 0, avg_fill_time_min: 0, return_rate: 0,
    top_forms: [], users: [],
  }

  const filtered = events.filter(e => e.user_email !== 'test@savvywealth.com')

  const loginEvents    = filtered.filter(e => e.event === 'login')
  const openEvents     = filtered.filter(e => e.event === 'form_open')
  const matchEvents    = filtered.filter(e => e.event === 'match_complete')
  const downloadEvents = filtered.filter(e => e.event === 'fill_complete')

  // Active users in last 7d
  const sevenDaysAgoMs = new Date(sevenDaysAgo).getTime()
  const activeUserSet = new Set(
    loginEvents
      .filter(e => new Date(e.ts).getTime() >= sevenDaysAgoMs)
      .map(e => e.user_email)
      .filter(Boolean)
  )

  // email → display name from login props
  const emailToName: Record<string, string> = {}
  for (const ev of loginEvents) {
    if (ev.user_email && (ev.props as { name?: string } | null)?.name) {
      emailToName[ev.user_email] = (ev.props as { name: string }).name
    }
  }

  // Per-user stats: logins, matches, downloads, last seen
  type UserAcc = { name: string; logins: number; matches: number; downloads: number; lastSeen: number }
  const userAcc: Record<string, UserAcc> = {}
  const ensureUser = (email: string) => {
    if (!userAcc[email]) {
      userAcc[email] = {
        name: emailToName[email] || email.split('@')[0],
        logins: 0, matches: 0, downloads: 0, lastSeen: 0,
      }
    }
  }
  for (const ev of loginEvents) {
    if (!ev.user_email) continue
    ensureUser(ev.user_email)
    userAcc[ev.user_email].logins++
    const t = new Date(ev.ts).getTime()
    if (t > userAcc[ev.user_email].lastSeen) userAcc[ev.user_email].lastSeen = t
  }
  for (const ev of matchEvents) {
    if (!ev.user_email) continue
    ensureUser(ev.user_email)
    userAcc[ev.user_email].matches++
    const t = new Date(ev.ts).getTime()
    if (t > userAcc[ev.user_email].lastSeen) userAcc[ev.user_email].lastSeen = t
  }
  for (const ev of downloadEvents) {
    if (!ev.user_email) continue
    ensureUser(ev.user_email)
    userAcc[ev.user_email].downloads++
    const t = new Date(ev.ts).getTime()
    if (t > userAcc[ev.user_email].lastSeen) userAcc[ev.user_email].lastSeen = t
  }
  const users = Object.entries(userAcc)
    .map(([email, u]) => ({
      email,
      name: u.name,
      logins: u.logins,
      matches: u.matches,
      downloads: u.downloads,
      last_seen: u.lastSeen > 0 ? new Date(u.lastSeen).toISOString() : '',
    }))
    .sort((a, b) => b.matches - a.matches || b.logins - a.logins)

  // Top forms: opens + matches per form_title
  const formMap: Record<string, { opens: number; matches: number; folder: string }> = {}
  for (const row of openEvents) {
    const key = row.form_title || 'Unknown'
    if (!formMap[key]) formMap[key] = { opens: 0, matches: 0, folder: row.folder || '' }
    formMap[key].opens++
  }
  for (const row of matchEvents) {
    const key = row.form_title || 'Unknown'
    if (!formMap[key]) formMap[key] = { opens: 0, matches: 0, folder: row.folder || '' }
    formMap[key].matches++
  }
  const topForms = Object.entries(formMap)
    .map(([form_title, d]) => ({
      form_title,
      folder: d.folder,
      opens: d.opens,
      matches: d.matches,
      fill_rate: d.opens > 0 ? Math.round((d.matches / d.opens) * 100) : 0,
    }))
    .sort((a, b) => b.opens - a.opens)
    .slice(0, 10)

  // Drop-off: sessions with form_open but no match_complete
  const sessionsWithOpen  = new Set(openEvents.map(e => e.session_id).filter(Boolean) as string[])
  const sessionsWithMatch = new Set(matchEvents.map(e => e.session_id).filter(Boolean) as string[])
  const droppedCount = [...sessionsWithOpen].filter(s => !sessionsWithMatch.has(s)).length
  const dropoff_rate = sessionsWithOpen.size > 0
    ? Math.round((droppedCount / sessionsWithOpen.size) * 100)
    : 0

  // Avg time-to-fill: form_open → fill_complete matched by session_id
  const sessionOpenTs: Record<string, number> = {}
  for (const ev of openEvents) {
    if (ev.session_id) sessionOpenTs[ev.session_id] = new Date(ev.ts).getTime()
  }
  const fillDeltas: number[] = []
  for (const ev of downloadEvents) {
    if (!ev.session_id) continue
    const openTs = sessionOpenTs[ev.session_id]
    if (!openTs) continue
    const delta = (new Date(ev.ts).getTime() - openTs) / 60000
    if (delta > 0 && delta < 120) fillDeltas.push(delta)
  }
  const avg_fill_time_min = fillDeltas.length > 0
    ? Math.round(fillDeltas.reduce((a, b) => a + b, 0) / fillDeltas.length)
    : 0

  // Return rate: % of users active last 7d who were also active in the prior period
  const recentActiveUsers = new Set(
    filtered
      .filter(e => e.user_email && new Date(e.ts).getTime() >= sevenDaysAgoMs)
      .map(e => e.user_email as string)
  )
  const priorActiveUsers = new Set(
    filtered
      .filter(e => e.user_email && new Date(e.ts).getTime() < sevenDaysAgoMs)
      .map(e => e.user_email as string)
  )
  const returningCount = [...recentActiveUsers].filter(u => priorActiveUsers.has(u)).length
  const return_rate = recentActiveUsers.size > 0
    ? Math.round((returningCount / recentActiveUsers.size) * 100)
    : 0

  return {
    logins_30d: loginEvents.length,
    active_users_7d: activeUserSet.size,
    forms_opened_30d: openEvents.length,
    forms_matched_30d: matchEvents.length,
    forms_downloaded_30d: downloadEvents.length,
    fill_rate: openEvents.length > 0 ? Math.round((matchEvents.length / openEvents.length) * 100) : 0,
    dropoff_rate,
    avg_fill_time_min,
    return_rate,
    top_forms: topForms,
    users,
  }
}

async function fetchRetoolStats(): Promise<RetoolStats> {
  const retool = createRetoolClient()
  const { data } = await retool
    .from('task_internal')
    .select('internal_status')
    .limit(5000)

  if (!data) return { total: 0, by_status: [] }

  const ORDERED_STATUSES = [
    'default', 'in_process', 'pending_client_signature', 'client_viewed',
    'docs_sent_to_custodian', 'pending_custodian', 'pending_settlement',
    'pending_advisor', 'needs_more_info', 'paused', 'completed',
  ]

  const counts: Record<string, number> = {}
  for (const row of data) {
    const s = row.internal_status ?? 'default'
    counts[s] = (counts[s] ?? 0) + 1
  }

  const by_status = ORDERED_STATUSES
    .filter(s => counts[s])
    .map(s => ({ status: s, count: counts[s] }))

  return { total: data.length, by_status }
}

export default async function UseCasePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const [{ slug }, { tab }] = await Promise.all([params, searchParams])
  const activeTab = tab === 'adoption' ? 'adoption' : 'details'

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

  const isFormFilling = useCase.name === FORM_FILLING_NAME
  const isRetool      = useCase.name === RETOOL_NAME
  const hasAdoptionTab = isFormFilling || isRetool

  // Only fetch live data when the adoption tab is active
  const [formFillingStats, retoolStats] = await Promise.all([
    (isFormFilling && activeTab === 'adoption') ? fetchFormFillingStats() : Promise.resolve(null),
    (isRetool      && activeTab === 'adoption') ? fetchRetoolStats()      : Promise.resolve(null),
  ])

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

        {/* Tab nav */}
        {hasAdoptionTab && (
          <div
            className="flex gap-0 mb-6 border-b"
            style={{ borderColor: '#ECECEC' }}
          >
            <Link
              href={`/use-cases/${slug}`}
              className="px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors"
              style={{
                borderColor: activeTab === 'details' ? '#1A1A1A' : 'transparent',
                color: activeTab === 'details' ? '#1A1A1A' : '#89837C',
              }}
            >
              Project Details
            </Link>
            <Link
              href={`/use-cases/${slug}?tab=adoption`}
              className="px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors"
              style={{
                borderColor: activeTab === 'adoption' ? '#1A1A1A' : 'transparent',
                color: activeTab === 'adoption' ? '#1A1A1A' : '#89837C',
              }}
            >
              Project Adoption
            </Link>
          </div>
        )}

        {/* Tab content */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#ECECEC' }}>
            <KanbanBoard
              useCaseId={useCase.id}
              initialTasks={taskList}
              hoursPerWeek={useCase.hours_per_week}
            />
          </div>
        )}

        {activeTab === 'adoption' && (
          <>
            {formFillingStats && <FormFillingLive stats={formFillingStats} />}
            {retoolStats      && <RetoolLive      stats={retoolStats} />}
          </>
        )}
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
