import type { ThemeConfig } from 'antd'
import { colors } from '@/utils/colors'

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: colors.primary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.danger,
    colorInfo: colors.info,
    borderRadius: 10,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  components: {
    Button: {
      borderRadius: 999,
      controlHeight: 44,
      fontWeight: 600,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 46,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 46,
    },
    Table: {
      headerBg: colors.bgSubtle,
      headerColor: colors.textSecondary,
      rowHoverBg: colors.bgSubtle,
    },
    Menu: {
      itemSelectedBg: colors.primary,
      itemSelectedColor: '#FFFFFF',
      subMenuItemSelectedColor: '#FFFFFF',
    },
  },
}
