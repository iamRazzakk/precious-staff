import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  ClipboardList,
  Flag,
  X,
  Menu,
  CloudUpload,
  Lightbulb,
  AlertTriangle,
  Circle,
  Leaf,
  FileCheck,
  GraduationCap,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

// ====================== DATA & STATE ======================
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL',
  'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT',
  'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
  'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]
const STATE_NAMES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
  'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia',
  'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
]
const STATE_OPTIONS = US_STATES.map((value, i) => ({ value, label: STATE_NAMES[i] }))

const TASKS = [
  { id: 1, name: 'Personal Contact Information' },
  { id: 2, name: 'Background Check Authorization' },
  { id: 3, name: "Valid Driver's License" },
  { id: 4, name: 'Auto Insurance Proof' },
  { id: 5, name: 'Emergency Contact Info' },
  { id: 6, name: 'I-9 Verification' },
  { id: 7, name: 'Direct Deposit' },
  { id: 8, name: 'Withholding Forms (W-4)' },
  { id: 9, name: 'Caregiver Job Description' },
  { id: 10, name: '2026 Employee Handbook' },
  { id: 11, name: 'Company Signature Acknowledge' },
  { id: 12, name: 'Go Paperless!' },
  { id: 13, name: 'Training' },
] as const

const TODAY = '2026-05-09'

interface TrainingItem {
  id: string
  name: string
  desc: string
  hours: string
  required: boolean
  /** Read-only note from the admin — displayed to the employee, not editable here. */
  note?: string
}

const TRAININGS: TrainingItem[] = [
  {
    id: 'orient',
    name: 'Company Orientation',
    desc: 'Mission, values, and company policies',
    hours: '2 hours',
    required: true,
    note: 'Attend the scheduled orientation session. Your trainer will issue the completion certificate.',
  },
  {
    id: 'hipaa',
    name: 'HIPAA Compliance',
    desc: 'Patient privacy regulations and procedures',
    hours: '3 hours',
    required: true,
    note: 'Complete the online HIPAA module and download your certificate after passing the quiz.',
  },
  {
    id: 'infection',
    name: 'Infection Control',
    desc: 'Proper sanitation and infection prevention',
    hours: '2 hours',
    required: true,
    note: 'Review the infection control handbook before uploading your certificate.',
  },
  {
    id: 'safety',
    name: 'Patient Safety',
    desc: 'Fall prevention, emergency protocols',
    hours: '2 hours',
    required: true,
    note: 'Includes fall-prevention and emergency-response modules. Certificate issued after assessment.',
  },
  {
    id: 'meds',
    name: 'Medication Administration',
    desc: 'Med pass procedures and documentation',
    hours: '4 hours',
    required: true,
    note: 'Hands-on training required. Certificate must be signed by your supervising nurse.',
  },
  {
    id: 'charting',
    name: 'Documentation & Charting',
    desc: 'Proper care documentation practices',
    hours: '2 hours',
    required: true,
    note: 'Practice charting in the demo system before completing this module.',
  },
  {
    id: 'abuse',
    name: 'Abuse & Neglect Reporting',
    desc: 'Oregon mandatory reporting requirements',
    hours: '1.5 hours',
    required: true,
    note: 'Mandatory under Oregon law. Keep a copy of your certificate for your records.',
  },
  {
    id: 'cultural',
    name: 'Cultural Sensitivity',
    desc: 'Providing culturally competent care',
    hours: '1 hour',
    required: false,
    note: 'Recommended for all caregivers. Self-paced online module.',
  },
  {
    id: 'attendance',
    name: 'Time & Attendance',
    desc: 'Clock in/out procedures, scheduling policies',
    hours: '1 hour',
    required: false,
    note: 'Covers the clock-in/out app and shift scheduling. Optional but encouraged.',
  },
  {
    id: 'tech',
    name: 'Technology Systems',
    desc: 'Using company apps and communication tools',
    hours: '1 hour',
    required: false,
    note: 'Learn the company app, messaging, and care-log tools. Optional refresher.',
  },
]

type Status = 'incomplete' | 'inprogress' | 'complete'
type TaskData = Record<string, string | boolean | number>
type ActiveTask = number | 'summary'
type Errors = Record<string, boolean>

interface TaskState {
  statuses: Record<number, Status>
  data: Record<number, TaskData>
}

function loadInitialState(): TaskState {
  const statuses: Record<number, Status> = {}
  const data: Record<number, TaskData> = {}
  TASKS.forEach((t) => {
    const saved = localStorage.getItem('pcp_task_' + t.id)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        statuses[t.id] = parsed.status || 'incomplete'
        data[t.id] = parsed.data || {}
      } catch {
        statuses[t.id] = 'incomplete'
        data[t.id] = {}
      }
    } else {
      statuses[t.id] = 'incomplete'
      data[t.id] = {}
    }
  })
  // Set initial statuses for demo
  if (!localStorage.getItem('pcp_initialized')) {
    ;[2, 9, 10, 11].forEach((id) => {
      statuses[id] = 'inprogress'
    })
    localStorage.setItem('pcp_initialized', 'true')
  }
  return { statuses, data }
}

// ====================== VALIDATION ======================
const REQUIRED_FIELDS: Record<number, string[]> = {
  1: ['firstName', 'lastName', 'address1', 'city', 'state', 'zip', 'phone', 'email'],
  2: ['legalName', 'dob', 'ssn4', 'signature'],
  3: ['licenseNum', 'licenseState', 'licenseExp'],
  4: ['insCompany', 'policyNum', 'policyHolder', 'policyExp'],
  5: ['ecName', 'relationship', 'ecPhone'],
  6: ['i9Name', 'i9Dob', 'i9Ssn', 'i9Email', 'i9Phone', 'i9Sig'],
  7: ['bankName', 'routingNum', 'acctNum', 'acctNumConfirm'],
  9: ['jdSig'],
  10: ['hbSig'],
  11: ['ackName', 'ackTitle', 'dept', 'startDate', 'ackSig'],
  12: ['plEmail', 'plEmailConfirm'],
}

function validateTask(taskId: number, data: TaskData): Errors {
  const errors: Errors = {}
  const fields = REQUIRED_FIELDS[taskId] || []
  fields.forEach((f) => {
    const v = data[f]
    if (v === undefined || v === null || !String(v).trim()) errors[f] = true
  })

  if (taskId === 2 && !data.authorized) errors.authorized = true
  if (taskId === 3) {
    if (!data.licenseFront) errors.licenseFront = true
    if (!data.licenseBack) errors.licenseBack = true
  }
  if (taskId === 4 && !data.insCard) errors.insCard = true
  if (taskId === 6 && !data.citizenship) errors.citizenship = true
  if (taskId === 7) {
    if (!data.acctType) errors.acctType = true
    if (!data.depType) errors.depType = true
    if (data.acctNum && data.acctNumConfirm && data.acctNum !== data.acctNumConfirm)
      errors.acctMatch = true
    if (String(data.routingNum || '').length !== 9) errors.routingNum = true
  }
  if (taskId === 9 && !data.jdRead) errors.jdRead = true
  if (taskId === 10) {
    if (!data.hbAck) errors.hbAck = true
    if (!data.hbComply) errors.hbComply = true
  }
  if (taskId === 11 && !data.ackAgree) errors.ackAgree = true
  if (taskId === 12) {
    if (!data.paperlessPref) errors.paperlessPref = true
    if (data.plEmail && data.plEmailConfirm && data.plEmail !== data.plEmailConfirm)
      errors.emailMatch = true
  }
  if (taskId === 13) {
    TRAININGS.forEach((tr) => {
      const certKey = `cert_${tr.id}`
      if (tr.required) {
        if (!data[certKey]) errors[certKey] = true
      } else if (data[`ans_${tr.id}`] === 'yes' && !data[certKey]) {
        errors[certKey] = true
      }
    })
  }
  return errors
}

// ====================== FORM PRIMITIVES ======================
interface FieldCtx {
  data: TaskData
  update: (field: string, value: string | boolean | number) => void
  errors: Errors
}

const Label = ({ children, required }: { children: ReactNode; required?: boolean }) => (
  <label className="ob-form-label">
    {children}
    {required && <span className="req">*</span>}
  </label>
)

interface TextFieldProps {
  ctx: FieldCtx
  field: string
  label: string
  required?: boolean
  type?: string
  placeholder?: string
  maxLength?: number
  readOnly?: boolean
  className?: string
  min?: string | number
  max?: string | number
  step?: string | number
  defaultToday?: boolean
}

const TextField = ({
  ctx,
  field,
  label,
  required,
  type = 'text',
  placeholder,
  maxLength,
  readOnly,
  className,
  min,
  max,
  step,
  defaultToday,
}: TextFieldProps) => {
  const value = defaultToday
    ? (ctx.data[field] as string) || TODAY
    : (ctx.data[field] as string | number | undefined) ?? ''
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input
        type={type}
        className={`ob-form-input${ctx.errors[field] ? ' error' : ''}${
          className ? ' ' + className : ''
        }`}
        value={value}
        onChange={(e) => ctx.update(field, e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        readOnly={readOnly}
        min={min}
        max={max}
        step={step}
      />
      {ctx.errors[field] && <div className="ob-error-msg">Required</div>}
    </div>
  )
}

interface SelectFieldProps {
  ctx: FieldCtx
  field: string
  label: string
  required?: boolean
  options: { value: string; label: string }[]
}

const SelectField = ({ ctx, field, label, required, options }: SelectFieldProps) => (
  <div>
    <Label required={required}>{label}</Label>
    <select
      className={`ob-form-input${ctx.errors[field] ? ' error' : ''}`}
      value={(ctx.data[field] as string) ?? ''}
      onChange={(e) => ctx.update(field, e.target.value)}
    >
      <option value="">Select...</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    {ctx.errors[field] && <div className="ob-error-msg">Required</div>}
  </div>
)

const TextAreaField = ({
  ctx,
  field,
  label,
  required,
  rows = 2,
}: {
  ctx: FieldCtx
  field: string
  label: string
  required?: boolean
  rows?: number
}) => (
  <div>
    <Label required={required}>{label}</Label>
    <textarea
      className={`ob-form-input${ctx.errors[field] ? ' error' : ''}`}
      value={(ctx.data[field] as string) ?? ''}
      onChange={(e) => ctx.update(field, e.target.value)}
      rows={rows}
    />
    {ctx.errors[field] && <div className="ob-error-msg">Required</div>}
  </div>
)

const UploadZone = ({
  ctx,
  field,
  error,
}: {
  ctx: FieldCtx
  field: string
  error?: boolean
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const fileName = ctx.data[field] as string | undefined
  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      className="hidden"
      accept=".jpg,.jpeg,.png,.pdf"
      onChange={(e) => {
        const f = e.target.files?.[0]
        if (f) ctx.update(field, f.name)
      }}
    />
  )
  if (fileName) {
    return (
      <div className="ob-cert-uploaded">
        <FileCheck className="w-5 h-5 text-green-600 shrink-0" />
        <span className="text-sm text-green-800 font-medium truncate flex-1">
          {fileName}
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs font-semibold text-green-700 hover:underline shrink-0"
        >
          Replace
        </button>
        {hiddenInput}
      </div>
    )
  }
  return (
    <div
      className={`ob-upload-zone${error ? ' error' : ''}`}
      onClick={() => inputRef.current?.click()}
    >
      <CloudUpload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
      <p className="text-sm text-gray-600">
        Click or drag to upload · JPG, PNG, PDF
      </p>
      {hiddenInput}
    </div>
  )
}

const RadioRow = ({
  name,
  value,
  current,
  onChange,
  children,
  bold,
}: {
  name: string
  value: string
  current: string | undefined
  onChange: (v: string) => void
  children: ReactNode
  bold?: boolean
}) => (
  <label
    className={`flex items-center gap-2 text-sm${bold ? ' font-medium' : ''}`}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={current === value}
      onChange={() => onChange(value)}
    />
    {children}
  </label>
)

const CheckRow = ({
  id,
  checked,
  onChange,
  children,
  big,
}: {
  id: string
  checked: boolean
  onChange: (v: boolean) => void
  children: ReactNode
  big?: boolean
}) => (
  <div className="flex items-start gap-2">
    <input
      type="checkbox"
      id={id}
      className={big ? 'mt-1 w-5 h-5' : 'mt-1'}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <label htmlFor={id} className="text-sm text-gray-700">
      {children}
    </label>
  </div>
)

const YesNoToggle = ({
  value,
  onChange,
}: {
  value: string | undefined
  onChange: (v: string) => void
}) => (
  <div
    className="inline-flex rounded-lg overflow-hidden"
    style={{ border: '1px solid #d1d5db' }}
  >
    <button
      type="button"
      onClick={() => onChange('yes')}
      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-colors"
      style={{
        background: value === 'yes' ? '#16a34a' : '#fff',
        color: value === 'yes' ? '#fff' : '#16a34a',
      }}
    >
      <Check className="w-3.5 h-3.5" /> Yes
    </button>
    <button
      type="button"
      onClick={() => onChange('no')}
      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-colors"
      style={{
        background: value === 'no' ? '#ef4444' : '#fff',
        color: value === 'no' ? '#fff' : '#ef4444',
        borderLeft: '1px solid #d1d5db',
      }}
    >
      <X className="w-3.5 h-3.5" /> No
    </button>
  </div>
)

// ====================== TASK FORMS ======================
const Task1 = ({ ctx }: { ctx: FieldCtx }) => (
  <>
    <div className="ob-section-header">Contact Details</div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TextField ctx={ctx} field="firstName" label="First Name" required />
      <TextField ctx={ctx} field="lastName" label="Last Name" required />
    </div>
    <div className="mt-4">
      <TextField ctx={ctx} field="address1" label="Address Line 1" required />
    </div>
    <div className="mt-4">
      <TextField ctx={ctx} field="address2" label="Address Line 2" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <TextField ctx={ctx} field="city" label="City" required />
      <SelectField ctx={ctx} field="state" label="State" required options={STATE_OPTIONS} />
      <TextField ctx={ctx} field="zip" label="Zip Code" required maxLength={10} />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <TextField ctx={ctx} field="phone" label="Personal Phone" type="tel" required />
      <TextField ctx={ctx} field="email" label="Personal Email" type="email" required />
    </div>
  </>
)

const Task2 = ({ ctx }: { ctx: FieldCtx }) => (
  <>
    <div className="rounded-lg p-4 mb-4" style={{ background: '#dbeafe' }}>
      <p className="text-sm text-blue-800 leading-relaxed">
        By signing below, I authorize Precious Care Providers to conduct a
        background check as part of my pre-employment screening. This may include
        criminal history, employment verification, and reference checks.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TextField ctx={ctx} field="legalName" label="Full Legal Name" required />
      <TextField ctx={ctx} field="dob" label="Date of Birth" type="date" required />
    </div>
    <div className="mt-4">
      <TextField
        ctx={ctx}
        field="ssn4"
        label="Last 4 of SSN"
        type="password"
        required
        maxLength={4}
        placeholder="••••"
        className="md:max-w-[200px]"
      />
    </div>
    <div className="mt-4">
      <TextField
        ctx={ctx}
        field="signature"
        label="Typed Signature"
        required
        placeholder="Type your full name as your signature"
      />
    </div>
    <div className="mt-4">
      <TextField
        ctx={ctx}
        field="signDate"
        label="Date"
        type="date"
        readOnly
        defaultToday
        className="md:max-w-[200px]"
      />
    </div>
    <div className="mt-4">
      <CheckRow
        id="bg-check-auth-cb"
        checked={!!ctx.data.authorized}
        onChange={(v) => ctx.update('authorized', v)}
      >
        I authorize Precious Care Providers to conduct the above background check{' '}
        <span className="text-red-500">*</span>
      </CheckRow>
    </div>
    {ctx.errors.authorized && (
      <div className="ob-error-msg">You must authorize to continue</div>
    )}
  </>
)

const Task3 = ({ ctx }: { ctx: FieldCtx }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <TextField ctx={ctx} field="licenseNum" label="License Number" required />
      <SelectField
        ctx={ctx}
        field="licenseState"
        label="Issuing State"
        required
        options={STATE_OPTIONS}
      />
      <TextField
        ctx={ctx}
        field="licenseExp"
        label="Expiration Date"
        type="date"
        required
      />
    </div>
    <div className="mt-6">
      <Label required>Upload Front of License</Label>
      <UploadZone ctx={ctx} field="licenseFront" error={ctx.errors.licenseFront} />
    </div>
    <div className="mt-4">
      <Label required>Upload Back of License</Label>
      <UploadZone ctx={ctx} field="licenseBack" error={ctx.errors.licenseBack} />
    </div>
  </>
)

const Task4 = ({ ctx }: { ctx: FieldCtx }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TextField ctx={ctx} field="insCompany" label="Insurance Company Name" required />
      <TextField ctx={ctx} field="policyNum" label="Policy Number" required />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <TextField ctx={ctx} field="policyHolder" label="Policy Holder Name" required />
      <TextField
        ctx={ctx}
        field="policyExp"
        label="Policy Expiration Date"
        type="date"
        required
      />
    </div>
    <div className="mt-6">
      <Label required>Upload Insurance Card</Label>
      <UploadZone ctx={ctx} field="insCard" error={ctx.errors.insCard} />
    </div>
  </>
)

const Task5 = ({ ctx }: { ctx: FieldCtx }) => {
  const rels = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other']
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField ctx={ctx} field="ecName" label="Contact Full Name" required />
        <SelectField
          ctx={ctx}
          field="relationship"
          label="Relationship"
          required
          options={rels.map((r) => ({ value: r, label: r }))}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <TextField ctx={ctx} field="ecPhone" label="Primary Phone" type="tel" required />
        <TextField ctx={ctx} field="ecAltPhone" label="Alternate Phone" type="tel" />
      </div>
      <div className="mt-4">
        <TextField ctx={ctx} field="ecEmail" label="Email Address" type="email" />
      </div>
      <div className="mt-4">
        <TextAreaField ctx={ctx} field="ecAddress" label="Address" rows={2} />
      </div>
    </>
  )
}

const Task6 = ({ ctx }: { ctx: FieldCtx }) => {
  const listADocs = [
    'U.S. Passport',
    'Permanent Resident Card (I-551)',
    'Employment Auth. Document (I-766)',
  ]
  const listBDocs = ["Driver's License", 'State ID Card', 'School ID with photo']
  const listCDocs = ['Social Security Card', 'Birth Certificate', 'U.S. Citizen ID']
  const toOpts = (arr: string[]) => arr.map((a) => ({ value: a, label: a }))
  const cit = (ctx.data.citizenship as string) || ''
  const docType = (ctx.data.docType as string) || 'listA'
  return (
    <>
      <div className="ob-section-header">Section 1 – Employee Information</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField ctx={ctx} field="i9Name" label="Full Legal Name" required />
        <TextField
          ctx={ctx}
          field="i9OtherNames"
          label="Other Names Used"
          placeholder="Maiden name, etc."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <TextField ctx={ctx} field="i9Dob" label="Date of Birth" type="date" required />
        <TextField
          ctx={ctx}
          field="i9Ssn"
          label="Social Security Number"
          type="password"
          required
          placeholder="XXX-XX-XXXX"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <TextField ctx={ctx} field="i9Email" label="Email" type="email" required />
        <TextField ctx={ctx} field="i9Phone" label="Phone" type="tel" required />
      </div>

      <div className="ob-section-header">Section 1b – Attestation</div>
      <div className="space-y-2">
        <RadioRow
          name="citizenship"
          value="citizen"
          current={cit}
          onChange={(v) => ctx.update('citizenship', v)}
        >
          A citizen of the United States
        </RadioRow>
        <RadioRow
          name="citizenship"
          value="noncitizen_national"
          current={cit}
          onChange={(v) => ctx.update('citizenship', v)}
        >
          A noncitizen national of the United States
        </RadioRow>
        <RadioRow
          name="citizenship"
          value="permanent_resident"
          current={cit}
          onChange={(v) => ctx.update('citizenship', v)}
        >
          A lawful permanent resident
        </RadioRow>
        {cit === 'permanent_resident' && (
          <div className="ml-6 mt-1">
            <Label>USCIS/A-Number</Label>
            <input
              type="text"
              className="ob-form-input md:max-w-xs"
              value={(ctx.data.i9Uscis as string) ?? ''}
              onChange={(e) => ctx.update('i9Uscis', e.target.value)}
            />
          </div>
        )}
        <RadioRow
          name="citizenship"
          value="alien_authorized"
          current={cit}
          onChange={(v) => ctx.update('citizenship', v)}
        >
          An alien authorized to work
        </RadioRow>
        {cit === 'alien_authorized' && (
          <div className="ml-6 mt-1 space-y-2">
            <div>
              <Label>USCIS/A-Number</Label>
              <input
                type="text"
                className="ob-form-input md:max-w-xs"
                value={(ctx.data.i9UscisAlien as string) ?? ''}
                onChange={(e) => ctx.update('i9UscisAlien', e.target.value)}
              />
            </div>
            <div>
              <Label>Work Authorization Expiration</Label>
              <input
                type="date"
                className="ob-form-input md:max-w-xs"
                value={(ctx.data.i9AlienExp as string) ?? ''}
                onChange={(e) => ctx.update('i9AlienExp', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
      {ctx.errors.citizenship && (
        <div className="ob-error-msg">Please select one</div>
      )}

      <div className="ob-section-header">Section 2 – Document Selection</div>
      <div className="flex gap-4 mb-4">
        <RadioRow
          name="docType"
          value="listA"
          current={docType}
          onChange={(v) => ctx.update('docType', v)}
          bold
        >
          List A Document
        </RadioRow>
        <RadioRow
          name="docType"
          value="listBC"
          current={docType}
          onChange={(v) => ctx.update('docType', v)}
          bold
        >
          List B + List C Documents
        </RadioRow>
      </div>
      {docType === 'listA' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField
            ctx={ctx}
            field="listADoc"
            label="Document"
            required
            options={toOpts(listADocs)}
          />
          <TextField ctx={ctx} field="listANum" label="Document Number" required />
          <TextField
            ctx={ctx}
            field="listAExp"
            label="Expiration Date"
            type="date"
            required
          />
        </div>
      )}
      {docType === 'listBC' && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            List B
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <SelectField
              ctx={ctx}
              field="listBDoc"
              label="Document"
              required
              options={toOpts(listBDocs)}
            />
            <TextField ctx={ctx} field="listBNum" label="Document Number" required />
            <TextField ctx={ctx} field="listBAuth" label="Issuing Authority" required />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            List C
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              ctx={ctx}
              field="listCDoc"
              label="Document"
              required
              options={toOpts(listCDocs)}
            />
            <TextField ctx={ctx} field="listCNum" label="Document Number" required />
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <TextField
          ctx={ctx}
          field="i9Sig"
          label="Typed Signature"
          required
          placeholder="Type your full name"
        />
        <TextField
          ctx={ctx}
          field="i9SigDate"
          label="Date"
          type="date"
          readOnly
          defaultToday
        />
      </div>
    </>
  )
}

const Task7 = ({ ctx }: { ctx: FieldCtx }) => {
  const acctType = (ctx.data.acctType as string) || ''
  const depType = (ctx.data.depType as string) || ''
  const routing = String(ctx.data.routingNum || '')
  const acctNum = String(ctx.data.acctNum || '')
  const acctConfirm = String(ctx.data.acctNumConfirm || '')
  return (
    <>
      <TextField ctx={ctx} field="bankName" label="Financial Institution Name" required />
      <div className="mt-4">
        <Label required>Account Type</Label>
        <div className="flex gap-6 mt-1">
          <RadioRow
            name="acctType"
            value="checking"
            current={acctType}
            onChange={(v) => ctx.update('acctType', v)}
          >
            Checking
          </RadioRow>
          <RadioRow
            name="acctType"
            value="savings"
            current={acctType}
            onChange={(v) => ctx.update('acctType', v)}
          >
            Savings
          </RadioRow>
        </div>
        {ctx.errors.acctType && <div className="ob-error-msg">Required</div>}
      </div>
      <div className="mt-4">
        <Label required>Routing Number (9 digits)</Label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className={`ob-form-input md:max-w-xs${
              ctx.errors.routingNum ? ' error' : ''
            }`}
            value={routing}
            maxLength={9}
            onChange={(e) =>
              ctx.update('routingNum', e.target.value.replace(/\D/g, ''))
            }
          />
          <span className="text-lg">
            {routing.length === 9 ? (
              <span style={{ color: '#16a34a' }}>✓</span>
            ) : routing.length > 0 ? (
              <span style={{ color: '#ef4444' }}>✗</span>
            ) : null}
          </span>
        </div>
        {ctx.errors.routingNum && <div className="ob-error-msg">Required</div>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <TextField ctx={ctx} field="acctNum" label="Account Number" required />
        <div>
          <Label required>Confirm Account Number</Label>
          <input
            type="text"
            className={`ob-form-input${
              ctx.errors.acctNumConfirm || ctx.errors.acctMatch ? ' error' : ''
            }`}
            value={acctConfirm}
            onChange={(e) => ctx.update('acctNumConfirm', e.target.value)}
          />
          {ctx.errors.acctNumConfirm && <div className="ob-error-msg">Required</div>}
          {acctConfirm && acctNum && (
            <span
              className={acctNum === acctConfirm ? 'ob-match-ok' : 'ob-match-bad'}
            >
              {acctNum === acctConfirm ? '✓ Match' : '✗ Mismatch'}
            </span>
          )}
        </div>
      </div>
      <div className="mt-4">
        <Label required>Deposit Type</Label>
        <div className="space-y-2 mt-1">
          <RadioRow
            name="depType"
            value="full"
            current={depType}
            onChange={(v) => ctx.update('depType', v)}
          >
            Full Paycheck
          </RadioRow>
          <RadioRow
            name="depType"
            value="amount"
            current={depType}
            onChange={(v) => ctx.update('depType', v)}
          >
            Specific Amount
          </RadioRow>
          {depType === 'amount' && (
            <div className="ml-6">
              <Label>Amount ($)</Label>
              <input
                type="number"
                className="ob-form-input md:max-w-[160px]"
                value={(ctx.data.depAmount as string) ?? ''}
                onChange={(e) => ctx.update('depAmount', e.target.value)}
                min={0}
                step="0.01"
              />
            </div>
          )}
          <RadioRow
            name="depType"
            value="percent"
            current={depType}
            onChange={(v) => ctx.update('depType', v)}
          >
            Percentage
          </RadioRow>
          {depType === 'percent' && (
            <div className="ml-6">
              <Label>Percentage (%)</Label>
              <input
                type="number"
                className="ob-form-input md:max-w-[120px]"
                value={(ctx.data.depPercent as string) ?? ''}
                onChange={(e) => ctx.update('depPercent', e.target.value)}
                min={0}
                max={100}
              />
            </div>
          )}
        </div>
        {ctx.errors.depType && <div className="ob-error-msg">Required</div>}
      </div>
      <div
        className="rounded-lg p-4 mt-5 text-sm"
        style={{ background: '#fefce8', border: '1px solid #fde68a' }}
      >
        <Lightbulb className="w-4 h-4 inline text-yellow-600 mr-1 align-text-bottom" />
        A voided check or bank letter shows your routing and account numbers.
      </div>
      <div className="mt-5">
        <Label>Upload Voided Check (Optional)</Label>
        <UploadZone ctx={ctx} field="voidedCheck" />
      </div>
    </>
  )
}

const Task8 = ({
  ctx,
  step,
  onNext1,
  onNext2,
  onBack,
  onSubmit,
}: {
  ctx: FieldCtx
  step: number
  onNext1: () => void
  onNext2: () => void
  onBack: (to: number) => void
  onSubmit: () => void
}) => {
  const filing = (ctx.data.filingStatus as string) || ''
  const multiJobs = !!ctx.data.multiJobs
  const filingLabels: Record<string, string> = {
    single: 'Single or Married filing separately',
    married: 'Married filing jointly or Qualifying surviving spouse',
    head: 'Head of household',
  }
  const d = ctx.data
  return (
    <>
      <div className="flex items-center justify-center gap-2 mb-6">
        <div
          className={`ob-wizard-dot ${
            step === 1 ? 'current' : step > 1 ? 'done' : 'future'
          }`}
        >
          1
        </div>
        <div className={`ob-wizard-line ${step > 1 ? 'done' : 'future'}`} />
        <div
          className={`ob-wizard-dot ${
            step === 2 ? 'current' : step > 2 ? 'done' : 'future'
          }`}
        >
          2
        </div>
        <div className={`ob-wizard-line ${step > 2 ? 'done' : 'future'}`} />
        <div className={`ob-wizard-dot ${step === 3 ? 'current' : 'future'}`}>3</div>
      </div>
      <div className="text-xs text-center text-gray-500 mb-4 flex justify-between px-4">
        <span>Filing Status</span>
        <span>Adjustments</span>
        <span>Review &amp; Sign</span>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div>
          <div className="ob-section-header">Filing Status</div>
          <div className="space-y-3">
            <RadioRow
              name="filingStatus"
              value="single"
              current={filing}
              onChange={(v) => ctx.update('filingStatus', v)}
            >
              Single or Married filing separately
            </RadioRow>
            <RadioRow
              name="filingStatus"
              value="married"
              current={filing}
              onChange={(v) => ctx.update('filingStatus', v)}
            >
              Married filing jointly or Qualifying surviving spouse
            </RadioRow>
            <RadioRow
              name="filingStatus"
              value="head"
              current={filing}
              onChange={(v) => ctx.update('filingStatus', v)}
            >
              Head of household
            </RadioRow>
          </div>
          {ctx.errors.filingStatus && (
            <div className="ob-error-msg">Please select a filing status</div>
          )}
          <div className="flex justify-end mt-6">
            <button
              className="px-6 py-2 rounded-lg text-white font-semibold text-sm"
              style={{ background: '#1a5fa8' }}
              onClick={onNext1}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div>
          <div className="ob-section-header">Adjustments (Optional)</div>
          <div className="mb-4">
            <CheckRow
              id="multi-jobs-cb-8abc"
              checked={multiJobs}
              onChange={(v) => ctx.update('multiJobs', v)}
            >
              Multiple jobs or spouse also works
            </CheckRow>
          </div>
          {multiJobs && (
            <div
              className="rounded-lg p-3 mb-4 text-xs text-blue-700"
              style={{ background: '#dbeafe' }}
            >
              If you have more than one job or your spouse also works, use the IRS
              estimator for best results.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              ctx={ctx}
              field="childDep"
              label="Children under 17 ($2,000 each)"
              type="number"
              min={0}
            />
            <TextField
              ctx={ctx}
              field="otherDep"
              label="Other dependents ($500 each)"
              type="number"
              min={0}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <TextField
              ctx={ctx}
              field="otherIncome"
              label="Other income (interest, dividends)"
              type="number"
              min={0}
              step="0.01"
            />
            <TextField
              ctx={ctx}
              field="deductions"
              label="Deductions (if itemizing)"
              type="number"
              min={0}
              step="0.01"
            />
          </div>
          <div className="mt-4">
            <TextField
              ctx={ctx}
              field="extraWith"
              label="Extra withholding per pay period ($)"
              type="number"
              min={0}
              step="0.01"
              className="md:max-w-xs"
            />
          </div>
          <div className="flex justify-between mt-6">
            <button
              className="px-6 py-2 rounded-lg border text-sm font-semibold text-gray-700"
              onClick={() => onBack(1)}
            >
              Back
            </button>
            <button
              className="px-6 py-2 rounded-lg text-white font-semibold text-sm"
              style={{ background: '#1a5fa8' }}
              onClick={onNext2}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div>
          <div className="ob-section-header">Review &amp; Sign</div>
          <div
            className="rounded-lg p-4 mb-4 text-sm space-y-1"
            style={{ background: '#f3f4f6' }}
          >
            <p>
              <strong>Filing Status:</strong>{' '}
              {filingLabels[filing] || 'Not selected'}
            </p>
            {d.multiJobs && (
              <p>
                <strong>Multiple jobs:</strong> Yes
              </p>
            )}
            {d.childDep && (
              <p>
                <strong>Children under 17:</strong> {d.childDep} ($
                {parseInt(String(d.childDep)) * 2000} credit)
              </p>
            )}
            {d.otherDep && (
              <p>
                <strong>Other dependents:</strong> {d.otherDep} ($
                {parseInt(String(d.otherDep)) * 500} credit)
              </p>
            )}
            {d.otherIncome && (
              <p>
                <strong>Other income:</strong> ${d.otherIncome}
              </p>
            )}
            {d.deductions && (
              <p>
                <strong>Deductions:</strong> ${d.deductions}
              </p>
            )}
            {d.extraWith && (
              <p>
                <strong>Extra withholding/period:</strong> ${d.extraWith}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              ctx={ctx}
              field="w4Sig"
              label="Typed Signature"
              required
              placeholder="Type your full name"
            />
            <TextField
              ctx={ctx}
              field="w4SigDate"
              label="Date"
              type="date"
              readOnly
              defaultToday
            />
          </div>
          <div className="mt-4">
            <CheckRow
              id="w4-certify-cb-8abc"
              checked={!!ctx.data.w4Certified}
              onChange={(v) => ctx.update('w4Certified', v)}
            >
              I certify that the above information is correct to the best of my
              knowledge <span className="text-red-500">*</span>
            </CheckRow>
          </div>
          {ctx.errors.w4Certified && (
            <div className="ob-error-msg">You must certify to continue</div>
          )}
          <div className="flex justify-between mt-6">
            <button
              className="px-6 py-2 rounded-lg border text-sm font-semibold text-gray-700"
              onClick={() => onBack(2)}
            >
              Back
            </button>
            <button
              className="px-6 py-2 rounded-lg text-white font-semibold text-sm"
              style={{ background: '#1a5fa8' }}
              onClick={onSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </>
  )
}

const JOB_DESCRIPTION = `CAREGIVER – JOB DESCRIPTION
Precious Care Providers

POSITION SUMMARY
Provide personal care and support to clients in their homes or care facilities, ensuring comfort, safety, and dignity.

KEY RESPONSIBILITIES
• Assist clients with activities of daily living (ADLs) including bathing, dressing, grooming, and toileting
• Provide companionship and emotional support
• Prepare meals and assist with feeding as needed
• Administer medications as directed by a healthcare professional
• Document all care activities accurately in the care log
• Transport clients to appointments as needed
• Communicate changes in client condition promptly to supervisors
• Maintain a clean and safe environment for clients

QUALIFICATIONS & REQUIREMENTS
• Valid driver's license and reliable transportation
• CPR and First Aid certification (or willingness to obtain within 30 days)
• Background check clearance required
• Compassionate, patient, and dependable
• Previous caregiving experience preferred but not required`

const Task9 = ({ ctx }: { ctx: FieldCtx }) => (
  <>
    <div className="ob-doc-box mb-4">{JOB_DESCRIPTION}</div>
    <div className="mt-4">
      <CheckRow
        id="jd-read-cb-9abc"
        checked={!!ctx.data.jdRead}
        onChange={(v) => ctx.update('jdRead', v)}
      >
        I have read and fully understand my Caregiver Job Description{' '}
        <span className="text-red-500">*</span>
      </CheckRow>
    </div>
    {ctx.errors.jdRead && (
      <div className="ob-error-msg">You must acknowledge to continue</div>
    )}
    <div className="mt-4">
      <TextField
        ctx={ctx}
        field="jdSig"
        label="Typed Signature"
        required
        placeholder="Type your full name"
      />
    </div>
    <div className="mt-4">
      <TextField
        ctx={ctx}
        field="jdDate"
        label="Date"
        type="date"
        readOnly
        defaultToday
        className="md:max-w-xs"
      />
    </div>
  </>
)

const HANDBOOK = `PRECIOUS CARE PROVIDERS – 2026 EMPLOYEE HANDBOOK

WELCOME
Welcome to the Precious Care Providers family. We are committed to providing exceptional care while maintaining a positive and respectful work environment.

CODE OF CONDUCT
All employees are expected to conduct themselves professionally, treating clients, co-workers, and supervisors with dignity and respect at all times.

ATTENDANCE & PUNCTUALITY
Employees must report to shifts on time. Notify your supervisor at least 2 hours before a scheduled shift if you are unable to attend.

DRESS CODE
Professional attire is required. Scrubs or company-issued uniforms must be worn during all client visits.

HIPAA & CONFIDENTIALITY
All client information is strictly confidential. Sharing client details with unauthorized individuals is a violation of HIPAA and grounds for immediate termination.

SOCIAL MEDIA POLICY
Do not post photos, videos, or information about clients on any social media platform.

DISCIPLINARY PROCEDURES
Violations of company policy may result in verbal warning, written warning, suspension, or termination depending on severity.

BENEFITS OVERVIEW
Eligible employees may receive health benefits, paid time off, mileage reimbursement, and continuing education support.`

const Task10 = ({ ctx }: { ctx: FieldCtx }) => (
  <>
    <div className="ob-doc-box mb-4">{HANDBOOK}</div>
    <div className="mt-4">
      <CheckRow
        id="hb-ack-cb-10abc"
        checked={!!ctx.data.hbAck}
        onChange={(v) => ctx.update('hbAck', v)}
      >
        I acknowledge receipt and understanding of the 2026 Employee Handbook{' '}
        <span className="text-red-500">*</span>
      </CheckRow>
    </div>
    {ctx.errors.hbAck && <div className="ob-error-msg">Required</div>}
    <div className="mt-3">
      <CheckRow
        id="hb-comply-cb-10abc"
        checked={!!ctx.data.hbComply}
        onChange={(v) => ctx.update('hbComply', v)}
      >
        I understand I am responsible for compliance with all policies herein{' '}
        <span className="text-red-500">*</span>
      </CheckRow>
    </div>
    {ctx.errors.hbComply && <div className="ob-error-msg">Required</div>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <TextField
        ctx={ctx}
        field="hbSig"
        label="Typed Signature"
        required
        placeholder="Type your full name"
      />
      <TextField
        ctx={ctx}
        field="hbDate"
        label="Date"
        type="date"
        readOnly
        defaultToday
      />
    </div>
  </>
)

const Task11 = ({ ctx }: { ctx: FieldCtx }) => {
  const depts = ['Caregiving', 'Administrative', 'Management', 'Other']
  return (
    <>
      <div
        className="rounded-lg border p-4 mb-4"
        style={{ background: '#f9fafb' }}
      >
        <p className="text-sm text-gray-700 leading-relaxed">
          I, the undersigned, hereby acknowledge receipt of all company documents,
          policies, and forms provided during the onboarding process for Precious
          Care Providers. I agree to comply with all policies and procedures
          outlined therein.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField ctx={ctx} field="ackName" label="Printed Full Name" required />
        <TextField ctx={ctx} field="ackTitle" label="Job Title" required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <SelectField
          ctx={ctx}
          field="dept"
          label="Department"
          required
          options={depts.map((d) => ({ value: d, label: d }))}
        />
        <TextField ctx={ctx} field="startDate" label="Start Date" type="date" required />
      </div>
      <div className="mt-4">
        <TextField
          ctx={ctx}
          field="ackSig"
          label="Electronic Signature – Type your full legal name"
          required
        />
      </div>
      <div className="mt-4">
        <TextField
          ctx={ctx}
          field="ackDate"
          label="Date"
          type="date"
          readOnly
          defaultToday
          className="md:max-w-xs"
        />
      </div>
      <div className="mt-4 flex items-start gap-2">
        <input
          type="checkbox"
          id="ack-agree-cb-11abc"
          className="mt-1 w-5 h-5"
          checked={!!ctx.data.ackAgree}
          onChange={(e) => ctx.update('ackAgree', e.target.checked)}
        />
        <label
          htmlFor="ack-agree-cb-11abc"
          className="text-sm text-gray-700 font-medium"
        >
          <Check className="w-4 h-4 inline text-green-600 mr-1" />I agree to all of
          the above terms and acknowledgments{' '}
          <span className="text-red-500">*</span>
        </label>
      </div>
      {ctx.errors.ackAgree && <div className="ob-error-msg">Required</div>}
    </>
  )
}

const Task12 = ({ ctx }: { ctx: FieldCtx }) => {
  const pref = (ctx.data.paperlessPref as string) || ''
  const email = String(ctx.data.plEmail || '')
  const emailConfirm = String(ctx.data.plEmailConfirm || '')
  return (
    <>
      <div
        className="rounded-lg p-4 mb-4 border"
        style={{ background: '#f0fdf4', borderColor: '#86efac' }}
      >
        <p className="text-sm text-green-800 leading-relaxed">
          <Leaf className="w-4 h-4 inline text-green-600 mr-1 align-text-bottom" />{' '}
          <strong>Go Green with Precious Care Providers!</strong> Receive your pay
          stubs, W-2s, and tax documents electronically. It's faster, secure, and
          environmentally friendly.
        </p>
      </div>
      <div className="mt-4">
        <TextField
          ctx={ctx}
          field="plEmail"
          label="Email Address for Electronic Delivery"
          type="email"
          required
        />
      </div>
      <div className="mt-4">
        <Label required>Confirm Email Address</Label>
        <input
          type="email"
          className={`ob-form-input${
            ctx.errors.plEmailConfirm || ctx.errors.emailMatch ? ' error' : ''
          }`}
          value={emailConfirm}
          onChange={(e) => ctx.update('plEmailConfirm', e.target.value)}
        />
        {ctx.errors.plEmailConfirm && <div className="ob-error-msg">Required</div>}
        {emailConfirm && email && (
          <span className={email === emailConfirm ? 'ob-match-ok' : 'ob-match-bad'}>
            {email === emailConfirm ? '✓ Match' : '✗ Mismatch'}
          </span>
        )}
      </div>
      <div className="mt-4">
        <Label required>Delivery Preference</Label>
        <div className="space-y-2 mt-1">
          <RadioRow
            name="paperlessPref"
            value="yes"
            current={pref}
            onChange={(v) => ctx.update('paperlessPref', v)}
          >
            Yes, enroll me in paperless delivery{' '}
            <span className="text-xs text-green-600 font-medium">(recommended)</span>
          </RadioRow>
          <RadioRow
            name="paperlessPref"
            value="no"
            current={pref}
            onChange={(v) => ctx.update('paperlessPref', v)}
          >
            No, I prefer paper documents
          </RadioRow>
        </div>
        {ctx.errors.paperlessPref && <div className="ob-error-msg">Required</div>}
      </div>
      <p className="text-xs text-gray-500 mt-3">
        By selecting paperless, you consent to receive all payroll and tax documents
        electronically.
      </p>
    </>
  )
}

type TrainingState = 'complete' | 'inprogress' | 'incomplete'

const trainingState = (tr: TrainingItem, data: TaskData): TrainingState => {
  const cert = data[`cert_${tr.id}`]
  if (tr.required) return cert ? 'complete' : 'incomplete'
  const ans = data[`ans_${tr.id}`]
  if (ans === 'no') return 'complete'
  if (ans === 'yes') return cert ? 'complete' : 'inprogress'
  return 'incomplete'
}

const TrainingCard = ({ ctx, tr }: { ctx: FieldCtx; tr: TrainingItem }) => {
  const certKey = `cert_${tr.id}`
  const ansKey = `ans_${tr.id}`
  const ans = (ctx.data[ansKey] as string) || ''
  const state = trainingState(tr, ctx.data)
  const showCert = tr.required || ans === 'yes'

  return (
    <div className={`ob-training-card${state === 'complete' ? ' done' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`ob-status-dot ${state}`}>
          {state === 'complete' ? (
            <Check className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <GraduationCap
              className={`w-3.5 h-3.5 ${
                state === 'inprogress' ? 'text-blue-600' : 'text-gray-400'
              }`}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900">
                {tr.name}
                {tr.required && <span className="text-red-500 ml-1">*</span>}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {tr.desc} · {tr.hours}
              </div>
            </div>
            {!tr.required && (
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs font-medium text-gray-600">
                  Completed this training?
                </span>
                <YesNoToggle value={ans} onChange={(v) => ctx.update(ansKey, v)} />
              </div>
            )}
          </div>

          {tr.note && (
            <div
              className="mt-2.5 rounded-lg px-3 py-2 text-xs leading-relaxed text-gray-600"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <span className="font-semibold text-gray-500">Note: </span>
              {tr.note}
            </div>
          )}

          {showCert && (
            <div
              className="ob-reveal mt-3 pt-3 border-t"
              style={{ borderColor: '#e2e8f0' }}
            >
              <Label required={tr.required}>Upload Certificate</Label>
              <UploadZone ctx={ctx} field={certKey} error={ctx.errors[certKey]} />
              {ctx.errors[certKey] && (
                <div className="ob-error-msg">
                  Certificate is required for this training
                </div>
              )}
            </div>
          )}

          {!tr.required && ans === 'no' && (
            <div className="ob-reveal mt-2 flex items-center gap-1.5 text-xs text-gray-400">
              <Check className="w-3.5 h-3.5" />
              No action needed for this optional training.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const Task13 = ({ ctx }: { ctx: FieldCtx }) => {
  const requiredTrainings = TRAININGS.filter((t) => t.required)
  const optionalTrainings = TRAININGS.filter((t) => !t.required)
  const readyCount = TRAININGS.filter(
    (t) => trainingState(t, ctx.data) === 'complete',
  ).length
  const pct = Math.round((readyCount / TRAININGS.length) * 100)

  return (
    <>
      <div className="flex items-start gap-2 mb-4">
        <GraduationCap
          className="w-5 h-5 shrink-0 mt-0.5"
          style={{ color: '#1a5fa8' }}
        />
        <p className="text-sm text-gray-600">
          Upload your training completion certificates below. Required trainings
          must include a certificate. For optional trainings, choose Yes or No — if
          Yes, attach the certificate.
        </p>
      </div>

      <div
        className="rounded-xl p-3.5 mb-6"
        style={{ background: '#f4f6f9', border: '1px solid #e2e8f0' }}
      >
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-gray-500 uppercase tracking-wider">
            Trainings Ready
          </span>
          <span className="tabular-nums" style={{ color: '#1a5fa8' }}>
            {readyCount} of {TRAININGS.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="ob-progress-bar-fill h-2 rounded-full"
            style={{ background: '#c9a027', width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="ob-section-header" style={{ marginTop: 0 }}>
        Required Trainings
      </div>
      <div className="space-y-3">
        {requiredTrainings.map((tr) => (
          <TrainingCard key={tr.id} ctx={ctx} tr={tr} />
        ))}
      </div>

      <div className="ob-section-header">Optional Trainings</div>
      <div className="space-y-3">
        {optionalTrainings.map((tr) => (
          <TrainingCard key={tr.id} ctx={ctx} tr={tr} />
        ))}
      </div>
    </>
  )
}

// ====================== ONBOARDING PAGE ======================
const OnboardingPage = () => {
  const { completeOnboarding } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [taskState, setTaskState] = useState<TaskState>(loadInitialState)
  const [activeTask, setActiveTask] = useState<ActiveTask>(1)
  const [errors, setErrors] = useState<Errors>({})
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  const { statuses: taskStatuses, data: taskData } = taskState

  // Persist to localStorage
  useEffect(() => {
    TASKS.forEach((t) => {
      localStorage.setItem(
        'pcp_task_' + t.id,
        JSON.stringify({ status: taskStatuses[t.id], data: taskData[t.id] || {} }),
      )
    })
  }, [taskStatuses, taskData])

  const completedCount = TASKS.filter(
    (t) => taskStatuses[t.id] === 'complete',
  ).length
  const progressPct = Math.round((completedCount / TASKS.length) * 100)
  const allDone = completedCount === TASKS.length

  const w4Step = (taskData[8]?._w4Step as number) || 1

  const update = (field: string, value: string | boolean | number) => {
    if (typeof activeTask !== 'number') return
    setTaskState((s) => ({
      ...s,
      data: {
        ...s.data,
        [activeTask]: { ...s.data[activeTask], [field]: value },
      },
    }))
  }

  const ctx: FieldCtx = {
    data: typeof activeTask === 'number' ? taskData[activeTask] || {} : {},
    update,
    errors,
  }

  const goToTask = (id: ActiveTask) => {
    setActiveTask(id)
    setErrors({})
    setSidebarOpen(false)
    mainRef.current?.scrollTo(0, 0)
  }

  const completeAndAdvance = (id: number) => {
    setTaskState((s) => {
      const statuses = { ...s.statuses, [id]: 'complete' as Status }
      const data = {
        ...s.data,
        [id]: { ...s.data[id], completedDate: TODAY },
      }
      const nextIncomplete = TASKS.find(
        (t) => t.id > id && statuses[t.id] !== 'complete',
      )
      let nextActive: ActiveTask
      if (nextIncomplete) {
        nextActive = nextIncomplete.id
        if (statuses[nextIncomplete.id] === 'incomplete')
          statuses[nextIncomplete.id] = 'inprogress'
      } else {
        const anyIncomplete = TASKS.find((t) => statuses[t.id] !== 'complete')
        nextActive = anyIncomplete ? anyIncomplete.id : 'summary'
      }
      setActiveTask(nextActive)
      return { statuses, data }
    })
    setErrors({})
    showToast('Saved successfully!')
    mainRef.current?.scrollTo(0, 0)
  }

  const handleSave = () => {
    if (typeof activeTask !== 'number') return
    const errs = validateTask(activeTask, taskData[activeTask] || {})
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    completeAndAdvance(activeTask)
  }

  // W-4 wizard handlers
  const setW4Step = (n: number) => update('_w4Step', n)
  const handleW4Next1 = () => {
    if (!taskData[8]?.filingStatus) {
      setErrors({ filingStatus: true })
      return
    }
    setErrors({})
    setW4Step(2)
  }
  const handleW4Next2 = () => {
    setErrors({})
    setW4Step(3)
  }
  const handleW4Back = (to: number) => {
    setErrors({})
    setW4Step(to)
  }
  const handleW4Submit = () => {
    const d = taskData[8] || {}
    const errs: Errors = {}
    if (!d.w4Sig || !String(d.w4Sig).trim()) errs.w4Sig = true
    if (!d.w4Certified) errs.w4Certified = true
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    completeAndAdvance(8)
  }

  const handleSubmitPacket = () => {
    showToast('Onboarding packet submitted!')
    completeOnboarding()
    setTimeout(() => navigate('/clock-in-out'), 600)
  }

  const renderTaskForm = () => {
    switch (activeTask) {
      case 1:
        return <Task1 ctx={ctx} />
      case 2:
        return <Task2 ctx={ctx} />
      case 3:
        return <Task3 ctx={ctx} />
      case 4:
        return <Task4 ctx={ctx} />
      case 5:
        return <Task5 ctx={ctx} />
      case 6:
        return <Task6 ctx={ctx} />
      case 7:
        return <Task7 ctx={ctx} />
      case 8:
        return (
          <Task8
            ctx={ctx}
            step={w4Step}
            onNext1={handleW4Next1}
            onNext2={handleW4Next2}
            onBack={handleW4Back}
            onSubmit={handleW4Submit}
          />
        )
      case 9:
        return <Task9 ctx={ctx} />
      case 10:
        return <Task10 ctx={ctx} />
      case 11:
        return <Task11 ctx={ctx} />
      case 12:
        return <Task12 ctx={ctx} />
      case 13:
        return <Task13 ctx={ctx} />
      default:
        return null
    }
  }

  const badgeMeta = (st: Status) =>
    st === 'complete'
      ? { cls: 'ob-badge-complete', text: 'Complete' }
      : st === 'inprogress'
        ? { cls: 'ob-badge-inprogress', text: 'In Progress' }
        : { cls: 'ob-badge-incomplete', text: 'Incomplete' }

  return (
    <div className="ob-root flex min-h-screen bg-white">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="ob-sidebar-overlay fixed inset-0 bg-black/40 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`ob-sidebar-panel flex flex-col w-[280px] h-screen fixed top-0 left-0 overflow-hidden z-50${
          sidebarOpen ? ' open' : ''
        }`}
        style={{ background: '#f4f6f9', borderRight: '1px solid #e2e8f0' }}
      >
        <div
          className="p-4 flex flex-col items-center"
          style={{ borderBottom: '1px solid #e2e8f0' }}
        >
          <button
            className="self-end p-1 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{ borderBottom: '1px solid #e2e8f0' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
            style={{ background: '#1a5fa8', color: '#c9a027' }}
          >
            JT
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-gray-900 truncate">
              Joel Akon Tacho
            </div>
            <div className="text-xs text-gray-500">New Employee · Caregiver</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0">
          {TASKS.map((t, i) => {
            const st = taskStatuses[t.id]
            const isActive = activeTask === t.id
            const isLast = i === TASKS.length - 1
            const { cls, text } = badgeMeta(st)
            return (
              <div
                key={t.id}
                className={`ob-sidebar-task flex items-start gap-3 px-3 py-2.5 rounded-r-lg relative${
                  isActive ? ' active' : ''
                }`}
                onClick={() => goToTask(t.id)}
              >
                {!isLast && <div className="ob-connector-line" />}
                <div className={`ob-status-dot ${st}`}>
                  {st === 'complete' ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <ClipboardList
                      className={`w-3.5 h-3.5 ${
                        st === 'inprogress' ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 leading-tight">
                    {t.name}
                  </div>
                  <span className={`ob-badge ${cls} mt-1 inline-block`}>{text}</span>
                </div>
              </div>
            )
          })}
          {/* Summary item */}
          <div
            className={`ob-sidebar-task flex items-start gap-3 px-3 py-2.5 rounded-r-lg mt-2 pt-3${
              activeTask === 'summary' ? ' active' : ''
            }`}
            style={{ borderTop: '1px solid #e2e8f0' }}
            onClick={() => goToTask('summary')}
          >
            <div className={`ob-status-dot ${allDone ? 'complete' : 'incomplete'}`}>
              {allDone ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Flag className="w-3.5 h-3.5 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800">Summary</div>
              <span
                className={`ob-badge ${
                  allDone ? 'ob-badge-complete' : 'ob-badge-incomplete'
                } mt-1 inline-block`}
              >
                {allDone ? 'Ready' : 'Pending'}
              </span>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="ob-main-panel flex-1 md:ml-[280px] flex flex-col min-h-screen">
        {/* Top Header */}
        <header
          className="bg-white border-b-2 sticky top-0 z-40 px-4 md:px-8 py-4"
          style={{ borderBottomColor: '#c9a027' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <button
              className="ob-mobile-menu-btn p-2 -ml-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: '#1a5fa8' }}>
              Onboarding Tasks
            </h2>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="ob-progress-bar-fill h-3 rounded-full"
              style={{ background: '#c9a027', width: `${progressPct}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {completedCount} of {TASKS.length} Tasks Complete · {progressPct}%
            Complete
          </p>
        </header>

        {/* Main Task Content */}
        <main ref={mainRef} className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTask === 'summary' ? (
            <div className="bg-white rounded-xl p-6 md:p-8 max-w-3xl mx-auto shadow-sm border border-gray-100">
              <div className="max-w-2xl mx-auto text-center">
                {allDone ? (
                  <>
                    <div className="flex justify-center mb-4">
                      <div className="ob-checkmark-anim">
                        <Check className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <h2
                      className="text-2xl font-bold mb-2"
                      style={{ color: '#1a5fa8' }}
                    >
                      Onboarding Complete!
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Congratulations, Joel! You have successfully completed all
                      required onboarding tasks for Precious Care Providers.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-3">#</th>
                            <th className="py-2 px-3">Task Name</th>
                            <th className="py-2 px-3">Status</th>
                            <th className="py-2 px-3">Date Completed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {TASKS.map((t) => (
                            <tr
                              key={t.id}
                              className="border-b"
                              style={{ background: '#f0fdf4' }}
                            >
                              <td className="py-2 px-3 font-medium">{t.id}</td>
                              <td className="py-2 px-3">{t.name}</td>
                              <td className="py-2 px-3">
                                <span className="ob-badge ob-badge-complete">
                                  <Check className="w-3 h-3 inline mr-1" />
                                  Complete
                                </span>
                              </td>
                              <td className="py-2 px-3 text-gray-600">{TODAY}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      className="mt-6 w-full py-3 rounded-lg text-white font-bold text-base"
                      style={{ background: '#c9a027' }}
                      onClick={handleSubmitPacket}
                    >
                      Submit Onboarding Packet
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center mb-4">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: '#fef3c7' }}
                      >
                        <AlertTriangle className="w-8 h-8 text-yellow-600" />
                      </div>
                    </div>
                    <h2
                      className="text-2xl font-bold mb-2"
                      style={{ color: '#1a5fa8' }}
                    >
                      Almost there!
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Please complete all tasks before submitting. ({completedCount}/
                      {TASKS.length} complete)
                    </p>
                    <div className="text-left space-y-2">
                      {TASKS.filter((t) => taskStatuses[t.id] !== 'complete').map(
                        (t) => (
                          <div
                            key={t.id}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 cursor-pointer"
                            onClick={() => goToTask(t.id)}
                          >
                            <Circle className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-blue-700 font-medium">
                              {t.name}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-5 md:p-8 max-w-3xl mx-auto shadow-sm border border-gray-100">
              {(() => {
                const task = TASKS.find((t) => t.id === activeTask)!
                const { cls, text } = badgeMeta(taskStatuses[activeTask as number])
                const isW4 = activeTask === 8
                const isPaperless = activeTask === 12
                return (
                  <>
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3
                        className="text-lg md:text-xl font-bold"
                        style={{ color: '#1a5fa8' }}
                      >
                        {task.name}
                      </h3>
                      <span className={`ob-badge ${cls}`}>{text}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-5">
                      Please complete all required fields below.
                    </p>
                    {renderTaskForm()}
                    {!isW4 && (
                      <button
                        className="mt-6 w-full py-3 rounded-lg text-white font-bold text-sm"
                        style={{ background: isPaperless ? '#c9a027' : '#1a5fa8' }}
                        onClick={handleSave}
                      >
                        {isPaperless ? 'Enroll & Continue' : 'Save & Continue'}
                      </button>
                    )}
                  </>
                )
              })()}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default OnboardingPage
