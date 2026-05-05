import { useEffect, useMemo, useState } from 'react'
import { Select } from 'antd'
import { Clock, MapPin, LogIn, LogOut, Activity, Info, Timer } from 'lucide-react'
import { colors } from '@/utils/colors'
import { useToast } from '@/context/ToastContext'

const formatDuration = (ms: number) => {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

type GpsStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'

const STAFF_OPTIONS = [
  { value: 'st-1', label: 'Maria Santos' },
  { value: 'st-2', label: 'David Kim' },
  { value: 'st-3', label: 'Priya Patel' },
  { value: 'st-4', label: 'Aisha Johnson' },
]

const CLIENT_OPTIONS = [
  { value: 'cl-1', label: 'Eleanor Mitchell' },
  { value: 'cl-2', label: 'George Patterson' },
  { value: 'cl-3', label: 'Helen Zhao' },
  { value: 'cl-4', label: 'Rose Nakamura' },
  { value: 'cl-5', label: 'James O’Connor' },
]

const formatTime = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

interface ActiveShift {
  staffId: string
  staffLabel: string
  clientId: string
  clientLabel: string
  startedAt: Date
}

const ClockInOutPage = () => {
  const { showToast } = useToast()
  const [staffId, setStaffId] = useState<string | undefined>()
  const [clientId, setClientId] = useState<string | undefined>()
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!activeShift) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [activeShift])

  const elapsedMs = useMemo(
    () => (activeShift ? now - activeShift.startedAt.getTime() : 0),
    [now, activeShift],
  )

  const requestGps = () => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('unavailable')
      return
    }
    setGpsStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsStatus('granted')
      },
      () => setGpsStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  useEffect(() => {
    requestGps()
  }, [])

  const isClockedIn = activeShift !== null
  const canClockIn = !!staffId && !!clientId

  const handleClockIn = () => {
    if (!canClockIn) return
    const staffLabel = STAFF_OPTIONS.find((s) => s.value === staffId)?.label ?? ''
    const clientLabel = CLIENT_OPTIONS.find((c) => c.value === clientId)?.label ?? ''
    const startedAt = new Date()
    setActiveShift({
      staffId: staffId!,
      staffLabel,
      clientId: clientId!,
      clientLabel,
      startedAt,
    })
    setNow(startedAt.getTime())
    showToast('Clocked in', 'success')
  }

  const handleClockOut = () => {
    setActiveShift(null)
    showToast('Clocked out', 'info')
  }

  const renderGpsStatus = () => {
    switch (gpsStatus) {
      case 'requesting':
        return (
          <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
            <span className="w-2 h-2 rounded-full" style={{ background: colors.warning }} />
            Requesting location access…
          </div>
        )
      case 'granted':
        return (
          <div className="flex items-center gap-2 text-sm" style={{ color: colors.successText }}>
            <span className="w-2 h-2 rounded-full" style={{ background: colors.success }} />
            Location locked — {coords?.lat.toFixed(4)}, {coords?.lng.toFixed(4)}
          </div>
        )
      case 'denied':
        return (
          <div className="flex items-center gap-2 text-sm" style={{ color: colors.danger }}>
            <span className="w-2 h-2 rounded-full" style={{ background: colors.danger }} />
            Location access denied — please enable GPS
            <button
              onClick={requestGps}
              className="ml-2 text-xs font-semibold underline cursor-pointer bg-transparent border-0 p-0"
              style={{ color: colors.primary }}
            >
              Retry
            </button>
          </div>
        )
      case 'unavailable':
        return (
          <div className="flex items-center gap-2 text-sm" style={{ color: colors.danger }}>
            <span className="w-2 h-2 rounded-full" style={{ background: colors.danger }} />
            GPS not supported by this browser
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
            <span className="w-2 h-2 rounded-full" style={{ background: colors.textMuted }} />
            Location not requested
          </div>
        )
    }
  }

  return (
    <div className="px-8 py-7">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main card */}
        <div className="lg:col-span-2 bg-bg-card border border-border-light rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={20} style={{ color: colors.primary }} />
            <h2 className="text-xl font-bold text-text-primary m-0">Clock In / Out</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Staff Member
              </label>
              <Select
                value={staffId}
                onChange={setStaffId}
                options={STAFF_OPTIONS}
                placeholder="— Select Staff —"
                className="w-full"
                disabled={isClockedIn}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Client
              </label>
              <Select
                value={clientId}
                onChange={setClientId}
                options={CLIENT_OPTIONS}
                placeholder="— Select Client —"
                className="w-full"
                disabled={isClockedIn}
              />
            </div>
          </div>

          <div
            className="rounded-xl px-4 py-3 mb-5"
            style={{ background: colors.infoLight, border: `1px solid ${colors.infoLight}` }}
          >
            <div className="flex items-center gap-2 mb-1.5" style={{ color: colors.infoText }}>
              <MapPin size={16} />
              <span className="text-sm font-semibold">GPS Location</span>
              <span className="text-xs font-normal" style={{ color: colors.textMuted }}>
                (optional)
              </span>
            </div>
            {renderGpsStatus()}
          </div>

          {isClockedIn ? (
            <>
              <div
                className="rounded-xl px-5 py-4 mb-4 flex items-center justify-between"
                style={{ background: colors.successLight }}
              >
                <div className="flex items-center gap-2" style={{ color: colors.successText }}>
                  <Timer size={18} />
                  <span className="text-sm font-semibold">Shift duration</span>
                </div>
                <div
                  className="text-3xl font-bold tabular-nums tracking-tight"
                  style={{ color: colors.successText }}
                >
                  {formatDuration(elapsedMs)}
                </div>
              </div>
              <button
                onClick={handleClockOut}
                className="w-full inline-flex items-center justify-center gap-2 h-14 rounded-xl border-0 cursor-pointer text-base font-bold tracking-wide text-white"
                style={{ background: colors.danger }}
              >
                <LogOut size={18} />
                CLOCK OUT
              </button>
            </>
          ) : (
            <button
              onClick={handleClockIn}
              disabled={!canClockIn}
              className="w-full inline-flex items-center justify-center gap-2 h-14 rounded-xl border-0 text-base font-bold tracking-wide text-white"
              style={{
                background: canClockIn ? colors.primary : '#9CB5C7',
                cursor: canClockIn ? 'pointer' : 'not-allowed',
              }}
            >
              <LogIn size={18} />
              CLOCK IN
            </button>
          )}
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-5">
          {/* Active Shifts */}
          <div className="bg-bg-card border border-border-light rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={18} style={{ color: colors.primary }} />
              <h3 className="text-base font-bold text-text-primary m-0">Active Shifts</h3>
            </div>
            {activeShift ? (
              <div className="rounded-lg p-3" style={{ background: colors.successLight }}>
                <div className="text-sm font-semibold" style={{ color: colors.successText }}>
                  {activeShift.staffLabel}
                </div>
                <div className="text-xs mt-0.5 text-text-secondary">
                  with {activeShift.clientLabel}
                </div>
                <div className="text-xs mt-1 text-text-muted">
                  Since {formatTime(activeShift.startedAt)}
                </div>
                <div
                  className="text-xl font-bold mt-2 tabular-nums"
                  style={{ color: colors.successText }}
                >
                  {formatDuration(elapsedMs)}
                </div>
              </div>
            ) : (
              <div className="text-sm text-text-muted italic">No active shifts</div>
            )}
          </div>

          {/* How It Works */}
          <div className="bg-bg-card border border-border-light rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info size={18} style={{ color: colors.primary }} />
              <h3 className="text-base font-bold text-text-primary m-0">How It Works</h3>
            </div>
            <ol className="m-0 pl-5 flex flex-col gap-2 text-sm text-text-secondary">
              <li>Select your name and the client</li>
              <li>Allow GPS access when prompted</li>
              <li>You must be within 0.3 miles of the client's address</li>
              <li>Press CLOCK IN to start your shift</li>
              <li>Press CLOCK OUT when your shift ends (no location required)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClockInOutPage
