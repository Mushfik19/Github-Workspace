import { PageHeader } from '../../components/common/PageHeader'
import { useWorkspace } from '../../context/WorkspaceContext'

export function SettingsPage() {
  const { settings, updateSettings } = useWorkspace()

  return (
    <div className="list-grid">
      <PageHeader
        badge="Module 10"
        title="Workspace settings"
        description="Theme, page size, and default search behavior are all persisted locally."
      />

      <section className="setting-grid">
        <article className="card form-grid">
          <h2 className="section-heading">Theme</h2>
          <select
            className="select"
            value={settings.theme}
            onChange={(event) => updateSettings({ theme: event.target.value })}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </article>

        <article className="card form-grid">
          <h2 className="section-heading">Pagination size</h2>
          <select
            className="select"
            value={settings.paginationSize}
            onChange={(event) => updateSettings({ paginationSize: Number(event.target.value) })}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </article>

        <article className="card form-grid">
          <h2 className="section-heading">Default search type</h2>
          <select
            className="select"
            value={settings.defaultSearchType}
            onChange={(event) => updateSettings({ defaultSearchType: event.target.value })}
          >
            <option value="users">Users</option>
            <option value="repositories">Repositories</option>
          </select>
        </article>
      </section>
    </div>
  )
}
