const STATUS_LABELS: Record<string, string> = {
  default:                   'Unassigned',
  in_process:                'In Process',
  pending_client_signature:  'Pending Client Signature',
  client_viewed:             'Client Viewed',
  docs_sent_to_custodian:    'Docs Sent to Custodian',
  pending_custodian:         'Pending Custodian',
  pending_settlement:        'Pending Settlement',
  pending_advisor:           'Pending Advisor',
  needs_more_info:           'Needs More Info',
  paused:                    'Paused',
  completed:                 'Completed',
}

// Colour intent per stage
const STATUS_COLORS: Record<string, { bg: string; dot: string }> = {
  default:                  { bg: '#F5F5F4', dot: '#A8A29E' },
  in_process:               { bg: '#EFF6FF', dot: '#3B82F6' },
  pending_client_signature: { bg: '#FFFBEB', dot: '#F59E0B' },
  client_viewed:            { bg: '#F0FDF4', dot: '#22C55E' },
  docs_sent_to_custodian:   { bg: '#F0FDF4', dot: '#16A34A' },
  pending_custodian:        { bg: '#FFF7ED', dot: '#EA580C' },
  pending_settlement:       { bg: '#FFF7ED', dot: '#C2410C' },
  pending_advisor:          { bg: '#FDF4FF', dot: '#A855F7' },
  needs_more_info:          { bg: '#FFF1F2', dot: '#F43F5E' },
  paused:                   { bg: '#F5F5F4', dot: '#78716C' },
  completed:                { bg: '#F0FDF4', dot: '#175242' },
}

export interface RetoolStats {
  total: number
  by_status: { status: string; count: number }[]
}

export function RetoolLive({ stats }: { stats: RetoolStats }) {
  const openStatuses = stats.by_status.filter(s => s.status !== 'completed')
  const completedEntry = stats.by_status.find(s => s.status === 'completed')
  const openTotal = openStatuses.reduce((n, s) => n + s.count, 0)

  return (
    <div className="bg-white rounded-xl border p-6 mt-6" style={{ borderColor: '#ECECEC' }}>
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
          Task Queue
        </h2>
      </div>

      {/* Summary tiles */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-5 border-b"
        style={{ borderColor: '#ECECEC' }}
      >
        <Tile label="total tracked" value={stats.total} />
        <Tile label="open" value={openTotal} />
        {completedEntry && <Tile label="completed" value={completedEntry.count} highlight />}
      </div>

      {/* Status breakdown */}
      {stats.by_status.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="font-caption text-xs mb-3" style={{ color: '#89837C' }}>
            by status
          </p>
          {stats.by_status.map(({ status, count }) => {
            const colors = STATUS_COLORS[status] ?? { bg: '#F5F5F4', dot: '#A8A29E' }
            const label = STATUS_LABELS[status] ?? status
            const pct = stats.total > 0 ? Math.round(count / stats.total * 100) : 0
            return (
              <div key={status} className="flex items-center gap-3">
                {/* Dot */}
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: colors.dot }}
                />
                {/* Label */}
                <span className="text-sm flex-1 truncate" style={{ color: '#1A1A1A' }}>
                  {label}
                </span>
                {/* Bar */}
                <div className="w-24 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#ECECEC' }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: colors.dot }}
                  />
                </div>
                {/* Count */}
                <span
                  className="text-sm font-semibold w-8 text-right shrink-0"
                  style={{ fontFamily: 'Diatype, sans-serif', color: '#1A1A1A' }}
                >
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Tile({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <p className="font-caption text-xs mb-0.5" style={{ color: '#89837C' }}>{label}</p>
      <p
        className="text-xl font-bold"
        style={{ fontFamily: 'Diatype, sans-serif', color: highlight ? '#175242' : '#1A1A1A' }}
      >
        {value}
      </p>
    </div>
  )
}
