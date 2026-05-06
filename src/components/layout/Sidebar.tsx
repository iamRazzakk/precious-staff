import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, type MenuProps } from 'antd'
import { CalendarDays, ListChecks, Clock, UserRound, LogOut, TimerReset, MessageSquare } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

type MenuItem = Required<MenuProps>['items'][number]

const NAV_ITEMS: MenuItem[] = [
  { key: '/clock-in-out', icon: <TimerReset size={18} />, label: 'Clock In/Out' },
  { key: '/my-schedule', icon: <CalendarDays size={18} />, label: 'My Schedule' },
  { key: '/task-checklist', icon: <ListChecks size={18} />, label: 'Task Checklist' },
  { key: '/hours-worked', icon: <Clock size={18} />, label: 'Hours Worked' },
  { key: '/chat', icon: <MessageSquare size={18} />, label: 'Chat' },
  { key: '/my-profile', icon: <UserRound size={18} />, label: 'My Profile' },
]

const Sidebar = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const selectedKey = useMemo(() => {
    const path = location.pathname
    const topMatch = NAV_ITEMS.find(
      (i) => i && (path === i.key || path.startsWith(i.key + '/')),
    )
    return topMatch ? (topMatch.key as string) : path
  }, [location.pathname])

  return (
    <aside className="w-[260px] bg-bg-card border-r border-border-light flex flex-col flex-shrink-0 h-screen sticky top-0">
      <div className="p-6 flex-shrink-0 flex items-center justify-center">
        <img
          src="/logo-icon.png"
          alt="logo-icon"
          className=" w-[80px] h-[80px] rounded-full object-cover border-2 border-border-light"
        />
      </div>

      <div className="flex-1 px-2 overflow-y-auto overflow-x-hidden">
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={NAV_ITEMS}
          onClick={({ key }) => navigate(key)}
          style={{ borderInlineEnd: 'none', background: 'transparent', fontSize: 14 }}
        />
      </div>

      <div className="px-3.5 pt-3 pb-3.5 border-t border-border-light flex-shrink-0">

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-[11px] rounded-[10px] border-0 bg-transparent text-text-secondary text-sm font-medium cursor-pointer text-left font-[inherit] transition-[background] duration-150 hover:bg-bg-input"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
