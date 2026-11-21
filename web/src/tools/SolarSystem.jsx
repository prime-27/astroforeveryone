import { useEffect, useRef, useState } from 'react'
import { createSolarSystem } from '../engine/solarSystem.js'
import { FACTS } from './solar-system/data.js'

const PLANETS = [['sun', 'Sun'], ['mercury', 'Mercury'], ['venus', 'Venus'], ['earth', 'Earth'], ['mars', 'Mars'], ['jupiter', 'Jupiter'], ['saturn', 'Saturn'], ['uranus', 'Uranus'], ['neptune', 'Neptune']]
const DWARFS = [['ceres', 'Ceres'], ['pluto', 'Pluto'], ['haumea', 'Haumea'], ['makemake', 'Makemake'], ['eris', 'Eris']]
const NAMES = Object.fromEntries([...PLANETS, ...DWARFS])

const ROWS = [
  ['Orbital characteristics', [['dist', 'Distance from the Sun'], ['period', 'Orbital period'], ['vel', 'Orbital speed'], ['inc', 'Inclination to the ecliptic']]],
  ['Physical properties', [['diam', 'Diameter'], ['mass', 'Mass'], ['grav', 'Surface gravity'], ['temp', 'Temperature'], ['atmo', 'Atmosphere / surface', true], ['moons', 'Moons', true]]],
]

export default function SolarSystem() {
  const ref = useRef(null)
  const sim = useRef(null)
  const [selected, setSelected] = useState('earth')
  const [showFacts, setShowFacts] = useState(true)
  const [running, setRunning] = useState(true)
  const [speed, setSpeed] = useState(30)
  const [labels, setLabels] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      sim.current = createSolarSystem(ref.current, {
        label: (id) => NAMES[id],
        onSelect: (id) => { setSelected(id); setShowFacts(true) },
      })
      setRunning(sim.current.running())
    } catch {
      setError(true) // no WebGL
    }
    return () => sim.current?.dispose()
  }, [])

  useEffect(() => { sim.current?.setRunning(running) }, [running])
  useEffect(() => { sim.current?.setSpeed(speed) }, [speed])
  useEffect(() => { sim.current?.setLabels(labels) }, [labels])

  const pick = (id) => sim.current?.select(id)
  const info = FACTS[selected]
  const body = (list, dwarf) => (
    <div className={`ss-bodies${dwarf ? ' dwarf' : ''}`}>
      {list.map(([id, name]) => (
        <button key={id} type="button" aria-pressed={selected === id} onClick={() => pick(id)}>{name}</button>
      ))}
    </div>
  )

  return (
    <div className="ss">
      <div className="ss-view" ref={ref} />
      {error && <p className="ss-error">This simulation needs WebGL, which your browser or device has turned off.</p>}

      <details className="ss-panel" open>
        <summary>Controls</summary>
        <div className="ss-row">
          <button type="button" className="button small" onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Play'}</button>
          <label className="ss-check"><input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} /> Names</label>
        </div>
        <label className="ss-range">
          <span>Speed <output>{speed} days per second</output></span>
          <input type="range" min="1" max="180" step="1" value={speed} onChange={(e) => setSpeed(+e.target.value)} />
        </label>
        <h3>Sun and planets</h3>
        {body(PLANETS)}
        <h3>Dwarf planets</h3>
        {body(DWARFS, true)}
        <p className="ss-hint">Drag to turn · scroll or pinch to zoom · tap a world for its fact sheet</p>
      </details>

      {showFacts && info && (
        <aside className="ss-facts" aria-live="polite">
          <header>
            <div>
              <h2>{info.name}</h2>
              <p className="eyebrow">{info.type}</p>
            </div>
            <button type="button" className="ss-close" aria-label="Close fact sheet" onClick={() => setShowFacts(false)}>✕</button>
          </header>
          {ROWS.map(([heading, rows]) => (
            <section key={heading}>
              <h3>{heading}</h3>
              <dl>
                {rows.map(([k, label, wide]) => (
                  <div key={k} className={wide ? 'wide' : ''}><dt>{label}</dt><dd>{info[k]}</dd></div>
                ))}
              </dl>
            </section>
          ))}
          <p className="ss-desc">{info.desc}</p>
        </aside>
      )}
      <p className="ss-credit">Designed by Dr Ravi Raja Pothineni · sizes and distances not to scale</p>
    </div>
  )
}
