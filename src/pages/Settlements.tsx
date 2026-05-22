import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useSettlements } from '../hooks/useSettlements'
import { useMembers } from '../hooks/useMembers'
import { formatCurrency, formatDate } from '../lib/calculations'
import { MemberDot } from '../components/MemberDot'
import { EmptyState } from '../components/EmptyState'
import { AddSettlementForm } from '../components/AddSettlementForm'

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded animate-pulse w-20" style={{ background: 'var(--bg-hover)' }} />
        </td>
      ))}
    </tr>
  )
}

export function Settlements() {
  const { settlements, loading, refetch } = useSettlements()
  const { members } = useMembers()
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-[20px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            Settlements
          </h1>
          <span
            className="text-[11px] font-mono px-2 py-0.5 rounded border"
            style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border)' }}
          >
            {settlements.length}
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium"
          style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}
        >
          <Plus size={14} />
          Add Settlement
        </button>
      </div>

      {/* Table */}
      <div
        className="rounded border overflow-hidden"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
      >
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Date', 'Person', 'Direction', 'Amount', 'Notes'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
            ) : settlements.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState message="No settlements yet." />
                </td>
              </tr>
            ) : (
              settlements.map((s) => {
                const member = members.find((m) => m.id === s.member_id) ?? s.member
                return (
                  <tr
                    key={s.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-hover)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.background = ''
                    }}
                  >
                    <td className="px-4 py-3 font-mono text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                      {formatDate(s.date)}
                    </td>
                    <td className="px-4 py-3">
                      {member ? (
                        <MemberDot color={member.color} name={member.name} />
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>{s.member_id}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                      {s.direction}
                    </td>
                    <td className="px-4 py-3 font-mono text-right" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(s.amount)}
                    </td>
                    <td className="px-4 py-3 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                      {s.notes ?? '—'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <AddSettlementForm
          members={members}
          onClose={() => setShowAddForm(false)}
          onSaved={refetch}
        />
      )}
    </div>
  )
}
