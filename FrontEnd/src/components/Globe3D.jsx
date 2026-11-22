import { useEffect, useRef, useState } from 'react'
import './Globe3D.css'

export default function Globe3D({ fallback }) {
  const host = useRef(null)
  const controller = useRef(null)
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    let cancelled = false
    const abort = new AbortController()
    import('./createGlobeScene').then(async ({ createGlobeScene }) => {
      if (cancelled) return
      try {
        const scene = await createGlobeScene(host.current, {
          signal: abort.signal,
          onFailure: () => { if (!cancelled) setReady(false) },
        })
        if (cancelled) { scene.dispose(); return }
        controller.current = scene
        setReady(true)
      } catch {
        // Keep the static illustration visible on devices without WebGL.
        if (!cancelled) setReady(false)
      }
    }).catch(() => { if (!cancelled) setReady(false) })
    return () => { cancelled = true; abort.abort(); controller.current?.dispose(); controller.current = null }
  }, [])
  useEffect(() => { controller.current?.setPaused(paused) }, [paused, ready])

  return <>
    <div className={`globe-fallback ${ready ? 'is-hidden' : ''}`} aria-hidden="true">{fallback}</div>
    <div className={`globe-canvas ${ready ? 'is-ready' : ''}`} ref={host} aria-hidden="true" />
    <div className="globe-ground" aria-hidden="true" />
    {ready && <button className="globe-motion-toggle" type="button" onClick={() => setPaused(!paused)} aria-label={paused ? 'Tiếp tục chuyển động 3D' : 'Tạm dừng chuyển động 3D'} aria-pressed={paused}>
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">{paused ? <path d="m6 3 11 7-11 7Z" /> : <path d="M5 3h3v14H5zm7 0h3v14h-3z" />}</svg>
      <span>{paused ? 'Tiếp tục' : 'Tạm dừng'}</span>
    </button>}
  </>
}
