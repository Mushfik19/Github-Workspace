import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'

const navItems = [
  ['Dashboard', '/dashboard'],
  ['Search', '/search'],
  ['Favorites', '/favorites'],
  ['Collections', '/collections'],
  ['Notifications', '/notifications'],
  ['Settings', '/settings'],
]

export function AppShell() {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const { unreadCount, activity } = useWorkspace()

  return (
    <div className="app-shell">
      <aside className="sidebar panel">
        <div className="space-between">
          <div className="brand-mark">GW</div>
          {unreadCount ? <span className="status-pill">{unreadCount} unread</span> : null}
        </div>

        <div className="brand-copy" style={{ marginTop: 18 }}>
          <h1>GitHub Workspace</h1>
          <p>Explore developers, save repositories, and manage your GitHub research in one place.</p>
        </div>

        <div className="divider" />

        <nav className="sidebar-nav">
          {navItems.map(([label, href]) => (
            <NavLink key={href} to={href}>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="divider" />

        <div className="side-actions">
          <button type="button" onClick={() => navigate('/search?type=users')}>
            <span>Quick user search</span>
            <span className="tiny-pill">{activity.recentSearches.length}</span>
          </button>
          <button type="button" onClick={() => navigate('/search?type=repositories')}>
            <span>Advanced repo search</span>
            <span className="tiny-pill">URL sync</span>
          </button>
        </div>

        <div className="divider" />

        <div className="card">
          <p className="helper-text">Logged in as</p>
          <strong>{currentUser?.name}</strong>
          <p className="muted">@{currentUser?.username}</p>
          <p className="helper-text">{currentUser?.email}</p>
          <div className="inline-actions" style={{ marginTop: 12 }}>
            <button className="secondary-btn" type="button" onClick={() => navigate('/settings')}>
              Preferences
            </button>
            <button
              className="danger-btn"
              type="button"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="main-panel panel">
        <Outlet />
      </main>
    </div>
  )
}
