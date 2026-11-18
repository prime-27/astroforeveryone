// Size each embedded tool frame to its content (same origin). Tools that fill the viewport (vh units) or have
// a zero-height body report scrollHeight == frame height / ~0: those keep their original aspect ratio.
export function fitToolFrames(root) {
  const observers = []
  const frames = root.querySelectorAll('iframe[src^="/tools/"]')
  const handlers = []
  frames.forEach((f) => {
    const fit = () => {
      const b = f.contentDocument && f.contentDocument.body
      if (!b) return
      const sh = b.scrollHeight
      if (sh < 50 || Math.abs(sh - f.clientHeight) <= 4) return
      const h = Math.min(sh + 16, 4000)
      if (Math.abs(f.offsetHeight - h) > 8) {
        f.style.aspectRatio = 'auto'
        f.style.minHeight = '0'
        f.style.height = h + 'px'
      }
    }
    const start = () => {
      const b = f.contentDocument && f.contentDocument.body
      if (!b) return
      fit()
      const ro = new ResizeObserver(fit)
      ro.observe(b)
      observers.push(ro)
    }
    f.addEventListener('load', start)
    handlers.push([f, start])
    if (f.contentDocument?.readyState === 'complete' && f.contentDocument.body?.childElementCount) start()
  })
  return () => {
    observers.forEach((o) => o.disconnect())
    handlers.forEach(([f, h]) => f.removeEventListener('load', h))
  }
}
