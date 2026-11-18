// The journey: from a Hyderabad rooftop out to the edge of the observable universe,
// through objects ASTRO shows people at its observing sessions.
// `scene` names the drawing in engine/journey.js.

export const STOPS = [
  {
    scene: 'hyderabad',
    kicker: 'Start · 17.4° N, 78.5° E',
    title: 'Hyderabad, tonight',
    distance: 'You are here',
    light: '—',
    see: { how: 'Your eyes', best: 'Any clear night' },
    facts: [
      'Look up. Every point of light above the city is a different distance away, and some of that light is older than history.',
      'Scroll to leave the ground. Each stop is something you can see from Hyderabad with your eyes, binoculars or a small telescope.',
    ],
  },
  {
    scene: 'moon',
    kicker: 'Stop 1 · Our Moon',
    title: 'The Moon',
    distance: '384,400 km',
    light: '1.3 seconds',
    see: { how: 'Naked eye · any telescope', best: 'Around first quarter' },
    facts: [
      'The dark patches are maria, plains of ancient lava. Early astronomers took them for seas.',
      'The best view is along the terminator, the line between day and night, where low sunlight throws long shadows from crater walls.',
      'It is 3,474 km wide, about a quarter of Earth.',
    ],
  },
  {
    scene: 'jupiter',
    kicker: 'Stop 2 · The largest planet',
    title: 'Jupiter',
    distance: '590–970 million km',
    light: '33–54 minutes',
    see: { how: 'Naked eye · binoculars for its moons', best: 'Months around opposition' },
    facts: [
      'About 1,300 Earths would fit inside it.',
      'Steady binoculars show its four largest moons, Io, Europa, Ganymede and Callisto. Galileo found them in 1610, and they change places every night.',
      'A small telescope shows its cloud belts. The Great Red Spot is a storm wider than Earth.',
    ],
  },
  {
    scene: 'saturn',
    kicker: 'Stop 3 · The ringed planet',
    title: 'Saturn',
    distance: '1.2–1.7 billion km',
    light: '67–92 minutes',
    see: { how: 'Small telescope at 30× or more', best: 'Months around opposition' },
    facts: [
      'The rings are mostly water ice, about 270,000 km across but in most places only tens of metres thick.',
      'Seeing the rings for the first time through a telescope is the moment most people never forget at our sessions.',
      'Its moon Titan shows as a faint star beside it.',
    ],
  },
  {
    scene: 'pleiades',
    kicker: 'Stop 4 · Krittika',
    title: 'The Pleiades',
    distance: '444 light-years',
    light: '444 years',
    see: { how: 'Naked eye · best in binoculars', best: 'November to February evenings' },
    facts: [
      'Known in India as Krittika, one of the 27 nakshatras.',
      'Most people can count six or seven stars with their eyes. Binoculars show dozens of hot young blue stars, about 100 million years old.',
      'The light you see tonight left in the late 1500s.',
    ],
  },
  {
    scene: 'orion',
    kicker: 'Stop 5 · A star nursery',
    title: 'The Orion Nebula',
    distance: '1,344 light-years',
    light: '1,344 years',
    see: { how: 'Naked eye as a fuzzy star · binoculars', best: 'December to February evenings' },
    facts: [
      'Find the three stars of Orion\'s belt, then look just below for his sword. The middle "star" is this glowing cloud.',
      'New stars are forming inside it right now. Four bright young stars at its heart, the Trapezium, light up the gas.',
      'The light reaching you left around 680 CE.',
    ],
  },
  {
    scene: 'andromeda',
    kicker: 'Stop 6 · Another galaxy',
    title: 'The Andromeda Galaxy',
    distance: '2.5 million light-years',
    light: '2.5 million years',
    see: { how: 'Naked eye from a dark site · binoculars', best: 'October to December evenings' },
    facts: [
      'The farthest thing most people can see without a telescope: a whole galaxy of about a trillion stars.',
      'Its light set out before modern humans existed.',
      'City lights hide it from Hyderabad itself. A dark site outside the city shows it as a faint oval glow.',
    ],
  },
  {
    scene: 'edge',
    kicker: 'Stop 7 · As far as we can see',
    title: 'The edge of the observable universe',
    distance: '46 billion light-years',
    light: '13.8 billion years',
    see: { how: 'Radio telescopes and satellites', best: 'Everywhere, all the time' },
    facts: [
      'The oldest light there is: the cosmic microwave background, released about 380,000 years after the Big Bang.',
      'It has travelled 13.8 billion years, but space stretched while it travelled, so its source is now about 46 billion light-years away.',
      'A small part of the static on an old analogue TV came from it.',
    ],
  },
]
