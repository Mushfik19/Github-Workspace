import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import { formatDate } from '../../utils/format'

export function DashboardPage() {
  const { currentUser } = useAuth()
  const { favorites, collections, notifications, activity, settings } = useWorkspace()

  return (
    <div className="list-grid">
      <PageHeader
        badge="Workspace command center"
        title={`Hi ${currentUser?.name?.split(' ')[0] ?? 'there'}`}
        description={`Signed in as @${currentUser?.username ?? 'member'}. Track people, explore repositories, and keep your GitHub research organized.`}
        actions={
          <>
            <Link className="primary-btn" to="/search">
              Start exploring
            </Link>
            <Link className="secondary-btn" to="/collections">
              Manage collections
            </Link>
          </>
        }
      />

      <section className="hero-banner">
        <span className="badge">Real-world upgrades</span>
        <h2 className="section-heading">Built for actual research workflows</h2>
        <p>
          Search filters stay in the URL, recently viewed items are remembered, notifications show your actions,
          and repository health scores help you prioritize stronger projects quickly.
        </p>
      </section>

      <section className="stats-grid">
        <article className="card stat-card">
          <p className="muted">Favorite developers</p>
          <h3>{favorites.users.length}</h3>
        </article>
        <article className="card stat-card">
          <p className="muted">Favorite repositories</p>
          <h3>{favorites.repos.length}</h3>
        </article>
        <article className="card stat-card">
          <p className="muted">Collections</p>
          <h3>{collections.length}</h3>
        </article>
        <article className="card stat-card">
          <p className="muted">Unread notifications</p>
          <h3>{notifications.filter((item) => !item.isRead).length}</h3>
        </article>
      </section>

      <section className="split-hero">
        <article className="card">
          <div className="space-between">
            <div>
              <h2 className="section-heading">Recent activity feed</h2>
              <p className="muted">Your recent searches and visits stay saved automatically.</p>
            </div>
            <Link to="/notifications" className="secondary-btn">
              Notifications
            </Link>
          </div>
          <div className="activity-list" style={{ marginTop: 14 }}>
            {activity.recentSearches.slice(0, 3).map((item) => (
              <div className="list-item" key={item.id}>
                <strong>{item.label}</strong>
                <p className="muted">{item.type} search</p>
                <p className="helper-text">{formatDate(item.createdAt)}</p>
              </div>
            ))}
            {!activity.recentSearches.length ? (
              <div className="empty-state">
                <p>Search history will appear here after your first query.</p>
              </div>
            ) : null}
          </div>
        </article>

        <article className="card">
          <h2 className="section-heading">Workspace preferences</h2>
          <p className="muted">Your UI and search behavior settings are stored locally.</p>
          <div className="detail-grid" style={{ marginTop: 14 }}>
            <div className="kpi">
              <span className="muted">Theme</span>
              <strong>{settings.theme}</strong>
            </div>
            <div className="kpi">
              <span className="muted">Page size</span>
              <strong>{settings.paginationSize}</strong>
            </div>
            <div className="kpi">
              <span className="muted">Default search</span>
              <strong>{settings.defaultSearchType}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="grid-two">
        <article className="card">
          <div className="space-between">
            <h2 className="section-heading">Recently viewed developers</h2>
            <Link to="/favorites" className="secondary-btn">
              Saved items
            </Link>
          </div>
          <div className="activity-list" style={{ marginTop: 14 }}>
            {activity.recentUsers.slice(0, 4).map((user) => (
              <Link className="list-item" key={user.login} to={`/users/${user.login}`}>
                <strong>{user.login}</strong>
                <p className="muted">{user.name || 'GitHub developer'}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="space-between">
            <h2 className="section-heading">Collections snapshot</h2>
            <Link to="/collections" className="secondary-btn">
              Open collections
            </Link>
          </div>
          <div className="activity-list" style={{ marginTop: 14 }}>
            {collections.slice(0, 4).map((collection) => (
              <div className="list-item" key={collection.id}>
                <strong>{collection.name}</strong>
                <p className="muted">{collection.description}</p>
                <span className="tiny-pill">{collection.items.length} repos</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
