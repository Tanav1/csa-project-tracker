interface TopForm {
  form_title: string
  folder: string
  opens: number
  matches: number
  fill_rate: number
}

export interface UserStat {
  email: string
  name: string
  logins: number
  matches: number    // match_complete — AI successfully filled
  downloads: number  // fill_complete — user accepted/downloaded
  last_seen: string
}

export interface FormFillingStats {
  logins_30d: number
  active_users_7d: number
  forms_opened_30d: number
  forms_matched_30d: number    // match_complete
  forms_downloaded_30d: number // fill_complete
  fill_rate: number            // match_complete / form_open
  dropoff_rate: number         // sessions with open but no match, as %
  avg_fill_time_min: number    // median minutes from form_open to fill_complete
  return_rate: number          // % of last-7d users who were also active before
  top_forms: TopForm[]
  users: UserStat[]
}

function fmtDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function FormFillingLive({ stats }: { stats: FormFillingStats }) {
  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#ECECEC' }}>
        <div className="flex items-center gap-2 mb-5">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#E8F3F0', color: '#175242' }}
          >
            live
          </span>
          <h2
            className="text-sm font-semibold"
            style={{ fontFamily: 'Diatype, sans-serif', color: '#1A1A1A' }}
          >
            Form Filling Usage
          </h2>
          <span className="font-caption text-xs ml-auto" style={{ color: '#89837C' }}>
            last 30 days
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Tile label="logins" value={stats.logins_30d} definition="Total login events in the last 30 days. One user logging in multiple times counts separately." />
          <Tile label="active users (7d)" value={stats.active_users_7d} definition="Unique users who logged in at least once in the past 7 days." />
          <Tile label="forms opened" value={stats.forms_opened_30d} definition="Forms uploaded or selected for AI filling in the last 30 days." />
          <Tile label="fills" value={stats.forms_matched_30d} definition="Forms where the AI completed field matching (match_complete event). The form was successfully processed." />
          <Tile label="fill rate" value={`${stats.fill_rate}%`} highlight={stats.fill_rate >= 80} definition="Percentage of opened forms that resulted in a successful AI fill. Higher is better — below 80% suggests extraction issues." />
          <Tile label="downloaded" value={stats.forms_downloaded_30d} definition="Forms the user accepted and downloaded with AI-filled fields applied (fill_complete event)." />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-5 mt-5 border-t" style={{ borderColor: '#ECECEC' }}>
          <Tile label="drop-off rate" value={`${stats.dropoff_rate}%`} highlight={stats.dropoff_rate <= 20} definition="% of form sessions where a form was opened but the AI never completed a fill. High values suggest friction or extraction failures on certain form types." />
          <Tile label="avg time-to-fill" value={stats.avg_fill_time_min > 0 ? `${stats.avg_fill_time_min}m` : '—'} definition="Average minutes from opening a form to downloading it. Lower means the tool is speeding up the workflow effectively." />
          <Tile label="return rate (7d)" value={`${stats.return_rate}%`} highlight={stats.return_rate >= 70} definition="% of users active this week who also used the tool in a prior period. High return rate means the tool is becoming a habit, not a one-off." />
        </div>
      </div>

      {/* User activity */}
      {stats.users.length > 0 && (
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#ECECEC' }}>
          <p
            className="text-sm font-semibold mb-4"
            style={{ fontFamily: 'Diatype, sans-serif', color: '#1A1A1A' }}
          >
            User Activity
          </p>
          <div className="w-full">
            <div
              className="grid text-xs pb-2 border-b"
              style={{
                gridTemplateColumns: '1fr 60px 72px 80px 80px',
                color: '#89837C',
                borderColor: '#ECECEC',
              }}
            >
              <span>Name</span>
              <span className="text-right">Logins</span>
              <span className="text-right">Fills</span>
              <span className="text-right">Downloads</span>
              <span className="text-right">Last seen</span>
            </div>
            {stats.users.map((u) => (
              <div
                key={u.email}
                className="grid items-center py-2.5 border-b last:border-0"
                style={{
                  gridTemplateColumns: '1fr 60px 72px 80px 80px',
                  borderColor: '#ECECEC',
                }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#1A1A1A' }}>
                    {u.name}
                  </p>
                  <p className="font-caption text-xs truncate" style={{ color: '#89837C' }}>
                    {u.email}
                  </p>
                </div>
                <span
                  className="text-sm text-right"
                  style={{ color: '#1A1A1A' }}
                >
                  {u.logins || '—'}
                </span>
                <span
                  className="text-sm font-semibold text-right"
                  style={{ fontFamily: 'Diatype, sans-serif', color: u.matches > 0 ? '#175242' : '#89837C' }}
                >
                  {u.matches || '—'}
                </span>
                <span
                  className="text-sm text-right"
                  style={{ color: '#1A1A1A' }}
                >
                  {u.downloads || '—'}
                </span>
                <span
                  className="font-caption text-xs text-right"
                  style={{ color: '#89837C' }}
                >
                  {fmtDate(u.last_seen)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top forms */}
      {stats.top_forms.length > 0 && (
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#ECECEC' }}>
          <p
            className="text-sm font-semibold mb-4"
            style={{ fontFamily: 'Diatype, sans-serif', color: '#1A1A1A' }}
          >
            Top Forms
          </p>
          {/* Header */}
          <div
            className="grid text-xs pb-2 border-b"
            style={{
              gridTemplateColumns: '1fr 60px 60px 72px',
              color: '#89837C',
              borderColor: '#ECECEC',
            }}
          >
            <span>Form</span>
            <span className="text-right">Opens</span>
            <span className="text-right">Fills</span>
            <span className="text-right">Fill rate</span>
          </div>
          {stats.top_forms.map((f) => (
            <div
              key={f.form_title}
              className="grid items-center py-2.5 border-b last:border-0"
              style={{
                gridTemplateColumns: '1fr 60px 60px 72px',
                borderColor: '#ECECEC',
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="text-xs px-1.5 py-0.5 rounded shrink-0"
                  style={{
                    backgroundColor: f.folder === 'schwab' ? '#F0F4FF' : '#FFF8E8',
                    color: f.folder === 'schwab' ? '#3B5BDB' : '#92650A',
                    fontFamily: 'monospace',
                  }}
                >
                  {f.folder || '—'}
                </span>
                <span className="text-sm truncate" style={{ color: '#1A1A1A' }}>
                  {f.form_title}
                </span>
              </div>
              <span className="text-sm text-right" style={{ color: '#1A1A1A' }}>
                {f.opens}
              </span>
              <span
                className="text-sm font-semibold text-right"
                style={{ fontFamily: 'Diatype, sans-serif', color: '#175242' }}
              >
                {f.matches}
              </span>
              <span
                className="text-sm text-right"
                style={{ color: f.fill_rate >= 100 ? '#175242' : '#1A1A1A' }}
              >
                {f.fill_rate}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Tile({ label, value, highlight, definition }: {
  label: string
  value: string | number
  highlight?: boolean
  definition?: string
}) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5">
        <p className="font-caption text-xs" style={{ color: '#89837C' }}>{label}</p>
        {definition && (
          <div className="relative group/tip">
            <span
              className="font-caption text-xs leading-none cursor-default select-none"
              style={{ color: '#C8C2BB' }}
            >
              ?
            </span>
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 px-3 py-2 rounded-lg text-xs leading-snug opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity duration-150 z-20"
              style={{ backgroundColor: '#1A1A1A', color: '#F5F2EC' }}
            >
              {definition}
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #1A1A1A' }}
              />
            </div>
          </div>
        )}
      </div>
      <p
        className="text-xl font-bold"
        style={{ fontFamily: 'Diatype, sans-serif', color: highlight ? '#175242' : '#1A1A1A' }}
      >
        {value}
      </p>
    </div>
  )
}
