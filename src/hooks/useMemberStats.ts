import { useMemo } from 'react'
import type { Bet, Member, Settlement, MemberStats } from '../types'
import { computeMemberStats } from '../lib/calculations'

export function useMemberStats(
  members: Member[],
  bets: Bet[],
  settlements: Settlement[]
): MemberStats[] {
  return useMemo(
    () => members.map((m) => computeMemberStats(m, bets, settlements)),
    [members, bets, settlements]
  )
}
