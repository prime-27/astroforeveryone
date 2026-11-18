import { useEffect, useRef } from 'react'
import { createUniverse } from '../engine/universe.js'

export default function Universe({ className }) {
  const ref = useRef(null)
  useEffect(() => {
    try {
      return createUniverse(ref.current)
    } catch {
      return undefined // no WebGL: the starfield behind still shows
    }
  }, [])
  return <div className={className} ref={ref} aria-hidden="true" />
}
