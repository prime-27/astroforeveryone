import { useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import nav from '../nav.json'
import NightVision from './NightVision.jsx'

export default function Header() {
  const navRef = useRef(null)
  const { pathname } = useLocation()

  // close every dropdown on navigation and on a click outside the menu
  useEffect(() => {
    const closeAll = (except) => navRef.current?.querySelectorAll('details[open]').forEach((d) => d !== except && (d.open = false))
    closeAll()
    const onClick = (e) => closeAll(e.target.closest?.('nav details'))
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [pathname])

  return (
    <header className="top">
      <Link className="brand" to="/">
        <img src={`${import.meta.env.BASE_URL}logo.webp`} alt="ASTRO – The Astronomical Society for Training, Research and Outreach" width="52" height="52" />
        <span>Astronomy for Everyone</span>
      </Link>
      <nav aria-label="Main" ref={navRef}>
        {nav.map((group) => (
          <details key={group.label}>
            <summary>{group.label}</summary>
            <div className="menu">
              {group.pages.map((p) => (
                <NavLink key={p.slug} to={`/${p.slug}`}>{p.title}</NavLink>
              ))}
            </div>
          </details>
        ))}
      </nav>
      <NightVision />
    </header>
  )
}
