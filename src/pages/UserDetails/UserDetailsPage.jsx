import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useOutletContext, useParams } from 'react-router-dom'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { useWorkspace } from '../../context/WorkspaceContext'
import {
  getUser,
  getUserFollowers,
  getUserFollowing,
  getUserRepos,
} from '../../services/githubApi'
import { formatNumber } from '../../utils/format'

export function UserDetailsPage() {
  const { username } = useParams()
  const { favorites, toggleFavoriteUser, trackUserView } = useWorkspace()
  const [user, setUser] = useState(null)
  const [repos, setRepos] = useState([])
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUserDetails() {
      setLoading(true)
      setError('')

      try {
        const [profile, repoData, followerData, followingData] = await Promise.all([
          getUser(username),
          getUserRepos(username, 12),
          getUserFollowers(username, 10),
          getUserFollowing(username, 10),
        ])

        setUser(profile)
        setRepos(repoData)
        setFollowers(followerData)
        setFollowing(followingData)
        trackUserView(profile)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadUserDetails()
  }, [trackUserView, username])

  if (loading) {
    return <LoadingState message="Fetching profile, followers, and repositories..." />
  }

  if (error || !user) {
    return <div className="error-text">{error || 'User not found.'}</div>
  }

  const isFavorite = favorites.users.some((item) => item.login === user.login)

  return (
    <div className="list-grid">
      <PageHeader
        badge="Module 3"
        title={user.login}
        description={user.bio || 'GitHub developer profile view'}
        actions={
          <>
            <a className="secondary-btn" href={user.html_url} target="_blank" rel="noreferrer">
              Open on GitHub
            </a>
            <button className="primary-btn" type="button" onClick={() => toggleFavoriteUser(user)}>
              {isFavorite ? 'Remove favorite' : 'Favorite developer'}
            </button>
          </>
        }
      />

      <section className="card">
        <div className="profile-head">
          <div className="repo-head">
            <img className="avatar lg" src={user.avatar_url} alt={user.login} />
            <div>
              <h2 className="section-heading">{user.name || user.login}</h2>
              <p className="muted">{user.company || 'Independent developer'}</p>
              <p className="muted">{user.location || 'Location unavailable'}</p>
              {user.blog ? (
                <a href={user.blog} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                  {user.blog}
                </a>
              ) : null}
            </div>
          </div>

          <div className="kpi-grid">
            <div className="kpi">
              <span className="muted">Followers</span>
              <strong>{formatNumber(user.followers)}</strong>
            </div>
            <div className="kpi">
              <span className="muted">Following</span>
              <strong>{formatNumber(user.following)}</strong>
            </div>
            <div className="kpi">
              <span className="muted">Public repos</span>
              <strong>{formatNumber(user.public_repos)}</strong>
            </div>
          </div>
        </div>
      </section>

      <nav className="tab-row">
        <NavLink end to="" className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
          Profile
        </NavLink>
        <NavLink to="repositories" className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
          Repositories
        </NavLink>
        <NavLink to="followers" className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
          Followers
        </NavLink>
        <NavLink to="following" className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
          Following
        </NavLink>
      </nav>

      <Outlet context={{ user, repos, followers, following }} />
    </div>
  )
}

export function UserProfileTab() {
  const { user } = useOutletContext()

  return (
    <section className="grid-two">
      <article className="card">
        <h2 className="section-heading">Profile summary</h2>
        <p>{user.bio || 'No bio available.'}</p>
      </article>
      <article className="card">
        <h2 className="section-heading">Quick links</h2>
        <div className="activity-list">
          <Link className="list-item" to={`/search?type=repositories&q=${user.login}`}>
            Search repositories by this user
          </Link>
          <a className="list-item" href={user.html_url} target="_blank" rel="noreferrer">
            Open GitHub profile
          </a>
        </div>
      </article>
    </section>
  )
}

export function UserRepositoriesTab() {
  const { repos } = useOutletContext()

  return (
    <section className="search-results">
      {repos.map((repo) => (
        <Link className="repo-card" key={repo.id} to={`/repos/${repo.owner.login}/${repo.name}`}>
          <strong>{repo.name}</strong>
          <p className="muted">{repo.description || 'No description available.'}</p>
          <span className="tiny-pill">{repo.language || 'Unknown language'}</span>
        </Link>
      ))}
    </section>
  )
}

function FollowList({ items }) {
  return (
    <section className="search-results">
      {items.map((item) => (
        <Link className="repo-card" key={item.id} to={`/users/${item.login}`}>
          <div className="repo-head">
            <img className="avatar" src={item.avatar_url} alt={item.login} />
            <div>
              <strong>{item.login}</strong>
              <p className="muted">Open profile</p>
            </div>
          </div>
        </Link>
      ))}
    </section>
  )
}

export function UserFollowersTab() {
  const { followers } = useOutletContext()
  return <FollowList items={followers} />
}

export function UserFollowingTab() {
  const { following } = useOutletContext()
  return <FollowList items={following} />
}
