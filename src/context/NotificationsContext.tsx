import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react'
import type { AdminNotification } from '@/types'

interface NotificationsContextValue {
  notifications: AdminNotification[]
  unreadCount: number
  markAsRead: (id: number) => void
  markAllRead: () => void
  removeNotification: (id: number) => void
  addNotification: (n: Omit<AdminNotification, 'id'>) => void
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

const SEED_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 1,
    type: 'system',
    title: 'Schedule Update',
    message: 'Your shift on Friday has been updated to 8:00 AM - 4:00 PM with Eleanor Mitchell.',
    time: '2 hours ago',
    rawTime: '',
    read: false,
  },
  {
    id: 2,
    type: 'system',
    title: 'Training Reminder',
    message: 'Annual Dementia Care refresher training is due by May 15, 2026.',
    time: '5 hours ago',
    rawTime: '',
    read: false,
  },
  {
    id: 3,
    type: 'user',
    title: 'New Client Assignment',
    message: 'You have been assigned a new client: Rose Nakamura, starting next week.',
    time: '1 day ago',
    rawTime: '',
    read: true,
  },
  {
    id: 4,
    type: 'billing',
    title: 'Payroll Processed',
    message: 'Your April 1-15 payroll has been processed. Check your bank account.',
    time: '2 days ago',
    rawTime: '',
    read: true,
  },
  {
    id: 5,
    type: 'broadcast',
    title: 'Policy Update',
    message: 'Updated infection control policies are now available in the staff handbook.',
    time: '3 days ago',
    rawTime: '',
    read: true,
  },
  {
    id: 6,
    type: 'system',
    title: 'Certification Expiry',
    message: 'Your CPR/First Aid certification expires in 60 days. Please schedule renewal.',
    time: '4 days ago',
    rawTime: '',
    read: true,
  },
  {
    id: 7,
    type: 'community',
    title: 'Team Meeting',
    message: 'Monthly team meeting scheduled for May 1, 2026 at 9:00 AM.',
    time: '5 days ago',
    rawTime: '',
    read: true,
  },
  {
    id: 8,
    type: 'support',
    title: 'Client Feedback',
    message: "Eleanor Mitchell's family left positive feedback about your care this week!",
    time: '6 days ago',
    rawTime: '',
    read: true,
  },
]

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>(SEED_NOTIFICATIONS)

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const addNotification = (n: Omit<AdminNotification, 'id'>) => {
    setNotifications((prev) => [{ ...n, id: Date.now() }, ...prev])
  }

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllRead, removeNotification, addNotification }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotifications = (): NotificationsContextValue => {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
