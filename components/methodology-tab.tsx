export function MethodologyTab() {
  return (
    <div className="space-y-0">
      {/* Headline claims */}
      <div
        className="rounded-xl p-6 mb-10"
        style={{ backgroundColor: '#175242' }}
      >
        <p className="font-caption text-xs mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Defensible headline claims
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <p
              className="text-3xl font-bold leading-none mb-1"
              style={{ fontFamily: 'Diatype, sans-serif', letterSpacing: '-0.03em', color: '#FFFFFF' }}
            >
              2–3 hrs/wk
            </p>
            <p className="font-caption text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Conservative — provable at moderate adoption for a CSA managing 40+ active tasks
            </p>
            <p className="font-caption text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Current estimate — before Slack integrations
            </p>
          </div>
          <div className="w-px hidden sm:block" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <div className="flex-1">
            <p
              className="text-3xl font-bold leading-none mb-1"
              style={{ fontFamily: 'Diatype, sans-serif', letterSpacing: '-0.03em', color: '#FFFFFF' }}
            >
              5+ hrs/wk
            </p>
            <p className="font-caption text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Achievable for high-volume CSAs who use this as their primary workflow interface
            </p>
          </div>
        </div>
      </div>

      {/* Section 01 */}
      <Section step="01" title="The Core Time Sinks" description="Three activities were used as the starting point for estimating manual overhead — before accounting for inflation or double-counting.">
        <DataTable
          headers={['Activity', 'Time / instance', 'Est. frequency', 'Weekly total']}
          alignRight={[2, 3]}
          rows={[
            ['Log into DocuSign to check envelope status', '3 min', '10×/day (high end)', '150 min'],
            ['Log into CSA email, check if client got flagged', '2 min', '8×/day (high end)', '80 min'],
            ['Lose track of task, re-orient', '2 min', '30×/day', '300 min'],
          ]}
          footerLabel="Raw total (inflated, before tool)"
          footerValue="530 min = 8.8 hrs/wk"
          footerHighlight
        />
      </Section>

      <Divider />

      {/* Section 02 */}
      <Section step="02" title="Honest Reassessment" description="The initial methodology double-counts and inflates frequencies. Three key issues:">
        <div className="space-y-3">
          <Callout label="Double-counting" color="#8E7E57" bg="#FDF6EC">
            "DocuSign login" and "task re-orient" are the same event — opening DocuSign to check status <em>is</em> a re-orient. Counting them separately inflates the total.
          </Callout>
          <Callout label="Frequency inflation" color="#095972" bg="#EEF6FA">
            7 DocuSign logins/day means logging in every hour of the workday. Realistic is 2–3 focused checks: morning, midday, afternoon.
          </Callout>
          <Callout label="Time-per-instance" color="#6B484D" bg="#FAF0F1">
            3 minutes assumes starting from zero. If DocuSign is already open in a tab, finding an envelope is ~45–60 seconds. True saving is 1–1.5 min per check, not 3.
          </Callout>
        </div>
      </Section>

      <Divider />

      {/* Section 03 */}
      <Section step="03" title="Realistic Savings Estimate" description="After correcting for double-counting and frequency inflation.">
        <DataTable
          headers={['Activity', 'Realistic frequency', 'Time saved each', 'Weekly savings']}
          alignRight={[2, 3]}
          rows={[
            ['DocuSign status checks eliminated (auto-advance)', '3/day', '1.5 min', '~22 min'],
            ['Email search in-tool vs. manual inbox scan', '4/day', '1 min', '~20 min'],
            ['Task re-orients via Kanban vs. CSA portal', '20/day', '1 min', '~100 min'],
            ['Follow-up emails sent via tool', '1/day', '5 min', '~25 min'],
          ]}
          footerLabel="Realistic weekly total"
          footerValue="~167 min ≈ 2.8 hrs/wk"
          footerHighlight
        />
      </Section>

      <Divider />

      {/* Section 04 */}
      <Section step="04" title="What Each Feature Eliminates" description="Before vs. after breakdown for each major capability — and the minimum usage level needed for that feature to move the needle.">
        <div className="space-y-4">
          <FeatureBlock
            title="DocuSign Auto-Status Advancement"
            before="Log into DocuSign → search client → check envelope → update task status → switch back. ~3 min."
            after="Status auto-advances when client views or signs. CSA sees it on Kanban immediately."
            minimum="Eliminating 5 manual DocuSign checks/day → ~75 min/week"
          />
          <FeatureBlock
            title="CSA Email Monitoring"
            before="Open Gmail → scan inbox → identify which client → open CSA portal → find task → update. ~4–5 min."
            after="Emails synced every 5 min, searchable, auto-linked to clients. Relevant email found in ~15 seconds."
            minimum="Replacing 8 manual inbox scans/day → ~64 min/week (high-end estimate)"
          />
          <FeatureBlock
            title="Losing Track of Tasks / Context Switching"
            before='"Which tasks need action today?" → open CSA portal → scroll through 200 tasks → check DocuSign → check email separately. ~2 min each time.'
            after="Kanban shows exactly where every task stands. Attention flags surface the handful needing action. Re-orient takes ~15 seconds."
            minimum="Saving 1 min on 20 of 30 daily re-orients → 100 min/week — the single biggest driver"
            highlight
          />
          <FeatureBlock
            title="Envelope Attention Flags + Follow-Up Emails"
            before="Log into DocuSign → find envelope → write custom message or send generic reminder → note it in task comments. ~8 min."
            after="One-click resend from attention flag, or send custom HTML email in-app. ~1 min."
            minimum="2 follow-ups/day → 70 min/week"
          />
          <FeatureBlock
            title="Auto-Completion of Kanban Tasks"
            before="CSA portal marks task done → CSA must remember to update internal tracking separately. ~1–2 min, often forgotten."
            after="Auto-completes in Kanban when CSA portal marks done. Zero extra work."
            minimum="No minimum — every auto-complete saves time automatically"
          />
        </div>
      </Section>

      <Divider />

      {/* Section 05 */}
      <Section step="05" title="Minimum Usage to Reach 5 Hours/Week" description="The tool needs to be the primary task interface — not a secondary lookup — to hit this threshold.">
        <DataTable
          headers={['Feature', 'Daily usage needed', 'Weekly time saved']}
          alignRight={[2]}
          rows={[
            ['DocuSign auto-status (eliminate manual checks)', '7 fewer logins/day', '105 min'],
            ['Email search instead of manual inbox', '5 fewer inbox scans/day', '50 min'],
            ['Kanban re-orient (15s vs. 2 min)', '20 re-orients via tool/day', '95 min'],
            ['Envelope attention flags', '2 follow-ups/day', '70 min'],
            ['Auto-completion of tasks', '20 tasks auto-completed/day', '20 min'],
          ]}
          footerLabel="Total"
          footerValue="360 min = 6 hrs/wk"
          footerHighlight
        />
        <p className="font-caption text-xs mt-4 leading-relaxed" style={{ color: '#89837C' }}>
          Reaching 5 hours/week requires high task volume <strong>and</strong> near-full adoption. The tool needs to be the primary task interface, not a secondary lookup.
        </p>
      </Section>

      <Divider />

      {/* Section 06 */}
      <Section step="06" title="Conservative Scenario (50% Adoption)" description="Even if a CSA uses the tool half the time and still falls back to old habits.">
        <DataTable
          headers={['Activity', 'Reduced usage', 'Weekly savings']}
          alignRight={[2]}
          rows={[
            ['DocuSign logins avoided', '3.5/day', '52 min'],
            ['Email searches in tool', '3/day', '30 min'],
            ['Re-orients via Kanban', '15/day', '67 min'],
            ['Follow-ups via tool', '1/day', '35 min'],
          ]}
          footerLabel="Total"
          footerValue="184 min ≈ 3 hrs/wk"
          footerHighlight
        />
      </Section>

      <Divider />

      {/* Section 07 */}
      <Section step="07" title="How to Validate Empirically" description="Usage events are already logged in the usage_events table — these steps move us from estimates to measured savings.">
        <div className="space-y-3">
          {[
            'Ask CSAs to log how many times per day they open DocuSign to check a status.',
            'Track how many "find this task" moments happen in a day.',
            'Compare time-to-action on stale envelopes before vs. after tool adoption.',
            'Analyze event frequency per user in usage_events to see actual interaction rates and compare to the frequency assumptions above.',
          ].map((text, i) => (
            <div key={i} className="flex gap-3">
              <span
                className="font-caption shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-bold mt-0.5"
                style={{ backgroundColor: '#ECECEC', color: '#767676', fontSize: '10px' }}
              >
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed" style={{ color: '#4A4440' }}>{text}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

/* ── Internal sub-components ─────────────────────────────────────────── */

function Section({
  step,
  title,
  description,
  children,
}: {
  step: string
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <section className="mb-0">
      <div className="flex items-start gap-4 mb-5">
        <span className="font-caption text-xs shrink-0 mt-1" style={{ color: '#C8C2BB', letterSpacing: '0.05em' }}>
          {step}
        </span>
        <div>
          <h3
            className="text-lg font-bold mb-1.5"
            style={{ fontFamily: 'Diatype, sans-serif', letterSpacing: '-0.02em' }}
          >
            {title}
          </h3>
          <p className="text-sm" style={{ color: '#767676' }}>{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function Divider() {
  return <div className="my-8 border-t" style={{ borderColor: '#ECECEC' }} />
}

function Callout({
  label,
  color,
  bg,
  children,
}: {
  label: string
  color: string
  bg: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg px-4 py-3 flex gap-3 items-start" style={{ backgroundColor: bg }}>
      <span className="font-caption text-xs font-bold shrink-0 mt-0.5" style={{ color }}>{label}</span>
      <p className="text-sm leading-relaxed" style={{ color: '#4A4440' }}>{children}</p>
    </div>
  )
}

function DataTable({
  headers,
  rows,
  alignRight = [],
  footerLabel,
  footerValue,
  footerHighlight = false,
}: {
  headers: string[]
  rows: string[][]
  alignRight?: number[]
  footerLabel?: string
  footerValue?: string
  footerHighlight?: boolean
}) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b" style={{ borderColor: '#ECECEC' }}>
            {headers.map((h, i) => (
              <th
                key={i}
                className="font-caption text-xs pb-2 pr-6 last:pr-0"
                style={{ color: '#89837C', textAlign: alignRight.includes(i) ? 'right' : 'left', fontWeight: 400 }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b" style={{ borderColor: '#F5F0EB' }}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="py-3 pr-6 last:pr-0"
                  style={{
                    fontFamily: ci === 0 ? 'Diatype, sans-serif' : undefined,
                    color: ci === 0 ? '#1A1A1A' : '#767676',
                    textAlign: alignRight.includes(ci) ? 'right' : 'left',
                    fontSize: ci === 0 ? '0.875rem' : '0.8125rem',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footerLabel && footerValue && (
          <tfoot>
            <tr>
              <td
                className="pt-3 pr-6 font-bold font-caption text-xs"
                colSpan={headers.length - 1}
                style={{ color: footerHighlight ? '#175242' : '#4A4440' }}
              >
                {footerLabel}
              </td>
              <td
                className="pt-3 font-bold text-right"
                style={{ fontFamily: 'Diatype, sans-serif', color: footerHighlight ? '#175242' : '#1A1A1A', fontSize: '0.9375rem' }}
              >
                {footerValue}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

function FeatureBlock({
  title,
  before,
  after,
  minimum,
  highlight = false,
}: {
  title: string
  before: string
  after: string
  minimum: string
  highlight?: boolean
}) {
  return (
    <div
      className="rounded-xl p-5 border"
      style={{ borderColor: highlight ? '#175242' : '#ECECEC', backgroundColor: highlight ? '#F4FAF7' : '#FAFAF9' }}
    >
      <h4
        className="font-bold text-sm mb-4"
        style={{ fontFamily: 'Diatype, sans-serif', color: highlight ? '#175242' : '#1A1A1A' }}
      >
        {title}
        {highlight && (
          <span
            className="ml-2 font-caption text-xs font-normal px-1.5 py-0.5 rounded"
            style={{ backgroundColor: '#175242', color: '#FFFFFF' }}
          >
            biggest driver
          </span>
        )}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="font-caption text-xs mb-1.5" style={{ color: '#B2AAA1' }}>Without tool</p>
          <p className="text-xs leading-relaxed" style={{ color: '#767676' }}>{before}</p>
        </div>
        <div>
          <p className="font-caption text-xs mb-1.5" style={{ color: '#175242' }}>With tool</p>
          <p className="text-xs leading-relaxed" style={{ color: '#4A4440' }}>{after}</p>
        </div>
      </div>
      <div
        className="rounded-lg px-3 py-2"
        style={{ backgroundColor: highlight ? 'rgba(23,82,66,0.08)' : '#F5F2EC' }}
      >
        <span className="font-caption text-xs" style={{ color: '#89837C' }}>Minimum for impact: </span>
        <span className="font-caption text-xs font-bold" style={{ color: highlight ? '#175242' : '#4A4440' }}>{minimum}</span>
      </div>
    </div>
  )
}
