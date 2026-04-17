export interface RetoolStats {
  active_users: number
  total_time_mins: number
  sessions: number
  status_changes: number
  per_user: {
    email: string
    time_spent_mins: number
    status_changes: number
    sessions: number
    last_seen: string | null
  }[]
}

function fmtTime(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

function fmtLastSeen(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function RetoolLive({ stats }: { stats: RetoolStats }) {
  return (
    <div className="bg-white rounded-xl border p-6 mt-6" style={{ borderColor: '#ECECEC' }}>
      {/* Header */}
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
          Usage Metrics
        </h2>
      </div>

      {/* Summary tiles */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-5 border-b"
        style={{ borderColor: '#ECECEC' }}
      >
        <Tile label="Active Users" value={String(stats.active_users)} />
        <Tile label="Time on Platform" value={fmtTime(stats.total_time_mins)} />
        <Tile label="Sessions" value={String(stats.sessions)} />
        <Tile label="Status Changes" value={String(stats.status_changes)} />
      </div>

      {/* Per-user table */}
      {stats.per_user.length > 0 && (
        <div className="mt-5">
          <p className="font-caption text-xs mb-3" style={{ color: '#89837C' }}>
            PER-USER ACTIVITY
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #ECECEC' }}>
                  {['User', 'Time on Platform', 'Status Changes', 'Sessions', 'Last Seen'].map(h => (
                    <th
                      key={h}
                      className="text-left py-2 pr-4 font-caption text-xs whitespace-nowrap"
                      style={{ color: '#89837C' }}
                    >
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.per_user.map(u => (
                  <tr key={u.email} style={{ borderBottom: '1px solid #F5F5F4' }}>
                    <td className="py-2 pr-4 max-w-[180px] truncate" style={{ color: '#1A1A1A' }}>
                      {u.email}
                    </td>
                    <td className="py-2 pr-4 font-medium" style={{ color: '#1A1A1A' }}>
                      {fmtTime(u.time_spent_mins)}
                    </td>
                    <td className="py-2 pr-4" style={{ color: '#1A1A1A' }}>
                      {u.status_changes}
                    </td>
                    <td className="py-2 pr-4" style={{ color: '#1A1A1A' }}>
                      {u.sessions}
                    </td>
                    <td className="py-2 pr-4 whitespace-nowrap" style={{ color: '#89837C' }}>
                      {fmtLastSeen(u.last_seen)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-caption text-xs mb-0.5 uppercase" style={{ color: '#89837C' }}>{label}</p>
      <p className="text-xl font-bold" style={{ fontFamily: 'Diatype, sans-serif', color: '#1A1A1A' }}>
        {value}
      </p>
    </div>
  )
}
