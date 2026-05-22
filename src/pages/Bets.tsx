import { useState } from 'react'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { useBets } from '../hooks/useBets'
import { useMembers } from '../hooks/useMembers'
import { formatCurrency, formatDate, formatOdds, computeMemberReturn } from '../lib/calculations'
import { BetResultBadge } from '../components/BetResultBadge'
import { PLValue } from '../components/PLValue'
import { MemberDot } from '../components/MemberDot'
import { EmptyState } from '../components/EmptyState'
import { AddBetForm } from '../components/AddBetForm'
import type { Bet, BetResult } from '../types'

type Filter = 'All' | BetResult
type SortKey = 'date' | 'odds' | 'stake'

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded animate-pulse w-16" style={{ background: 'var(--bg-hover)' }} />
        </td>
      ))}
    </tr>
  )
}

export function Bets() {
  const { bets, loading, refetch } = useBets()
  const { members } = useMembers()
  const [filter, setFilter] = useState<Filter>('All')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const filtered = bets.filter((b) => filter === 'All' || b.result === filter)

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'date') return b.date.localeCompare(a.date)
    if (sortKey === 'odds') return b.odds - a.odds
    if (sortKey === 'stake') {
      const sa = (a.stakes ?? []).reduce((s, bk) => s + bk.stake, 0)
      const sb = (b.stakes ?? []).reduce((s, bk) => s + bk.stake, 0)
      return sb - sa
    }
    return 0
  })

  function getBetPL(bet: Bet): number | null {
    const stakes = bet.stakes ?? []
    const totalStake = stakes.reduce((s, bk) => s + bk.stake, 0)
    if (bet.result === 'Pending') return null
    const payout = bet.result === 'Won'
      ? (bet.actual_payout_override ?? bet.odds * totalStake)
      : 0
    return payout - totalStake
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-[20px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            Bets
          </h1>
          <span
            className="text-[11px] font-mono px-2 py-0.5 rounded border"
            style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border)' }}
          >
            {bets.length}
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium"
          style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}
        >
          <Plus size={14} />
          Add Bet
        </button>
      </div>

      {/* Filter + sort bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-0">
          {(['All', 'Won', 'Lost', 'Pending'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 text-[12px] border-b-2 transition-colors"
              style={{
                borderColor: filter === f ? 'var(--text-primary)' : 'transparent',
                color: filter === f ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
          <span>Sort:</span>
          {(['date', 'odds', 'stake'] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              className="capitalize px-2 py-0.5 rounded"
              style={{
                background: sortKey === k ? 'var(--bg-hover)' : 'transparent',
                color: sortKey === k ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded border overflow-hidden"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
      >
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="w-6" />
              {['Date', 'Event', 'Odds', 'Stake', 'Result', 'Payout', 'Net P/L', 'Members'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={9} />)
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState message="No bets match this filter." />
                </td>
              </tr>
            ) : (
              sorted.flatMap((bet) => {
                const stakes = bet.stakes ?? []
                const totalStake = stakes.reduce((s, bk) => s + bk.stake, 0)
                const payout =
                  bet.result === 'Won'
                    ? (bet.actual_payout_override ?? bet.odds * totalStake)
                    : null
                const pl = getBetPL(bet)
                const isExpanded = expandedId === bet.id
                const participatingMembers = members.filter((m) =>
                  stakes.some((s) => s.member_id === m.id)
                )

                return [
                  <tr
                    key={bet.id}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.background =
                        'var(--bg-hover)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.background = ''
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : bet.id)}
                  >
                    <td className="pl-3 pr-1 py-3 text-[var(--text-tertiary)]">
                      {isExpanded ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                      {formatDate(bet.date)}
                    </td>
                    <td
                      className="px-4 py-3 max-w-[180px] truncate"
                      title={bet.event}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {bet.event}
                    </td>
                    <td className="px-4 py-3 font-mono text-right" style={{ color: 'var(--text-secondary)' }}>
                      {formatOdds(bet.odds)}
                    </td>
                    <td className="px-4 py-3 font-mono text-right" style={{ color: 'var(--text-secondary)' }}>
                      {formatCurrency(totalStake)}
                    </td>
                    <td className="px-4 py-3">
                      <BetResultBadge result={bet.result} />
                    </td>
                    <td className="px-4 py-3 font-mono text-right" style={{ color: 'var(--text-secondary)' }}>
                      {payout !== null ? formatCurrency(payout) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PLValue value={pl} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {participatingMembers.map((m) => (
                          <span
                            key={m.id}
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: m.color }}
                            title={m.name}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>,
                  isExpanded ? (
                    <tr key={`${bet.id}-expanded`} style={{ background: 'var(--bg)' }}>
                      <td colSpan={9} className="px-8 py-4">
                        <table className="w-full text-[12px]">
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                              {['Member', 'Stake', 'Return', 'Net P/L'].map((h) => (
                                <th
                                  key={h}
                                  className="pb-2 text-left font-medium"
                                  style={{ color: 'var(--text-tertiary)' }}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {stakes.map((s) => {
                              const member = members.find((m) => m.id === s.member_id)
                              const ret = computeMemberReturn(bet, s.stake, totalStake)
                              const mpl = ret !== null ? ret - s.stake : null
                              return (
                                <tr key={s.id}>
                                  <td className="py-1.5">
                                    {member ? (
                                      <MemberDot color={member.color} name={member.name} size="sm" />
                                    ) : (
                                      s.member_id
                                    )}
                                  </td>
                                  <td className="py-1.5 font-mono" style={{ color: 'var(--text-secondary)' }}>
                                    {formatCurrency(s.stake)}
                                  </td>
                                  <td className="py-1.5 font-mono" style={{ color: 'var(--text-secondary)' }}>
                                    {ret !== null ? formatCurrency(ret) : '—'}
                                  </td>
                                  <td className="py-1.5">
                                    <PLValue value={mpl} />
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  ) : null,
                ].filter(Boolean)
              })
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <AddBetForm
          members={members}
          onClose={() => setShowAddForm(false)}
          onSaved={refetch}
        />
      )}
    </div>
  )
}
