import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { STOPS } from '../journey/stops.js'
import { createJourney } from '../engine/journey.js'

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

export default function Journey() {
  const canvasRef = useRef(null)
  const stepRefs = useRef([])
  const [active, setActive] = useState(0)

  // 2.4 = 40% of the way from stop 2 to stop 3. Each scene holds while you read, then hands over.
  const getProgress = useCallback(() => {
    const anchor = window.innerHeight * 0.5
    let p = 0
    stepRefs.current.forEach((el, i) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.top <= anchor) p = i + smooth(0.55, 1, (anchor - r.top) / r.height)
    })
    return p
  }, [])

  useEffect(() => {
    document.title = 'Journey to the edge · ASTRO – Astronomy for Everyone'
    window.scrollTo(0, 0)
    const stop = createJourney(canvasRef.current, STOPS.map((s) => s.scene), getProgress)
    const onScroll = () => setActive(Math.min(STOPS.length - 1, Math.round(getProgress())))
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { stop(); window.removeEventListener('scroll', onScroll) }
  }, [getProgress])

  const s = STOPS[active]
  return (
    <div className="journey">
      <div className="journey-stage">
        <canvas ref={canvasRef} aria-hidden="true" />
        <dl className="journey-hud" aria-live="polite">
          <div><dt>Distance</dt><dd>{s.distance}</dd></div>
          <div><dt>Light travel time</dt><dd>{s.light}</dd></div>
        </dl>
        <ol className="journey-dots" aria-hidden="true">
          {STOPS.map((x, i) => <li key={x.scene} className={i === active ? 'on' : i < active ? 'past' : ''} />)}
        </ol>
      </div>

      <div className="journey-steps">
        {STOPS.map((stop, i) => (
          <section key={stop.scene} className="journey-step" ref={(el) => (stepRefs.current[i] = el)}>
            <div className="journey-card">
              <p className="eyebrow">{stop.kicker}</p>
              {i === 0 ? <h1>{stop.title}</h1> : <h2>{stop.title}</h2>}
              {i > 0 && <p className="card-distance">{stop.distance} · light takes {stop.light}</p>}
              {stop.facts.map((f) => <p key={f}>{f}</p>)}
              <p className="see"><strong>See it:</strong> {stop.see.how}<br /><strong>Best:</strong> {stop.see.best}</p>
              {i === STOPS.length - 1 && (
                <p className="journey-end">
                  Want to see the first six stops with your own eyes? <Link to="/events">Join an ASTRO observing session</Link>.
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
