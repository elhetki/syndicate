export type BetResult = 'Won' | 'Lost' | 'Pending'
export type SettlementDirection = 'Paid to Person' | 'Received from Person'

export interface Member {
  id: string
  group_id: string
  name: string
  color: string
  created_at: string
}

export interface Bet {
  id: string
  group_id: string
  date: string
  event: string
  notes: string | null
  odds: number
  result: BetResult
  actual_payout_override: number | null
  created_at: string
  stakes?: BetStake[]
}

export interface BetStake {
  id: string
  bet_id: string
  member_id: string
  stake: number
  member?: Member
}

export interface Settlement {
  id: string
  group_id: string
  member_id: string
  direction: SettlementDirection
  amount: number
  date: string
  notes: string | null
  created_at: string
  member?: Member
}

export interface MemberStats {
  member: Member
  betsParticipated: number
  totalStaked: number
  wonBets: number
  lostBets: number
  pendingBets: number
  grossReturned: number
  realizedNetPL: number
  pendingExposure: number
  paidToPerson: number
  receivedFromPerson: number
  balanceVsAccount: number
}

export interface GroupSummary {
  totalBets: number
  wonBets: number
  lostBets: number
  pendingBets: number
  totalStaked: number
  totalReturned: number
  netPL: number
  winRate: number
  roi: number
}
