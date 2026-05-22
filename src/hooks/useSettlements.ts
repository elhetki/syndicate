import { useState, useEffect, useCallback } from 'react'
import { supabase, GROUP_ID } from '../lib/supabase'
import type { Settlement } from '../types'

export function useSettlements() {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('syndicate_settlements')
      .select(`*, syndicate_members(*)`)
      .eq('group_id', GROUP_ID)
      .order('date', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      const mapped = (data ?? []).map((s: Record<string, unknown>) => ({
        ...s,
        member: s.syndicate_members,
      })) as Settlement[]
      setSettlements(mapped)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { settlements, loading, error, refetch: fetch }
}
