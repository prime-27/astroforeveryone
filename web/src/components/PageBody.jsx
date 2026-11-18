import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fitToolFrames } from '../engine/fitFrames.js'

export default function PageBody({ html }) {
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // internal links inside the HTML go through the router instead of reloading the page
    const onClick = (e) => {
      const a = e.target.closest('a[href^="/"]')
      if (!a || a.target || e.metaKey || e.ctrlKey || a.getAttribute('href').startsWith('/tools/')) return
      e.preventDefault()
      navigate(a.getAttribute('href'))
    }
    el.addEventListener('click', onClick)
    const stop = fitToolFrames(el)
    return () => { el.removeEventListener('click', onClick); stop() }
  }, [html, navigate])

  return <div className="content" ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
}
