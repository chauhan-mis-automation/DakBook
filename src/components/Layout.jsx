import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import Postmark from './Postmark'
import { IconDashboard, IconParcel, IconLogout } from './Icons'

const NAV = [
  { to: '/', label: 'Dashboard', icon: IconDashboard, end: true },
  { to: '/parcels', label: 'Parcels', icon: IconParcel },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const name = user?.full_name || user?.username || 'User'

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <Postmark size={46} light />
          <div className="brand-text">
            <strong>DakBook</strong>
            <span>Parcel desk</span>
          </div>
        </div>

        <nav className="side-nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="side-link">
              <Icon /> <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="side-foot">
          <div className="who">
            <span className="avatar">{name.charAt(0).toUpperCase()}</span>
            <div>
              <b>{name}</b>
              <small>@{user?.username}</small>
            </div>
          </div>
          <button className="side-logout" onClick={logout}>
            <IconLogout /> Log out
          </button>
        </div>
      </aside>

      <header className="topbar">
        <div className="brand brand-sm">
          <Postmark size={34} light />
          <strong>DakBook</strong>
        </div>
        <button className="icon-btn on-dark" onClick={logout} aria-label="Log out">
          <IconLogout />
        </button>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="bottom-link">
            <Icon /> <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
