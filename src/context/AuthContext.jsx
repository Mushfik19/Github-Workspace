import { createContext, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AuthContext = createContext(null)
const normalizeEmail = (email) => email.trim().toLowerCase()
const normalizeUsername = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')

function buildUsername(formData) {
  const candidate = formData.username || formData.name || formData.email?.split('@')[0] || 'member'
  return normalizeUsername(candidate)
}

function hydrateUser(user) {
  const username = buildUsername(user)
  return {
    ...user,
    username: username || `member${String(user.id).slice(-4)}`,
  }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useLocalStorage('ghw_users', [])
  const [currentUser, setCurrentUser] = useLocalStorage('ghw_current_user', null)

  const value = useMemo(
    () => ({
      currentUser: currentUser ? hydrateUser(currentUser) : null,
      isAuthenticated: Boolean(currentUser),
      register(formData) {
        const normalizedEmail = normalizeEmail(formData.email)
        const normalizedUsername = buildUsername(formData)

        const exists = users.find((user) => user.email === normalizedEmail)
        if (exists) {
          throw new Error('An account with this email already exists.')
        }

        const usernameTaken = users.find(
          (user) => buildUsername(user) === normalizedUsername,
        )
        if (usernameTaken) {
          throw new Error('This username is already taken.')
        }

        if (!normalizedUsername) {
          throw new Error('Username is required.')
        }

        const newUser = {
          id: crypto.randomUUID(),
          name: formData.name.trim(),
          email: normalizedEmail,
          username: normalizedUsername,
          password: formData.password,
          role: 'workspace-member',
          createdAt: new Date().toISOString(),
        }

        setUsers((prev) => [...prev, newUser])
        setCurrentUser(newUser)
      },
      login({ identifier, password }) {
        const normalizedIdentifier = identifier.trim().toLowerCase()
        const user = users.find(
          (item) =>
            (item.email === normalizeEmail(identifier) ||
              buildUsername(item) === normalizedIdentifier ||
              item.name.trim().toLowerCase() === normalizedIdentifier) &&
            item.password === password,
        )

        if (!user) {
          throw new Error('Incorrect username, email, or password.')
        }

        setCurrentUser(hydrateUser(user))
      },
      logout() {
        setCurrentUser(null)
      },
    }),
    [currentUser, setCurrentUser, setUsers, users],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
