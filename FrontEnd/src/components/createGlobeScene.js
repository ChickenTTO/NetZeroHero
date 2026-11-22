import * as THREE from 'three'

// An original, stylized world texture. No external image requests are needed.
function createWorldTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas texture rendering is unavailable')
  context.fillStyle = '#173d34'
  context.fillRect(0, 0, 2048, 1024)
  const continents = [
    [[-168, 66], [-146, 71], [-125, 70], [-110, 75], [-78, 71], [-55, 54], [-66, 46], [-80, 26], [-88, 19], [-99, 17], [-110, 30], [-121, 40], [-129, 52], [-153, 57]],
    [[-81, 12], [-65, 10], [-48, -1], [-36, -8], [-44, -23], [-54, -36], [-68, -55], [-75, -43], [-77, -18]],
    [[-54, 59], [-42, 61], [-23, 75], [-30, 83], [-49, 82], [-64, 72]],
    [[-17, 36], [3, 37], [15, 33], [32, 31], [43, 12], [51, 10], [42, -2], [36, -20], [20, -35], [11, -28], [9, -7], [-4, 5], [-16, 13]],
    [[-10, 36], [-9, 44], [4, 49], [7, 58], [20, 70], [35, 68], [44, 57], [60, 68], [96, 77], [133, 69], [177, 65], [161, 54], [142, 49], [134, 35], [122, 25], [112, 20], [108, 7], [100, 2], [96, 20], [81, 8], [71, 24], [56, 25], [48, 15], [42, 13], [35, 30], [25, 39], [16, 40], [10, 36]],
    [[113, -22], [131, -12], [143, -14], [153, -28], [145, -39], [131, -34], [114, -35]],
    [[47, -13], [51, -16], [48, -25], [44, -24]],
    [[129, 33], [135, 34], [141, 44], [146, 45], [141, 34], [132, 30]],
    [[96, 5], [105, -3], [114, -7], [130, -4], [141, -7], [132, -10], [112, -9], [102, -5]],
    [[166, -34], [179, -39], [174, -47], [167, -46]],
  ]
  continents.forEach((points) => {
    context.beginPath()
    points.forEach(([longitude, latitude], index) => {
      const x = (longitude + 180) / 360 * canvas.width
      const y = (90 - latitude) / 180 * canvas.height
      if (index === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    })
    context.closePath()
    context.fillStyle = '#b2d98b'
    context.fill()
    context.strokeStyle = '#d3edb5'
    context.lineWidth = 2
    context.stroke()
  })
  context.strokeStyle = '#d8f6cb22'
  context.lineWidth = 1
  for (let x = 0; x < 2048; x += 2048 / 24) {
    context.beginPath(); context.moveTo(x, 0); context.lineTo(x, 1024); context.stroke()
  }
  for (let y = 0; y < 1024; y += 1024 / 12) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(2048, y); context.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createGlobeScene(host, { onFailure }) {
  let renderer = null
  let disposed = false
  let frame = 0
  const resources = new Set()
  const cleanups = []

  function track(resource) {
    resources.add(resource)
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
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setClearColor(0x000000, 0)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40)
    camera.position.set(0, 0.15, 7.8)
    camera.lookAt(0, 0, 0)
    const stage = new THREE.Group()
    stage.rotation.z = -0.12
    scene.add(stage)

    scene.add(new THREE.AmbientLight(0xc3e5b1, 1.5))
    const keyLight = new THREE.DirectionalLight(0xedffda, 3.2)
    keyLight.position.set(-3, 4, 5)
    scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0x68ef3f, 1.8)
    rimLight.position.set(4, 0, -3)
    scene.add(rimLight)

    const globe = new THREE.Mesh(
      track(new THREE.SphereGeometry(1.42, 64, 48)),
      track(new THREE.MeshStandardMaterial({ map: track(createWorldTexture()), roughness: 0.7, metalness: 0.12 })),
    )
    globe.rotation.y = -1.65
    stage.add(globe)

    const atmosphere = new THREE.Mesh(track(new THREE.SphereGeometry(1.47, 48, 32)), track(new THREE.ShaderMaterial({
      vertexShader: `varying vec3 vNormal; varying vec3 vView; void main() { vec4 p = modelViewMatrix * vec4(position, 1.0); vNormal = normalMatrix * normal; vView = -p.xyz; gl_Position = projectionMatrix * p; }`,
      fragmentShader: `varying vec3 vNormal; varying vec3 vView; void main() { float glow = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 3.0); gl_FragColor = vec4(0.45, 0.95, 0.28, glow * 0.4); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })))
    stage.add(atmosphere)

    function makeOrbit(radius, rotation, color, opacity) {
      const group = new THREE.Group()
      group.rotation.set(...rotation)
      const ring = new THREE.Mesh(track(new THREE.TorusGeometry(radius, 0.008, 8, 160)), track(new THREE.MeshBasicMaterial({ color, transparent: true, opacity })))
      group.add(ring)
      stage.add(group)
      return group
    }
    const orbit = makeOrbit(1.94, [1.05, 0.2, -0.35], 0x9cdd77, 0.65)
    makeOrbit(2.12, [0.5, 0.9, 0.5], 0x7ca66b, 0.22)
    const satellites = []
    const satelliteColors = [0xc5e4a0, 0x68ef3f, 0xd8d898]
    for (let index = 0; index < 3; index++) {
      const group = new THREE.Group()
      const material = track(new THREE.MeshStandardMaterial({ color: satelliteColors[index], roughness: 0.36, metalness: 0.32 }))
      const mesh = new THREE.Mesh(index === 1 ? track(new THREE.OctahedronGeometry(0.12)) : track(new THREE.BoxGeometry(0.18, 0.18, 0.18)), material)
      const halo = new THREE.Mesh(track(new THREE.TorusGeometry(0.18, 0.006, 6, 40)), track(new THREE.MeshBasicMaterial({ color: satelliteColors[index], transparent: true, opacity: 0.55 })))
      group.add(mesh, halo)
      orbit.add(group)
      satellites.push(group)
    }

    const points = []
    for (let index = 0; index < 45; index++) {
      const phase = index * 2.39996
      const radius = 2.25 + (index % 7) * 0.1
      points.push(Math.cos(phase) * radius, Math.sin(phase) * radius, -1 - (index % 5) * 0.2)
    }
    const dustGeometry = track(new THREE.BufferGeometry())
    dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    scene.add(new THREE.Points(dustGeometry, track(new THREE.PointsMaterial({ color: 0xafd48d, size: 0.017, transparent: true, opacity: 0.5, sizeAttenuation: true }))))

    let failed = false
    let paused = false
    let inView = false
    let lastTime = 0
    let elapsed = 0
    const cursor = { x: 0, y: 0 }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)')

    function draw() {
      if (disposed || failed) return
      satellites.forEach((satellite, index) => {
        const angle = elapsed * 0.18 + index * Math.PI * 2 / 3
        satellite.position.set(Math.cos(angle) * 1.94, Math.sin(angle) * 1.94, 0)
        satellite.rotation.set(elapsed * 0.15, elapsed * 0.25 + index, 0.4)
      })
      renderer.render(scene, camera)
    }

    function animate(time) {
      frame = requestAnimationFrame(animate)
      if (time - lastTime < 1000 / 30) return
      const delta = Math.min((time - lastTime) / 1000, 0.05)
      lastTime = time
      elapsed += delta
      globe.rotation.y += delta * 0.065
      stage.rotation.y += (cursor.x * 0.22 - stage.rotation.y) * 0.075
      stage.rotation.x += (cursor.y * 0.12 - stage.rotation.x) * 0.075
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
      cancelAnimationFrame(frame)
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
