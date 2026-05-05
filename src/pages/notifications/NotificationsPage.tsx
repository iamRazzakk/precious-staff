import { useEffect } from 'react'
import { useNotifications } from '@/context/NotificationsContext'
import { colors } from '@/utils/colors'

const NotificationsPage = () => {
  const { notifications, markAllRead } = useNotifications()

  useEffect(() => {
    // Mark all as read once the user lands on this page.
    markAllRead()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="px-8 py-7">
      <div className="bg-bg-card border border-border-light rounded-2xl p-6">
        <h2 className="text-xl font-bold text-text-primary m-0 mb-5">Notifications</h2>

        {notifications.length === 0 ? (
          <div className="text-center text-text-muted py-10">No notifications yet.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="rounded-xl px-5 py-4 flex items-start justify-between gap-4"
                style={{
                  background: n.read ? colors.bgCard : colors.primaryLight,
                  border: `1px solid ${n.read ? colors.borderLight : colors.primaryLight}`,
                }}
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-text-primary">{n.title}</div>
                  <div className="text-sm text-text-secondary mt-1">{n.message}</div>
                </div>
                <div className="text-xs text-text-muted whitespace-nowrap mt-0.5">{n.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
