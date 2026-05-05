import { useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react'

interface OtpInputProps {
  length?: number
  value: string[]
  onChange: (values: string[]) => void
  onComplete?: (code: string) => void
}

const OtpInput = ({ length = 4, value, onChange, onComplete }: OtpInputProps) => {
  const refs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  const handleChange = (idx: number, digit: string) => {
    const sanitized = digit.replace(/\D/g, '').slice(-1)
    const next = [...value]
    next[idx] = sanitized
    onChange(next)

    if (sanitized && idx < length - 1) {
      refs.current[idx + 1]?.focus()
    }

    if (sanitized && idx === length - 1 && next.every((d) => d)) {
      onComplete?.(next.join(''))
    }
  }

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      refs.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      refs.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      refs.current[idx + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    const next = Array(length).fill('')
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    onChange(next)
    refs.current[Math.min(pasted.length, length - 1)]?.focus()
    if (pasted.length === length) onComplete?.(pasted)
  }

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (refs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] || ''}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className={`w-16 h-16 text-center text-[28px] font-bold text-text-primary rounded-[14px] border-2 outline-none transition-all duration-150 font-[inherit] ${
            value[idx] ? 'border-primary bg-primary-light' : 'border-border bg-bg-card'
          }`}
        />
      ))}
    </div>
  )
}

export default OtpInput
