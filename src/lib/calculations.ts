import type { Bet, BetStake, Member, MemberStats, GroupSummary, Settlement } from '../types'

export function computeActualPayout(bet: Bet): number {
  const totalStake = (bet.stakes ?? []).reduce((s, bk) => s + bk.stake, 0)
  return bet.actual_payout_override != null
    ? bet.actual_payout_override
    : bet.odds * totalStake
}

export function computeBetPayout(bet: Bet, totalStake: number): number {
  return bet.actual_payout_override != null
    ? bet.actual_payout_override
    : bet.odds * totalStake
}

export function computeMemberReturn(
  bet: Bet,
  memberStake: number,
  totalStake: number
): number | null {
  if (bet.result === 'Pending') return null
  if (bet.result === 'Lost') return 0
  if (totalStake === 0) return 0
  const payout = computeBetPayout(bet, totalStake)
  return (memberStake / totalStake) * payout
}

export function computeMemberNetPL(
  bet: Bet,
  memberStake: number,
  totalStake: number
): number | null {
  const ret = computeMemberReturn(bet, memberStake, totalStake)
  if (ret === null) return null
  return ret - memberStake
}

export function computeMemberStats(
  member: Member,
  bets: Bet[],
  settlements: Settlement[]
): MemberStats {
  let totalStaked = 0
  let grossReturned = 0
  let pendingExposure = 0
  let betsParticipated = 0
  let wonBets = 0
  let lostBets = 0
  let pendingBets = 0

  for (const bet of bets) {
    const stakes = bet.stakes ?? []
    const memberStakeObj = stakes.find((s) => s.member_id === member.id)
    if (!memberStakeObj) continue

    const memberStake = memberStakeObj.stake
    const totalStake = stakes.reduce((sum, s) => sum + s.stake, 0)

    betsParticipated++
    totalStaked += memberStake

    if (bet.result === 'Won') {
      wonBets++
      const ret = computeMemberReturn(bet, memberStake, totalStake)
      if (ret !== null) grossReturned += ret
    } else if (bet.result === 'Lost') {
      lostBets++
    } else {
      pendingBets++
      pendingExposure += memberStake
    }
  }

  const realizedNetPL = grossReturned - (totalStaked - pendingExposure)

  let paidToPerson = 0
  let receivedFromPerson = 0
  for (const s of settlements) {
    if (s.member_id !== member.id) continue
    if (s.direction === 'Paid to Person') paidToPerson += s.amount
    else receivedFromPerson += s.amount
  }

  const balanceVsAccount = realizedNetPL - paidToPerson + receivedFromPerson

  return {
    member,
    betsParticipated,
    totalStaked,
    wonBets,
    lostBets,
    pendingBets,
    grossReturned,
    realizedNetPL,
    pendingExposure,
    paidToPerson,
    receivedFromPerson,
    balanceVsAccount,
  }
}

export function computeGroupSummary(bets: Bet[]): GroupSummary {
  let wonBets = 0
  let lostBets = 0
  let pendingBets = 0
  let totalStaked = 0
  let totalReturned = 0

  for (const bet of bets) {
    const stakes = bet.stakes ?? []
    const betTotal = stakes.reduce((s, bk) => s + bk.stake, 0)
    totalStaked += betTotal

    if (bet.result === 'Won') {
      wonBets++
      totalReturned += computeBetPayout(bet, betTotal)
    } else if (bet.result === 'Lost') {
      lostBets++
    } else {
      pendingBets++
    }
  }

  const settledBets = wonBets + lostBets
  const winRate = settledBets > 0 ? (wonBets / settledBets) * 100 : 0
  const settledStaked = bets
    .filter((b) => b.result !== 'Pending')
    .reduce((s, b) => s + (b.stakes ?? []).reduce((x, bk) => x + bk.stake, 0), 0)
  const netPL = totalReturned - settledStaked
  const roi = settledStaked > 0 ? (netPL / settledStaked) * 100 : 0

  return {
    totalBets: bets.length,
    wonBets,
    lostBets,
    pendingBets,
    totalStaked,
    totalReturned,
    netPL,
    winRate,
    roi,
  }
}

export function formatCurrency(n: number): string {
  return (
    '€' +
    Math.abs(n)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  )
}

export function formatCurrencySigned(n: number): string {
  const abs = Math.abs(n)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return (n < 0 ? '-€' : '€') + abs
}

export function formatDate(s: string): string {
  const d = new Date(s)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatOdds(n: number): string {
  return 'x' + n.toFixed(2)
}

export function getTotalStake(stakes: BetStake[]): number {
  return stakes.reduce((s, bk) => s + bk.stake, 0)
}
