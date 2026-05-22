import { useBets } from '../hooks/useBets'
import { useMembers } from '../hooks/useMembers'
import { useSettlements } from '../hooks/useSettlements'
import { useMemberStats } from '../hooks/useMemberStats'
import { formatCurrency } from '../lib/calculations'
import { MemberDot } from '../components/MemberDot'
import { PLValue } from '../components/PLValue'
import type { MemberStats } from '../types'

function MemberCard({ ms }: { ms: MemberStats }) {
  const winRate =
    ms.wonBets + ms.lostBets > 0
      ? (ms.wonBets / (ms.wonBets + ms.lostBets)) * 100
      : 0

  return (
    <div
      className="flex-1 border rounded p-5"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MemberDot color={ms.member.color} name={ms.member.name} size="lg" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Total Staked', val: formatCurrency(ms.totalStaked) },
          { label: 'Net P/L', val: <PLValue value={ms.realizedNetPL} /> },
          { label: 'Returned', val: formatCurrency(ms.grossReturned) },
          { label: 'Balance', val: <PLValue value={ms.balanceVsAccount} /> },
        ].map(({ label, val }) => (
          <div key={label}>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-tertiary)' }}>
              {label}
            </div>
            <div className="text-[13px] font-mono" style={{ color: 'var(--text-primary)' }}>
              {val}
            </div>
          </div>
        ))}
      </div>

      {/* Win rate */}
      <div className="mb-2">
        <div className="flex justify-between text-[11px] mb-1" style={{ color: 'var(--text-tertiary)' }}>
          <span>Win rate</span>
          <span>{winRate.toFixed(0)}%</span>
        </div>
        <div className="h-0.5 rounded-full" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${winRate}%`, background: ms.member.color }}
          />
        </div>
      </div>

      {ms.pendingExposure > 0 && (
        <div className="mt-2 text-[11px]" style={{ color: 'var(--accent-pending)' }}>
          {formatCurrency(ms.pendingExposure)} pending exposure
        </div>
      )}
    </div>
  )
}

const STAT_ROWS: { label: string; getValue: (ms: MemberStats) => React.ReactNode }[] = [
  { label: 'Bets', getValue: (ms) => <span className="font-mono">{ms.betsParticipated}</span> },
  { label: 'Won', getValue: (ms) => <span className="font-mono" style={{ color: 'var(--accent-won)' }}>{ms.wonBets}</span> },
  { label: 'Lost', getValue: (ms) => <span className="font-mono" style={{ color: 'var(--accent-lost)' }}>{ms.lostBets}</span> },
  { label: 'Total Staked', getValue: (ms) => <span className="font-mono">{formatCurrency(ms.totalStaked)}</span> },
  { label: 'Gross Returned', getValue: (ms) => <span className="font-mono">{formatCurrency(ms.grossReturned)}</span> },
  { label: 'Net P/L', getValue: (ms) => <PLValue value={ms.realizedNetPL} /> },
  { label: 'Pending Exposure', getValue: (ms) => <span className="font-mono" style={{ color: 'var(--accent-pending)' }}>{formatCurrency(ms.pendingExposure)}</span> },
  { label: 'Paid Out', getValue: (ms) => <span className="font-mono">{formatCurrency(ms.paidToPerson)}</span> },
  { label: 'Received', getValue: (ms) => <span className="font-mono">{formatCurrency(ms.receivedFromPerson)}</span> },
  { label: 'Balance', getValue: (ms) => <PLValue value={ms.balanceVsAccount} /> },
]

export function Members() {
  const { bets } = useBets()
  const { members } = useMembers()
  const { settlements } = useSettlements()
  const memberStats = useMemberStats(members, bets, settlements)

  return (
    <div>
      <h1 className="text-[20px] font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
        Members
      </h1>

      {/* Member cards */}
      <div className="flex gap-4 mb-8 flex-wrap">
        {memberStats.map((ms) => (
          <MemberCard key={ms.member.id} ms={ms} />
        ))}
        {memberStats.length === 0 && (
          <div className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>No members found.</div>
        )}
      </div>

      {/* Comparison table */}
      {memberStats.length > 0 && (
        <div
          className="rounded border overflow-hidden"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          <div
            className="px-5 py-3 border-b text-[12px] font-medium uppercase tracking-widest"
            style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}
          >
            Comparison
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th
                    className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-widest w-36"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Stat
                  </th>
                  {memberStats.map((ms) => (
                    <th key={ms.member.id} className="px-4 py-3 text-left">
                      <MemberDot color={ms.member.color} name={ms.member.name} size="sm" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STAT_ROWS.map(({ label, getValue }) => (
                  <tr
                    key={label}
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-hover)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.background = ''
                    }}
                  >
                    <td
                      className="px-5 py-3 text-[11px] font-medium"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {label}
                    </td>
                    {memberStats.map((ms) => (
                      <td key={ms.member.id} className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                        {getValue(ms)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
