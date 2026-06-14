import { CreditCard, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Brand from '@/components/Brand/Brand'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/authSlice'

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/plans', label: 'Plans', icon: CreditCard },
]

const AppShell = () => {
  const [isOpen, setIsOpen] = useState(false)
  const user = useAppSelector((state) => state.auth.session?.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const signOut = () => {
    dispatch(logout())
    navigate('/login')
  };

  const closeSidebarButton = isOpen ? (
    <button
      aria-label="Close navigation overlay"
      className="fixed inset-0 z-30 bg-slate-950/45 lg:hidden"
      onClick={() => setIsOpen(false)}
      type="button"
    />
  ) : null;

  const navLinks = links.map(({ to, label, icon: Icon }) => (
    <NavLink
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
          isActive ? 'bg-cyan-300 text-slate-950' : 'text-slate-300 hover:bg-white/8 hover:text-white'
        }`
      }
      end={to === '/'}
      key={to}
      onClick={() => setIsOpen(false)}
      to={to}
    >
      <Icon aria-hidden="true" size={18} />
      {label}
    </NavLink>
  ));

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:hidden">
        <Brand />
        <button
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
          className="rounded-lg p-2"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </header>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-950 px-5 py-6 text-white transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="lg:block">
          <Brand />
        </div>
        <nav aria-label="Main navigation" className="mt-14 grid gap-2">
          {navLinks}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-5">
          <p className="truncate text-sm font-bold">{user?.name ?? 'Subscriber'}</p>
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
          <button
            className="mt-4 flex w-full items-center gap-2 rounded-lg py-2 text-sm font-semibold text-slate-300 hover:text-white"
            onClick={signOut}
            type="button"
          >
            <LogOut aria-hidden="true" size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {closeSidebarButton}

      <main className="min-h-screen lg:ml-64">
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell;
