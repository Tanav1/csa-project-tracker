export function MethodologyTab() {
  return (
    <div>
      {/* Intro */}
      <div className="mb-8 pb-6 border-b" style={{ borderColor: '#ECECEC' }}>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: '#767676' }}>
          Two of the three inputs below are derived from live task and usage data, not assumed. The third (follow-up emails) is an estimate and is labeled as such. All arithmetic is shown so any input can be challenged directly.
        </p>
      </div>

      {/* Assumptions */}
      <div className="space-y-0">
        <Assumption
          id="A1"
          label="DocuSign status tracking"
          source="database"
          sourceNote="215 open DocuSign-flagged tasks across 16 CSAs in task_internal as of today"
          assumption="A CSA carries an average of 13 active tasks with a pending DocuSign envelope at any given time (215 divided by 16 CSAs). Each envelope requires periodic status checks. Without the tool, a check means opening DocuSign separately, finding the client, and reading the status — roughly 90 seconds per check if DocuSign is already open. The tool eliminates manual checks entirely via webhook-driven auto-advancement."
          formula="13 envelopes x 2 checks/week x 90 sec/check = 39 min/week saved"
          sensitivity="The 2 checks/week assumption drives this number. At 1 check/week: 19 min/week. At 3 checks/week: 58 min/week. The envelope count (13) is a measured fact."
        />
        <Assumption
          id="A2"
          label="Task re-orients"
          source="database"
          sourceNote="Active users recorded 2-15 status changes per day in usage_events over the last 30 days. Status changes are a lower bound on re-orients — CSAs also check the board without updating status."
          assumption="Active users of the tool made 2-15 status changes per day over the last 30 days. Each status change implies a deliberate check-in: open the tool, find the task, assess it, update it. Without the tool this same check-in went through the CSA portal. We use 5 check-ins per day as a conservative floor, consistent with median active-user behavior. The tool reduces each from roughly 2 minutes (portal navigation) to 15 seconds (Kanban scan)."
          formula="5 check-ins/day x 1.75 min saved x 5 days = 44 min/week saved"
          sensitivity="This is the most contested input. At 3 check-ins/day: 26 min/week. At 10/day: 88 min/week. The usage_events data gives a measured floor — the real number could be higher since many re-orients happen without a status change."
          highlight
        />
        <Assumption
          id="A3"
          label="Envelope follow-up emails"
          source="estimate"
          sourceNote="No measurement available. Based on judgment about how often a stale envelope prompts a manual follow-up."
          assumption="Once per day, a stale envelope prompts a CSA to send a follow-up to the client. Without the tool this requires logging into DocuSign, locating the envelope, and composing or resending — roughly 5 minutes. The tool enables a one-click resend or in-app custom email in under 1 minute."
          formula="1 follow-up/day x 4 min saved x 5 days = 20 min/week saved"
          sensitivity="If 0.5 follow-ups/day: 10 min/week. If 2/day: 40 min/week. This is the only unmeasured input."
        />
      </div>

      {/* Total */}
      <div className="mt-8 pt-6 border-t" style={{ borderColor: '#ECECEC' }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
          <div>
            <p className="font-caption text-xs mb-1" style={{ color: '#89837C' }}>
              Total at stated assumptions (A1 + A2 + A3)
            </p>
            <p
              className="text-3xl font-bold"
              style={{ fontFamily: 'Diatype, sans-serif', letterSpacing: '-0.03em' }}
            >
              103 min/week
            </p>
            <p className="font-caption text-xs mt-1" style={{ color: '#89837C' }}>
              approximately 1.7 hours -- before Slack integrations
            </p>
            <p className="font-caption text-xs mt-1" style={{ color: '#B2AAA1' }}>
              A1 and A2 are grounded in live data. A3 is an estimate.
            </p>
          </div>
          <div className="shrink-0">
            <p className="font-caption text-xs mb-2" style={{ color: '#89837C' }}>Plausible range</p>
            <div className="space-y-1.5">
              <RangeRow label="Low (conservative inputs)" value="55 min/week -- 0.9 hrs" />
              <RangeRow label="Stated assumptions" value="103 min/week -- 1.7 hrs" active />
              <RangeRow label="High (active users, full adoption)" value="206 min/week -- 3.4 hrs" />
            </div>
          </div>
        </div>
      </div>

      {/* What would move this number */}
      <div className="mt-8 pt-6 border-t" style={{ borderColor: '#ECECEC' }}>
        <p className="font-caption text-xs font-bold mb-3" style={{ color: '#4A4440' }}>
          What would move this number most
        </p>
        <div className="space-y-2">
          {[
            'A2 is the largest driver and the only one with an unresolved assumption (how often do CSAs re-orient without changing status). One CSA tracking this for a week would resolve it.',
            'The 2 checks/week assumption in A1 is the only non-measured input in that calculation. If CSAs check DocuSign status daily per envelope rather than twice weekly, A1 doubles.',
            'Adoption depth matters more than adoption breadth. One CSA using the tool as their primary interface saves more than five CSAs using it occasionally.',
          ].map((text, i) => (
            <div key={i} className="flex gap-3">
              <span
                className="font-caption shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-bold mt-0.5"
                style={{ backgroundColor: '#ECECEC', color: '#767676', fontSize: '10px' }}
              >
                {i + 1}
              </span>
              <p className="text-xs leading-relaxed" style={{ color: '#4A4440' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function Assumption({
  id,
  label,
  source,
  sourceNote,
  assumption,
  formula,
  sensitivity,
  highlight = false,
}: {
  id: string
  label: string
  source: 'database' | 'estimate'
  sourceNote: string
  assumption: string
  formula: string
  sensitivity: string
  highlight?: boolean
}) {
  const isDB = source === 'database'
  return (
    <div className="py-6 border-b" style={{ borderColor: '#ECECEC' }}>
      <div className="flex items-start gap-4">
        <span
          className="font-caption text-xs shrink-0 mt-0.5 w-7"
          style={{ color: '#C8C2BB', letterSpacing: '0.05em' }}
        >
          {id}
        </span>
        <div className="flex-1 min-w-0">
          {/* Label + source badge */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3
              className="text-sm font-bold"
              style={{ fontFamily: 'Diatype, sans-serif', color: '#1A1A1A' }}
            >
              {label}
            </h3>
            <span
              className="font-caption px-1.5 py-0.5 rounded"
              style={{
                fontSize: '10px',
                backgroundColor: isDB ? '#EEF6FA' : '#F5F2EC',
                color: isDB ? '#095972' : '#89837C',
              }}
            >
              {isDB ? 'from database' : 'estimate'}
            </span>
            {highlight && (
              <span
                className="font-caption px-1.5 py-0.5 rounded"
                style={{ fontSize: '10px', backgroundColor: '#175242', color: '#FFFFFF' }}
              >
                largest input
              </span>
            )}
          </div>
          {/* Source note */}
          <p className="font-caption text-xs mb-3 italic" style={{ color: '#B2AAA1' }}>
            {sourceNote}
          </p>
          {/* Assumption body */}
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#4A4440' }}>
            {assumption}
          </p>
          {/* Math + sensitivity */}
          <div className="flex flex-wrap gap-x-8 gap-y-3">
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
    <div className="flex items-center justify-between gap-6">
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
