export function formatNumber(value) {
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(value ?? 0)
}

export function formatDate(value) {
  if (!value) {
    return 'Not available'
  }
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function scoreRepository(repo) {
  if (!repo) {
    return 0
  }

  const starScore = Math.min(repo.stargazers_count / 50, 35)
  const forkScore = Math.min(repo.forks_count / 20, 20)
  const issueScore = Math.max(18 - Math.min(repo.open_issues_count, 18), 0)
  const freshnessDays = Math.floor(
    (Date.now() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24),
  )
  const freshnessScore = Math.max(25 - Math.floor(freshnessDays / 12), 0)
  const archivedPenalty = repo.archived ? 18 : 0

  return Math.max(0, Math.min(100, Math.round(starScore + forkScore + issueScore + freshnessScore - archivedPenalty)))
}
