import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../components/common/ProtectedRoute'
import { AppShell } from '../components/layout/AppShell'
import { AuthPage } from '../pages/Auth/AuthPage'
import { CollectionsPage } from '../pages/Collections/CollectionsPage'
import { DashboardPage } from '../pages/Dashboard/DashboardPage'
import { FavoritesPage } from '../pages/Favorites/FavoritesPage'
import { NotificationsPage } from '../pages/Notifications/NotificationsPage'
import {
  RepoBranchesTab,
  RepoCommitsTab,
  RepoContributorsTab,
  RepoIssuesTab,
  RepositoryDetailsPage,
  RepoOverviewTab,
} from '../pages/RepositoryDetails/RepositoryDetailsPage'
import { SearchPage } from '../pages/Search/SearchPage'
import { SettingsPage } from '../pages/Settings/SettingsPage'
import {
  UserDetailsPage,
  UserFollowersTab,
  UserFollowingTab,
  UserProfileTab,
  UserRepositoriesTab,
} from '../pages/UserDetails/UserDetailsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route path="/users/:username" element={<UserDetailsPage />}>
            <Route index element={<UserProfileTab />} />
            <Route path="repositories" element={<UserRepositoriesTab />} />
            <Route path="followers" element={<UserFollowersTab />} />
            <Route path="following" element={<UserFollowingTab />} />
          </Route>

          <Route path="/repos/:owner/:repo" element={<RepositoryDetailsPage />}>
            <Route index element={<RepoOverviewTab />} />
            <Route path="contributors" element={<RepoContributorsTab />} />
            <Route path="issues" element={<RepoIssuesTab />} />
            <Route path="branches" element={<RepoBranchesTab />} />
            <Route path="commits" element={<RepoCommitsTab />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
