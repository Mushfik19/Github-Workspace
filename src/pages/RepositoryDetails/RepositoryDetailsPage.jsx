import { useEffect, useState } from 'react'
import { NavLink, Outlet, useOutletContext, useParams } from 'react-router-dom'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { useWorkspace } from '../../context/WorkspaceContext'
import {
  getRepoBranches,
  getRepoCommits,
  getRepoContributors,
  getRepoIssues,
  getRepository,
} from '../../services/githubApi'
import { formatDate, formatNumber, scoreRepository } from '../../utils/format'

export function RepositoryDetailsPage() {
  const { owner, repo } = useParams()
  const {
    collections,
    favorites,
    toggleFavoriteRepo,
    addRepoToCollection,
    trackRepoView,
  } = useWorkspace()
  const [repository, setRepository] = useState(null)
  const [contributors, setContributors] = useState([])
  const [branches, setBranches] = useState([])
  const [commits, setCommits] = useState([])
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadRepository() {
      setLoading(true)
      setError('')

      try {
        const [repoData, contributorData, branchData, commitData, issueData] = await Promise.all([
          getRepository(owner, repo),
          getRepoContributors(owner, repo, 10),
          getRepoBranches(owner, repo, 10),
          getRepoCommits(owner, repo, 10),
          getRepoIssues(owner, repo, 10),
        ])

        setRepository(repoData)
        setContributors(contributorData)
        setBranches(branchData)
        setCommits(commitData)
        setIssues(issueData)
        trackRepoView(repoData)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadRepository()
  }, [owner, repo, trackRepoView])

  if (loading) {
    return <LoadingState message="Loading repository overview, branches, commits, and contributors..." />
  }

  if (error || !repository) {
    return <div className="error-text">{error || 'Repository not found.'}</div>
  }

  const isFavorite = favorites.repos.some((item) => item.id === repository.id)
  const healthScore = scoreRepository(repository)

  return (
    <div className="list-grid">
      <PageHeader
        badge="Repository Explorer"
        title={repository.full_name}
        description={repository.description || 'Repository explorer'}
        actions={
          <>
            <a className="secondary-btn" href={repository.html_url} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <button className="primary-btn" type="button" onClick={() => toggleFavoriteRepo(repository)}>
              {isFavorite ? 'Remove favorite' : 'Favorite repo'}
            </button>
          </>
        }
      />

      <section className="grid-two">
        <article className="card">
          <div className="repo-health">
            <div className="health-ring" style={{ '--score': healthScore }}>
              <span>{healthScore}</span>
            </div>
            <div>
              <h2 className="section-heading">Repository health score</h2>
              <p className="muted">
                A practical signal using stars, forks, open issues, freshness, and archive status.
              </p>
            </div>
          </div>
        </article>

        <article className="card">
          <h2 className="section-heading">Add to collection</h2>
          <div className="activity-list" style={{ marginTop: 14 }}>
            {collections.slice(0, 3).map((collection) => (
              <button
                key={collection.id}
                type="button"
                className="list-item"
                onClick={() => addRepoToCollection(collection.id, collection.name, repository)}
              >
                <strong>{collection.name}</strong>
                <p className="muted">{collection.items.length} saved repositories</p>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="stats-grid">
        <article className="card stat-card">
          <p className="muted">Stars</p>
          <h3>{formatNumber(repository.stargazers_count)}</h3>
        </article>
        <article className="card stat-card">
          <p className="muted">Forks</p>
          <h3>{formatNumber(repository.forks_count)}</h3>
        </article>
        <article className="card stat-card">
          <p className="muted">Open issues</p>
          <h3>{formatNumber(repository.open_issues_count)}</h3>
        </article>
        <article className="card stat-card">
          <p className="muted">Language</p>
          <h3>{repository.language || 'N/A'}</h3>
        </article>
      </section>

      <nav className="tab-row">
        <NavLink end to="" className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
          Overview
        </NavLink>
        <NavLink to="contributors" className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
          Contributors
        </NavLink>
        <NavLink to="issues" className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
          Issues
        </NavLink>
        <NavLink to="branches" className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
          Branches
        </NavLink>
        <NavLink to="commits" className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
          Commits
        </NavLink>
      </nav>

      <Outlet context={{ repository, contributors, issues, branches, commits }} />
    </div>
  )
}

export function RepoOverviewTab() {
  const { repository } = useOutletContext()

  return (
    <section className="grid-two">
      <article className="card">
        <h2 className="section-heading">Overview</h2>
        <p>{repository.description || 'No description available.'}</p>
      </article>
      <article className="card">
        <h2 className="section-heading">Operational signals</h2>
        <div className="activity-list">
          <div className="list-item">
            <strong>Last push</strong>
            <p className="muted">{formatDate(repository.pushed_at)}</p>
          </div>
          <div className="list-item">
            <strong>Default branch</strong>
            <p className="muted">{repository.default_branch}</p>
          </div>
          <div className="list-item">
            <strong>Visibility</strong>
            <p className="muted">{repository.visibility}</p>
          </div>
        </div>
      </article>
    </section>
  )
}

function RepoListTab({ items, render }) {
  return <section className="search-results">{items.map(render)}</section>
}

export function RepoContributorsTab() {
  const { contributors } = useOutletContext()
  return (
    <RepoListTab
      items={contributors}
      render={(item) => (
        <article className="repo-card" key={item.id}>
          <strong>{item.login}</strong>
          <p className="muted">{formatNumber(item.contributions)} contributions</p>
        </article>
      )}
    />
  )
}

export function RepoIssuesTab() {
  const { issues } = useOutletContext()
  return (
    <RepoListTab
      items={issues}
      render={(item) => (
        <article className="repo-card" key={item.id}>
          <strong>{item.title}</strong>
          <p className="muted">#{item.number}</p>
        </article>
      )}
    />
  )
}

export function RepoBranchesTab() {
  const { branches } = useOutletContext()
  return (
    <RepoListTab
      items={branches}
      render={(item) => (
        <article className="repo-card" key={item.name}>
          <strong>{item.name}</strong>
          <p className="muted">{item.protected ? 'Protected branch' : 'Standard branch'}</p>
        </article>
      )}
    />
  )
}

export function RepoCommitsTab() {
  const { commits } = useOutletContext()
  return (
    <RepoListTab
      items={commits}
      render={(item) => (
        <article className="repo-card" key={item.sha}>
          <strong>{item.commit.message}</strong>
          <p className="muted">{item.commit.author?.name || 'Unknown author'}</p>
        </article>
      )}
    />
  )
}
