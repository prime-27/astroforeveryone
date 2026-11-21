import { Suspense, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findTool } from '../tools/catalogue.js'
import { COMPONENTS } from '../tools/registry.js'
import { fitToolFrames } from '../engine/fitFrames.js'

const BASE = import.meta.env.BASE_URL

export default function ToolPage() {
  const { section: sectionSlug, tool: toolSlug } = useParams()
  const found = findTool(sectionSlug, toolSlug)
  const stageRef = useRef(null)
  const [full, setFull] = useState(false)
  const current = found?.tool

  useEffect(() => {
    if (!current) return
    document.title = `${current.title} · ASTRO – Astronomy for Everyone`
    window.scrollTo(0, 0)
  }, [current])

  // original HTML tools: grow the frame to the tool's own height
  useEffect(() => (stageRef.current ? fitToolFrames(stageRef.current) : undefined), [current])

  useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === stageRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  if (!found) {
    return (
      <main>
        <h1>Tool not found</h1>
        <p>There is no tool at this address. <Link to="/">Go to the home page</Link>.</p>
      </main>
    )
  }

  const { section, tool, prev, next } = found
  const Component = tool.component && COMPONENTS[tool.component]
  const toggleFull = () => (full ? document.exitFullscreen() : stageRef.current?.requestFullscreen?.())

  return (
    <main className="wide tool-page">
      <p className="crumbs"><Link to={`/${sectionSlug}`}>{section.title}</Link></p>
      <div className="tool-title">
        <div>
          <h1>{tool.title}</h1>
          <p className="lede">{tool.text}</p>
        </div>
        <button type="button" className="button small" onClick={toggleFull}>{full ? 'Exit full screen' : 'Full screen'}</button>
      </div>

      <div className={`tool-stage${Component ? ' react' : ''}`} ref={stageRef}>
        {Component ? (
          <Suspense fallback={<p className="loading">Loading {tool.title}…</p>}><Component /></Suspense>
        ) : (
          <iframe key={tool.file} src={`${BASE}tools/${tool.file}`} title={tool.title} allow="fullscreen" />
        )}
      </div>

      <nav className="tool-pager" aria-label={`More ${section.title}`}>
        {prev ? <Link to={`/${sectionSlug}/${prev.slug}`}>← {prev.title}</Link> : <span />}
        {next ? <Link to={`/${sectionSlug}/${next.slug}`}>{next.title} →</Link> : <span />}
      </nav>
    </main>
  )
}
