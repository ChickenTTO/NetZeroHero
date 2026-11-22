import * as THREE from 'three'

import surfaceUrl from '../assets/globe/surface.webp'
import reliefUrl from '../assets/globe/relief.webp'
import roughnessUrl from '../assets/globe/roughness.webp'

export async function createGlobeScene(host, { onFailure, signal }) {
  let renderer = null
  let disposed = false
  let frame = 0
  const resources = new Set()
  const cleanups = []

  function track(resource) {
    if (disposed) resource.dispose()
    else resources.add(resource)
    return resource
  }

  function listen(target, event, handler) {
    target.addEventListener(event, handler)
    cleanups.push(() => target.removeEventListener(event, handler))
  }

  function release(callback) {
    try { callback() } catch {
      // Continue releasing the remaining resources even after context loss.
    }
  }

  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    cleanups.reverse().forEach((cleanup) => release(cleanup))
    cleanups.length = 0
    resources.forEach((resource) => release(() => resource.dispose()))
    resources.clear()
    if (renderer) {
      release(() => renderer.dispose())
      release(() => renderer.forceContextLoss())
      renderer.domElement.remove()
      renderer = null
    }
  }

  try {
    if (signal?.aborted) throw new DOMException('Scene cancelled', 'AbortError')
    if (signal) listen(signal, 'abort', dispose)
    const loader = new THREE.TextureLoader()
    const [surface, relief, roughness] = await Promise.all(
      [surfaceUrl, reliefUrl, roughnessUrl].map(url => loader.loadAsync(url).then(track)),
    )
    if (disposed) throw new DOMException('Scene cancelled', 'AbortError')
    surface.colorSpace = THREE.SRGBColorSpace
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, host.clientWidth < 480 ? 1.25 : 1.75))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    surface.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4)
    renderer.setClearColor(0x000000, 0)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40)
    camera.position.set(0, 0.12, 7.5)
    camera.lookAt(0, 0, 0)
    const stage = new THREE.Group()
    stage.rotation.z = -0.16
    scene.add(stage)

    scene.add(new THREE.HemisphereLight(0xe7f3e2, 0x14271f, 2.1))
    const keyLight = new THREE.DirectionalLight(0xf2fff2, 3.4)
    keyLight.position.set(-3, 4, 4)
    scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0xa2eab0, 2.0)
    rimLight.position.set(3, 1, -2)
    scene.add(rimLight)
    const fillLight = new THREE.DirectionalLight(0x92b9a7, 0.55)
    fillLight.position.set(3, -1, 4)
    scene.add(fillLight)

    const globe = new THREE.Mesh(
      track(new THREE.SphereGeometry(1.42, 64, 48)),
      track(new THREE.MeshPhysicalMaterial({ map: surface, bumpMap: relief, bumpScale: 0.024, roughnessMap: roughness, roughness: 0.82, metalness: 0.12, clearcoat: 0.32, clearcoatRoughness: 0.42 })),
    )
    globe.rotation.y = -3.35
    stage.add(globe)

    // Illustrative connections, attached to the globe so they follow its surface.
    const toSurface = (latitude, longitude) => {
      const phi = THREE.MathUtils.degToRad(90 - latitude)
      const theta = THREE.MathUtils.degToRad(longitude + 180)
      return new THREE.Vector3(-Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)).multiplyScalar(1.44)
    }
    const hub = toSurface(21, 105)
    const routes = []
    const routeMaterial = track(new THREE.LineBasicMaterial({ color: 0xc3edce, transparent: true, opacity: 0.48 }))
    const pointGeometry = track(new THREE.SphereGeometry(0.018, 10, 8))
    const pointMaterial = track(new THREE.MeshBasicMaterial({ color: 0xc6f2cc }))
    for (const [latitude, longitude] of [[36, 139], [18, 74], [-23, 134]]) {
      const destination = toSurface(latitude, longitude)
      const routePoints = Array.from({ length: 49 }, (_, index) => {
        const t = index / 48
        return hub.clone().lerp(destination, t).normalize().multiplyScalar(1.44 + Math.sin(t * Math.PI) * 0.18)
      })
      const curve = new THREE.CatmullRomCurve3(routePoints)
      const line = new THREE.Line(track(new THREE.BufferGeometry().setFromPoints(routePoints)), routeMaterial)
      const pulse = new THREE.Mesh(pointGeometry, pointMaterial)
      const endpoint = new THREE.Mesh(pointGeometry, pointMaterial)
      endpoint.position.copy(destination)
      globe.add(line, pulse, endpoint)
      routes.push({ curve, pulse })
    }
    const hubDot = new THREE.Mesh(track(new THREE.SphereGeometry(0.03, 12, 10)), pointMaterial)
    hubDot.position.copy(hub)
    globe.add(hubDot)

    const atmosphere = new THREE.Mesh(track(new THREE.SphereGeometry(1.455, 48, 32)), track(new THREE.ShaderMaterial({
      vertexShader: `varying vec3 vNormal; varying vec3 vView; void main() { vec4 p = modelViewMatrix * vec4(position, 1.0); vNormal = normalMatrix * normal; vView = -p.xyz; gl_Position = projectionMatrix * p; }`,
      fragmentShader: `varying vec3 vNormal; varying vec3 vView; void main() { float glow = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 3.0); gl_FragColor = vec4(0.51, 0.86, 0.64, glow * 0.22); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })))
    stage.add(atmosphere)

    function makeOrbit(radius, rotation, color, opacity) {
      const group = new THREE.Group()
      group.rotation.set(...rotation)
      const ring = new THREE.Mesh(track(new THREE.TorusGeometry(radius, 0.004, 6, 144)), track(new THREE.MeshBasicMaterial({ color, transparent: true, opacity })))
      group.add(ring)
      stage.add(group)
      return group
    }
    const orbit = makeOrbit(1.94, [1.07, 0.25, -0.32], 0xc1d7c3, 0.5)
    makeOrbit(2.1, [0.48, 0.9, 0.5], 0x97b4a0, 0.17)
    const satellites = []
    const satelliteColors = [0xcce2c8, 0x91d89c, 0xc6d4b9]
    for (let index = 0; index < 3; index++) {
      const group = new THREE.Group()
      const material = track(new THREE.MeshStandardMaterial({ color: satelliteColors[index], roughness: 0.36, metalness: 0.32 }))
      const mesh = new THREE.Mesh(track(new THREE.SphereGeometry(0.072, 20, 16)), material)
      const halo = new THREE.Mesh(track(new THREE.TorusGeometry(0.14, 0.005, 6, 40)), track(new THREE.MeshBasicMaterial({ color: satelliteColors[index], transparent: true, opacity: 0.36 })))
      const light = new THREE.Mesh(track(new THREE.SphereGeometry(0.026, 12, 8)), track(new THREE.MeshBasicMaterial({ color: 0xb4f4bf })))
      light.position.z = 0.066
      group.add(mesh, halo, light)
      orbit.add(group)
      satellites.push(group)
    }

    const points = []
    for (let index = 0; index < 28; index++) {
      const phase = index * 2.39996
      const radius = 2.25 + (index % 7) * 0.1
      points.push(Math.cos(phase) * radius, Math.sin(phase) * radius, -1 - (index % 5) * 0.2)
    }
    const dustGeometry = track(new THREE.BufferGeometry())
    dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    scene.add(new THREE.Points(dustGeometry, track(new THREE.PointsMaterial({ color: 0xafd48d, size: 0.012, transparent: true, opacity: 0.23, sizeAttenuation: true }))))

    let failed = false
    let paused = false
    let inView = false
    let lastTime = 0
    let elapsed = 0
    let targetFps = 60
    const cursor = { x: 0, y: 0 }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)')

    function draw() {
      if (disposed || failed) return
      routes.forEach(({ curve, pulse }, index) => { pulse.position.copy(curve.getPoint((elapsed * 0.07 + index / 3) % 1)) })
      satellites.forEach((satellite, index) => {
        const angle = elapsed * 0.12 + index * Math.PI * 2 / 3
        satellite.position.set(Math.cos(angle) * 1.94, Math.sin(angle) * 1.94, 0)
        satellite.rotation.set(0.4, elapsed * 0.12 + index, 0.25)
      })
      renderer.render(scene, camera)
    }

    function animate(time) {
      frame = requestAnimationFrame(animate)
      if (time - lastTime < 1000 / targetFps - 0.5) return
      const delta = Math.min((time - lastTime) / 1000, 0.05)
      lastTime = time
      elapsed += delta
      globe.rotation.y = -3.35 + Math.sin(elapsed * 0.065) * 0.24
      const smoothing = 1 - Math.exp(-5 * delta)
      stage.rotation.y += (cursor.x * 0.15 - stage.rotation.y) * smoothing
      stage.rotation.x += (cursor.y * 0.09 - stage.rotation.x) * smoothing
      draw()
    }

    function syncAnimation() {
      cancelAnimationFrame(frame)
      frame = 0
      if (motion.matches || !pointer.matches || paused) {
        cursor.x = 0; cursor.y = 0
        stage.rotation.x = 0; stage.rotation.y = 0
      }
      if (!disposed && !failed && inView && !document.hidden && !paused && !motion.matches) {
        lastTime = performance.now()
        frame = requestAnimationFrame(animate)
      } else draw()
    }

    function resize() {
      if (disposed || failed) return
      const { width, height } = host.getBoundingClientRect()
      if (!width || !height) return
      targetFps = width < 480 ? 30 : 60
      const pixelRatio = Math.min(window.devicePixelRatio || 1, width < 480 ? 1.25 : 1.75)
      if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio)
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      draw()
    }
    function move(event) {
      if (motion.matches || paused || !pointer.matches || event.pointerType !== 'mouse') return
      const rect = host.getBoundingClientRect()
      cursor.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      cursor.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    }
    function resetPointer() { cursor.x = 0; cursor.y = 0 }
    function contextLost(event) {
      event.preventDefault()
      failed = true
      dispose()
      onFailure()
    }

    renderer.domElement.setAttribute('aria-hidden', 'true')
    listen(renderer.domElement, 'webglcontextlost', contextLost)
    host.appendChild(renderer.domElement)
    const resizeObserver = new ResizeObserver(resize)
    cleanups.push(() => resizeObserver.disconnect())
    resizeObserver.observe(host)
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncAnimation() })
    cleanups.push(() => observer.disconnect())
    observer.observe(host)
    listen(host, 'pointermove', move)
    listen(host, 'pointerleave', resetPointer)
    listen(document, 'visibilitychange', syncAnimation)
    listen(motion, 'change', syncAnimation)
    listen(pointer, 'change', syncAnimation)
    resize()

    return {
      setPaused(value) { paused = value; syncAnimation() },
      dispose,
    }
  } catch (error) {
    dispose()
    throw error
  }
}
