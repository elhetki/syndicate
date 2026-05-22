interface Props {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  className?: string
}

export function StatBlock({ label, value, sub, className = '' }: Props) {
  return (
    <div className={`px-6 py-5 ${className}`}>
      <div className="text-[11px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium mb-2">
        {label}
      </div>
      <div className="text-[24px] font-mono font-medium leading-none text-[var(--text-primary)]">
        {value}
      </div>
      {sub && (
        <div className="mt-1.5 text-[11px] text-[var(--text-tertiary)]">{sub}</div>
      )}
    </div>
  )
}
