import { PageHeader } from '../../components/common/PageHeader'
import { useWorkspace } from '../../context/WorkspaceContext'
import { formatDate } from '../../utils/format'

export function NotificationsPage() {
  const { notifications, markAllNotificationsRead, markNotificationRead } = useWorkspace()

  return (
    <div className="list-grid">
      <PageHeader
        badge="Activity Feed"
        title="Notification center"
        description="Local notifications make the app feel like a real workspace instead of a static demo."
        actions={
          <button className="secondary-btn" type="button" onClick={markAllNotificationsRead}>
            Mark all as read
          </button>
        }
      />

      <section className="notification-list">
        {notifications.map((notification) => (
          <article
            className={`notification-item ${notification.isRead ? '' : 'unread'}`}
            key={notification.id}
          >
            <div className="space-between">
              <div>
                <strong>{notification.title}</strong>
                <p className="muted">{notification.message}</p>
                <p className="helper-text">{formatDate(notification.createdAt)}</p>
              </div>
              {!notification.isRead ? (
                <button
                  className="secondary-btn"
                  type="button"
                  onClick={() => markNotificationRead(notification.id)}
                >
                  Mark read
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
