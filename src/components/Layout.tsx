import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  Users,
  ArrowLeftRight,
} from 'lucide-react'

const navItems = [
  { to: '/overview', label: 'Overview', Icon: LayoutDashboard },
  { to: '/bets', label: 'Bets', Icon: Receipt },
  { to: '/members', label: 'Members', Icon: Users },
  { to: '/settlements', label: 'Settlements', Icon: ArrowLeftRight },
]

interface Props {
  children: React.ReactNode
}

export function Layout({ children }: Props) {
  const sidebar = (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div
          className="text-[13px] font-semibold tracking-widest uppercase"
          style={{ color: 'var(--text-primary)' }}
        >
          SYNDICATE
        </div>
        <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          Stake Tracker
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded text-[13px] transition-colors ${
                isActive
                  ? 'text-[var(--text-primary)] border-l-2 border-[var(--text-primary)] bg-[var(--bg-hover)] pl-[10px]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`
            }
          >
            <Icon size={15} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-4 border-t flex items-center gap-2"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="w-2 h-2 rounded-full bg-[var(--accent-won)] inline-block" />
        <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
          Stake Syndicate
        </span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 w-60 z-30">
        {sidebar}
      </div>

      {/* Mobile top app bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center px-4 h-[52px] border-b"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div
          className="text-[13px] font-semibold tracking-widest uppercase"
          style={{ color: 'var(--text-primary)' }}
        >
          SYNDICATE
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-60 min-h-screen overflow-y-auto">
        {/* Mobile: pt for top bar + pb for bottom tabs */}
        {/* Desktop: normal pt-8 */}
        <div className="p-4 pt-[64px] pb-[76px] md:p-8 md:pt-8 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center border-t"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          height: '56px',
        }}
      >
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center gap-[3px] relative"
            style={({ isActive }) => ({
              color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full"
                    style={{ background: 'var(--text-primary)' }}
                  />
                )}
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
