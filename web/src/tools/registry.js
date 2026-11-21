import { lazy } from 'react'

// Tools rebuilt in React. Each loads in its own chunk, only when its page is opened.
export const COMPONENTS = {
  SolarSystem: lazy(() => import('./SolarSystem.jsx')),
}
