import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SECTIONS } from '../tools/catalogue.js'

const BASE = import.meta.env.BASE_URL

export default function ToolSection({ slug }) {
  const section = SECTIONS[slug]
  useEffect(() => {
    document.title = `${section.title} · ASTRO – Astronomy for Everyone`
    window.scrollTo(0, 0)
  }, [section])

  return (
    <main className="wide">
      <h1>{section.title}</h1>
      <p className="lede">{section.intro}</p>
      <ul className="tool-grid">
        {section.tools.map((t) => (
          <li key={t.slug}>
            <Link className="card tool-tile" to={`/${slug}/${t.slug}`}>
              <img src={`${BASE}tools/previews/${t.slug}.webp`} alt="" width="640" height="400" loading="lazy" />
              <h2>{t.title}</h2>
              <p>{t.text}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
