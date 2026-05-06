import { useMemo, useState } from 'react'
import { Collapse, Drawer, Form, Select, DatePicker, Checkbox } from 'antd'
import type { Dayjs } from 'dayjs'
import { Check, X, SkipForward, Printer, RotateCcw, Plus } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons'
import { colors } from '@/utils/colors'
import { useToast } from '@/context/ToastContext'

type TaskStatus = 'complete' | 'not_done' | 'skipped' | null

interface Task {
  id: string
  label: string
}

interface Category {
  key: string
  title: string
  tasks: Task[]
}

const CATEGORIES: Category[] = [
  {
    key: 'morning-routine',
    title: 'Morning Routine',
    tasks: [
      { id: 'mr-1', label: 'Wake-up assistance' },
      { id: 'mr-2', label: 'Bathing/hygiene' },
      { id: 'mr-3', label: 'Dressing' },
      { id: 'mr-4', label: 'Breakfast prep' },
      { id: 'mr-5', label: 'Morning medications' },
      { id: 'mr-6', label: 'Vital signs check' },
    ],
  },
  {
    key: 'midday-care',
    title: 'Midday Care',
    tasks: [
      { id: 'mc-1', label: 'Lunch preparation' },
      { id: 'mc-2', label: 'Medication administration' },
      { id: 'mc-3', label: 'Mobility exercises' },
      { id: 'mc-4', label: 'Companionship activity' },
      { id: 'mc-5', label: 'Fluid intake monitoring' },
    ],
  },
  {
    key: 'afternoon',
    title: 'Afternoon',
    tasks: [
      { id: 'af-1', label: 'Afternoon snack' },
      { id: 'af-2', label: 'Light housekeeping' },
      { id: 'af-3', label: 'Laundry' },
      { id: 'af-4', label: 'Appointment transport' },
      { id: 'af-5', label: 'Outdoor activity' },
    ],
  },
  {
    key: 'evening',
    title: 'Evening',
    tasks: [
      { id: 'ev-1', label: 'Dinner preparation' },
      { id: 'ev-2', label: 'Evening medications' },
      { id: 'ev-3', label: 'Evening hygiene' },
      { id: 'ev-4', label: 'Bedtime preparation' },
      { id: 'ev-5', label: 'End-of-day documentation' },
    ],
  },
  {
    key: 'ongoing',
    title: 'Ongoing',
    tasks: [
      { id: 'on-1', label: 'Fall prevention checks' },
      { id: 'on-2', label: 'Skin integrity checks' },
      { id: 'on-3', label: 'Communication with family' },
      { id: 'on-4', label: 'Incident reporting' },
      { id: 'on-5', label: 'Care plan adherence' },
    ],
  },
]

interface AddTaskFormValues {
  taskNames: string[]
  date: Dayjs
  clientId: string
  shiftId: string
}

const TASK_NAME_GROUPS: { title: string; tasks: string[] }[] = CATEGORIES.map((cat) => ({
  title: cat.title,
  tasks: cat.tasks.map((t) => t.label),
}))

const CLIENT_OPTIONS = [
  { value: 'cl-1', label: 'Eleanor Mitchell' },
  { value: 'cl-2', label: 'George Patterson' },
  { value: 'cl-3', label: 'Helen Zhao' },
  { value: 'cl-4', label: 'Rose Nakamura' },
  { value: 'cl-5', label: 'James O’Connor' },
]

const SHIFT_OPTIONS = [
  { value: 'morning', label: 'Morning (7:00 AM – 11:00 AM)' },
  { value: 'midday', label: 'Midday (11:00 AM – 3:00 PM)' },
  { value: 'afternoon', label: 'Afternoon (3:00 PM – 7:00 PM)' },
  { value: 'evening', label: 'Evening (7:00 PM – 11:00 PM)' },
  { value: 'overnight', label: 'Overnight (11:00 PM – 7:00 AM)' },
]

const statusMeta: Record<Exclude<TaskStatus, null>, { label: string; color: string; bg: string; Icon: typeof Check }> = {
  complete: { label: 'Complete', color: colors.success, bg: colors.successLight, Icon: Check },
  not_done: { label: 'Not Done', color: colors.danger, bg: colors.dangerLight, Icon: X },
  skipped: { label: 'Skip', color: colors.info, bg: colors.infoLight, Icon: SkipForward },
}

interface SegmentedStatusProps {
  value: TaskStatus
  onChange: (v: TaskStatus) => void
}

const SegmentedStatus = ({ value, onChange }: SegmentedStatusProps) => {
  const options: Exclude<TaskStatus, null>[] = ['complete', 'not_done', 'skipped']
  return (
    <div
      className="inline-flex rounded-lg overflow-hidden"
      style={{ border: `1px solid ${colors.border}` }}
    >
      {options.map((opt, idx) => {
        const active = value === opt
        const meta = statusMeta[opt]
        const Icon = meta.Icon
        return (
          <button
            key={opt}
            onClick={() => onChange(active ? null : opt)}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold cursor-pointer transition-colors duration-150 border-0"
            style={{
              background: active ? meta.color : '#FFFFFF',
              color: active ? '#FFFFFF' : meta.color,
              borderLeft: idx > 0 ? `1px solid ${colors.border}` : 'none',
            }}
          >
            <Icon size={14} />
            {meta.label}
          </button>
        )
      })}
    </div>
  )
}

interface ProgressBarProps {
  done: number
  notDone: number
  skipped: number
  total: number
}

const ProgressBar = ({ done, notDone, skipped, total }: ProgressBarProps) => {
  const pct = (n: number) => (n / total) * 100
  return (
    <div className="w-full h-2.5 rounded-full overflow-hidden flex" style={{ background: colors.bgInput }}>
      <div style={{ width: `${pct(done)}%`, background: colors.success, transition: 'width 200ms ease' }} />
      <div style={{ width: `${pct(notDone)}%`, background: colors.danger, transition: 'width 200ms ease' }} />
      <div style={{ width: `${pct(skipped)}%`, background: colors.info, transition: 'width 200ms ease' }} />
    </div>
  )
}

interface StatusDotsProps {
  tasks: Task[]
  statuses: Record<string, TaskStatus>
}

const StatusDots = ({ tasks, statuses }: StatusDotsProps) => (
  <div className="flex items-center gap-1">
    {tasks.map((t) => {
      const s = statuses[t.id]
      const bg =
        s === 'complete' ? colors.success :
        s === 'not_done' ? colors.danger :
        s === 'skipped' ? colors.info :
        colors.border
      return (
        <span
          key={t.id}
          className="w-2 h-2 rounded-full"
          style={{ background: bg, transition: 'background 150ms ease' }}
        />
      )
    })}
  </div>
)

interface ChipProps {
  label: string
  count: number
  color: string
  bg: string
}

const Chip = ({ label, count, color, bg }: ChipProps) => (
  <span
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
    style={{ background: bg, color }}
  >
    <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
    {label} <span className="tabular-nums">{count}</span>
  </span>
)

const TaskChecklistPage = () => {
  const { showToast } = useToast()
  const [categories, setCategories] = useState<Category[]>(CATEGORIES)
  const [statuses, setStatuses] = useState<Record<string, TaskStatus>>({})
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form] = Form.useForm<AddTaskFormValues>()

  const totalTasks = useMemo(
    () => categories.reduce((sum, c) => sum + c.tasks.length, 0),
    [categories],
  )

  const setStatus = (id: string, status: TaskStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: status }))
  }

  const counts = useMemo(() => {
    let done = 0, notDone = 0, skipped = 0
    Object.values(statuses).forEach((s) => {
      if (s === 'complete') done++
      else if (s === 'not_done') notDone++
      else if (s === 'skipped') skipped++
    })
    return { done, notDone, skipped, pending: totalTasks - done - notDone - skipped }
  }, [statuses, totalTasks])

  const overallPercent = totalTasks
    ? Math.round(((counts.done + counts.notDone + counts.skipped) / totalTasks) * 100)
    : 0

  const handleReset = () => {
    setStatuses({})
    showToast('Checklist reset', 'info')
  }

  const handleAddTask = (values: AddTaskFormValues) => {
    const clientLabel = CLIENT_OPTIONS.find((c) => c.value === values.clientId)?.label ?? ''
    const shiftLabel = SHIFT_OPTIONS.find((s) => s.value === values.shiftId)?.label ?? ''
    const dateLabel = values.date.format('MMM D, YYYY')
    const targetKey = categories[0]?.key
    if (!targetKey) return
    const baseId = Date.now()
    const newTasks: Task[] = values.taskNames.map((name, idx) => ({
      id: `${targetKey}-${baseId}-${idx}`,
      label: `${name} — ${clientLabel} · ${shiftLabel.split(' (')[0]} · ${dateLabel}`,
    }))
    setCategories((prev) =>
      prev.map((cat) =>
        cat.key === targetKey ? { ...cat, tasks: [...cat.tasks, ...newTasks] } : cat,
      ),
    )
    form.resetFields()
    setDrawerOpen(false)
    showToast(`${newTasks.length} task${newTasks.length > 1 ? 's' : ''} added`, 'success')
  }

  return (
    <div className="px-8 py-7">
      <PageHeader
        title="Task Checklist"
        subtitle="Track and complete your assigned tasks"
        action={
          <PrimaryButton label="Add Task" Icon={Plus} onClick={() => setDrawerOpen(true)} />
        }
      />

      {/* Progress overview */}
      <div className="bg-bg-card border border-border-light rounded-2xl p-6 mb-5 sticky top-0 z-10">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Today's progress
            </div>
            <div className="text-3xl font-bold text-text-primary mt-1 tabular-nums">
              {overallPercent}%
              <span className="text-base font-medium text-text-secondary ml-2">
                · {counts.done + counts.notDone + counts.skipped} of {totalTasks} tasks actioned
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Chip label="Done" count={counts.done} color={colors.success} bg={colors.successLight} />
            <Chip label="Not Done" count={counts.notDone} color={colors.danger} bg={colors.dangerLight} />
            <Chip label="Skipped" count={counts.skipped} color={colors.info} bg={colors.infoLight} />
            <Chip label="Pending" count={counts.pending} color={colors.textSecondary} bg={colors.bgInput} />
          </div>
        </div>
        <ProgressBar done={counts.done} notDone={counts.notDone} skipped={counts.skipped} total={totalTasks || 1} />
      </div>

      {/* Categories */}
      <div className="bg-bg-card border border-border-light rounded-2xl p-2">
        <Collapse
          bordered={false}
          expandIconPosition="end"
          className="bg-transparent"
          defaultActiveKey={['morning-routine']}
          items={categories.map((cat) => {
            const done = cat.tasks.filter((t) => statuses[t.id] === 'complete').length
            return {
              key: cat.key,
              label: (
                <div className="flex items-center justify-between w-full pr-2 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-semibold text-text-primary truncate">{cat.title}</span>
                    <span className="text-xs text-text-muted">· {cat.tasks.length} tasks</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusDots tasks={cat.tasks} statuses={statuses} />
                    <span className="text-sm font-semibold tabular-nums" style={{ color: done === cat.tasks.length ? colors.success : colors.textSecondary }}>
                      {done}/{cat.tasks.length}
                    </span>
                  </div>
                </div>
              ),
              children: (
                <div className="divide-y divide-border-light">
                  {cat.tasks.map((task) => {
                    const status = statuses[task.id] ?? null
                    return (
                      <div key={task.id} className="py-3">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{
                                background:
                                  status === 'complete' ? colors.success :
                                  status === 'not_done' ? colors.danger :
                                  status === 'skipped' ? colors.info :
                                  colors.border,
                              }}
                            />
                            <span className="text-sm text-text-primary">{task.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <SegmentedStatus
                              value={status}
                              onChange={(v) => setStatus(task.id, v)}
                            />
                            <button
                              onClick={() => setStatus(task.id, null)}
                              disabled={!status}
                              title="Reset task status"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150"
                              style={{
                                background: 'transparent',
                                color: status ? colors.textSecondary : colors.textMuted,
                                border: `1px solid ${colors.border}`,
                                cursor: status ? 'pointer' : 'not-allowed',
                                opacity: status ? 1 : 0.5,
                              }}
                            >
                              <RotateCcw size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ),
            }
          })}
        />
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
        <SecondaryButton label="Reset" Icon={RotateCcw} onClick={handleReset} />
        <div className="flex items-center gap-3">
          <SecondaryButton label="Print" Icon={Printer} onClick={() => window.print()} />
          <PrimaryButton
            label="Submit Checklist"
            onClick={() => showToast('Checklist submitted', 'success')}
          />
        </div>
      </div>

      {/* Add Task Drawer */}
      <Drawer
        title="Add New Task"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          form.resetFields()
        }}
        width={620}
        destroyOnHidden
        footer={
          <div className="flex items-center justify-end gap-3">
            <SecondaryButton
              label="Cancel"
              onClick={() => {
                setDrawerOpen(false)
                form.resetFields()
              }}
            />
            <PrimaryButton label="Add Task" onClick={() => form.submit()} />
          </div>
        }
      >
        <Form<AddTaskFormValues>
          form={form}
          layout="vertical"
          onFinish={handleAddTask}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select a date' }]}
            >
              <DatePicker style={{ height: '46px', width: '100%' }} format="MMM D, YYYY" />
            </Form.Item>

            <Form.Item
              name="clientId"
              label="Client"
              rules={[{ required: true, message: 'Please select a client' }]}
            >
              <Select options={CLIENT_OPTIONS} placeholder="Select client" />
            </Form.Item>
          </div>
          <Form.Item
              name="shiftId"
              label="Shift"
              rules={[{ required: true, message: 'Please select a shift' }]}
            >
              <Select options={SHIFT_OPTIONS} placeholder="Select shift" />
            </Form.Item>

          <Form.Item
            name="taskNames"
            label="Tasks"
            rules={[{ required: true, message: 'Please select at least one task' }]}
          >
            <Checkbox.Group className="w-full">
              <div className="flex flex-col gap-4 w-full  overflow-y-auto pr-2 border border-border rounded-lg p-4">
                {TASK_NAME_GROUPS.map((group) => (
                  <div key={group.title}>
                    <div className="text-sm font-bold text-text-primary mb-2">{group.title}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pl-1">
                      {group.tasks.map((t) => (
                        <Checkbox key={t} value={t}>
                          {t}
                        </Checkbox>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}

export default TaskChecklistPage
