import { useMemo } from 'react'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/common/Badge'
import { colors } from '@/utils/colors'

type ShiftStatus = 'Completed' | 'In Progress' | 'Upcoming' | 'Weekend'

interface ScheduleRow {
  key: string
  day: string
  isToday: boolean
  shift: string
  client: string
  status: ShiftStatus
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// Weekday template (Mon–Fri). Sat/Sun are OFF.
const WEEKDAY_TEMPLATE: { shift: string; client: string }[] = [
  { shift: '8:00 AM – 4:00 PM', client: 'Eleanor Mitchell' },
  { shift: '9:00 AM – 5:00 PM', client: 'George Patterson' },
  { shift: '7:00 AM – 3:00 PM', client: 'Helen Zhao' },
  { shift: '8:00 AM – 4:00 PM', client: 'Rose Nakamura' },
  { shift: '8:00 AM – 4:00 PM', client: 'Eleanor Mitchell' },
]

const startOfDay = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

const getMondayOfWeek = (date: Date) => {
  const d = startOfDay(date)
  const day = d.getDay() // 0 = Sun, 1 = Mon, ...
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

const formatRangeTitle = (start: Date, end: Date) => {
  const startMonth = MONTH_LABELS[start.getMonth()]
  const endMonth = MONTH_LABELS[end.getMonth()]
  const year = end.getFullYear()
  if (start.getFullYear() !== end.getFullYear()) {
    return `${startMonth} ${start.getDate()}, ${start.getFullYear()} – ${endMonth} ${end.getDate()}, ${end.getFullYear()}`
  }
  if (start.getMonth() === end.getMonth()) {
    return `${startMonth} ${start.getDate()}–${end.getDate()}, ${year}`
  }
  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${year}`
}

const buildScheduleData = (today: Date): ScheduleRow[] => {
  const monday = getMondayOfWeek(today)
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i)
    const dayLabel = DAY_LABELS[date.getDay()]
    const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`
    const isToday = isSameDay(date, today)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const dayText = isToday ? `${dayLabel} ${dateLabel} (Today)` : `${dayLabel} ${dateLabel}`

    if (isWeekend) {
      return {
        key: String(i),
        day: dayText,
        isToday,
        shift: 'OFF',
        client: '—',
        status: 'Weekend',
      }
    }

    const tpl = WEEKDAY_TEMPLATE[i] // Monday=0 .. Friday=4
    const status: ShiftStatus = isToday
      ? 'In Progress'
      : date < startOfDay(today)
        ? 'Completed'
        : 'Upcoming'
    return {
      key: String(i),
      day: dayText,
      isToday,
      shift: tpl.shift,
      client: tpl.client,
      status,
    }
  })
}

const renderStatus = (status: ShiftStatus) => {
  if (status === 'Completed') {
    return <Badge text="Completed" bg={colors.successLight} color={colors.successText} />
  }
  if (status === 'In Progress') {
    return <Badge text="In Progress" bg={colors.primaryLight} color={colors.primary} />
  }
  if (status === 'Upcoming') {
    return <Badge text="Upcoming" bg={colors.warningLight} color={colors.warningText} />
  }
  return <Badge text="Weekend" bg={colors.bgInput} color={colors.textMuted} />
}

const columns: ColumnsType<ScheduleRow> = [
  {
    title: 'Day',
    dataIndex: 'day',
    key: 'day',
    render: (day: string, record) => (
      <span className={record.isToday ? 'font-bold text-text-primary' : 'text-text-primary'}>{day}</span>
    ),
  },
  {
    title: 'Shift',
    dataIndex: 'shift',
    key: 'shift',
    render: (shift: string, record) => (
      <span className={record.isToday ? 'font-bold text-text-primary' : 'text-text-secondary'}>{shift}</span>
    ),
  },
  {
    title: 'Client',
    dataIndex: 'client',
    key: 'client',
    render: (client: string, record) => (
      <span className={record.isToday ? 'font-bold text-text-primary' : 'text-text-secondary'}>{client}</span>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: ShiftStatus) => renderStatus(status),
  },
]

const MySchedulePage = () => {
  const { title, data } = useMemo(() => {
    const today = startOfDay(new Date())
    const monday = getMondayOfWeek(today)
    const sunday = addDays(monday, 6)
    return {
      title: `Weekly Schedule — ${formatRangeTitle(monday, sunday)}`,
      data: buildScheduleData(today),
    }
  }, [])

  return (
    <div className="px-8 py-7">
      {/* <PageHeader title="My Schedule" subtitle="Your upcoming shifts and assignments" /> */}

      <div className="bg-bg-card border border-border-light rounded-2xl p-6">
        <h2 className="text-xl font-bold text-text-primary m-0 mb-5">{title}</h2>

        <Table<ScheduleRow>
          columns={columns}
          dataSource={data}
          pagination={false}
          rowClassName={(record) => (record.isToday ? 'today-row' : '')}
        />
      </div>
    </div>
  )
}

export default MySchedulePage
