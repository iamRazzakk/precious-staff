import React, { createContext, useContext, useState, ReactNode } from 'react'
import Toast from '@/components/common/Toast'
import type { ToastTone } from '@/types'

interface ToastState {
  text: string
  tone: ToastTone
}

interface ToastContextValue {
  showToast: (text: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = (text: string, tone: ToastTone = 'success') => {
    setToast({ text, tone })
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast text={toast.text} tone={toast.tone} />}
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
