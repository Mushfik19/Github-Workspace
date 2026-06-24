import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const WorkspaceContext = createContext(null)
const MAX_NOTIFICATIONS = 24

function createDefaultCollections() {
  return [
    {
      id: crypto.randomUUID(),
      name: 'Frontend Repositories',
      description: 'UI systems, component libraries, and polished frontends.',
      items: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Machine Learning',
      description: 'Practical ML tools and learning resources.',
      items: [],
      createdAt: new Date().toISOString(),
    },
  ]
}

function createDefaultState() {
  return {
    favorites: {
      users: [],
      repos: [],
    },
    collections: createDefaultCollections(),
    notifications: [],
    activity: {
      recentUsers: [],
      recentRepos: [],
      recentSearches: [],
    },
    settings: {
      theme: 'system',
      paginationSize: 10,
      defaultSearchType: 'users',
    },
  }
}

function mergeState(persistedState) {
  const fallback = createDefaultState()

  return {
    ...fallback,
    ...persistedState,
    favorites: {
      ...fallback.favorites,
      ...persistedState?.favorites,
    },
    activity: {
      ...fallback.activity,
      ...persistedState?.activity,
    },
    settings: {
      ...fallback.settings,
      ...persistedState?.settings,
    },
    collections:
      persistedState?.collections?.length ? persistedState.collections : fallback.collections,
    notifications: persistedState?.notifications ?? [],
  }
}

function buildNotification(title, message) {
  return {
    id: crypto.randomUUID(),
    title,
    message,
    isRead: false,
    createdAt: new Date().toISOString(),
  }
}

function trimList(list, max = 8) {
  return list.slice(0, max)
}

function prependNotification(notifications, notification) {
  return trimList([notification, ...notifications], MAX_NOTIFICATIONS)
}

function workspaceReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_FAVORITE_USER': {
      const exists = state.favorites.users.some((user) => user.login === action.payload.login)
      const users = exists
        ? state.favorites.users.filter((user) => user.login !== action.payload.login)
        : [action.payload, ...state.favorites.users]

      return {
        ...state,
        favorites: { ...state.favorites, users },
        notifications: prependNotification(
          state.notifications,
          buildNotification(
            exists ? 'Developer removed' : 'Developer added to favorites',
            `${action.payload.login} ${exists ? 'was removed from' : 'was saved to'} your favorites.`,
          ),
        ),
      }
    }
    case 'TOGGLE_FAVORITE_REPO': {
      const exists = state.favorites.repos.some((repo) => repo.id === action.payload.id)
      const repos = exists
        ? state.favorites.repos.filter((repo) => repo.id !== action.payload.id)
        : [action.payload, ...state.favorites.repos]

      return {
        ...state,
        favorites: { ...state.favorites, repos },
        notifications: prependNotification(
          state.notifications,
          buildNotification(
            exists ? 'Repository removed' : 'Repository added to favorites',
            `${action.payload.full_name} ${exists ? 'was removed from' : 'was saved to'} favorites.`,
          ),
        ),
      }
    }
    case 'ADD_COLLECTION':
      return {
        ...state,
        collections: [action.payload, ...state.collections],
        notifications: prependNotification(
          state.notifications,
          buildNotification('Collection created', `${action.payload.name} is ready to organize repositories.`),
        ),
      }
    case 'UPDATE_COLLECTION':
      return {
        ...state,
        collections: state.collections.map((collection) =>
          collection.id === action.payload.id ? action.payload : collection,
        ),
      }
    case 'DELETE_COLLECTION':
      return {
        ...state,
        collections: state.collections.filter((collection) => collection.id !== action.payload),
      }
    case 'ADD_REPO_TO_COLLECTION':
      if (
        state.collections.some(
          (collection) =>
            collection.id === action.payload.collectionId &&
            collection.items.some((item) => item.id === action.payload.repo.id),
        )
      ) {
        return state
      }

      return {
        ...state,
        collections: state.collections.map((collection) =>
          collection.id === action.payload.collectionId
            ? {
                ...collection,
                items: collection.items.some((item) => item.id === action.payload.repo.id)
                  ? collection.items
                  : [action.payload.repo, ...collection.items],
              }
            : collection,
        ),
        notifications: prependNotification(
          state.notifications,
          buildNotification(
            'Repository collected',
            `${action.payload.repo.full_name} was added to ${action.payload.collectionName}.`,
          ),
        ),
      }
    case 'TRACK_USER_VIEW':
      return {
        ...state,
        activity: {
          ...state.activity,
          recentUsers: trimList([
            action.payload,
            ...state.activity.recentUsers.filter((user) => user.login !== action.payload.login),
          ]),
        },
        notifications: prependNotification(
          state.notifications,
          buildNotification('Profile viewed', `You checked ${action.payload.login}'s workspace profile.`),
        ),
      }
    case 'TRACK_REPO_VIEW':
      return {
        ...state,
        activity: {
          ...state.activity,
          recentRepos: trimList([
            action.payload,
            ...state.activity.recentRepos.filter((repo) => repo.id !== action.payload.id),
          ]),
        },
      }
    case 'TRACK_SEARCH':
      return {
        ...state,
        activity: {
          ...state.activity,
          recentSearches: trimList([
            action.payload,
            ...state.activity.recentSearches.filter((search) => search.label !== action.payload.label),
          ]),
        },
        notifications: prependNotification(
          state.notifications,
          buildNotification('Search completed', `Saved ${action.payload.type} search: ${action.payload.label}.`),
        ),
      }
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload
            ? { ...notification, isRead: true }
            : notification,
        ),
      }
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      }
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      }
    default:
      return state
  }
}

export function WorkspaceProvider({ children }) {
  const [persistedState, setPersistedState] = useLocalStorage(
    'ghw_workspace',
    createDefaultState(),
  )
  const [state, dispatch] = useReducer(workspaceReducer, persistedState, mergeState)

  useEffect(() => {
    setPersistedState(state)
  }, [setPersistedState, state])

  useEffect(() => {
    const preferredTheme =
      state.settings.theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : state.settings.theme

    document.documentElement.dataset.theme = preferredTheme
  }, [state.settings.theme])

  const value = useMemo(
    () => ({
      ...state,
      unreadCount: state.notifications.filter((item) => !item.isRead).length,
      toggleFavoriteUser(user) {
        dispatch({ type: 'TOGGLE_FAVORITE_USER', payload: user })
      },
      toggleFavoriteRepo(repo) {
        dispatch({ type: 'TOGGLE_FAVORITE_REPO', payload: repo })
      },
      createCollection(name, description) {
        dispatch({
          type: 'ADD_COLLECTION',
          payload: {
            id: crypto.randomUUID(),
            name,
            description,
            items: [],
            createdAt: new Date().toISOString(),
          },
        })
      },
      updateCollection(collection) {
        dispatch({ type: 'UPDATE_COLLECTION', payload: collection })
      },
      deleteCollection(id) {
        dispatch({ type: 'DELETE_COLLECTION', payload: id })
      },
      addRepoToCollection(collectionId, collectionName, repo) {
        dispatch({
          type: 'ADD_REPO_TO_COLLECTION',
          payload: { collectionId, collectionName, repo },
        })
      },
      trackUserView(user) {
        dispatch({ type: 'TRACK_USER_VIEW', payload: user })
      },
      trackRepoView(repo) {
        dispatch({ type: 'TRACK_REPO_VIEW', payload: repo })
      },
      trackSearch(search) {
        dispatch({ type: 'TRACK_SEARCH', payload: search })
      },
      markNotificationRead(id) {
        dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id })
      },
      markAllNotificationsRead() {
        dispatch({ type: 'MARK_ALL_READ' })
      },
      updateSettings(settings) {
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings })
      },
    }),
    [state],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider')
  }
  return context
}
