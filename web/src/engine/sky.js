// Live sky report for an observer: Moon, Sun, naked-eye planets and the next eclipses (astronomy-engine).
import * as A from 'astronomy-engine'

export const HYDERABAD = { name: 'Hyderabad', lat: 17.385, lon: 78.4867, tz: 'Asia/Kolkata' }
const PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']
const PHASE_NAMES = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent']
const MIN_ALT = 10 // degrees above the horizon to count as comfortably visible

export const phaseName = (angle) => PHASE_NAMES[Math.round(angle / 45) % 8]

function altitude(body, date, obs) {
  const eq = A.Equator(body, date, obs, true, true)
  return A.Horizon(date, obs, eq.ra, eq.dec, 'normal').altitude
}

const riseSet = (body, obs, dir, from, days) => A.SearchRiseSet(body, obs, dir, from, days)?.date ?? null

export function skyReport(loc, now = new Date()) {
  const obs = new A.Observer(loc.lat, loc.lon, 0)
  const sunUp = altitude('Sun', now, obs) > -0.833
  // "tonight" = the dark hours after the coming (or, if already dark, the latest) sunset
  const sunset = sunUp ? riseSet('Sun', obs, -1, now, 1) : riseSet('Sun', obs, -1, now, -1)
  const sunrise = riseSet('Sun', obs, +1, now, 1)
  const evening = new Date(sunset.getTime() + 3600e3)
  const dawn = new Date(sunrise.getTime() - 3600e3)

  const angle = A.MoonPhase(now)
  const moon = {
    angle,
    name: phaseName(angle),
    lit: A.Illumination('Moon', now).phase_fraction,
    rise: riseSet('Moon', obs, +1, now, 2),
    set: riseSet('Moon', obs, -1, now, 2),
  }

  const planets = PLANETS.map((name) => {
    const eve = altitude(name, evening, obs)
    const morn = altitude(name, dawn, obs)
    return {
      name,
      mag: A.Illumination(name, now).mag,
      when: eve > MIN_ALT ? 'Evening' : morn > MIN_ALT ? 'Before dawn' : 'Lost in twilight',
      visible: eve > MIN_ALT || morn > MIN_ALT,
    }
  })

  const lunar = A.SearchLunarEclipse(now)
  const solar = A.SearchLocalSolarEclipse(now, obs)
  return {
    sunUp, sunset, sunrise, moon, planets,
    lunar: { kind: lunar.kind, date: lunar.peak.date },
    solar: { kind: solar.kind, date: solar.peak.time.date },
  }
}

// SVG path of the Moon's lit part, radius r, centred on 0,0; seen from the northern hemisphere (waxing = right side lit)
export function moonPath(angle, r) {
  const phi = (angle * Math.PI) / 180
  const rx = Math.abs(Math.cos(phi)) * r
  const waxing = angle < 180
  const gibbous = Math.cos(phi) < 0
  const outer = waxing ? 1 : 0 // lit limb: right half when waxing, left half when waning
  const inner = gibbous === waxing ? 1 : 0 // terminator bulges into the dark half when gibbous
  return `M0,${-r} A${r},${r} 0 0 ${outer} 0,${r} A${rx},${r} 0 0 ${inner} 0,${-r}Z`
}
