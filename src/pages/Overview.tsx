import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useBets } from '../hooks/useBets'
import { useMembers } from '../hooks/useMembers'
import { useSettlements } from '../hooks/useSettlements'
import { useMemberStats } from '../hooks/useMemberStats'
import {
  computeGroupSummary,
  formatCurrency,
  formatDate,
  formatOdds,
  computeMemberReturn,
} from '../lib/calculations'
import { StatBlock } from '../components/StatBlock'
import { BetResultBadge } from '../components/BetResultBadge'
import { PLValue } from '../components/PLValue'
import { MemberDot } from '../components/MemberDot'

function SkeletonRow() {
  return (
    <div className="flex gap-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
      {[80, 160, 60, 60, 80].map((w, i) => (
        <div
          key={i}
          className="h-3 rounded animate-pulse"
          style={{ width: w, background: 'var(--bg-surface)' }}
        />
      ))}
    </div>
  )
}

export function Overview() {
  const { bets, loading: bLoading } = useBets()
  const { members } = useMembers()
  const { settlements } = useSettlements()
  const memberStats = useMemberStats(members, bets, settlements)

  const summary = useMemo(() => computeGroupSummary(bets), [bets])
  const recentBets = bets.slice(0, 10)

  // Build cumulative P/L chart data
  const chartData = useMemo(() => {
    const sorted = [...bets]
      .filter((b) => b.result !== 'Pending')
      .sort((a, b) => a.date.localeCompare(b.date))

    let cum = 0
    return sorted.map((bet) => {
      const stakes = bet.stakes ?? []
      const totalStake = stakes.reduce((s, bk) => s + bk.stake, 0)
      const payout =
        bet.result === 'Won'
          ? (bet.actual_payout_override ?? bet.odds * totalStake)
          : 0
      cum += payout - totalStake
      return { date: formatDate(bet.date), pl: parseFloat(cum.toFixed(2)) }
    })
  }, [bets])

  // Member cumulative P/L per bet
  const memberChartData = useMemo(() => {
    const sorted = [...bets]
      .filter((b) => b.result !== 'Pending')
      .sort((a, b) => a.date.localeCompare(b.date))

    const cums: Record<string, number> = {}
    members.forEach((m) => { cums[m.id] = 0 })

    return sorted.map((bet) => {
      const stakes = bet.stakes ?? []
      const totalStake = stakes.reduce((s, bk) => s + bk.stake, 0)
      const point: Record<string, number | string> = { date: formatDate(bet.date) }
      members.forEach((m) => {
        const mStake = stakes.find((s) => s.member_id === m.id)?.stake ?? 0
        const ret = computeMemberReturn(bet, mStake, totalStake) ?? 0
        cums[m.id] += ret - mStake
        point[m.id] = parseFloat(cums[m.id].toFixed(2))
      })
      return point
    })
  }, [bets, members])

  const plColor =
    summary.netPL > 0
      ? 'var(--accent-won)'
      : summary.netPL < 0
        ? 'var(--accent-lost)'
        : 'var(--text-primary)'

  return (
    <div>
      <h1
        className="text-[20px] font-semibold mb-6"
        style={{ color: 'var(--text-primary)' }}
      >
        Overview
      </h1>

      {/* Stats row — 2×2 grid on mobile, horizontal row on desktop */}
      <div
        className="rounded border overflow-hidden mb-8"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
      >
        {/* Mobile: 2×2 grid */}
        <div className="md:hidden grid grid-cols-2">
          <StatBlock
            label="Net P/L"
            value={
              <span style={{ color: plColor }}>
                {summary.netPL >= 0 ? '+' : ''}
                {formatCurrency(summary.netPL)}
              </span>
            }
            className="border-r border-b"
          />
          <StatBlock
            label="Total Staked"
            value={formatCurrency(summary.totalStaked)}
            className="border-b"
          />
          <StatBlock
            label="Win Rate"
            value={`${summary.winRate.toFixed(0)}%`}
            sub={`${summary.wonBets}W / ${summary.lostBets}L`}
            className="border-r"
          />
          <StatBlock
            label="Total Bets"
            value={summary.totalBets}
            sub={
              <span className="text-[10px]">
                <span style={{ color: 'var(--accent-won)' }}>{summary.wonBets}W</span>
                {' · '}
                <span style={{ color: 'var(--accent-lost)' }}>{summary.lostBets}L</span>
              </span>
            }
          />
        </div>
        {/* Desktop: horizontal row */}
        <div className="hidden md:flex">
          <StatBlock
            label="Net P/L"
            value={
              <span style={{ color: plColor }}>
                {summary.netPL >= 0 ? '+' : ''}
                {formatCurrency(summary.netPL)}
              </span>
            }
            className="flex-1 border-r"
          />
          <StatBlock
            label="Total Staked"
            value={formatCurrency(summary.totalStaked)}
            className="flex-1 border-r"
          />
          <StatBlock
            label="Win Rate"
            value={`${summary.winRate.toFixed(0)}%`}
            sub={`${summary.wonBets}W / ${summary.lostBets}L`}
            className="flex-1 border-r"
          />
          <StatBlock
            label="Total Bets"
            value={summary.totalBets}
            sub={
              <span>
                <span style={{ color: 'var(--accent-won)' }}>{summary.wonBets} won</span>
                {' · '}
                <span style={{ color: 'var(--accent-lost)' }}>{summary.lostBets} lost</span>
                {' · '}
                <span style={{ color: 'var(--accent-pending)' }}>{summary.pendingBets} pending</span>
              </span>
            }
            className="flex-1"
          />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Bets */}
        <div
          className="rounded border overflow-hidden"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          <div
            className="px-5 py-3 border-b text-[12px] font-medium uppercase tracking-widest"
            style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}
          >
            Recent Bets
          </div>
          <div>
            {bLoading ? (
              <div className="px-5">
                {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : recentBets.length === 0 ? (
              <div className="px-5 py-8 text-[13px] text-[var(--text-tertiary)] text-center">No bets yet.</div>
            ) : (
              <>
                {/* Mobile: card list */}
                <div className="md:hidden">
                  {recentBets.map((bet) => {
                    const stakes = bet.stakes ?? []
                    const totalStake = stakes.reduce((s, bk) => s + bk.stake, 0)
                    const payout =
                      bet.result === 'Won'
                        ? (bet.actual_payout_override ?? bet.odds * totalStake)
                        : bet.result === 'Lost'
                          ? 0
                          : null
                    const pl = payout !== null ? payout - totalStake : null
                    return (
                      <div
                        key={bet.id}
                        className="py-3 px-4"
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                            {formatDate(bet.date)}
                          </span>
                          <BetResultBadge result={bet.result} />
                        </div>
                        <div
                          className="text-[13px] font-medium truncate mb-1"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {bet.event}
                        </div>
                        <div className="flex items-center gap-2 text-[12px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                          <span>×{formatOdds(bet.odds)}</span>
                          <span>·</span>
                          <PLValue value={pl} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                {/* Desktop: table */}
                <table className="hidden md:table w-full text-[12px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Date', 'Event', 'Odds', 'Result', 'P/L'].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2 text-left font-medium"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentBets.map((bet) => {
                      const stakes = bet.stakes ?? []
                      const totalStake = stakes.reduce((s, bk) => s + bk.stake, 0)
                      const payout =
                        bet.result === 'Won'
                          ? (bet.actual_payout_override ?? bet.odds * totalStake)
                          : bet.result === 'Lost'
                            ? 0
                            : null
                      const pl = payout !== null ? payout - totalStake : null
                      return (
                        <tr
                          key={bet.id}
                          className="transition-colors"
                          style={{ borderBottom: '1px solid var(--border-subtle)' }}
                          onMouseEnter={(e) => {
                            ;(e.currentTarget as HTMLTableRowElement).style.background =
                              'var(--bg-hover)'
                          }}
                          onMouseLeave={(e) => {
                            ;(e.currentTarget as HTMLTableRowElement).style.background = ''
                          }}
                        >
                          <td className="px-4 py-2.5 font-mono" style={{ color: 'var(--text-tertiary)' }}>
                            {formatDate(bet.date)}
                          </td>
                          <td
                            className="px-4 py-2.5 max-w-[120px] truncate"
                            title={bet.event}
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {bet.event}
                          </td>
                          <td className="px-4 py-2.5 font-mono" style={{ color: 'var(--text-secondary)' }}>
                            {formatOdds(bet.odds)}
                          </td>
                          <td className="px-4 py-2.5">
                            <BetResultBadge result={bet.result} />
                          </td>
                          <td className="px-4 py-2.5">
                            <PLValue value={pl} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>

        {/* Member Balances */}
        <div
          className="rounded border overflow-hidden"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          <div
            className="px-5 py-3 border-b text-[12px] font-medium uppercase tracking-widest"
            style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}
          >
            Member Balances
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {memberStats.length === 0 ? (
              <div className="px-5 py-8 text-[13px] text-[var(--text-tertiary)] text-center">No members.</div>
            ) : (
              memberStats.map((ms) => (
                <div
                  key={ms.member.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <MemberDot color={ms.member.color} name={ms.member.name} />
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="text-right">
                      <div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">Balance</div>
                      <PLValue value={ms.balanceVsAccount} />
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-[var(--text-tertiary)] mb-0.5">Net P/L</div>
                      <PLValue value={ms.realizedNetPL} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      {(memberChartData.length > 0 || chartData.length > 0) && (
        <div
          className="rounded border overflow-hidden"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          <div
            className="px-5 py-3 border-b text-[12px] font-medium uppercase tracking-widest"
            style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}
          >
            Cumulative Net P/L
          </div>
          <div className="px-4 py-4">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={memberChartData.length > 0 ? memberChartData : chartData}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `€${v}`}
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    fontSize: 12,
                    color: 'var(--text-primary)',
                  }}
                  formatter={(value) => [`€${Number(value ?? 0).toFixed(2)}`, '']}
                />
                {members.length > 0
                  ? members.map((m) => (
                      <Line
                        key={m.id}
                        type="monotone"
                        dataKey={m.id}
                        stroke={m.color}
                        strokeWidth={1.5}
                        dot={false}
                        name={m.name}
                      />
                    ))
                  : (
                      <Line
                        type="monotone"
                        dataKey="pl"
                        stroke="var(--text-primary)"
                        strokeWidth={1.5}
                        dot={false}
                        name="Group"
                      />
                    )}
              </LineChart>
            </ResponsiveContainer>
            {members.length > 0 && (
              <div className="flex gap-4 mt-2 justify-center flex-wrap">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{m.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
