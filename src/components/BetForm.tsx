import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase, GROUP_ID } from '../lib/supabase'
import type { Member, Bet, BetResult } from '../types'

interface Props {
  members: Member[]
  bet?: Bet // if provided → edit mode
  onClose: () => void
  onSaved: () => void
}

export function BetForm({ members, bet, onClose, onSaved }: Props) {
  const isEdit = !!bet

  const [date, setDate] = useState(bet?.date ?? new Date().toISOString().slice(0, 10))
  const [event, setEvent] = useState(bet?.event ?? '')
  const [odds, setOdds] = useState(bet?.odds != null ? String(bet.odds) : '')
  const [result, setResult] = useState<BetResult>(bet?.result ?? 'Pending')
  const [payoutOverride, setPayoutOverride] = useState(
    bet?.actual_payout_override != null ? String(bet.actual_payout_override) : ''
  )
  const [stakes, setStakes] = useState<Record<string, string>>(() => {
    if (!bet?.stakes) return {}
    const map: Record<string, string> = {}
    bet.stakes.forEach((s) => {
      map[s.member_id] = String(s.stake)
    })
    return map
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!date || !event || !odds) {
      setError('Date, event, and odds are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const stakeRows = members
        .filter((m) => stakes[m.id] && parseFloat(stakes[m.id]) > 0)
        .map((m) => ({
          member_id: m.id,
          stake: parseFloat(stakes[m.id]),
        }))

      if (isEdit && bet) {
        // UPDATE
        const { error: betErr } = await supabase
          .from('syndicate_bets')
          .update({
            date,
            event,
            odds: parseFloat(odds),
            result,
            actual_payout_override: payoutOverride ? parseFloat(payoutOverride) : null,
          })
          .eq('id', bet.id)
        if (betErr) throw betErr

        // Replace stakes
        const { error: delStakeErr } = await supabase
          .from('syndicate_bet_stakes')
          .delete()
          .eq('bet_id', bet.id)
        if (delStakeErr) throw delStakeErr

        if (stakeRows.length > 0) {
          const { error: stakeErr } = await supabase
            .from('syndicate_bet_stakes')
            .insert(stakeRows.map((s) => ({ ...s, bet_id: bet.id })))
          if (stakeErr) throw stakeErr
        }
      } else {
        // INSERT
        const { data: betData, error: betErr } = await supabase
          .from('syndicate_bets')
          .insert({
            group_id: GROUP_ID,
            date,
            event,
            odds: parseFloat(odds),
            result,
            actual_payout_override: payoutOverride ? parseFloat(payoutOverride) : null,
          })
          .select()
          .single()
        if (betErr) throw betErr

        if (stakeRows.length > 0) {
          const { error: stakeErr } = await supabase
            .from('syndicate_bet_stakes')
            .insert(stakeRows.map((s) => ({ ...s, bet_id: betData.id })))
          if (stakeErr) throw stakeErr
        }
      }

      onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save bet.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!bet) return
    if (!confirm('Delete this bet? This cannot be undone.')) return
    setDeleting(true)
    setError(null)
    try {
      const { error: delStakeErr } = await supabase
        .from('syndicate_bet_stakes')
        .delete()
        .eq('bet_id', bet.id)
      if (delStakeErr) throw delStakeErr

      const { error: delBetErr } = await supabase
        .from('syndicate_bets')
        .delete()
        .eq('id', bet.id)
      if (delBetErr) throw delBetErr

      onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete bet.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col overflow-y-auto"
        style={{
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          width: 'min(400px, 100vw)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="text-[14px] font-medium text-[var(--text-primary)]">
            {isEdit ? 'Edit Bet' : 'Add Bet'}
          </span>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-4">
          {error && (
            <div className="text-[12px] text-[var(--accent-lost)] p-3 rounded border border-[var(--accent-lost)]/30 bg-[var(--accent-lost)]/10">
              {error}
            </div>
          )}

          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bf-input w-full"
            />
          </Field>

          <Field label="Event">
            <input
              type="text"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              placeholder="e.g. Man City vs Arsenal"
              className="bf-input w-full"
            />
          </Field>

          <Field label="Odds">
            <input
              type="number"
              value={odds}
              onChange={(e) => setOdds(e.target.value)}
              placeholder="e.g. 2.50"
              step="0.01"
              className="bf-input w-full font-mono"
            />
          </Field>

          <Field label="Result">
            <select
              value={result}
              onChange={(e) => setResult(e.target.value as BetResult)}
              className="bf-input w-full"
            >
              <option value="Pending">Pending</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </Field>

          <Field label="Actual Payout Override (optional)">
            <input
              type="number"
              value={payoutOverride}
              onChange={(e) => setPayoutOverride(e.target.value)}
              placeholder="Leave blank to use odds × total stake"
              step="0.01"
              className="bf-input w-full font-mono"
            />
          </Field>

          <div>
            <div className="text-[11px] uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
              Stakes (€)
            </div>
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-24">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: m.color }}
                    />
                    <span className="text-[13px] text-[var(--text-secondary)]">{m.name}</span>
                  </div>
                  <input
                    type="number"
                    value={stakes[m.id] ?? ''}
                    onChange={(e) =>
                      setStakes((prev) => ({ ...prev, [m.id]: e.target.value }))
                    }
                    placeholder="0.00"
                    step="0.01"
                    className="bf-input flex-1 font-mono text-right"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Delete button (edit mode only) */}
          {isEdit && (
            <div className="pt-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-[13px] text-[var(--accent-lost)] hover:opacity-80 disabled:opacity-40 transition-opacity"
              >
                {deleting ? 'Deleting…' : 'Delete this bet'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex gap-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2 text-[13px] rounded border text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border)]"
            style={{ borderColor: 'var(--border)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 text-[13px] rounded font-medium text-[var(--bg)] bg-[var(--text-primary)] hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Bet'}
          </button>
        </div>
      </div>

      <style>{`
        .bf-input {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 6px 10px;
          font-size: 13px;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.15s;
        }
        .bf-input:focus { border-color: oklch(0.45 0 0); }
        .bf-input option { background: var(--bg-surface); }
      `}</style>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-widest text-[var(--text-tertiary)] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}
