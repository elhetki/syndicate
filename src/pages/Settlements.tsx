import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useSettlements } from '../hooks/useSettlements'
import { useMembers } from '../hooks/useMembers'
import { formatCurrency, formatDate } from '../lib/calculations'
import { MemberDot } from '../components/MemberDot'
import { EmptyState } from '../components/EmptyState'
import { SettlementForm } from '../components/SettlementForm'
import type { Settlement } from '../types'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return isMobile
}

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

function SkeletonCard() {
  return (
    <div className="py-3 px-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex justify-between mb-2">
        <div className="h-3 w-16 rounded animate-pulse" style={{ background: 'var(--bg-hover)' }} />
        <div className="h-3 w-16 rounded animate-pulse" style={{ background: 'var(--bg-hover)' }} />
      </div>
      <div className="h-3 w-32 rounded animate-pulse" style={{ background: 'var(--bg-hover)' }} />
    </div>
  )
}

export function Settlements() {
  const { settlements, loading, error: settlementsError, refetch } = useSettlements()
  const { members, error: membersError } = useMembers()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSettlement, setEditingSettlement] = useState<Settlement | null>(null)
  const isMobile = useIsMobile()
  const loadError = settlementsError ?? membersError

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

      {loadError && (
        <div className="mb-4 rounded border border-[var(--accent-lost)]/30 bg-[var(--accent-lost)]/10 px-3 py-2 text-[12px] text-[var(--accent-lost)]">
          {loadError}
        </div>
      )}

      {/* ── MOBILE: Card list ── */}
      {isMobile ? (
        <div
          className="rounded border overflow-hidden"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : settlements.length === 0 ? (
            <EmptyState message="No settlements yet." />
          ) : (
            settlements.map((s) => {
              const member = members.find((m) => m.id === s.member_id) ?? s.member
              return (
                <div
                  key={s.id}
                  className="py-3 px-4 cursor-pointer active:bg-[var(--bg-hover)] transition-colors"
                  style={{ borderBottom: '1px solid var(--border-subtle)', minHeight: 44 }}
                  onClick={() => setEditingSettlement(s)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                      {formatDate(s.date)}
                    </span>
                    <span className="text-[13px] font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(s.amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {member ? (
                      <MemberDot color={member.color} name={member.name} size="sm" />
                    ) : (
                      <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{s.member_id}</span>
                    )}
                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      · {s.direction}
                    </span>
                  </div>
                  {s.notes && (
                    <div className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      {s.notes}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      ) : (
        /* ── DESKTOP: Table ── */
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
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      onMouseEnter={(e) => {
                        ;(e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-hover)'
                      }}
                      onMouseLeave={(e) => {
                        ;(e.currentTarget as HTMLTableRowElement).style.background = ''
                      }}
                      onClick={() => setEditingSettlement(s)}
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
      )}

      {showAddForm && (
        <SettlementForm
          members={members}
          onClose={() => setShowAddForm(false)}
          onSaved={() => { refetch(); setShowAddForm(false) }}
        />
      )}

      {editingSettlement && (
        <SettlementForm
          members={members}
          settlement={editingSettlement}
          onClose={() => setEditingSettlement(null)}
          onSaved={() => { refetch(); setEditingSettlement(null) }}
        />
      )}
    </div>
  )
}
