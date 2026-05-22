import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase, GROUP_ID } from '../lib/supabase'
import type { Member, SettlementDirection } from '../types'

interface Props {
  members: Member[]
  onClose: () => void
  onSaved: () => void
}

export function AddSettlementForm({ members, onClose, onSaved }: Props) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [memberId, setMemberId] = useState(members[0]?.id ?? '')
  const [direction, setDirection] = useState<SettlementDirection>('Paid to Person')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!date || !memberId || !amount) {
      setError('Date, member, and amount are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const { error: err } = await supabase.from('syndicate_settlements').insert({
        group_id: GROUP_ID,
        date,
        member_id: memberId,
        direction,
        amount: parseFloat(amount),
        notes: notes || null,
      })
      if (err) throw err
      onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div
        className="fixed top-0 right-0 h-full w-[400px] z-50 flex flex-col"
        style={{
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="text-[14px] font-medium text-[var(--text-primary)]">Add Settlement</span>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="text-[12px] text-[var(--accent-lost)] p-3 rounded border border-[var(--accent-lost)]/30 bg-[var(--accent-lost)]/10">
              {error}
            </div>
          )}

          <Field label="Date">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="sf-input w-full" />
          </Field>

          <Field label="Member">
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="sf-input w-full"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Direction">
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as SettlementDirection)}
              className="sf-input w-full"
            >
              <option value="Paid to Person">Paid to Person</option>
              <option value="Received from Person">Received from Person</option>
            </select>
          </Field>

          <Field label="Amount (€)">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="sf-input w-full font-mono"
            />
          </Field>

          <Field label="Notes (optional)">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cash payout"
              className="sf-input w-full"
            />
          </Field>
        </div>

        <div
          className="px-6 py-4 border-t flex gap-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2 text-[13px] rounded border text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            style={{ borderColor: 'var(--border)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 text-[13px] rounded font-medium text-[var(--bg)] bg-[var(--text-primary)] hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <style>{`
        .sf-input {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 6px 10px;
          font-size: 13px;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.15s;
        }
        .sf-input:focus { border-color: oklch(0.45 0 0); }
        .sf-input option { background: var(--bg-surface); }
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
