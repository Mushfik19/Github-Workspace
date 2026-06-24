import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/common/EmptyState'
import { PageHeader } from '../../components/common/PageHeader'
import { useWorkspace } from '../../context/WorkspaceContext'
import { formatNumber } from '../../utils/format'

export function FavoritesPage() {
  const { favorites } = useWorkspace()

  return (
    <div className="list-grid">
      <PageHeader
        badge="Module 6"
        title="Favorites"
        description="Keep your most relevant developers and repositories in one fast-access workspace."
      />

      <section className="grid-two">
        <article className="card">
          <h2 className="section-heading">Favorite developers</h2>
          <div className="favorites-grid" style={{ marginTop: 14 }}>
            {favorites.users.map((user) => (
              <Link className="repo-card" key={user.id} to={`/users/${user.login}`}>
                <strong>{user.login}</strong>
                <p className="muted">{user.name || 'GitHub developer'}</p>
                <span className="tiny-pill">{formatNumber(user.followers)} followers</span>
              </Link>
            ))}
          </div>
        </article>

        <article className="card">
          <h2 className="section-heading">Favorite repositories</h2>
          <div className="favorites-grid" style={{ marginTop: 14 }}>
            {favorites.repos.map((repo) => (
              <Link className="repo-card" key={repo.id} to={`/repos/${repo.owner.login}/${repo.name}`}>
                <strong>{repo.full_name}</strong>
                <p className="muted">{repo.description || 'No description available.'}</p>
                <span className="tiny-pill">{formatNumber(repo.stargazers_count)} stars</span>
              </Link>
            ))}
          </div>
        </article>
      </section>

      {!favorites.users.length && !favorites.repos.length ? (
        <EmptyState
          title="Nothing favorited yet"
          message="Save developers and repositories from search results or detail pages."
        />
      ) : null}
    </div>
  )
}
