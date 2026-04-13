import type { Priority } from '@/lib/types'

const config: Record<Priority, { bg: string; text: string }> = {
  P0: { bg: '#B63D35', text: '#FFFFFF' },
  P1: { bg: '#D79F32', text: '#000000' },
  P2: { bg: '#ECECEC', text: '#89837C' },
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { bg, text } = config[priority] ?? config['P2']
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-caption"
      style={{ backgroundColor: bg, color: text, letterSpacing: '0.05em' }}
    >
      {priority}
    </span>
  )
}
