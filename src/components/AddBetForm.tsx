import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase, GROUP_ID } from '../lib/supabase'
import type { Member, BetResult } from '../types'

interface Props {
  members: Member[]
  onClose: () => void
  onSaved: () => void
}

export function AddBetForm({ members, onClose, onSaved }: Props) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [event, setEvent] = useState('')
  const [odds, setOdds] = useState('')
  const [result, setResult] = useState<BetResult>('Pending')
  const [payoutOverride, setPayoutOverride] = useState('')
  const [stakes, setStakes] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!date || !event || !odds) {
      setError('Date, event, and odds are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
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

      const stakeRows = members
        .filter((m) => stakes[m.id] && parseFloat(stakes[m.id]) > 0)
        .map((m) => ({
          bet_id: betData.id,
          member_id: m.id,
          stake: parseFloat(stakes[m.id]),
        }))

      if (stakeRows.length > 0) {
        const { error: stakeErr } = await supabase
          .from('syndicate_bet_stakes')
          .insert(stakeRows)
        if (stakeErr) throw stakeErr
      }

      onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save bet.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full w-[400px] z-50 flex flex-col overflow-y-auto"
        style={{
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="text-[14px] font-medium text-[var(--text-primary)]">Add Bet</span>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
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
              className="input-base w-full"
            />
          </Field>

          <Field label="Event">
            <input
              type="text"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              placeholder="e.g. Man City vs Arsenal"
              className="input-base w-full"
            />
          </Field>

          <Field label="Odds">
            <input
              type="number"
              value={odds}
              onChange={(e) => setOdds(e.target.value)}
              placeholder="e.g. 2.50"
              step="0.01"
              className="input-base w-full font-mono"
            />
          </Field>

          <Field label="Result">
            <select
              value={result}
              onChange={(e) => setResult(e.target.value as BetResult)}
              className="input-base w-full"
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
              className="input-base w-full font-mono"
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
                    onChange={(e) => setStakes((prev) => ({ ...prev, [m.id]: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                    className="input-base flex-1 font-mono text-right"
                  />
                </div>
              ))}
            </div>
          </div>
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
            {saving ? 'Saving…' : 'Save Bet'}
          </button>
        </div>
      </div>

      <style>{`
        .input-base {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 6px 10px;
          font-size: 13px;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.15s;
        }
        .input-base:focus {
          border-color: oklch(0.45 0 0);
        }
        .input-base option {
          background: var(--bg-surface);
        }
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
