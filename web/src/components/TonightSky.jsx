import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HYDERABAD, moonPath, skyReport } from '../engine/sky.js'

const time = (d, tz) => d ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: tz }) : '—'
const day = (d, tz) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: tz })
const cap = (s) => s[0].toUpperCase() + s.slice(1)

function MoonIcon({ angle }) {
  return (
    <svg className="moon-icon" viewBox="-52 -52 104 104" role="img" aria-label="Current Moon phase">
      <circle r="48" className="moon-dark" />
      <path d={moonPath(angle, 48)} className="moon-lit" />
    </svg>
  )
}

export default function TonightSky() {
  const [loc, setLoc] = useState(HYDERABAD)
  const [now, setNow] = useState(() => new Date())
  const [geoError, setGeoError] = useState('')

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 5 * 60e3) // refresh every 5 minutes
    return () => clearInterval(id)
  }, [])

  const sky = useMemo(() => skyReport(loc, now), [loc, now])
  const tz = loc.tz

  const useMyLocation = () => {
    setGeoError('')
    if (!navigator.geolocation) return setGeoError('Your browser cannot share its location.')
    navigator.geolocation.getCurrentPosition(
      (p) => setLoc({ name: 'your location', lat: p.coords.latitude, lon: p.coords.longitude, tz: undefined }),
      () => setGeoError('Location was not shared, so this still shows Hyderabad.'),
      { timeout: 10000 },
    )
  }

  const visible = sky.planets.filter((p) => p.visible)

  return (
    <section className="tonight" aria-labelledby="tonight-title">
      <div className="tonight-head">
        <h2 id="tonight-title">Tonight's sky over {loc.name}</h2>
        {loc === HYDERABAD
          ? <button type="button" className="button small" onClick={useMyLocation}>Use my location</button>
          : <button type="button" className="button small" onClick={() => setLoc(HYDERABAD)}>Back to Hyderabad</button>}
      </div>
      {geoError && <p className="note">{geoError}</p>}

      <div className="sky-grid">
        <article className="sky-card moon-card">
          <MoonIcon angle={sky.moon.angle} />
          <div>
            <h3>{sky.moon.name}</h3>
            <p className="big">{Math.round(sky.moon.lit * 100)}% lit</p>
            <p className="data">Moonrise {time(sky.moon.rise, tz)}</p>
            <p className="data">Moonset {time(sky.moon.set, tz)}</p>
          </div>
        </article>

        <article className="sky-card">
          <h3>The Sun</h3>
          <p className="data">Sunset {time(sky.sunset, tz)}</p>
          <p className="data">Sunrise {time(sky.sunrise, tz)}</p>
          <p className="muted">{sky.sunUp ? 'Dark sky about an hour after sunset.' : 'The Sun is down. Look up!'}</p>
        </article>

        <article className="sky-card">
          <h3>Planets to spot</h3>
          {visible.length === 0 && <p className="muted">No bright planets are well placed tonight.</p>}
          <ul className="planets">
            {sky.planets.map((p) => (
              <li key={p.name} className={p.visible ? '' : 'faded'}>
                <span>{p.name}</span>
                <span className="data">{p.when}</span>
                <span className="data" title="Apparent magnitude: lower is brighter">mag {p.mag.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="sky-card">
          <h3>Next eclipses</h3>
          <p><strong>{cap(sky.lunar.kind)} lunar eclipse</strong><br /><span className="data">{day(sky.lunar.date, tz)}</span></p>
          <p><strong>{cap(sky.solar.kind)} solar eclipse</strong> seen from {loc.name}<br /><span className="data">{day(sky.solar.date, tz)}</span></p>
        </article>
      </div>
      <p className="muted small-print">
        Calculated live in your browser for {loc.name} ({loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°).
        Want more? Open the <Link to="/sky-tools">planisphere and sky tools</Link>.
      </p>
    </section>
  )
}
