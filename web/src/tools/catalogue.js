// Every interactive tool on the site, grouped by the page that lists it.
// `file` is the original standalone page in public/tools/. When a tool has been rebuilt in React,
// `component` names it in tools/registry.js and the page renders that instead of the HTML frame.
// Preview images live in public/tools/previews/<slug>.webp (made by scripts/previews.py).

export const SECTIONS = {
  'sky-tools': {
    title: 'Sky Tools',
    intro: "Charts and tables for the real sky: what is up tonight over Hyderabad, where to find it, and when the next eclipse comes.",
    tools: [
      { slug: 'planisphere', file: 'sky-tools-2.html', title: 'Planisphere & Star Chart', text: 'A star chart for any date and time from observatories across India, with 24 constellations, the planets and the Moon. Print it or save it as an image.' },
      { slug: 'tonights-sky', file: 'sky-tools-3.html', title: "Tonight's Sky & Lunar Ephemeris", text: "Moon phase, moonrise and moonset, and which planets are up this evening from Hyderabad, for any date you choose." },
      { slug: 'eclipses', file: 'sky-tools-4.html', title: 'Upcoming Eclipses', text: 'Solar and lunar eclipses coming up, and whether each one is visible from Hyderabad.' },
    ],
  },
  simulations: {
    title: 'Simulations',
    intro: 'Hands-on 3D models. Drag to turn them, scroll to zoom, and change the controls to see how the sky works.',
    tools: [
      { slug: 'solar-system', file: 'simulations-3.html', component: 'SolarSystem', title: '3D Solar System', text: 'The Sun, eight planets and five dwarf planets in motion, with a fact sheet for each world.' },
      { slug: 'stellar-deaths', file: 'simulations-2.html', title: 'Stellar Cinema: How Massive Stars Die', text: 'A 3D film of the two ways a massive star can end: as a neutron star or as a black hole.' },
      { slug: 'celestial-sphere', file: 'simulations-4.html', title: 'Celestial Sphere', text: 'The equator, ecliptic and horizon planes, the 13 zodiac constellations, the seasons, and why eclipses happen at the nodes.' },
      { slug: 'retrograde-motion', file: 'simulations-5.html', title: 'Retrograde Motion', text: 'Why Mars and the other planets seem to loop backwards in our sky, seen from the Sun and from Earth.' },
      { slug: 'eclipse-mechanics', file: 'simulations-6.html', title: 'Eclipse Mechanics', text: "Line up the Sun, Earth and Moon to make total, annular and partial eclipses, and watch the umbra and penumbra move." },
      { slug: 'lunar-craters', file: 'simulations-7.html', title: 'Lunar Crater Formation', text: 'Fire an impactor at the Moon and change its speed, angle and size to make simple bowls, central peaks and ring basins.' },
      { slug: 'space-missions', file: 'simulations-8.html', title: 'Space Missions & Planets', text: "Fly to any planet and follow the paths of missions including ISRO's Chandrayaan, Mangalyaan and Aditya-L1." },
      { slug: 'seasons', file: 'simulations-9.html', title: 'Earth Seasons & Tilt', text: "How Earth's 23.44° tilt makes the seasons and changes the length of the day at your latitude." },
      { slug: 'moon-phases', file: 'simulations-10.html', title: 'Moon Phase Engine', text: 'The Moon orbiting Earth beside the view through a telescope, through all eight phases.' },
      { slug: 'observer-sky', file: 'simulations-11.html', title: 'Observer Sky & Sphere', text: "Stand at your latitude and watch the Sun's daily path change between summer, the equinoxes and winter." },
      { slug: 'solar-nebula', file: 'simulations-12.html', title: 'Solar Nebula Studio', text: 'How our solar system formed, stage by stage, from a collapsing gas cloud to a disk and planets.' },
    ],
  },
  'scientific-tools': {
    title: 'Scientific Tools',
    intro: 'Calculators and labs used in positional astronomy, variable-star work and the history of Indian astronomy.',
    tools: [
      { slug: 'julian-date', file: 'scientific-tools-2.html', title: 'Julian Date Converter', text: 'Convert between calendar dates, Julian Dates and Modified Julian Dates, the time scale astronomers use.' },
      { slug: 'eclipsing-binary', file: 'scientific-tools-3.html', title: 'Eclipsing Binary Analyser', text: 'Paste a light curve to find the period, the epoch and the times of minimum of an eclipsing binary star.' },
      { slug: 'precession', file: 'scientific-tools-4.html', title: 'Precession & Nutation Lab', text: "Earth's slow 25,772-year wobble and the smaller nodding on top of it, in 3D." },
      { slug: 'star-coordinates', file: 'scientific-tools-5.html', title: 'Star Position & Coordinates', text: "Set latitude, declination and hour angle and work out a star's altitude and azimuth step by step." },
      { slug: 'coordinates-3d', file: 'scientific-tools-6.html', title: '3D Coordinate Systems Lab', text: 'Plot one star in horizon, equatorial, hour-angle and ecliptic coordinates and see how they relate.' },
      { slug: 'nakshatras', file: 'scientific-tools-7.html', title: '28 Nakshatras', text: 'The 27 nakshatras and Abhijit: their ecliptic spans, yogataras and modern coordinates.' },
      { slug: 'ancient-indian-astronomy', file: 'scientific-tools-8.html', title: 'Ancient Indian Astronomy', text: 'Āryabhaṭa, Varāhamihira, Brahmagupta, Bhāskara II and Nīlakaṇṭha, with a 3D gola yantra and shanku shadow.' },
      { slug: 'indian-astronomy-legacy', file: 'scientific-tools-9.html', title: 'Legacy of Indian Astronomy', text: 'Yugas, siddhantic epicycles and a Katapayadi number decoder.' },
      { slug: 'constellations', file: 'scientific-tools-10.html', title: 'Constellations & Bright Stars', text: 'Accurate stick figures of the constellations with data on their brightest stars.' },
    ],
  },
  games: {
    title: 'Games',
    intro: 'Learn while you play.',
    tools: [
      { slug: 'cosmic-vanguard', file: 'games-2.html', title: 'Cosmic Vanguard', text: 'Steer a space probe through asteroid belts, collect energy and answer astrophysics questions.' },
      { slug: 'spectroscope', file: 'games-3.html', title: 'Starlight Spectroscope', text: 'Match star spectra to their spectral class, O, B, A, F, G, K or M, before the stars drift away.' },
    ],
  },
}

export function findTool(section, slug) {
  const s = SECTIONS[section]
  const i = s ? s.tools.findIndex((t) => t.slug === slug) : -1
  if (i < 0) return null
  return { section: s, tool: s.tools[i], prev: s.tools[i - 1] || null, next: s.tools[i + 1] || null }
}
