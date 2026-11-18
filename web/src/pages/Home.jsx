import { lazy, Suspense, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageBody from '../components/PageBody.jsx'
import { loadPage } from '../content.js'

// three.js is only needed here, so it loads in its own chunk
const Universe = lazy(() => import('../components/Universe.jsx'))
const TonightSky = lazy(() => import('../components/TonightSky.jsx'))

const TOOLS = [
  { slug: 'sky-tools', title: 'Sky Tools', text: "Planisphere, tonight's sky over Hyderabad, and upcoming eclipses." },
  { slug: 'simulations', title: 'Simulations', text: '3D solar system, eclipses, seasons, moon phases and stellar deaths.' },
  { slug: 'scientific-tools', title: 'Scientific Tools', text: 'Julian dates, eclipsing binaries, coordinates and the 28 nakshatras.' },
  { slug: 'quizzes', title: 'Quizzes', text: 'Test yourself, climb the leaderboard and earn a certificate.' },
]

export default function Home() {
  const [page, setPage] = useState(null)
  useEffect(() => {
    document.title = 'ASTRO – Astronomy for Everyone'
    loadPage('index').then(setPage)
  }, [])

  return (
    <>
      <section className="hero">
        <Suspense fallback={null}><Universe className="universe" /></Suspense>
        <div className="hero-text">
          <img className="hero-logo" src={`${import.meta.env.BASE_URL}logo.webp`} alt="ASTRO – The Astronomical Society for Training, Research and Outreach" width="160" height="160" />
          <h1>Explore the cosmos with professional astronomers</h1>
          <p>Training, outreach and research from Hyderabad, for students, families and anyone who looks up.</p>
          <div className="actions">
            <Link className="button primary" to="/programs">See programs</Link>
            <Link className="button" to="/events">Upcoming events</Link>
          </div>
        </div>
      </section>
      <main>
        <Suspense fallback={<p className="loading">Calculating tonight's sky…</p>}><TonightSky /></Suspense>
        <h2>Try it yourself</h2>
        <div className="cards four">
          {TOOLS.map((t) => (
            <Link key={t.slug} className="card tool-card" to={`/${t.slug}`}>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
            </Link>
          ))}
        </div>
        {page && <PageBody html={page.html} />}
      </main>
    </>
  )
}
