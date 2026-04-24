export function MethodologyTab() {
  return (
    <div>
      {/* Intro */}
      <div className="mb-8">
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: '#767676' }}>
          These savings estimates are built from assumptions, not measurements. Each assumption is stated explicitly below along with the arithmetic. If an assumption is wrong, the number it produces is wrong.
        </p>
      </div>

      {/* Assumptions */}
      <div className="space-y-0">
        <Assumption
          id="A1"
          label="DocuSign status checks"
          assumption="A CSA checks the status of an envelope in DocuSign 3 times per day. Without the tool this takes 90 seconds per check (DocuSign already open in a tab, navigating to the envelope). The tool eliminates this entirely via auto-status advancement."
          formula="3 checks/day x 1.5 min/check x 5 days = 22.5 min/week"
          sensitivity="If the real frequency is 1 check/day: 7.5 min/week. If 6 checks/day: 45 min/week."
        />
        <Assumption
          id="A2"
          label="Email inbox searches"
          assumption="A CSA scans Gmail 4 times per day looking for flagged client emails. Each scan takes 1 minute to locate the relevant thread. With the tool, emails are pre-filtered and searchable, reducing this to 15 seconds."
          formula="4 scans/day x 0.75 min saved/scan x 5 days = 15 min/week"
          sensitivity="If the real frequency is 2 scans/day: 7.5 min/week. If 8 scans/day: 30 min/week."
        />
        <Assumption
          id="A3"
          label="Task re-orientation"
          assumption="A CSA loses track of which tasks need action and re-orients 20 times per day. Without the tool this takes 1 minute (opening CSA portal, scanning the list, cross-referencing DocuSign). The Kanban view with attention flags reduces this to 15 seconds."
          formula="20 re-orients/day x 0.75 min saved x 5 days = 75 min/week"
          sensitivity="This is the largest and most uncertain input. If the real frequency is 10/day: 37.5 min/week. If 30/day: 112 min/week."
          highlight
        />
        <Assumption
          id="A4"
          label="Follow-up emails"
          assumption="A CSA sends 1 follow-up email per day to a client with a stale envelope. Without the tool this requires logging into DocuSign, finding the envelope, and composing a message: about 5 minutes. The tool reduces this to 1 minute via in-app send."
          formula="1 follow-up/day x 4 min saved x 5 days = 20 min/week"
          sensitivity="If 0.5 follow-ups/day: 10 min/week. If 2/day: 40 min/week."
        />
      </div>

      {/* Total */}
      <div className="mt-8 pt-6 border-t" style={{ borderColor: '#ECECEC' }}>
        <div className="flex items-start justify-between gap-8 flex-wrap">
          <div>
            <p className="font-caption text-xs mb-1" style={{ color: '#89837C' }}>
              Total at stated assumptions (A1 + A2 + A3 + A4)
            </p>
            <p
              className="text-3xl font-bold"
              style={{ fontFamily: 'Diatype, sans-serif', letterSpacing: '-0.03em' }}
            >
              132 min/week
            </p>
            <p className="font-caption text-xs mt-1" style={{ color: '#89837C' }}>
              approximately 2.2 hours -- before Slack integrations
            </p>
          </div>
          <div className="max-w-sm">
            <p className="font-caption text-xs mb-2" style={{ color: '#89837C' }}>Plausible range</p>
            <div className="space-y-1">
              <RangeRow label="Low (half all frequencies)" value="66 min/week -- 1.1 hrs" />
              <RangeRow label="Stated assumptions" value="132 min/week -- 2.2 hrs" active />
              <RangeRow label="High (double all frequencies)" value="264 min/week -- 4.4 hrs" />
            </div>
          </div>
        </div>
      </div>

      {/* Validation note */}
      <div
        className="mt-8 rounded-lg px-4 py-3"
        style={{ backgroundColor: '#F5F2EC' }}
      >
        <p className="font-caption text-xs font-bold mb-1" style={{ color: '#4A4440' }}>To validate these numbers</p>
        <p className="text-xs leading-relaxed" style={{ color: '#767676' }}>
          Ask CSAs to log DocuSign opens and task re-orients for one week. The usage_events table already captures in-tool event frequency per user -- comparing that to self-reported manual frequency is the fastest way to confirm or correct A3, which drives most of the estimate.
        </p>
      </div>
    </div>
  )
}

function Assumption({
  id,
  label,
  assumption,
  formula,
  sensitivity,
  highlight = false,
}: {
  id: string
  label: string
  assumption: string
  formula: string
  sensitivity: string
  highlight?: boolean
}) {
  return (
    <div
      className="py-6 border-b"
      style={{ borderColor: '#ECECEC' }}
    >
      <div className="flex items-start gap-4">
        <span
          className="font-caption text-xs shrink-0 mt-0.5 w-7"
          style={{ color: '#C8C2BB', letterSpacing: '0.05em' }}
        >
          {id}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3
              className="text-sm font-bold"
              style={{ fontFamily: 'Diatype, sans-serif', color: '#1A1A1A' }}
            >
              {label}
            </h3>
            {highlight && (
              <span
                className="font-caption text-xs px-1.5 py-0.5 rounded"
                style={{ backgroundColor: '#175242', color: '#FFFFFF', fontSize: '10px' }}
              >
                largest input
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#4A4440' }}>
            {assumption}
          </p>
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="font-caption text-xs mb-0.5" style={{ color: '#B2AAA1' }}>Math</p>
              <p
                className="text-xs font-bold"
                style={{ fontFamily: 'Diatype, sans-serif', color: '#1A1A1A' }}
              >
                {formula}
              </p>
            </div>
            <div className="flex-1 min-w-48">
              <p className="font-caption text-xs mb-0.5" style={{ color: '#B2AAA1' }}>Sensitivity</p>
              <p className="text-xs leading-relaxed" style={{ color: '#767676' }}>{sensitivity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RangeRow({ label, value, active = false }: { label: string; value: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-caption text-xs" style={{ color: active ? '#1A1A1A' : '#B2AAA1' }}>
        {label}
      </span>
      <span
        className="font-caption text-xs font-bold shrink-0"
        style={{ color: active ? '#175242' : '#B2AAA1' }}
      >
        {value}
      </span>
    </div>
  )
}
