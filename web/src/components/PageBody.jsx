import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fitToolFrames } from '../engine/fitFrames.js'
import { BASE, withBase } from '../content.js'

export default function PageBody({ html }) {
  const ref = useRef(null)
  const navigate = useNavigate()
  const body = useMemo(() => withBase(html), [html])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // internal links inside the HTML go through the router instead of reloading the page
    const onClick = (e) => {
      const a = e.target.closest('a[href]')
      const href = a?.getAttribute('href') || ''
      if (!href.startsWith(BASE) || a.target || e.metaKey || e.ctrlKey || href.startsWith(`${BASE}tools/`)) return
      e.preventDefault()
      navigate('/' + href.slice(BASE.length))
    }
    el.addEventListener('click', onClick)
    const stop = fitToolFrames(el)
    return () => { el.removeEventListener('click', onClick); stop() }
  }, [body, navigate])

  return <div className="content" ref={ref} dangerouslySetInnerHTML={{ __html: body }} />
}
