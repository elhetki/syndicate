import { useState, useEffect } from 'react'
import { supabase, GROUP_ID } from '../lib/supabase'
import type { Member } from '../types'

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('syndicate_members')
        .select('*')
        .eq('group_id', GROUP_ID)
        .order('name')

      if (err) setError(err.message)
      else setMembers((data ?? []) as Member[])
      setLoading(false)
    }
    fetch()
  }, [])

  return { members, loading, error }
}
