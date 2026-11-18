import { useEffect, useState } from 'react'

// Red light keeps your eyes dark-adapted at the telescope: this turns the whole site (tools included) red.
const KEY = 'astro-night-vision'
const read = () => { try { return localStorage.getItem(KEY) === '1' } catch { return false } }

export default function NightVision() {
  const [on, setOn] = useState(read)

  useEffect(() => {
    document.documentElement.classList.toggle('night-vision', on)
    try { localStorage.setItem(KEY, on ? '1' : '0') } catch { /* private mode: just not remembered */ }
  }, [on])

  return (
    <button type="button" className="night-toggle" aria-pressed={on} onClick={() => setOn(!on)}
      title="Red light mode keeps your eyes adapted to the dark while observing">
      <span className="dot" aria-hidden="true" /> Night vision
    </button>
  )
}
