import { useState, useEffect, useCallback } from 'react'
import { supabase, GROUP_ID } from '../lib/supabase'
import type { Member } from '../types'

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('syndicate_members')
        .select('*')
        .eq('group_id', GROUP_ID)
        .order('name')

      if (err) throw err
      setMembers((data ?? []) as Member[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load members.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void fetch()
    })
  }, [fetch])

  return { members, loading, error, refetch: fetch }
}
