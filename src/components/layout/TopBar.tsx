import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useNotifications } from '@/context/NotificationsContext'

const TopBar = () => {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()

  return (
    <div className="h-20 bg-bg-card border-b border-border-light flex items-center gap-5 px-7 sticky top-0 z-10">
      

      <div className="flex-1" />

      {/* Notification bell */}
      <button
        title="Notifications"
        onClick={() => navigate('/notifications')}
        className="w-10 h-10 rounded-pill border-0 bg-transparent cursor-pointer flex items-center justify-center text-text-secondary relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className={`absolute top-1.5 min-w-[18px] h-[18px] px-[5px] rounded-pill bg-danger text-white text-[10px] font-bold flex items-center justify-center border-2 border-bg-card tabular-nums ${
              unreadCount > 9 ? 'right-1' : 'right-[7px]'
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Staff greeting */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-bold text-text-primary">Welcome, {user.name}</div>
            <div className="text-xs text-text-muted">{user.role}</div>
          </div>
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-border-light"
          />
        </div>
      )}
    </div>
  )
}

export default TopBar
