import { useState, useCallback } from 'react'

/**
 * Returns hover state + handlers for any element.
 * Use for pure presentational hover effects (not for dropdowns/tooltips).
 */
export const useHover = () => {
  const [isHovered, setIsHovered] = useState(false)
  const onMouseEnter = useCallback(() => setIsHovered(true), [])
  const onMouseLeave = useCallback(() => setIsHovered(false), [])
  return { isHovered, hoverProps: { onMouseEnter, onMouseLeave } }
}
