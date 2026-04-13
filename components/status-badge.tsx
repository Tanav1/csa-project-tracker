import type { UseCaseStatus } from '@/lib/types'

const config: Record<UseCaseStatus, { label: string; bg: string; text: string }> = {
  'Complete':    { label: 'Complete',    bg: '#DCFCE7', text: '#175242' },
  'In Progress': { label: 'In Progress', bg: '#FEF9C3', text: '#854D0E' },
  'Blocked':     { label: 'Blocked',     bg: '#FEE2E2', text: '#B63D35' },
  'Not Started': { label: 'Not Started', bg: '#F5F2EC', text: '#89837C' },
}

export function StatusBadge({ status }: { status: UseCaseStatus }) {
  const { label, bg, text } = config[status] ?? config['Not Started']
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-caption"
      style={{ backgroundColor: bg, color: text, letterSpacing: '0.05em' }}
    >
      {label}
    </span>
  )
}
