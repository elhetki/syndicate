import { formatCurrency } from '../lib/calculations'

interface Props {
  value: number | null
  className?: string
}

export function PLValue({ value, className = '' }: Props) {
  if (value === null) {
    return <span className={`font-mono text-[var(--text-tertiary)] ${className}`}>—</span>
  }
  const color =
    value > 0
      ? 'text-[var(--accent-won)]'
      : value < 0
        ? 'text-[var(--accent-lost)]'
        : 'text-[var(--text-secondary)]'
  return (
    <span className={`font-mono ${color} ${className}`}>
      {value < 0 ? '-' : ''}{formatCurrency(Math.abs(value))}
    </span>
  )
}

export function PLValueRaw({ value, className = '' }: Props) {
  if (value === null) {
    return <span className={`font-mono text-[var(--text-tertiary)] ${className}`}>—</span>
  }
  const color =
    value > 0
      ? 'text-[var(--accent-won)]'
      : value < 0
        ? 'text-[var(--accent-lost)]'
        : 'text-[var(--text-secondary)]'
  const sign = value < 0 ? '-' : ''
  return (
    <span className={`font-mono ${color} ${className}`}>
      {sign}€{Math.abs(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
    </span>
  )
}
