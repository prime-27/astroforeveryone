// Universe engine: a three.js spiral galaxy with a warm core, blue arms, dust and a halo of field stars.
// The camera eases toward the pointer; the galaxy turns slowly. One still frame for reduced motion.
import * as THREE from 'three'

const CORE = new THREE.Color('#f96c53') // comet coral
const ARM = new THREE.Color('#75b5dd') // orbit blue
const EDGE = new THREE.Color('#2b4f8f')

function dotTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.35, 'rgba(255,255,255,0.6)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

function galaxy({ count = 40000, radius = 6, arms = 4, spin = 1.1, spread = 0.35 } = {}, texture) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const c = new THREE.Color()
  for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 1.6) * radius // denser toward the core
    const arm = ((i % arms) / arms) * Math.PI * 2
    const angle = arm + r * spin
    const jitter = () => Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * spread * (r + 0.4)
    pos[i * 3] = Math.cos(angle) * r + jitter()
    pos[i * 3 + 1] = jitter() * 0.35 // thin disc
    pos[i * 3 + 2] = Math.sin(angle) * r + jitter()
    const t = r / radius
    c.copy(CORE).lerp(ARM, Math.min(t * 1.8, 1)).lerp(EDGE, Math.max(t - 0.6, 0) * 2)
    col.set([c.r, c.g, c.b], i * 3)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  const mat = new THREE.PointsMaterial({
    size: 0.05, map: texture, vertexColors: true, transparent: true,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  })
  return new THREE.Points(geo, mat)
}

function fieldStars(count, texture) {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(30 + Math.random() * 40)
    pos.set([v.x, v.y, v.z], i * 3)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.25, map: texture, color: 0xffffff, transparent: true, depthWrite: false, opacity: 0.8,
  }))
}

export function createUniverse(container) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200)
  camera.position.set(0, 4.2, 8.5)
  const texture = dotTexture()
  const disc = galaxy({}, texture)
  disc.rotation.x = 0.35
  scene.add(disc, fieldStars(1500, texture))

  const pointer = { x: 0, y: 0 }
  const onPointer = (e) => {
    const r = container.getBoundingClientRect()
    pointer.x = (e.clientX - r.left) / r.width - 0.5
    pointer.y = (e.clientY - r.top) / r.height - 0.5
  }
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // pull back on narrow screens so the whole disc fits
    camera.position.z = w < 640 ? 12 : 8.5
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
  }
  const ro = new ResizeObserver(resize)
  ro.observe(container)
  resize()

  let raf = 0
  let last = 0
  const frame = (t) => {
    const dt = Math.min(t - (last || t), 50) / 1000
    last = t
    disc.rotation.y += dt * 0.06
    camera.position.x += (pointer.x * 2 - camera.position.x) * 0.03
    camera.position.y += (4.2 - pointer.y * 2 - camera.position.y) * 0.03
    camera.lookAt(0, 0, 0)
    renderer.render(scene, camera)
    raf = requestAnimationFrame(frame)
  }
  const start = () => { if (!reduced && !raf) { last = 0; raf = requestAnimationFrame(frame) } }
  const stop = () => { cancelAnimationFrame(raf); raf = 0 }
  const onVisibility = () => (document.hidden ? stop() : start())
  // only animate while the hero is on screen
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()))
  io.observe(container)
  window.addEventListener('pointermove', onPointer, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)

  return () => {
    stop()
    io.disconnect()
    ro.disconnect()
    window.removeEventListener('pointermove', onPointer)
    document.removeEventListener('visibilitychange', onVisibility)
    scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose() })
    texture.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}
