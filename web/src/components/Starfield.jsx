import { useEffect, useRef } from 'react'
import { ParticleEngine } from '../engine/particles.js'

// fixed, full-window starfield behind every page
export default function Starfield() {
  const ref = useRef(null)
  useEffect(() => new ParticleEngine(ref.current).mount(), [])
  return <canvas className="starfield" ref={ref} aria-hidden="true" />
}
