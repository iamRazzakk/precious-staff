import Badge from '@/components/common/Badge'
import { colors } from '@/utils/colors'

interface Credential {
  key: string
  label: string
  badge: string
  detail: string
}

const PROFILE = {
  name: 'Maria Santos',
  role: 'Certified Nursing Assistant (CNA)',
  employeeId: 'PCP-2024-0042',
  avatar: 'https://i.pravatar.cc/120?img=47',
}

const CREDENTIALS: Credential[] = [
  { key: 'cna', label: 'CNA License', badge: 'Active', detail: 'Exp: 12/2026' },
  { key: 'cpr', label: 'CPR/First Aid', badge: 'Current', detail: 'Exp: 06/2027' },
  { key: 'dementia', label: 'Dementia Care', badge: 'Certified', detail: 'Completed 2025' },
  { key: 'bg-check', label: 'Background Check', badge: 'Cleared', detail: 'Annual: 01/2026' },
]

const MyProfilePage = () => {
  return (
    <div className="px-8 py-7">
      <div className="bg-bg-card border border-border-light rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center gap-5 mb-6">
          <img
            src={PROFILE.avatar}
            alt={PROFILE.name}
            className="w-[88px] h-[88px] rounded-full object-cover border-2 border-border-light flex-shrink-0"
          />
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-text-primary m-0">{PROFILE.name}</h2>
            <div className="text-base font-semibold mt-0.5" style={{ color: colors.primary }}>
              {PROFILE.role}
            </div>
            <div className="text-sm text-text-muted mt-0.5">Employee ID: {PROFILE.employeeId}</div>
          </div>
        </div>

        {/* Credentials grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CREDENTIALS.map((c) => (
            <div
              key={c.key}
              className="rounded-xl px-5 py-4"
              style={{ background: colors.bgSubtle, border: `1px solid ${colors.borderLight}` }}
            >
              <div className="text-xs text-text-secondary mb-2">{c.label}</div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <Badge text={c.badge} bg={colors.successLight} color={colors.successText} />
                <span className="text-sm text-text-primary">{c.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyProfilePage
