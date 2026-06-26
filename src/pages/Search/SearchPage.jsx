import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { PageHeader } from '../../components/common/PageHeader'
import { useDebounce } from '../../hooks/useDebounce'
import { getUser, searchRepositories } from '../../services/githubApi'
import { useWorkspace } from '../../context/WorkspaceContext'
import { formatNumber, scoreRepository } from '../../utils/format'

export function SearchPage() {
  const { settings, favorites, trackSearch, toggleFavoriteUser, toggleFavoriteRepo } = useWorkspace()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '')
  const [language, setLanguage] = useState(searchParams.get('language') ?? '')
  const [stars, setStars] = useState(searchParams.get('stars') ?? '')
  const [forks, setForks] = useState(searchParams.get('forks') ?? '')
  const [updated, setUpdated] = useState(searchParams.get('updated') ?? '')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const lastTrackedSearch = useRef('')

  const type = searchParams.get('type') ?? settings.defaultSearchType
  const debouncedValue = useDebounce(searchValue, 500)

  useEffect(() => {
    setSearchValue(searchParams.get('q') ?? '')
    setLanguage(searchParams.get('language') ?? '')
    setStars(searchParams.get('stars') ?? '')
    setForks(searchParams.get('forks') ?? '')
    setUpdated(searchParams.get('updated') ?? '')
  }, [searchParams])

  useEffect(() => {
    const next = new URLSearchParams()
    next.set('type', type)

    if (searchValue) next.set('q', searchValue)
    else next.delete('q')

    if (language) next.set('language', language)
    else next.delete('language')

    if (stars) next.set('stars', stars)
    else next.delete('stars')

    if (forks) next.set('forks', forks)
    else next.delete('forks')

    if (updated) next.set('updated', updated)
    else next.delete('updated')

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true })
    }
  }, [forks, language, searchParams, searchValue, setSearchParams, stars, type, updated])

  useEffect(() => {
    let isActive = true

    async function runSearch() {
      if (!debouncedValue.trim()) {
        setItems([])
        setError('')
        return
      }

      setLoading(true)
      setError('')

      try {
        if (type === 'users') {
          const usernames = debouncedValue
            .split(/[\s,]+/)
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 6)

          const users = await Promise.all(usernames.map((username) => getUser(username)))
          if (!isActive) return
          setItems(users)

          const searchLabel = usernames.join(', ')
          const searchKey = `users:${searchLabel}`
          if (lastTrackedSearch.current !== searchKey) {
            lastTrackedSearch.current = searchKey
            trackSearch({
              id: crypto.randomUUID(),
              type: 'users',
              label: searchLabel,
              createdAt: new Date().toISOString(),
            })
          }
        } else {
          const response = await searchRepositories({
            query: debouncedValue,
            language,
            stars,
            forks,
            updated,
            perPage: settings.paginationSize,
          })
          if (!isActive) return
          setItems(response.items ?? [])

          const searchKey = `repositories:${debouncedValue}:${language}:${stars}:${forks}:${updated}`
          if (lastTrackedSearch.current !== searchKey) {
            lastTrackedSearch.current = searchKey
            trackSearch({
              id: crypto.randomUUID(),
              type: 'repositories',
              label: debouncedValue,
              createdAt: new Date().toISOString(),
            })
          }
        }
      } catch (requestError) {
        if (!isActive) return
        setError(requestError.message)
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    runSearch()
    return () => {
      isActive = false
    }
  }, [debouncedValue, forks, language, settings.paginationSize, stars, trackSearch, type, updated])

  const shareLink = window.location.href

  async function handleCopyLink() {
    try {
      if (window.navigator.clipboard?.writeText) {
        await window.navigator.clipboard.writeText(shareLink)
      } else {
        window.prompt('Copy this link:', shareLink)
      }
      setCopyStatus('Link copied.')
    } catch {
      setCopyStatus('Copy failed. You can copy the URL manually.')
    }
  }

  function changeType(nextType) {
    const next = new URLSearchParams()
    next.set('type', nextType)

    if (searchValue) {
      next.set('q', searchValue)
    }
    if (nextType === 'repositories') {
      if (language) next.set('language', language)
      if (stars) next.set('stars', stars)
      if (forks) next.set('forks', forks)
      if (updated) next.set('updated', updated)
    }

    setSearchParams(next)
  }

  return (
    <div className="list-grid">
      <PageHeader
        badge="Search"
        title="Search GitHub users and repositories"
        description="Users search supports multiple usernames at once, and repository search keeps filters synced in the URL for sharing."
        actions={
          <div className="form-grid">
            <button className="secondary-btn" type="button" onClick={handleCopyLink}>
              Copy shareable link
            </button>
            {copyStatus ? <span className="helper-text">{copyStatus}</span> : null}
          </div>
        }
      />

      <section className="card form-grid">
        <div className="tab-row">
          <button
            type="button"
            className={`tab-link ${type === 'users' ? 'active' : ''}`}
            onClick={() => changeType('users')}
          >
            Users
          </button>
          <button
            type="button"
            className={`tab-link ${type === 'repositories' ? 'active' : ''}`}
            onClick={() => changeType('repositories')}
          >
            Repositories
          </button>
        </div>

        <input
          className="field"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder={
            type === 'users'
              ? 'Try: torvalds gaearon yyx990803'
              : 'Search repositories, libraries, starter kits...'
          }
        />

        {type === 'repositories' ? (
          <div className="grid-four">
            <input
              className="field"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              placeholder="Language"
            />
            <input
              className="field"
              value={stars}
              onChange={(event) => setStars(event.target.value)}
              placeholder="Min stars"
            />
            <input
              className="field"
              value={forks}
              onChange={(event) => setForks(event.target.value)}
              placeholder="Min forks"
            />
            <input
              className="field"
              type="date"
              value={updated}
              onChange={(event) => setUpdated(event.target.value)}
            />
          </div>
        ) : null}
      </section>

      {loading ? <LoadingState message="Querying GitHub..." /> : null}
      {error ? <div className="error-text">{error}</div> : null}

      {!loading && !error && !items.length ? (
        <EmptyState
          title="No results yet"
          message="Start with a username list or a repository keyword to populate the workspace."
        />
      ) : null}

      <section className="search-results">
        {type === 'users'
          ? items.map((user) => {
              const isFavorite = favorites.users.some((item) => item.login === user.login)
              return (
                <article className="repo-card" key={user.id}>
                  <div className="repo-head">
                    <img className="avatar" src={user.avatar_url} alt={user.login} />
                    <div>
                      <strong>{user.login}</strong>
                      <p className="muted">{user.name || 'No public name'}</p>
                    </div>
                  </div>
                  <div className="kpi-grid" style={{ marginTop: 14 }}>
                    <div className="kpi">
                      <span className="muted">Followers</span>
                      <strong>{formatNumber(user.followers)}</strong>
                    </div>
                    <div className="kpi">
                      <span className="muted">Following</span>
                      <strong>{formatNumber(user.following)}</strong>
                    </div>
                    <div className="kpi">
                      <span className="muted">Repos</span>
                      <strong>{formatNumber(user.public_repos)}</strong>
                    </div>
                  </div>
                  <div className="inline-actions" style={{ marginTop: 14 }}>
                    <Link className="primary-btn" to={`/users/${user.login}`}>
                      View profile
                    </Link>
                    <button className="secondary-btn" type="button" onClick={() => toggleFavoriteUser(user)}>
                      {isFavorite ? 'Unfavorite' : 'Favorite'}
                    </button>
                  </div>
                </article>
              )
            })
          : items.map((repo) => {
              const isFavorite = favorites.repos.some((item) => item.id === repo.id)
              return (
                <article className="repo-card" key={repo.id}>
                  <div className="space-between">
                    <div>
                      <strong>{repo.full_name}</strong>
                      <p className="muted">{repo.description || 'No description provided.'}</p>
                    </div>
                    <span className="tiny-pill">Health {scoreRepository(repo)}</span>
                  </div>
                  <div className="pill-row">
                    <span className="tiny-pill">{repo.language || 'Unknown language'}</span>
                    <span className="tiny-pill">{formatNumber(repo.stargazers_count)} stars</span>
                    <span className="tiny-pill">{formatNumber(repo.forks_count)} forks</span>
                  </div>
                  <div className="inline-actions">
                    <Link className="primary-btn" to={`/repos/${repo.owner.login}/${repo.name}`}>
                      Explore repo
                    </Link>
                    <button className="secondary-btn" type="button" onClick={() => toggleFavoriteRepo(repo)}>
                      {isFavorite ? 'Unfavorite' : 'Favorite'}
                    </button>
                  </div>
                </article>
              )
            })}
      </section>
    </div>
  )
}
