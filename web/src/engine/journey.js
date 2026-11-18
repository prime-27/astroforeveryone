// Journey engine: draws each stop of the scroll journey on one canvas, procedurally (no image files).
// getProgress() returns a float: 2.4 means 40% of the way from stop 2 to stop 3. The leaving scene
// grows and fades (you fly past it) while the next one grows into place.
import { moonPath } from './moonPath.js'

// small seeded random generator, so every visit draws the same craters and nebula
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const gauss = (r) => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r())

function glow(ctx, x, y, r, color, alpha = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, color)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.globalAlpha = alpha
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

// pre-render particle-heavy scenes once per size onto an offscreen canvas
function sprite(size, draw) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  ctx.translate(size / 2, size / 2)
  draw(ctx, size / 2)
  return c
}

const SCENES = {
  hyderabad(ctx, R) {
    // night horizon over the city: a warm glow, low hills, and the Charminar in silhouette
    const w = R * 12, base = R * 1.15
    const g = ctx.createLinearGradient(0, base - R * 1.1, 0, base)
    g.addColorStop(0, 'rgba(249,108,83,0)')
    g.addColorStop(1, 'rgba(249,108,83,0.28)')
    ctx.fillStyle = g
    ctx.fillRect(-w, base - R * 1.1, w * 2, R * 1.1)
    ctx.fillStyle = '#040915'
    ctx.beginPath()
    ctx.moveTo(-w, base)
    for (let x = -w; x <= w; x += R * 0.15) ctx.lineTo(x, base - R * (0.1 + 0.06 * Math.sin(x / R * 2.3) + 0.04 * Math.sin(x / R * 5.1)))
    ctx.lineTo(w, R * 6)
    ctx.lineTo(-w, R * 6)
    ctx.fill()
    // Charminar, front view: square body with a great arch, two of its four minarets with balconies and domes
    const s = R * 0.011, y0 = base - R * 0.08
    ctx.fillStyle = '#0d1f42'
    const minaret = (x) => {
      ctx.fillRect(x - 4 * s, y0 - 100 * s, 8 * s, 100 * s)
      for (const y of [58, 78]) ctx.fillRect(x - 6 * s, y0 - y * s, 12 * s, 3 * s) // balconies
      ctx.beginPath(); ctx.arc(x, y0 - 100 * s, 5 * s, Math.PI, 0); ctx.fill()
      ctx.fillRect(x - 0.6 * s, y0 - 110 * s, 1.2 * s, 6 * s) // finial
    }
    ctx.fillRect(-30 * s, y0 - 52 * s, 60 * s, 52 * s)
    ctx.fillRect(-26 * s, y0 - 58 * s, 52 * s, 6 * s)
    minaret(-32 * s); minaret(32 * s)
    ctx.fillStyle = 'rgba(249,108,83,0.35)' // lit archway
    ctx.beginPath(); ctx.moveTo(-12 * s, y0); ctx.lineTo(-12 * s, y0 - 26 * s); ctx.arc(0, y0 - 26 * s, 12 * s, Math.PI, 0); ctx.lineTo(12 * s, y0); ctx.fill()
  },

  moon(ctx, R, t, d) {
    const g = ctx.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R)
    g.addColorStop(0, '#eceae4'); g.addColorStop(1, '#8f8c86')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill()
    ctx.save()
    ctx.clip()
    for (const m of d.maria) { ctx.fillStyle = 'rgba(70,72,78,0.32)'; ctx.beginPath(); ctx.ellipse(m.x * R, m.y * R, m.rx * R, m.ry * R, m.a, 0, Math.PI * 2); ctx.fill() }
    for (const c of d.craters) {
      ctx.strokeStyle = 'rgba(60,60,64,0.45)'; ctx.lineWidth = Math.max(1, c.r * R * 0.25)
      ctx.beginPath(); ctx.arc(c.x * R, c.y * R, c.r * R, 0, Math.PI * 2); ctx.stroke()
    }
    // night side: the dark part of a waxing gibbous Moon
    ctx.fillStyle = 'rgba(4,9,20,0.9)'
    ctx.fill(new Path2D(moonPath(295, R + 1)))
    ctx.restore()
  },

  jupiter(ctx, R, t) {
    const r = R * 0.75
    ctx.save()
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip()
    const bands = ['#e9dcc4', '#c49a6c', '#efe3cc', '#b07f55', '#e6d6bb', '#c8a27a', '#f0e6d2', '#a9764f', '#e2d1b4']
    const h = (2 * r) / bands.length
    bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(-r, -r + i * h, 2 * r, h + 1) })
    ctx.fillStyle = '#c5654a'
    ctx.beginPath(); ctx.ellipse(r * 0.3 + Math.sin(t * 0.0002) * r * 0.05, r * 0.38, r * 0.17, r * 0.09, 0, 0, Math.PI * 2); ctx.fill()
    const limb = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r)
    limb.addColorStop(0, 'rgba(0,0,0,0)'); limb.addColorStop(1, 'rgba(0,0,0,0.45)')
    ctx.fillStyle = limb; ctx.fillRect(-r, -r, 2 * r, 2 * r)
    ctx.restore()
    // the four Galilean moons, seen edge-on, sliding side to side
    const moons = [[1.25, 1.77], [1.6, 3.55], [2.05, 7.15], [2.6, 16.7]]
    moons.forEach(([dist, days], i) => {
      const a = t * 0.0006 / days + i * 1.9
      const x = Math.sin(a) * dist * r, front = Math.cos(a) > 0
      if (!front && Math.abs(x) < r) return
      ctx.fillStyle = '#f3efe4'
      ctx.beginPath(); ctx.arc(x, 0, Math.max(1.5, r * 0.035), 0, Math.PI * 2); ctx.fill()
    })
  },

  saturn(ctx, R) {
    const r = R * 0.5, tilt = -0.32
    const ring = (from, to) => {
      ctx.save(); ctx.rotate(tilt)
      const rings = [[1.25, 0.5, '#cbb48f'], [1.45, 0.75, '#e3d2b0'], [1.62, 0.15, '#05080f'], [1.7, 0.6, '#d8c39d'], [1.95, 0.55, '#c9b18a'], [2.15, 0.25, '#a8946f']]
      for (const [k, a, col] of rings) {
        ctx.strokeStyle = col; ctx.globalAlpha = a; ctx.lineWidth = r * 0.17
        ctx.beginPath(); ctx.ellipse(0, 0, r * k, r * k * 0.24, 0, from, to); ctx.stroke()
      }
      ctx.globalAlpha = 1; ctx.restore()
    }
    ring(Math.PI, Math.PI * 2) // far side of the rings, behind the planet
    ctx.save()
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip()
    ctx.rotate(tilt)
    const bands = ['#eadbb8', '#d9c294', '#efe2c4', '#cdb284', '#e6d4ae', '#d2b98c']
    const h = (2 * r) / bands.length
    bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(-r * 1.2, -r + i * h, 2.4 * r, h + 1) })
    ctx.rotate(-tilt)
    const limb = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.5, 0, 0, r)
    limb.addColorStop(0, 'rgba(0,0,0,0)'); limb.addColorStop(1, 'rgba(0,0,0,0.5)')
    ctx.fillStyle = limb; ctx.fillRect(-r, -r, 2 * r, 2 * r)
    ctx.restore()
    ring(0, Math.PI) // near side, in front of the planet
    ctx.fillStyle = '#e8c98f'
    ctx.beginPath(); ctx.arc(r * 2.9, -r * 0.7, Math.max(1.5, r * 0.04), 0, Math.PI * 2); ctx.fill() // Titan
  },

  pleiades(ctx, R, t, d) {
    ctx.drawImage(d.haze, -R * 1.6, -R * 1.6, R * 3.2, R * 3.2)
    // the bright members, roughly as they sit on the sky (north up)
    const stars = [['Alcyone', 0, 0, 1], ['Atlas', -0.95, 0.12, 0.8], ['Pleione', -0.98, -0.05, 0.45],
      ['Electra', 0.72, 0.32, 0.8], ['Maia', 0.52, -0.33, 0.75], ['Merope', 0.48, 0.62, 0.7],
      ['Taygeta', 0.82, -0.52, 0.65], ['Celaeno', 1.05, -0.2, 0.4], ['Asterope', 0.92, -0.8, 0.35]]
    ctx.font = `${Math.max(10, R * 0.07)}px "Open Sans", sans-serif`
    for (const [name, x, y, b] of stars) {
      const tw = 0.85 + 0.15 * Math.sin(t * 0.002 + x * 7)
      glow(ctx, x * R * 0.8, y * R * 0.8, R * 0.22 * b, 'rgba(170,205,255,0.55)', tw)
      glow(ctx, x * R * 0.8, y * R * 0.8, R * 0.05 * b, 'rgba(255,255,255,1)')
      if (R > 120) { ctx.fillStyle = 'rgba(169,182,204,0.85)'; ctx.fillText(name, x * R * 0.8 + R * 0.06, y * R * 0.8 + R * 0.1) }
    }
  },

  orion(ctx, R, t, d) {
    const s = 1 + 0.02 * Math.sin(t * 0.0008)
    ctx.drawImage(d.nebula, -R * 1.5 * s, -R * 1.5 * s, R * 3 * s, R * 3 * s)
    for (const [x, y] of [[-0.05, -0.04], [0.05, -0.05], [-0.03, 0.05], [0.07, 0.03]]) glow(ctx, x * R, y * R, R * 0.06, 'rgba(255,255,255,1)')
  },

  andromeda(ctx, R, t, d) {
    ctx.save(); ctx.rotate(-0.6 + t * 0.00001)
    ctx.drawImage(d.galaxy, -R * 1.7, -R * 1.7, R * 3.4, R * 3.4)
    ctx.restore()
    glow(ctx, R * 0.25, -R * 0.12, R * 0.08, 'rgba(255,236,210,0.8)') // M32
    glow(ctx, -R * 0.55, R * 0.45, R * 0.12, 'rgba(255,236,210,0.45)') // M110
  },

  edge(ctx, R, t, d) {
    ctx.drawImage(d.cmb, -R * 1.25, -R * 0.625, R * 2.5, R * 1.25)
    ctx.strokeStyle = 'rgba(117,181,221,0.6)'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.ellipse(0, 0, R * 1.25, R * 0.625, 0, 0, Math.PI * 2); ctx.stroke()
  },
}

function buildData(R) {
  const r = rng(27)
  const size = Math.max(256, Math.min(1400, Math.round(R * 3.4)))
  return {
    maria: Array.from({ length: 7 }, () => ({ x: r() * 1.2 - 0.6, y: r() * 1.2 - 0.7, rx: 0.12 + r() * 0.2, ry: 0.1 + r() * 0.15, a: r() * 3 })),
    craters: Array.from({ length: 40 }, () => ({ x: r() * 1.8 - 0.9, y: r() * 1.8 - 0.9, r: 0.015 + r() ** 3 * 0.09 })),
    haze: sprite(size, (ctx, h) => {
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < 260; i++) glow(ctx, gauss(r) * h * 0.3, gauss(r) * h * 0.25, h * (0.05 + r() * 0.12), 'rgba(90,130,220,0.08)')
    }),
    nebula: sprite(size, (ctx, h) => {
      ctx.globalCompositeOperation = 'lighter'
      const cols = ['rgba(255,111,145,0.10)', 'rgba(224,72,95,0.10)', 'rgba(95,208,200,0.07)', 'rgba(140,120,255,0.06)', 'rgba(255,200,160,0.08)']
      for (let i = 0; i < 900; i++) {
        const x = gauss(r) * h * 0.28, y = gauss(r) * h * 0.22 + Math.abs(x) * 0.25
        glow(ctx, x, y, h * (0.03 + r() * 0.12), cols[(r() * cols.length) | 0])
      }
      for (let i = 0; i < 300; i++) glow(ctx, (r() - 0.5) * h * 1.8, (r() - 0.5) * h * 1.8, h * 0.006, 'rgba(255,255,255,0.8)')
    }),
    galaxy: sprite(size, (ctx, h) => {
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < 5000; i++) {
        const rad = -Math.log(r() || 1e-9) * h * 0.18, a = r() * Math.PI * 2
        const x = Math.cos(a) * rad, y = Math.sin(a) * rad * 0.3
        if (Math.abs(x) > h * 0.98) continue
        const warm = Math.max(0, 1 - rad / (h * 0.35))
        ctx.fillStyle = `rgba(${200 + 55 * warm | 0},${200 + 30 * warm | 0},${255 - 60 * warm | 0},0.35)`
        ctx.fillRect(x, y, 1.5, 1.5)
      }
      glow(ctx, 0, 0, h * 0.22, 'rgba(255,236,210,0.55)')
      glow(ctx, 0, 0, h * 0.07, 'rgba(255,250,240,0.9)')
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = 'rgba(20,12,10,0.35)'; ctx.lineWidth = h * 0.02
      ctx.beginPath(); ctx.ellipse(0, h * 0.03, h * 0.5, h * 0.13, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke() // dust lane
    }),
    cmb: (() => {
      const c = document.createElement('canvas'); c.width = size; c.height = size / 2
      const ctx = c.getContext('2d')
      ctx.beginPath(); ctx.ellipse(size / 2, size / 4, size / 2, size / 4, 0, 0, Math.PI * 2); ctx.clip()
      // soft overlapping blobs, coloured like the Planck all-sky map (blue = slightly colder, red = slightly warmer)
      ctx.fillStyle = '#5b86c9'; ctx.fillRect(0, 0, size, size / 2)
      const cols = ['rgba(30,60,170,0.35)', 'rgba(70,140,220,0.3)', 'rgba(240,210,120,0.3)', 'rgba(232,116,59,0.32)', 'rgba(190,50,40,0.3)']
      for (let i = 0; i < 4000; i++) glow(ctx, r() * size, r() * size / 2, size * (0.008 + r() * 0.02), cols[(r() * cols.length) | 0])
      return c
    })(),
  }
}

export function createJourney(canvas, scenes, getProgress) {
  const ctx = canvas.getContext('2d')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let w = 0, h = 0, R = 0, cx = 0, cy = 0, wide = true, data = null, raf = 0, lastP = -1

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = canvas.clientWidth; h = canvas.clientHeight
    canvas.width = w * dpr; canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    // wide screens: the subject sits right of the text cards; phones: in the upper part, above the cards
    wide = w >= 900
    cx = wide ? w * 0.66 : w / 2
    cy = wide ? h * 0.52 : h * 0.42
    R = wide ? Math.min(w * 0.6, h) * 0.3 : Math.min(w, h * 0.6) * 0.34
    data = buildData(R)
    draw(performance.now())
  }

  function drawScene(i, alpha, scale, t) {
    const fn = SCENES[scenes[i]]
    if (!fn || alpha <= 0.01) return
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.translate(cx, cy)
    ctx.scale(scale, scale)
    fn(ctx, R, t, data)
    ctx.restore()
  }

  function draw(t) {
    const p = Math.max(0, Math.min(scenes.length - 1, getProgress()))
    const i = Math.floor(p), f = p - i
    ctx.clearRect(0, 0, w, h)
    // leaving scene flies past (grows, fades); next scene comes up from the distance
    drawScene(i, 1 - f, 1 + f * 1.5, t)
    if (i + 1 < scenes.length) drawScene(i + 1, f, 0.35 + f * 0.65, t)
    lastP = p
  }

  const frame = (t) => { draw(t); raf = requestAnimationFrame(frame) }
  // reduced motion: redraw only when the scroll position changes
  const onScroll = () => { if (reduced && getProgress() !== lastP) draw(0) }

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()
  if (!reduced) raf = requestAnimationFrame(frame)
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('scroll', onScroll) }
}
