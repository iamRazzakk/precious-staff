import { useState, useEffect } from 'react'

/**
 * Countdown timer hook — counts down from `initialSeconds` to 0.
 * Returns seconds remaining and a reset function.
 */
export const useCountdown = (initialSeconds: number) => {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (seconds <= 0) return
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [seconds])

  const reset = () => setSeconds(initialSeconds)
  const isActive = seconds > 0

  return { seconds, isActive, reset }
}
