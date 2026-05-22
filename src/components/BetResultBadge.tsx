import type { BetResult } from '../types'

interface Props {
  result: BetResult
}

const config: Record<BetResult, { dot: string; text: string; label: string }> = {
  Won: {
    dot: 'bg-[var(--accent-won)]',
    text: 'text-[var(--accent-won)]',
    label: 'Won',
  },
  Lost: {
    dot: 'bg-[var(--accent-lost)]',
    text: 'text-[var(--accent-lost)]',
    label: 'Lost',
  },
  Pending: {
    dot: 'bg-[var(--accent-pending)]',
    text: 'text-[var(--accent-pending)]',
    label: 'Pending',
  },
}

export function BetResultBadge({ result }: Props) {
  const c = config[result]
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span className={`text-[11px] font-medium ${c.text}`}>{c.label}</span>
    </span>
  )
}
