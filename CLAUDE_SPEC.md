# Syndicate — Build Spec for Claude Code

## What this is
A group sports betting tracker. 4 friends (Gebran, Jad, Dany, Elias) pool money on Stake (crypto betting platform). The app replaces a spreadsheet. Data is already seeded in Supabase.

## Stack
- Vite + React 18 + TypeScript
- TailwindCSS v4 (via @tailwindcss/vite)
- React Router v6
- @supabase/supabase-js
- recharts (charts)
- lucide-react (icons)
- Geist + Geist Mono fonts (loaded via Google Fonts in index.css)

## Design: Vercel Aesthetic (CRITICAL)
The app MUST feel like vercel.com — their dashboard aesthetic.

**Palette (already defined in index.css as CSS vars):**
- `--bg`: near-black `oklch(0.09 0 0)` — main background  
- `--bg-surface`: `oklch(0.13 0 0)` — card/table surfaces
- `--bg-hover`: `oklch(0.16 0 0)` — hover states
- `--border`: `oklch(0.22 0 0)` — borders
- `--border-subtle`: `oklch(0.17 0 0)` — subtle dividers
- `--text-primary`: `oklch(0.95 0 0)` — main text
- `--text-secondary`: `oklch(0.6 0 0)` — secondary text
- `--text-tertiary`: `oklch(0.42 0 0)` — muted text
- `--accent-won`: green — Won bets
- `--accent-lost`: red — Lost bets
- `--accent-pending`: amber — Pending bets
- Member colors: `--accent-gebran` (blue), `--accent-jad` (green), `--accent-dany` (amber), `--accent-elias` (purple)

**Typography:**
- Primary font: `Geist` (already loaded)
- Numbers/amounts: `Geist Mono` (class `font-mono`)
- Sizes: 13px body, 12px secondary, 11px label/badge

**NO:**
- No glassmorphism
- No gradient text
- No purple-to-blue gradients
- No nested cards inside cards
- No rounded corners > 6px
- No generic shadows
- No Inter font — use Geist

**DO:**
- Clean table rows with hover states (like Vercel deployments)
- Status dots/badges (small, tight, pill shape)
- Left-aligned text, right-aligned numbers
- Subtle borders for surfaces
- Monospace for all monetary values

## Data Model (Supabase tables — prefix: `syndicate_`)

```
syndicate_groups: id, name, created_at
syndicate_members: id, group_id, name, color, created_at
syndicate_bets: id, group_id, date, event, notes, odds, result (Won/Lost/Pending), actual_payout_override, created_at
syndicate_bet_stakes: id, bet_id, member_id, stake
syndicate_settlements: id, group_id, member_id, direction (Paid to Person/Received from Person), amount, date, notes, created_at
```

## Business Logic

### Calculated fields per bet (per member):
- `stake` = from syndicate_bet_stakes
- `return` = if Won: (stake / total_stake) * actual_payout; if Lost: 0; if Pending: null
- `net_pl` = return - stake (if not Pending)
- `actual_payout` = actual_payout_override if set, else odds * total_stake

### Per-member summary:
- `totalStaked` = sum of all their stakes
- `grossReturned` = sum of all their returns (Won bets only)
- `realizedNetPL` = grossReturned - totalStaked (Won+Lost only)
- `pendingExposure` = sum of stakes on Pending bets
- `paidToPerson` = sum from settlements where direction = 'Paid to Person'
- `receivedFromPerson` = sum from settlements where direction = 'Received from Person'
- `balanceVsAccount` = realizedNetPL - paidToPerson + receivedFromPerson

### Group summary:
- Won/Lost/Pending counts
- Total staked across all bets
- Total returned
- Net P/L
- Win rate %
- ROI %

## Pages & Components

### 1. Layout (`src/components/Layout.tsx`)
Vercel-style layout:
- Left sidebar (240px wide, fixed)
  - App logo/name "SYNDICATE" — uppercase, weight 600, small tracking
  - Nav links: Overview, Bets, Members, Settlements
  - Active state: white text + subtle left border accent
  - At bottom: group name "Stake Syndicate"
- Main content area: scrollable, padding 32px
- Top header bar on mobile (hide sidebar, hamburger)

Nav items with icons (lucide-react):
- LayoutDashboard → Overview
- Receipt → Bets
- Users → Members
- ArrowLeftRight → Settlements

### 2. Overview/Dashboard (`src/pages/Overview.tsx`)
Top row — 4 stat tiles (NOT cards, just stat blocks separated by borders):
- Net P/L (total group, in €) — large mono number, green if positive red if negative
- Total Staked — mono
- Win Rate % — mono
- Total Bets (with Won/Lost/Pending breakdown below)

Below: Two-column layout
- LEFT: Recent Bets (last 10) — table style, cols: Date | Event | Odds | Result | P/L
- RIGHT: Member Balances — horizontal bar showing each person's P/L, their balance vs account with colored dots

Below: Simple line chart (recharts) — cumulative Net P/L over time, one line per member, member colors

### 3. Bets (`src/pages/Bets.tsx`)
Full-width table of all bets. Vercel deployments table style.

Columns:
- Date (monospace, small)
- Event (primary text, truncated)
- Odds (mono, right-aligned)
- Total Stake (mono, € prefix, right-aligned)
- Result (badge: Won=green dot, Lost=red dot, Pending=amber dot + text)
- Payout (mono, right-aligned, show — for Lost/Pending)
- Net P/L (mono, colored green/red, right-aligned)
- Stakes breakdown (show each member's stake as small colored dots/pills)

Expandable row: click a row → expands to show per-member breakdown table

Filter bar at top:
- All / Won / Lost / Pending tabs
- Sort by: Date (default desc), Odds, Stake

Add Bet button (top right) → inline form or drawer (NOT a modal)

### 4. Members (`src/pages/Members.tsx`)
4 member tiles in a row (NOT nested cards — just bordered blocks).
Each shows:
- Member name + colored dot
- Key stats: Staked / Returned / Net P/L / Balance
- Win rate (mini progress bar — simple line not a fat rounded bar)
- Pending exposure amount

Below: comparison table — all 4 members side by side with all stats

### 5. Settlements (`src/pages/Settlements.tsx`)
Table of all settlements. Simple.
Columns: Date | Person (colored dot + name) | Direction | Amount | Notes

Add Settlement button → inline form

## Supabase Queries

Use these patterns:

```typescript
// Fetch bets with stakes
const { data } = await supabase
  .from('syndicate_bets')
  .select(`*, syndicate_bet_stakes(*, syndicate_members(*))`)
  .eq('group_id', GROUP_ID)
  .order('date', { ascending: false })

// Fetch members
const { data } = await supabase
  .from('syndicate_members')
  .select('*')
  .eq('group_id', GROUP_ID)
  .order('name')

// Fetch settlements with members
const { data } = await supabase
  .from('syndicate_settlements')
  .select(`*, syndicate_members(*)`)
  .eq('group_id', GROUP_ID)
  .order('date', { ascending: false })
```

## Files to create:
```
src/
  main.tsx                     — router setup
  App.tsx                      — route definitions
  lib/
    supabase.ts                — already exists
    calculations.ts            — all business logic functions
  types/
    index.ts                   — already exists
  hooks/
    useGroup.ts                — fetch group data
    useBets.ts                 — fetch bets + stakes
    useMembers.ts              — fetch members
    useSettlements.ts          — fetch settlements
    useMemberStats.ts          — compute member stats from data
  components/
    Layout.tsx                 — sidebar + nav
    StatBlock.tsx              — single stat display
    BetResultBadge.tsx         — Won/Lost/Pending badge
    MemberDot.tsx              — colored dot + optional name
    PLValue.tsx                — colored P/L number (green/red)
    EmptyState.tsx             — empty state component
    AddBetForm.tsx             — add bet inline form
    AddSettlementForm.tsx      — add settlement inline form
  pages/
    Overview.tsx
    Bets.tsx
    Members.tsx
    Settlements.tsx
```

## Important
- All monetary values formatted as: `€1,234.56` (Euro symbol, 2 decimal places, comma separator)
- Dates formatted as: `18 Mar 2026`
- Loading states: simple skeleton rows (thin lines), not spinners
- Error states: inline error message, no full-page errors
- NO mock data — fetch everything from Supabase
- The app is currently single-group (GROUP_ID from env) — no auth needed
- RLS is disabled for now (public access via anon key)

## RLS — run this in Supabase before deploying:
```sql
ALTER TABLE syndicate_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE syndicate_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE syndicate_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE syndicate_bet_stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE syndicate_settlements ENABLE ROW LEVEL SECURITY;

-- Public read for now (single shared group)
CREATE POLICY "public_read_groups" ON syndicate_groups FOR SELECT USING (true);
CREATE POLICY "public_read_members" ON syndicate_members FOR SELECT USING (true);
CREATE POLICY "public_read_bets" ON syndicate_bets FOR SELECT USING (true);
CREATE POLICY "public_read_stakes" ON syndicate_bet_stakes FOR SELECT USING (true);
CREATE POLICY "public_read_settlements" ON syndicate_settlements FOR SELECT USING (true);
CREATE POLICY "public_write_bets" ON syndicate_bets FOR INSERT WITH CHECK (true);
CREATE POLICY "public_write_stakes" ON syndicate_bet_stakes FOR INSERT WITH CHECK (true);
CREATE POLICY "public_write_settlements" ON syndicate_settlements FOR INSERT WITH CHECK (true);
```
