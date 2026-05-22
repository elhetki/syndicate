import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  Users,
  ArrowLeftRight,
  Menu,
  X,
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
  const [mobileOpen, setMobileOpen] = useState(false)

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
            onClick={() => setMobileOpen(false)}
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
        <span
          className="w-2 h-2 rounded-full bg-[var(--accent-won)] inline-block"
        />
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

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="text-[13px] font-semibold tracking-widest uppercase" style={{ color: 'var(--text-primary)' }}>
          SYNDICATE
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="p-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 flex"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-60 h-full" onClick={(e) => e.stopPropagation()}>
            {sidebar}
          </div>
          <div className="flex-1 bg-black/50" />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-60 min-h-screen overflow-y-auto">
        <div className="p-8 pt-16 md:pt-8">{children}</div>
      </main>
    </div>
  )
}
