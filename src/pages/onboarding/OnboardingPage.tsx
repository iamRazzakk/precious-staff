import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DatePicker } from 'antd'
import type { Dayjs } from 'dayjs'
import {
  FileText,
  GraduationCap,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons'
import { colors } from '@/utils/colors'

type Answer = 'yes' | 'no' | null

interface DocumentItem {
  id: string
  label: string
}

interface TrainingItem {
  id: string
  label: string
  description: string
  hours: string
  required: boolean
}

interface ItemState {
  answer: Answer
  expirationDate: Dayjs | null
}

const DOCUMENTS: DocumentItem[] = [
  { id: 'doc-cpr', label: 'CPR/First Aid Certification' },
  { id: 'doc-cna', label: 'CNA License' },
  { id: 'doc-rn', label: 'RN License' },
  { id: 'doc-lpn', label: 'LPN License' },
  { id: 'doc-tb', label: 'TB Test Results' },
  { id: 'doc-bg', label: 'Background Check' },
  { id: 'doc-hipaa', label: 'HIPAA Training Certificate' },
  { id: 'doc-driver', label: 'Driver License' },
  { id: 'doc-ssn', label: 'Social Security Card' },
  { id: 'doc-i9', label: 'I-9 Form' },
  { id: 'doc-w4', label: 'W-4 Form' },
  { id: 'doc-dd', label: 'Direct Deposit Form' },
  { id: 'doc-offer', label: 'Signed Offer Letter' },
  { id: 'doc-handbook', label: 'Employee Handbook Acknowledgment' },
  { id: 'doc-emergency', label: 'Emergency Contact Form' },
  { id: 'doc-drug', label: 'Drug Screen Results' },
  { id: 'doc-liability', label: 'Liability Insurance' },
  { id: 'doc-covid', label: 'COVID Vaccination Record' },
]

const TRAININGS: TrainingItem[] = [
  {
    id: 'tr-orient',
    label: 'Company Orientation',
    description: 'Mission, values, and company policies',
    hours: '2 hours',
    required: true,
  },
  {
    id: 'tr-hipaa',
    label: 'HIPAA Compliance',
    description: 'Patient privacy regulations and procedures',
    hours: '3 hours',
    required: true,
  },
  {
    id: 'tr-infection',
    label: 'Infection Control',
    description: 'Proper sanitation and infection prevention',
    hours: '2 hours',
    required: true,
  },
  {
    id: 'tr-safety',
    label: 'Patient Safety',
    description: 'Fall prevention, emergency protocols',
    hours: '2 hours',
    required: true,
  },
  {
    id: 'tr-meds',
    label: 'Medication Administration',
    description: 'Med pass procedures and documentation',
    hours: '4 hours',
    required: true,
  },
  {
    id: 'tr-charting',
    label: 'Documentation & Charting',
    description: 'Proper care documentation practices',
    hours: '2 hours',
    required: true,
  },
  {
    id: 'tr-abuse',
    label: 'Abuse & Neglect Reporting',
    description: 'Oregon mandatory reporting requirements',
    hours: '1.5 hours',
    required: true,
  },
  {
    id: 'tr-cultural',
    label: 'Cultural Sensitivity',
    description: 'Providing culturally competent care',
    hours: '1 hour',
    required: false,
  },
]

interface YesNoProps {
  value: Answer
  onChange: (v: Answer) => void
}

const YesNo = ({ value, onChange }: YesNoProps) => (
  <div
    className="inline-flex rounded-lg overflow-hidden"
    style={{ border: `1px solid ${colors.border}` }}
  >
    <button
      type="button"
      onClick={() => onChange(value === 'yes' ? null : 'yes')}
      className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold cursor-pointer border-0 transition-colors"
      style={{
        background: value === 'yes' ? colors.success : '#FFFFFF',
        color: value === 'yes' ? '#FFFFFF' : colors.success,
      }}
    >
      <Check size={14} />
      Yes
    </button>
    <button
      type="button"
      onClick={() => onChange(value === 'no' ? null : 'no')}
      className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold cursor-pointer border-0 transition-colors"
      style={{
        background: value === 'no' ? colors.danger : '#FFFFFF',
        color: value === 'no' ? '#FFFFFF' : colors.danger,
        borderLeft: `1px solid ${colors.border}`,
      }}
    >
      <X size={14} />
      No
    </button>
  </div>
)

interface RowProps {
  title: string
  subtitle?: string
  meta?: string
  required?: boolean
  state: ItemState
  onChange: (next: ItemState) => void
  showError: boolean
}

const ItemRow = ({ title, subtitle, meta, required, state, onChange, showError }: RowProps) => {
  const dateMissing = showError && state.answer === 'yes' && !state.expirationDate
  const answerMissing = showError && state.answer === null

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: '#fff',
        border: `1px solid ${
          dateMissing || answerMissing ? colors.danger : colors.borderLight
        }`,
      }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-text-primary">{title}</span>
            {required && (
              <span style={{ color: colors.danger }} className="text-sm">
                *
              </span>
            )}
          </div>
          {subtitle && (
            <div className="text-xs text-text-secondary mt-0.5">
              {subtitle}
              {meta && <span className="text-text-muted"> · {meta}</span>}
            </div>
          )}
        </div>

        <YesNo
          value={state.answer}
          onChange={(answer) => onChange({ answer, expirationDate: answer === 'yes' ? state.expirationDate : null })}
        />
      </div>

      {state.answer === 'yes' && (
        <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-border-light">
          <label className="text-xs font-semibold text-text-secondary">
            Expiration Date <span style={{ color: colors.danger }}>*</span>
          </label>
          <DatePicker
            value={state.expirationDate ?? undefined}
            onChange={(d) => onChange({ ...state, expirationDate: d })}
            format="MMM D, YYYY"
            placeholder="Select expiration date"
            style={{ height: 38, minWidth: 220 }}
            status={dateMissing ? 'error' : undefined}
          />
          {dateMissing && (
            <span className="text-xs flex items-center gap-1" style={{ color: colors.danger }}>
              <AlertCircle size={12} /> Please select an expiration date
            </span>
          )}
        </div>
      )}

      {answerMissing && (
        <div className="text-xs flex items-center gap-1" style={{ color: colors.danger }}>
          <AlertCircle size={12} /> Please answer Yes or No
        </div>
      )}
    </div>
  )
}

const OnboardingPage = () => {
  const { user, completeOnboarding, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [docState, setDocState] = useState<Record<string, ItemState>>(() =>
    Object.fromEntries(
      DOCUMENTS.map((d) => [d.id, { answer: null, expirationDate: null } satisfies ItemState]),
    ),
  )
  const [trainingState, setTrainingState] = useState<Record<string, ItemState>>(() =>
    Object.fromEntries(
      TRAININGS.map((t) => [t.id, { answer: null, expirationDate: null } satisfies ItemState]),
    ),
  )
  const [showErrors, setShowErrors] = useState(false)

  const allItems = useMemo(
    () => [
      ...DOCUMENTS.map((d) => ({ id: d.id, state: docState[d.id] })),
      ...TRAININGS.map((t) => ({ id: t.id, state: trainingState[t.id] })),
    ],
    [docState, trainingState],
  )

  const answered = allItems.filter((i) => i.state.answer !== null).length
  const total = allItems.length
  const percent = Math.round((answered / total) * 100)

  const isValid = useMemo(
    () =>
      allItems.every(
        (i) =>
          i.state.answer === 'no' ||
          (i.state.answer === 'yes' && !!i.state.expirationDate),
      ),
    [allItems],
  )

  const handleSubmit = () => {
    if (!isValid) {
      setShowErrors(true)
      showToast('Please complete all items before submitting', 'danger')
      return
    }
    completeOnboarding()
    showToast('Onboarding complete! Welcome aboard.', 'success')
    navigate('/clock-in-out')
  }

  const handleSkipForNow = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-bg-page py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-bg-card border border-border-light rounded-2xl p-6 mb-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: colors.primaryLight, color: colors.primary }}
              >
                <ShieldCheck size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary m-0">
                  Welcome{user ? `, ${user.name.split(' ')[0]}` : ''}!
                </h1>
                <p className="text-sm text-text-secondary mt-1 mb-0">
                  Complete your onboarding to access the staff dashboard. For each
                  document and training, mark whether you have it and provide its
                  expiration date.
                </p>
              </div>
            </div>
            <button
              onClick={handleSkipForNow}
              className="text-xs font-semibold underline cursor-pointer bg-transparent border-0 p-0"
              style={{ color: colors.textMuted }}
            >
              Sign out
            </button>
          </div>

          {/* Progress */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Progress
              </span>
              <span className="text-xs font-bold text-text-primary tabular-nums">
                {answered} of {total} answered · {percent}%
              </span>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: colors.bgInput }}
            >
              <div
                className="h-full transition-[width] duration-300"
                style={{ width: `${percent}%`, background: colors.primary }}
              />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-bg-card border border-border-light rounded-2xl p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} style={{ color: colors.primary }} />
            <h2 className="text-lg font-bold text-text-primary m-0">Documents</h2>
            <span className="text-xs text-text-muted ml-auto">
              {DOCUMENTS.length} items
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DOCUMENTS.map((d) => (
              <ItemRow
                key={d.id}
                title={d.label}
                state={docState[d.id]}
                showError={showErrors}
                onChange={(next) =>
                  setDocState((prev) => ({ ...prev, [d.id]: next }))
                }
              />
            ))}
          </div>
        </div>

        {/* Trainings */}
        <div className="bg-bg-card border border-border-light rounded-2xl p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={20} style={{ color: colors.primary }} />
            <h2 className="text-lg font-bold text-text-primary m-0">
              Completed Trainings
            </h2>
            <span className="text-xs text-text-muted ml-auto">
              {TRAININGS.length} items
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {TRAININGS.map((t) => (
              <ItemRow
                key={t.id}
                title={t.label}
                subtitle={t.description}
                meta={t.hours}
                required={t.required}
                state={trainingState[t.id]}
                showError={showErrors}
                onChange={(next) =>
                  setTrainingState((prev) => ({ ...prev, [t.id]: next }))
                }
              />
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <SecondaryButton label="Sign Out" onClick={handleSkipForNow} />
          <div className="flex items-center gap-3">
            {!isValid && showErrors && (
              <span className="text-xs flex items-center gap-1" style={{ color: colors.danger }}>
                <AlertCircle size={14} /> Some items still need attention
              </span>
            )}
            <PrimaryButton label="Complete Onboarding" onClick={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage
