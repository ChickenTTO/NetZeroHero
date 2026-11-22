import { useEffect, useRef } from 'react'
import './TiltSurface.css'

export default function TiltSurface({ children, className = '', maxTilt = 7, style }) {
  const surface = useRef(null)

  useEffect(() => {
    const element = surface.current
    const motion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
    const strength = Number.isFinite(maxTilt) ? Math.min(Math.max(maxTilt, 0), 12) : 7
    let frame = 0
    let pointerX = 0
    let pointerY = 0

    const reset = () => {
      window.cancelAnimationFrame(frame)
      frame = 0
      delete element.dataset.tilting
      element.style.setProperty('--tilt-x', '0deg')
      element.style.setProperty('--tilt-y', '0deg')
      element.style.setProperty('--tilt-pointer-x', '50%')
      element.style.setProperty('--tilt-pointer-y', '50%')
    }

    const update = () => {
      frame = 0
      if (!motion.matches || document.hidden) return reset()
      // The outer surface stays untransformed, so its bounds remain stable.
      const bounds = element.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return reset()
      const x = Math.min(Math.max((pointerX - bounds.left) / bounds.width, 0), 1)
      const y = Math.min(Math.max((pointerY - bounds.top) / bounds.height, 0), 1)
      element.dataset.tilting = 'true'
      element.style.setProperty('--tilt-x', `${((0.5 - y) * strength * 2).toFixed(2)}deg`)
      element.style.setProperty('--tilt-y', `${((x - 0.5) * strength * 2).toFixed(2)}deg`)
      element.style.setProperty('--tilt-pointer-x', `${(x * 100).toFixed(1)}%`)
      element.style.setProperty('--tilt-pointer-y', `${(y * 100).toFixed(1)}%`)
    }

    const move = (event) => {
      if (!motion.matches || event.pointerType !== 'mouse') return
      pointerX = event.clientX
      pointerY = event.clientY
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    const visibilityChange = () => { if (document.hidden) reset() }

    element.addEventListener('pointermove', move)
    element.addEventListener('pointerleave', reset)
    element.addEventListener('pointercancel', reset)
    element.addEventListener('focusin', reset)
    window.addEventListener('blur', reset)
    document.addEventListener('visibilitychange', visibilityChange)
    motion.addEventListener('change', reset)

    return () => {
      reset()
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerleave', reset)
      element.removeEventListener('pointercancel', reset)
      element.removeEventListener('focusin', reset)
      window.removeEventListener('blur', reset)
      document.removeEventListener('visibilitychange', visibilityChange)
      motion.removeEventListener('change', reset)
    }
  }, [maxTilt])

  return <div ref={surface} className={`tilt-surface ${className}`} style={style}>
    <div className="tilt-surface-plane">
      {children}
      <span className="tilt-glare" aria-hidden="true" />
    </div>
  </div>
}
