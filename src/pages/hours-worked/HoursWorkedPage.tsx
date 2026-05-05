import { useMemo } from 'react'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Download } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { SecondaryButton } from '@/components/common/Buttons'
import { colors } from '@/utils/colors'
import { useToast } from '@/context/ToastContext'

interface WeekRow {
  key: string
  weekLabel: string
  regular: number
  overtime: number
  total: number
  isCurrent: boolean
}

const MONTH_LABELS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const startOfDay = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

const getMondayOfWeek = (date: Date) => {
  const d = startOfDay(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

const addDays = (date: Date, days: number) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const formatWeekLabel = (start: Date, end: Date) => {
  const startMonth = MONTH_LABELS_SHORT[start.getMonth()]
  const endMonth = MONTH_LABELS_SHORT[end.getMonth()]
  if (start.getMonth() === end.getMonth()) {
    return `${startMonth} ${start.getDate()}–${end.getDate()}`
  }
  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}`
}

// Deterministic dummy hours per week so the table doesn't shift on re-render.
const dummyHoursForWeek = (weekStart: Date, today: Date): { regular: number; overtime: number } => {
  if (weekStart > today) return { regular: 0, overtime: 0 }
  const seed = weekStart.getDate() + weekStart.getMonth() * 31
  const regular = 32 + ((seed * 7) % 9) // 32..40
  const overtime = seed % 3 === 0 ? Number(((seed % 9) / 2).toFixed(1)) : 0
  return { regular, overtime }
}

const buildMonthWeeks = (today: Date): WeekRow[] => {
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth = new Date(year, month + 1, 0)
  const currentWeekStart = getMondayOfWeek(today)

  // Walk Mon-Sun weeks that overlap the current month.
  const rows: WeekRow[] = []
  let cursor = getMondayOfWeek(firstOfMonth)
  let i = 0
  while (cursor <= lastOfMonth) {
    const weekEnd = addDays(cursor, 6)
    if (weekEnd >= firstOfMonth) {
      const { regular, overtime } = dummyHoursForWeek(cursor, today)
      rows.push({
        key: `w-${i}`,
        weekLabel: formatWeekLabel(cursor, weekEnd),
        regular,
        overtime,
        total: regular + overtime,
        isCurrent: isSameDay(cursor, currentWeekStart),
      })
    }
    cursor = addDays(cursor, 7)
    i++
  }
  return rows
}

const computeNextPayday = (today: Date) => {
  // Paydays: 1st and 15th of every month
  const candidates: Date[] = [
    new Date(today.getFullYear(), today.getMonth(), 15),
    new Date(today.getFullYear(), today.getMonth() + 1, 1),
    new Date(today.getFullYear(), today.getMonth() + 1, 15),
  ]
  const next = candidates.find((d) => d > today)!
  return `${MONTH_LABELS_SHORT[next.getMonth()]} ${next.getDate()}`
}

interface StatCardProps {
  value: string
  label: string
  bg: string
  color: string
}

const StatCard = ({ value, label, bg, color }: StatCardProps) => (
  <div
    className="rounded-xl py-6 px-5 flex flex-col items-center justify-center"
    style={{ background: bg }}
  >
    <div className="text-3xl font-bold tabular-nums" style={{ color }}>
      {value}
    </div>
    <div className="text-xs mt-1.5 text-text-secondary">{label}</div>
  </div>
)

const HoursWorkedPage = () => {
  const { showToast } = useToast()

  const { weeks, totals, nextPayday, monthLabel } = useMemo(() => {
    const today = startOfDay(new Date())
    const w = buildMonthWeeks(today)
    const regular = w.reduce((s, r) => s + r.regular, 0)
    const overtime = w.reduce((s, r) => s + r.overtime, 0)
    return {
      weeks: w,
      totals: { regular, overtime, total: regular + overtime },
      nextPayday: computeNextPayday(today),
      monthLabel: MONTH_LABELS_SHORT[today.getMonth()],
    }
  }, [])

  const columns: ColumnsType<WeekRow> = [
    {
      title: 'Week',
      dataIndex: 'weekLabel',
      key: 'weekLabel',
      render: (label: string, record) => (
        <span className={record.isCurrent ? 'font-bold text-text-primary' : 'text-text-primary'}>
          {label}
          {record.isCurrent && (
            <span
              className="ml-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: colors.primaryLight, color: colors.primary }}
            >
              Current
            </span>
          )}
        </span>
      ),
    },
    {
      title: 'Regular',
      dataIndex: 'regular',
      key: 'regular',
      render: (v: number, record) => (
        <span className={`tabular-nums ${record.isCurrent ? 'font-bold text-text-primary' : 'text-text-secondary'}`}>
          {v.toFixed(1)}
        </span>
      ),
    },
    {
      title: 'Overtime',
      dataIndex: 'overtime',
      key: 'overtime',
      render: (v: number, record) => (
        <span className={`tabular-nums ${record.isCurrent ? 'font-bold text-text-primary' : 'text-text-secondary'}`}>
          {v === 0 ? '0' : v.toFixed(1)}
        </span>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (v: number) => (
        <span className="font-bold text-text-primary tabular-nums">{v.toFixed(1)}</span>
      ),
    },
  ]

  const handleExport = () => {
    const header = ['Week', 'Regular', 'Overtime', 'Total']
    const rows = weeks.map((w) => [w.weekLabel, w.regular, w.overtime, w.total])
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hours-worked-${monthLabel.toLowerCase()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Exported CSV', 'success')
  }

  return (
    <div className="px-8 py-7">
      {/* <PageHeader title="Hours Worked" subtitle="Your timesheet summary for this month" /> */}

      <div className="bg-bg-card border border-border-light rounded-2xl p-6">
        <h2 className="text-xl font-bold text-text-primary m-0 mb-5">Hours Worked</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            value={totals.total.toFixed(1)}
            label="Total Hours (Month)"
            bg={colors.successLight}
            color={colors.successText}
          />
          <StatCard
            value={totals.overtime.toFixed(1)}
            label="Overtime Hours"
            bg={colors.warningLight}
            color={colors.accent}
          />
          <StatCard
            value={nextPayday}
            label="Next Payday"
            bg={colors.infoLight}
            color={colors.info}
          />
        </div>

        <Table<WeekRow>
          columns={columns}
          dataSource={weeks}
          pagination={false}
          rowClassName={(record) => (record.isCurrent ? 'today-row' : '')}
        />

        <div className="mt-6">
          <SecondaryButton label="Export to CSV" Icon={Download} onClick={handleExport} />
        </div>
      </div>
    </div>
  )
}

export default HoursWorkedPage
