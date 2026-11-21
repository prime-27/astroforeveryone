// 3D Solar System engine: the Sun, planets and dwarf planets on circular orbits, the asteroid and Kuiper belts.
// Rebuilt from Dr Ravi Raja Pothineni's original tool on the site's own three.js.
// createSolarSystem(el, { onSelect }) returns { select, setSpeed, setRunning, setLabels, dispose }.
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { BODIES } from '../tools/solar-system/data.js'

const ring = (count, rMin, rSpread, thick, color, size) => {
  const p = []
  for (let i = 0; i < count; i++) {
    const r = rMin + Math.random() * rSpread
    const t = Math.random() * Math.PI * 2
    p.push(r * Math.cos(t), (Math.random() - 0.5) * thick, r * Math.sin(t))
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3))
  return new THREE.Points(g, new THREE.PointsMaterial({ color, size }))
}

export function createSolarSystem(el, { onSelect, label } = {}) {
  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x07142b, 0.004)

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 3000)
  camera.position.set(0, 50, 75)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x07142b)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  el.appendChild(renderer.domElement)

  const labels = new CSS2DRenderer()
  labels.domElement.className = 'ss-labels'
  el.appendChild(labels.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 3
  controls.maxDistance = 400

  scene.add(new THREE.AmbientLight(0xffffff, 0.9))
  scene.add(new THREE.PointLight(0xffffff, 4, 0, 0))

  const sun = new THREE.Mesh(new THREE.SphereGeometry(2.4, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffc94a, toneMapped: false }))
  sun.add(new THREE.Mesh(new THREE.SphereGeometry(3.5, 24, 24), new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.3, toneMapped: false })))
  sun.userData.id = 'sun'
  scene.add(sun)

  // background stars on a shell, then the two belts
  const stars = []
  for (let i = 0; i < 2000; i++) {
    const u = Math.random() * Math.PI * 2
    const v = Math.acos(Math.random() * 2 - 1)
    const r = 240 + Math.random() * 120
    stars.push(r * Math.sin(v) * Math.cos(u), r * Math.sin(v) * Math.sin(u), r * Math.cos(v))
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3))
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xa9b6cc, size: 0.8, transparent: true, opacity: 0.85, fog: false })))
  scene.add(ring(700, 20, 3.5, 1.2, 0x8d6e63, 0.35))
  scene.add(ring(1100, 55, 22, 4, 0x475569, 0.4))

  const clickable = [sun]
  const bodies = {}
  const tags = []
  const addLabel = (obj, id, text, dwarf) => {
    const div = document.createElement('div')
    div.className = `ss-label${dwarf ? ' dwarf' : ''}`
    div.textContent = text
    const tag = new CSS2DObject(div)
    tag.center.set(0.5, 1.4)
    obj.add(tag)
    tags.push(tag)
  }
  addLabel(sun, 'sun', label?.('sun') ?? 'Sun')

  BODIES.forEach((b) => {
    const pts = []
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(b.a * Math.cos(a), 0, b.a * Math.sin(a)))
    }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: b.dwarf ? 0x6b3fa0 : 0x3a5a8c, transparent: true, opacity: 0.55 })))

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(b.size, 24, 24), new THREE.MeshStandardMaterial({ color: b.col, roughness: 0.5 }))
    mesh.userData.id = b.id
    if (b.rings) {
      const r = new THREE.Mesh(new THREE.RingGeometry(b.size * 1.4, b.size * 2.3, 48),
        new THREE.MeshBasicMaterial({ color: 0xcdb284, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }))
      r.rotation.x = Math.PI / 2 + 0.35
      mesh.add(r)
    }
    // a larger invisible sphere so small worlds are easy to tap
    const hit = new THREE.Mesh(new THREE.SphereGeometry(Math.max(b.size * 2.5, 1.2), 8, 8), new THREE.MeshBasicMaterial({ visible: false }))
    mesh.add(hit)
    scene.add(mesh)
    clickable.push(mesh)
    addLabel(mesh, b.id, label?.(b.id) ?? b.id, b.dwarf)
    bodies[b.id] = { cfg: b, mesh }
  })

  let target = 'earth'
  let days = 0
  let speed = 30
  let running = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let frame = 0
  let last = 0
  let visible = true
  let zoomTo = 0 // camera distance to ease towards after picking a world; 0 = leave the camera alone
  controls.addEventListener('start', () => { zoomTo = 0 })

  const place = () => {
    for (const { cfg, mesh } of Object.values(bodies)) {
      const a = ((days / cfg.period) * Math.PI * 2) % (Math.PI * 2)
      mesh.position.set(cfg.a * Math.cos(a), 0, cfg.a * Math.sin(a))
    }
  }

  // keep the camera's offset while following the selected world
  const follow = () => {
    const pos = target === 'sun' ? sun.position : bodies[target]?.mesh.position
    if (!pos) return
    const delta = pos.clone().sub(controls.target)
    controls.target.add(delta)
    camera.position.add(delta)
  }

  const resize = () => {
    const w = el.clientWidth
    const h = el.clientHeight
    if (!w || !h) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    labels.setSize(w, h)
  }

  const render = () => {
    controls.update()
    renderer.render(scene, camera)
    labels.render(scene, camera)
  }

  const loop = (now) => {
    frame = requestAnimationFrame(loop)
    const dt = Math.min(0.1, (now - (last || now)) / 1000)
    last = now
    if (running) {
      days += dt * speed
      place()
      follow()
    }
    if (zoomTo) {
      const off = camera.position.clone().sub(controls.target)
      const d = off.length()
      if (Math.abs(d - zoomTo) < 0.05) zoomTo = 0
      else camera.position.copy(controls.target).add(off.setLength(d + (zoomTo - d) * Math.min(1, dt * 4)))
    }
    render()
  }

  const start = () => { if (!frame && visible && !document.hidden) { last = 0; frame = requestAnimationFrame(loop) } }
  const stop = () => { cancelAnimationFrame(frame); frame = 0 }

  // only draw while the tool is on screen and the tab is visible
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop() })
  io.observe(el)
  const onVisibility = () => (document.hidden ? stop() : start())
  document.addEventListener('visibilitychange', onVisibility)

  const ro = new ResizeObserver(() => { resize(); if (!frame) render() })
  ro.observe(el)

  // a click picks a world; a drag only turns the camera
  const ray = new THREE.Raycaster()
  const ptr = new THREE.Vector2()
  let down = null
  const onDown = (e) => { down = [e.clientX, e.clientY] }
  const onUp = (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return
    const r = renderer.domElement.getBoundingClientRect()
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(ptr, camera)
    let o = ray.intersectObjects(clickable, true)[0]?.object
    while (o && !o.userData.id) o = o.parent
    if (o) api.select(o.userData.id)
  }
  renderer.domElement.addEventListener('pointerdown', onDown)
  renderer.domElement.addEventListener('pointerup', onUp)

  const api = {
    select(id, { zoom = true } = {}) {
      target = id
      follow()
      if (zoom) {
        const size = id === 'sun' ? 3.5 : bodies[id]?.cfg.size || 1
        zoomTo = Math.max(size * 24, 10)
        if (!frame) {
          camera.position.copy(controls.target).add(camera.position.clone().sub(controls.target).setLength(zoomTo))
          zoomTo = 0
        }
      }
      onSelect?.(id)
      if (!frame) render()
    },
    setSpeed(v) { speed = v },
    setRunning(v) { running = v },
    setLabels(on) { tags.forEach((t) => (t.visible = on)) },
    dispose() {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      renderer.domElement.removeEventListener('pointerdown', onDown)
      renderer.domElement.removeEventListener('pointerup', onUp)
      controls.dispose()
      scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.() })
      renderer.dispose()
      el.replaceChildren()
    },
  }

  place()
  resize()
  // start a little way along so the planets are spread out, then frame Earth
  days = 2600
  place()
  api.select('earth', { zoom: false })
  start()
  return { ...api, running: () => running }
}
