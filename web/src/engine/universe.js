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

// faint disc stars in rings; each ring gets its own angular speed (inner faster), set in userData.omega
function diffuseRings(texture, { count = 14000, radius = 6.5, rings = 8 } = {}) {
  const out = []
  for (let k = 0; k < rings; k++) {
    const r0 = (k / rings) * radius, r1 = ((k + 1) / rings) * radius
    const n = Math.round(count * ((r1 * r1 - r0 * r0) / (radius * radius)))
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    const c = new THREE.Color()
    for (let i = 0; i < n; i++) {
      const r = Math.sqrt(r0 * r0 + Math.random() * (r1 * r1 - r0 * r0)), a = Math.random() * Math.PI * 2
      pos.set([Math.cos(a) * r, (Math.random() - 0.5) * 0.12 * (1 + r * 0.1), Math.sin(a) * r], i * 3)
      c.copy(CORE).lerp(ARM, Math.min((r / radius) * 2, 1))
      col.set([c.r, c.g, c.b], i * 3)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.035, map: texture, vertexColors: true, transparent: true, opacity: 0.55,
      depthWrite: false, blending: THREE.AdditiveBlending,
    }))
    pts.userData.omega = 0.45 / ((r0 + r1) / 2 + 0.6)
    out.push(pts)
  }
  return out
}

export function createUniverse(container) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200)
  camera.position.set(0, 4.2, reduced ? 8.5 : 26) // far away: the fly-in starts here
  const texture = dotTexture()
  const tilt = new THREE.Group() // everything in the galaxy shares one tilt; local y is the disc's axis
  tilt.rotation.x = 0.35
  const disc = galaxy({}, texture)
  const rings = diffuseRings(texture)
  const core = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture, color: 0xffb59e, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }))
  core.scale.setScalar(2.4)
  tilt.add(disc, core, ...rings)
  scene.add(tilt, fieldStars(1500, texture))

  const pointer = { x: 0, y: 0 }
  const onPointer = (e) => {
    const r = container.getBoundingClientRect()
    pointer.x = (e.clientX - r.left) / r.width - 0.5
    pointer.y = (e.clientY - r.top) / r.height - 0.5
  }
  let distance = 8.5 // camera distance once the fly-in ends
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // pull back on narrow screens so the whole disc fits
    distance = w < 640 ? 12 : 8.5
    if (reduced) camera.position.z = distance
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
  }
  const ro = new ResizeObserver(resize)
  ro.observe(container)
  resize()

  let raf = 0
  let last = 0
  let age = 0 // seconds of animation, drives the fly-in
  const frame = (t) => {
    const dt = Math.min(t - (last || t), 50) / 1000
    last = t
    age += dt
    // fly-in: the camera swoops from far away while the galaxy spins down to its cruising speed
    const intro = 1 - Math.pow(1 - Math.min(age / 3.5, 1), 3)
    const spin = 0.16 + 1.4 * (1 - intro)
    disc.rotation.y += dt * spin // spiral arms: a density wave that turns as one pattern
    // disc stars orbit at roughly constant speed, so inner rings turn faster (a flat rotation curve)
    for (const ring of rings) ring.rotation.y += dt * (ring.userData.omega + spin - 0.16)
    core.material.opacity = 0.75 + 0.25 * Math.sin(age * 1.6)
    core.scale.setScalar(2.2 + 0.25 * Math.sin(age * 1.6))
    // slow drift around the galaxy, plus a lean toward the pointer
    const drift = age * 0.05
    const tx = Math.sin(drift) * 1.6 + pointer.x * 2
    const ty = 4.2 + Math.sin(drift * 0.7) * 0.6 - pointer.y * 2
    camera.position.x += (tx - camera.position.x) * 0.03
    camera.position.y += (ty - camera.position.y) * 0.03
    camera.position.z = distance + (26 - distance) * (1 - intro)
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
