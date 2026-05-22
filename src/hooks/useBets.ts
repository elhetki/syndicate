import { useState, useEffect, useCallback } from 'react'
import { supabase, GROUP_ID } from '../lib/supabase'
import type { Bet } from '../types'

export function useBets() {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('syndicate_bets')
      .select(`*, syndicate_bet_stakes(*, syndicate_members(*))`)
      .eq('group_id', GROUP_ID)
      .order('date', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      const mapped = (data ?? []).map((b: Record<string, unknown>) => ({
        ...b,
        stakes: ((b.syndicate_bet_stakes as Record<string, unknown>[]) ?? []).map((s) => ({
          ...s,
          member: s.syndicate_members,
        })),
      })) as Bet[]
      setBets(mapped)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { bets, loading, error, refetch: fetch }
}
