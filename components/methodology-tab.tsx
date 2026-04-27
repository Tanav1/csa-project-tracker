export function MethodologyTab() {
  return (
    <div className="space-y-0">

      <Row
        mins={39}
        label="DocuSign status tracking"
        arithmetic="13 envelopes/CSA × 2 checks/week × 1.5 min/check"
        context="13 = 215 open DocuSign tasks across 16 CSAs in task_internal"
        low="19 min at 1 check/week"
        high="58 min at 3 checks/week"
      />

      <Row
        mins={44}
        label="Task re-orients"
        arithmetic="5 check-ins/day × 1.75 min saved × 5 days"
        context="5/day is a floor — active users made 2-15 status changes/day in usage_events"
        low="26 min at 3 check-ins/day"
        high="88 min at 10 check-ins/day"
        highlight
      />

      <Row
        mins={20}
        label="Envelope follow-up emails"
        arithmetic="1 follow-up/day × 4 min saved × 5 days"
        context="Assumed — no usage data available for this"
        low="10 min at 0.5/day"
        high="40 min at 2/day"
      />

      {/* Total */}
      <div className="pt-8 mt-2 border-t" style={{ borderColor: '#ECECEC' }}>
        <div className="flex items-baseline gap-3">
          <span
            className="font-bold"
            style={{ fontFamily: 'Diatype, sans-serif', fontSize: '2.5rem', letterSpacing: '-0.03em', color: '#175242' }}
          >
            103
          </span>
          <span className="text-sm" style={{ color: '#89837C' }}>min/week total (1.7 hrs)</span>
        </div>
        <p className="font-caption text-xs mt-1" style={{ color: '#B2AAA1' }}>
          Before Slack integrations. Range: 55 min (low) to 206 min (high adoption).
        </p>
      </div>

    </div>
  )
}

function Row({
  mins,
  label,
  arithmetic,
  context,
  low,
  high,
  highlight = false,
}: {
  mins: number
  label: string
  arithmetic: string
  context: string
  low: string
  high: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-start gap-6 py-6 border-b" style={{ borderColor: '#ECECEC' }}>
      {/* Number */}
      <div className="shrink-0 w-20 text-right">
        <span
          className="font-bold leading-none"
          style={{
            fontFamily: 'Diatype, sans-serif',
            fontSize: '2rem',
            letterSpacing: '-0.03em',
            color: highlight ? '#175242' : '#1A1A1A',
          }}
        >
          {mins}
        </span>
        <span className="block font-caption text-xs mt-0.5" style={{ color: '#B2AAA1' }}>min/week</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold mb-1" style={{ fontFamily: 'Diatype, sans-serif', color: '#1A1A1A' }}>
          {label}
        </p>
        <p className="font-caption text-xs mb-2" style={{ color: '#4A4440' }}>
          {arithmetic}
        </p>
        <p className="font-caption text-xs" style={{ color: '#B2AAA1' }}>
          {context}
        </p>
      </div>

      {/* Sensitivity */}
      <div className="shrink-0 hidden sm:block text-right">
        <p className="font-caption text-xs mb-1" style={{ color: '#D3CDC4' }}>range</p>
        <p className="font-caption text-xs" style={{ color: '#B2AAA1' }}>{high}</p>
        <p className="font-caption text-xs" style={{ color: '#D3CDC4' }}>{low}</p>
      </div>
    </div>
  )
}
