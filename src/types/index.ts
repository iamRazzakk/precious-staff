// Notification types
export type NotificationType =
  | 'safety'
  | 'support'
  | 'revenue'
  | 'user'
  | 'broadcast'
  | 'community'
  | 'billing'
  | 'system'

export interface AdminNotification {
  id: number
  type: NotificationType
  title: string
  message: string
  time: string
  rawTime: string
  read: boolean
  actor?: { name: string; avatar: string }
  actionLabel?: string
  actionKey?: string
}

// Toast types
export type ToastTone = 'success' | 'warning' | 'danger' | 'info'

export interface Toast {
  text: string
  tone: ToastTone
}
