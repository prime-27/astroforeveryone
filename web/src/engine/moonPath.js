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
