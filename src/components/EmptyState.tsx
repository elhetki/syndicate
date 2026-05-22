interface Props {
  message?: string
}

export function EmptyState({ message = 'No data yet.' }: Props) {
  return (
    <div className="flex items-center justify-center py-16 text-[13px] text-[var(--text-tertiary)]">
      {message}
    </div>
  )
}
