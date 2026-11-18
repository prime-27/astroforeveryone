// Particle engine: a layered starfield on a 2D canvas.
// Three depth layers drift with scroll and pointer (parallax), stars twinkle, and a shooting star
// crosses now and then. Pauses while the tab is hidden; draws one still frame for reduced motion.

const LAYERS = [
  { share: 0.6, size: [0.4, 1.0], speed: 0.02, parallax: 0.04 },
  { share: 0.3, size: [0.8, 1.6], speed: 0.05, parallax: 0.1 },
  { share: 0.1, size: [1.4, 2.4], speed: 0.1, parallax: 0.2 },
]
// star tints: mostly white, some orbit blue, a few warm (brand coral, softened)
const TINTS = ['255,255,255', '255,255,255', '255,255,255', '200,225,245', '117,181,221', '255,190,170']

const rand = (a, b) => a + Math.random() * (b - a)

export class ParticleEngine {
  constructor(canvas, { density = 0.00018 } = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.density = density
    this.stars = []
    this.meteors = []
    this.pointer = { x: 0, y: 0 }
    this.scroll = 0
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.raf = 0
    this.last = 0
    this.nextMeteor = rand(3000, 8000)

    this.onResize = () => this.resize()
    this.onScroll = () => { this.scroll = window.scrollY; if (this.reduced) this.draw(0) }
    this.onPointer = (e) => {
      this.pointer.x = e.clientX / window.innerWidth - 0.5
      this.pointer.y = e.clientY / window.innerHeight - 0.5
      // constellation lines follow a mouse only; touch has no hover
      this.cursor = e.pointerType === 'mouse' ? { x: e.clientX, y: e.clientY } : null
    }
    this.onLeave = () => { this.cursor = null }
    this.onVisibility = () => (document.hidden ? this.stop() : this.start())
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.w = window.innerWidth
    this.h = window.innerHeight
    this.canvas.width = this.w * dpr
    this.canvas.height = this.h * dpr
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const total = Math.round(this.w * this.h * this.density) + 60
    this.stars = []
    LAYERS.forEach((layer, li) => {
      for (let i = 0; i < total * layer.share; i++) {
        this.stars.push({
          x: Math.random() * this.w,
          y: Math.random() * this.h,
          r: rand(...layer.size),
          layer: li,
          tint: TINTS[(Math.random() * TINTS.length) | 0],
          phase: Math.random() * Math.PI * 2,
          twinkle: rand(0.6, 2.2),
        })
      }
    })
    this.draw(this.last)
  }

  spawnMeteor() {
    const fromLeft = Math.random() < 0.5
    this.meteors.push({
      x: fromLeft ? rand(0, this.w * 0.5) : rand(this.w * 0.5, this.w),
      y: rand(0, this.h * 0.4),
      vx: (fromLeft ? 1 : -1) * rand(0.6, 0.9),
      vy: rand(0.25, 0.4),
      life: 0,
      ttl: rand(700, 1100),
    })
  }

  draw(t, dt = 16) {
    const { ctx, w, h } = this
    ctx.clearRect(0, 0, w, h)
    for (const s of this.stars) {
      const L = LAYERS[s.layer]
      // drift slowly sideways; wrap around the edges
      if (!this.reduced) s.x = (s.x + L.speed * dt * 0.06) % w
      const px = s.x - this.pointer.x * L.parallax * 60
      const py = (((s.y - this.scroll * L.parallax) % h) + h) % h - this.pointer.y * L.parallax * 60
      const a = this.reduced ? 0.8 : 0.55 + 0.45 * Math.sin(t * 0.001 * s.twinkle + s.phase)
      ctx.fillStyle = `rgba(${s.tint},${a.toFixed(3)})`
      ctx.beginPath()
      ctx.arc(px, py, s.r, 0, Math.PI * 2)
      ctx.fill()
      s.px = px
      s.py = py
    }
    if (this.cursor) this.drawConstellation(this.cursor)
    for (const m of this.meteors) {
      const p = m.life / m.ttl
      const x = m.x + m.vx * m.life, y = m.y + m.vy * m.life
      const len = 120 * (1 - Math.abs(p - 0.5) * 2) + 20
      const g = ctx.createLinearGradient(x, y, x - m.vx * len, y - m.vy * len)
      g.addColorStop(0, 'rgba(255,255,255,0.9)')
      g.addColorStop(1, 'rgba(117,181,221,0)')
      ctx.strokeStyle = g
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - m.vx * len, y - m.vy * len)
      ctx.stroke()
    }
  }

  // join the brighter stars near the pointer into a constellation: each to its nearest neighbour
  drawConstellation({ x, y }, radius = 160, max = 10) {
    const near = this.stars
      .filter((s) => s.layer > 0 && Math.hypot(s.px - x, s.py - y) < radius)
      .sort((a, b) => Math.hypot(a.px - x, a.py - y) - Math.hypot(b.px - x, b.py - y))
      .slice(0, max)
    const { ctx } = this
    ctx.lineWidth = 0.8
    for (const s of near) {
      let best = null, bd = Infinity
      for (const o of near) {
        const d = o === s ? Infinity : Math.hypot(o.px - s.px, o.py - s.py)
        if (d < bd) { bd = d; best = o }
      }
      if (!best) continue
      const fade = 1 - Math.hypot(s.px - x, s.py - y) / radius
      ctx.strokeStyle = `rgba(117,181,221,${(0.55 * fade).toFixed(3)})`
      ctx.beginPath()
      ctx.moveTo(s.px, s.py)
      ctx.lineTo(best.px, best.py)
      ctx.stroke()
    }
  }

  frame = (t) => {
    const dt = Math.min(t - (this.last || t), 50)
    this.last = t
    this.nextMeteor -= dt
    if (this.nextMeteor <= 0) { this.spawnMeteor(); this.nextMeteor = rand(4000, 11000) }
    this.meteors.forEach((m) => (m.life += dt))
    this.meteors = this.meteors.filter((m) => m.life < m.ttl)
    this.draw(t, dt)
    this.raf = requestAnimationFrame(this.frame)
  }

  start() {
    if (this.reduced || this.raf) return
    this.last = 0
    this.raf = requestAnimationFrame(this.frame)
  }

  stop() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
  }

  mount() {
    this.resize()
    window.addEventListener('resize', this.onResize)
    window.addEventListener('scroll', this.onScroll, { passive: true })
    window.addEventListener('pointermove', this.onPointer, { passive: true })
    document.documentElement.addEventListener('mouseleave', this.onLeave)
    document.addEventListener('visibilitychange', this.onVisibility)
    this.start()
    return () => {
      this.stop()
      window.removeEventListener('resize', this.onResize)
      window.removeEventListener('scroll', this.onScroll)
      window.removeEventListener('pointermove', this.onPointer)
      document.documentElement.removeEventListener('mouseleave', this.onLeave)
      document.removeEventListener('visibilitychange', this.onVisibility)
    }
  }
}
