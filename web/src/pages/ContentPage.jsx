import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageBody from '../components/PageBody.jsx'
import { loadPage } from '../content.js'

export default function ContentPage() {
  const { slug } = useParams()
  const [page, setPage] = useState(undefined) // undefined = loading, null = not found

  useEffect(() => {
    let live = true
    setPage(undefined)
    loadPage(slug).then((p) => live && setPage(p))
    window.scrollTo(0, 0)
    return () => { live = false }
  }, [slug])

  useEffect(() => {
    document.title = page ? `${page.title} · ASTRO – Astronomy for Everyone` : 'ASTRO – Astronomy for Everyone'
  }, [page])

  if (page === undefined) return <main><p className="loading">Loading…</p></main>
  if (page === null) {
    return (
      <main>
        <h1>Page not found</h1>
        <p>There is no page at this address. <Link to="/">Go to the home page</Link>.</p>
      </main>
    )
  }
  return (
    <main>
      <h1>{page.title}</h1>
      <PageBody html={page.html} />
    </main>
  )
}
