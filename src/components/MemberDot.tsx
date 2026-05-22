interface Props {
  color: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
}

export function MemberDot({ color, name, size = 'md' }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block rounded-full flex-shrink-0 ${sizeMap[size]}`}
        style={{ backgroundColor: color }}
      />
      {name && <span className="text-[13px] text-[var(--text-primary)]">{name}</span>}
    </span>
  )
}
