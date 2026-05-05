import { LucideIcon } from 'lucide-react'
import { colors } from '@/utils/colors'
import { useHover } from '@/hooks/useHover'

interface BaseButtonProps {
  label: string
  Icon?: LucideIcon
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  fullWidth?: boolean
}

const baseClass = (fullWidth?: boolean) =>
  `inline-flex items-center gap-2 justify-center h-11 px-[22px] rounded-pill border-0 text-sm font-semibold cursor-pointer transition-[background] duration-150 font-[inherit] ${
    fullWidth ? 'w-full' : 'w-auto'
  }`

export const PrimaryButton = ({ Icon, label, onClick, disabled, type = 'button', fullWidth }: BaseButtonProps) => {
  const { isHovered, hoverProps } = useHover()
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...hoverProps}
      className={baseClass(fullWidth)}
      style={{
        background: disabled ? colors.border : isHovered ? colors.primary : colors.primary,
        color: '#FFFFFF',
        opacity: disabled ? 0.7 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {Icon && <Icon size={16} />}
      {label}
    </button>
  )
}

export const SecondaryButton = ({ Icon, label, onClick, disabled, fullWidth }: BaseButtonProps) => {
  const { isHovered, hoverProps } = useHover()
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {...hoverProps}
      className={`${baseClass(fullWidth)} text-text-primary border border-border`}
      style={{
        background: isHovered ? colors.bgSubtle : colors.bgCard,
      }}
    >
      {Icon && <Icon size={16} />}
      {label}
    </button>
  )
}

