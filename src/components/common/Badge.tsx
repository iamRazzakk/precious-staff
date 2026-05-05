import { colors } from '@/utils/colors'

interface BadgeProps {
  text: string
  bg?: string
  color?: string
  solid?: boolean
}

const Badge = ({ text, bg = colors.bgInput, color = colors.textSecondary, solid }: BadgeProps) => (
  <span
    className={`inline-block rounded-pill ${
      solid ? 'px-[14px] py-[5px] text-[11px] font-bold tracking-[0.4px]' : 'px-[10px] py-[3px] text-[12px] font-semibold'
    }`}
    style={{ background: bg, color }}
  >
    {text}
  </span>
)

export default Badge
