export function MethodologyTab() {
  return (
    <div>

      {/* Summary row */}
      <div
        className="grid grid-cols-3 gap-0 mb-10 pb-8 border-b"
        style={{ borderColor: '#ECECEC' }}
      >
        <SummaryCol id="A1" label="DocuSign tracking" value="39" source="database" />
        <SummaryCol id="A2" label="Task re-orients" value="44" source="database" highlight />
        <SummaryCol id="A3" label="Follow-up emails" value="20" source="estimate" />
      </div>

      {/* Assumption blocks */}
      <div className="space-y-10">

        <AssumptionBlock
          id="A1"
          label="DocuSign status tracking"
          source="database"
          sourceDetail="215 open DocuSign-flagged tasks / 16 CSAs in task_internal"
          inputs={[
            { variable: 'Active DocuSign tasks per CSA', value: '13', source: 'measured', note: '215 tasks / 16 CSAs' },
            { variable: 'Manual checks per envelope per week', value: '2x', source: 'assumed' },
            { variable: 'Time per manual check', value: '90 sec', source: 'assumed', note: 'DocuSign already open in a tab' },
          ]}
          formula="13 x 2 x 1.5 min x 5 days"
          result="39 min/week"
          sensitivity={[
            { label: '1 check/week', value: '19 min/week' },
            { label: '3 checks/week', value: '58 min/week' },
          ]}
          sensitivityNote="Envelope count (13) is measured. Check frequency is the only free variable."
        />

        <AssumptionBlock
          id="A2"
          label="Task re-orients"
          source="database"
          sourceDetail="usage_events: active users made 2-15 status changes/day over the last 30 days"
          inputs={[
            { variable: 'Check-ins per day (floor)', value: '5', source: 'assumed', note: 'Consistent with median active-user status changes; understates true re-orients' },
            { variable: 'Time per re-orient without tool', value: '2 min', source: 'assumed', note: 'CSA portal navigation to find and assess a task' },
            { variable: 'Time per re-orient with tool', value: '15 sec', source: 'assumed', note: 'Kanban scan' },
          ]}
          formula="5 x 1.75 min saved x 5 days"
          result="44 min/week"
          highlight
          sensitivity={[
            { label: '3 check-ins/day', value: '26 min/week' },
            { label: '10 check-ins/day', value: '88 min/week' },
          ]}
          sensitivityNote="Largest input. Status changes in usage_events are a lower bound — re-orients without a status update are not captured."
        />

        <AssumptionBlock
          id="A3"
          label="Envelope follow-up emails"
          source="estimate"
          sourceDetail="No measurement available"
          inputs={[
            { variable: 'Follow-ups sent per day', value: '1', source: 'assumed' },
            { variable: 'Time per follow-up without tool', value: '5 min', source: 'assumed', note: 'DocuSign login + locate envelope + compose or resend' },
            { variable: 'Time per follow-up with tool', value: '1 min', source: 'assumed', note: 'In-app send or one-click resend' },
          ]}
          formula="1 x 4 min saved x 5 days"
          result="20 min/week"
          sensitivity={[
            { label: '0.5 follow-ups/day', value: '10 min/week' },
            { label: '2 follow-ups/day', value: '40 min/week' },
          ]}
          sensitivityNote="Smallest input and only fully unanchored assumption."
        />
      </div>

      {/* Total */}
      <div className="mt-10 pt-8 border-t" style={{ borderColor: '#ECECEC' }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
          <div>
            <p className="font-caption text-xs mb-2" style={{ color: '#89837C' }}>
              Total — A1 + A2 + A3
            </p>
            <p
              className="font-bold leading-none mb-1"
              style={{ fontFamily: 'Diatype, sans-serif', fontSize: '2.25rem', letterSpacing: '-0.03em' }}
            >
              103 min/week
            </p>
            <p className="font-caption text-xs" style={{ color: '#89837C' }}>1.7 hrs — before Slack integrations</p>
          </div>

          <div className="shrink-0">
            <table className="text-xs border-collapse">
              <thead>
                <tr>
                  <th className="font-caption text-left pb-1.5 pr-8" style={{ color: '#B2AAA1', fontWeight: 400 }}>Scenario</th>
                  <th className="font-caption text-right pb-1.5 pr-8" style={{ color: '#B2AAA1', fontWeight: 400 }}>Min/week</th>
                  <th className="font-caption text-right pb-1.5" style={{ color: '#B2AAA1', fontWeight: 400 }}>Hrs/week</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Low (conservative inputs)', mins: 55, active: false },
                  { label: 'Stated assumptions', mins: 103, active: true },
                  { label: 'High (full adoption)', mins: 206, active: false },
                ].map(row => (
                  <tr key={row.label}>
                    <td
                      className="py-1 pr-8"
                      style={{ color: row.active ? '#1A1A1A' : '#B2AAA1', fontWeight: row.active ? 600 : 400 }}
                    >
                      {row.label}
                    </td>
                    <td
                      className="py-1 pr-8 text-right font-bold"
                      style={{ fontFamily: 'Diatype, sans-serif', color: row.active ? '#175242' : '#B2AAA1' }}
                    >
                      {row.mins}
                    </td>
                    <td
                      className="py-1 text-right"
                      style={{ color: row.active ? '#175242' : '#B2AAA1', fontWeight: row.active ? 600 : 400 }}
                    >
                      {(row.mins / 60).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function SummaryCol({
  id, label, value, source, highlight = false,
}: {
  id: string; label: string; value: string; source: 'database' | 'estimate'; highlight?: boolean
}) {
  const isDB = source === 'database'
  return (
    <div
      className="px-5 py-4 border-r last:border-r-0 first:pl-0 last:pr-0"
      style={{ borderColor: '#ECECEC' }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className="font-caption text-xs" style={{ color: '#C8C2BB' }}>{id}</span>
        <span
          className="font-caption px-1.5 py-0.5 rounded"
          style={{ fontSize: '10px', backgroundColor: isDB ? '#EEF6FA' : '#F5F2EC', color: isDB ? '#095972' : '#89837C' }}
        >
          {isDB ? 'measured' : 'estimate'}
        </span>
      </div>
      <p
        className="font-bold leading-none mb-1"
        style={{ fontFamily: 'Diatype, sans-serif', fontSize: '1.75rem', letterSpacing: '-0.03em', color: highlight ? '#175242' : '#1A1A1A' }}
      >
        {value}
        <span className="text-sm font-normal ml-1" style={{ color: '#89837C', fontFamily: 'inherit' }}>min/wk</span>
      </p>
      <p className="font-caption text-xs" style={{ color: '#89837C' }}>{label}</p>
    </div>
  )
}

function AssumptionBlock({
  id, label, source, sourceDetail, inputs, formula, result, sensitivity, sensitivityNote, highlight = false,
}: {
  id: string
  label: string
  source: 'database' | 'estimate'
  sourceDetail: string
  inputs: { variable: string; value: string; source: 'measured' | 'assumed'; note?: string }[]
  formula: string
  result: string
  sensitivity: { label: string; value: string }[]
  sensitivityNote: string
  highlight?: boolean
}) {
  const isDB = source === 'database'
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <span className="font-caption text-xs w-7 shrink-0" style={{ color: '#C8C2BB' }}>{id}</span>
        <h3 className="text-sm font-bold" style={{ fontFamily: 'Diatype, sans-serif', color: '#1A1A1A' }}>
          {label}
        </h3>
        <span
          className="font-caption px-1.5 py-0.5 rounded"
          style={{ fontSize: '10px', backgroundColor: isDB ? '#EEF6FA' : '#F5F2EC', color: isDB ? '#095972' : '#89837C' }}
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
      <div className="flex items-start gap-2 mb-4">
        <span className="w-7 shrink-0" />
        <p className="font-caption text-xs italic" style={{ color: '#B2AAA1' }}>{sourceDetail}</p>
      </div>

      <div className="flex items-start gap-2">
        <span className="w-7 shrink-0" />
        <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Inputs table */}
          <div className="lg:col-span-2">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: '#ECECEC' }}>
                  <th className="font-caption text-left pb-1.5 pr-4" style={{ color: '#B2AAA1', fontWeight: 400 }}>Input</th>
                  <th className="font-caption text-right pb-1.5 pr-4" style={{ color: '#B2AAA1', fontWeight: 400 }}>Value</th>
                  <th className="font-caption text-left pb-1.5" style={{ color: '#B2AAA1', fontWeight: 400 }}>Source</th>
                </tr>
              </thead>
              <tbody>
                {inputs.map((inp, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: '#F5F0EB' }}>
                    <td className="py-2 pr-4" style={{ color: '#4A4440' }}>
                      {inp.variable}
                      {inp.note && (
                        <span className="block font-caption" style={{ color: '#B2AAA1', fontSize: '10px' }}>{inp.note}</span>
                      )}
                    </td>
                    <td
                      className="py-2 pr-4 text-right font-bold align-top"
                      style={{ fontFamily: 'Diatype, sans-serif', color: '#1A1A1A', whiteSpace: 'nowrap' }}
                    >
                      {inp.value}
                    </td>
                    <td className="py-2 align-top">
                      <span
                        className="font-caption px-1.5 py-0.5 rounded"
                        style={{
                          fontSize: '10px',
                          backgroundColor: inp.source === 'measured' ? '#EEF6FA' : '#F5F2EC',
                          color: inp.source === 'measured' ? '#095972' : '#89837C',
                        }}
                      >
                        {inp.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="pt-3 pr-4 font-caption text-xs" style={{ color: '#89837C' }}>
                    {formula} =
                  </td>
                  <td
                    className="pt-3 pr-4 text-right font-bold"
                    style={{ fontFamily: 'Diatype, sans-serif', color: highlight ? '#175242' : '#1A1A1A', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                  >
                    {result}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Sensitivity */}
          <div>
            <p className="font-caption text-xs mb-2" style={{ color: '#B2AAA1' }}>Sensitivity</p>
            <div className="space-y-1 mb-2">
              {sensitivity.map((row, i) => (
                <div key={i} className="flex justify-between gap-4">
                  <span className="font-caption text-xs" style={{ color: '#89837C' }}>{row.label}</span>
                  <span className="font-caption text-xs font-bold" style={{ fontFamily: 'Diatype, sans-serif', color: '#4A4440' }}>{row.value}</span>
                </div>
              ))}
            </div>
            <p className="font-caption text-xs leading-relaxed" style={{ color: '#B2AAA1', fontSize: '10px' }}>
              {sensitivityNote}
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
