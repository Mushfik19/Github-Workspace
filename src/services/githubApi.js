const API_BASE = 'https://api.github.com'

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('GitHub resource not found.')
    }
    if (response.status === 403) {
      throw new Error('GitHub rate limit reached. Try again a bit later.')
    }
    throw new Error('GitHub request failed.')
  }

  return response.json()
}

export function getUser(username) {
  return request(`/users/${username}`)
}

export function getUserRepos(username, perPage = 10) {
  return request(`/users/${username}/repos?sort=updated&per_page=${perPage}`)
}

export function getUserFollowers(username, perPage = 10) {
  return request(`/users/${username}/followers?per_page=${perPage}`)
}

export function getUserFollowing(username, perPage = 10) {
  return request(`/users/${username}/following?per_page=${perPage}`)
}

export function searchRepositories({
  query,
  language,
  stars,
  forks,
  updated,
  perPage = 10,
}) {
  const terms = [query]

  if (language) {
    terms.push(`language:${language}`)
  }
  if (stars) {
    terms.push(`stars:>=${stars}`)
  }
  if (forks) {
    terms.push(`forks:>=${forks}`)
  }
  if (updated) {
    terms.push(`pushed:>=${updated}`)
  }

  const finalQuery = encodeURIComponent(terms.filter(Boolean).join(' ').trim())
  return request(`/search/repositories?q=${finalQuery}&sort=stars&order=desc&per_page=${perPage}`)
}

export function getRepository(owner, repo) {
  return request(`/repos/${owner}/${repo}`)
}

export function getRepoContributors(owner, repo, perPage = 10) {
  return request(`/repos/${owner}/${repo}/contributors?per_page=${perPage}`)
}

export function getRepoBranches(owner, repo, perPage = 10) {
  return request(`/repos/${owner}/${repo}/branches?per_page=${perPage}`)
}

export function getRepoCommits(owner, repo, perPage = 10) {
  return request(`/repos/${owner}/${repo}/commits?per_page=${perPage}`)
}

export function getRepoIssues(owner, repo, perPage = 10) {
  return request(`/repos/${owner}/${repo}/issues?per_page=${perPage}&state=open`)
}
