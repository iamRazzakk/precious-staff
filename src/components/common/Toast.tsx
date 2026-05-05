import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { colors } from '@/utils/colors'
import type { ToastTone } from '@/types'

interface ToastProps {
  text: string
  tone?: ToastTone
}

const toneMap = {
  success: { bg: colors.success, Icon: CheckCircle2 },
  warning: { bg: colors.warning, Icon: AlertTriangle },
  danger: { bg: colors.danger, Icon: AlertCircle },
  info: { bg: colors.info, Icon: Info },
} as const

const Toast = ({ text, tone = 'success' }: ToastProps) => {
  const { bg, Icon } = toneMap[tone]
  return (
    <div
      className="fixed top-6 left-1/2 -translate-x-1/2 text-white px-5 py-3 rounded-pill text-sm font-semibold flex items-center gap-2.5 shadow-toast z-[9999]"
      style={{ background: bg, animation: 'toastSlide 0.2s ease' }}
    >
      <Icon size={18} />
      {text}
    </div>
  )
}

export default Toast
