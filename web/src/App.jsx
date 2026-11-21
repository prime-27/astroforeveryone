import { lazy, Suspense } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Starfield from './components/Starfield.jsx'
import Home from './pages/Home.jsx'
import ContentPage from './pages/ContentPage.jsx'
import ToolSection from './pages/ToolSection.jsx'
import { SECTIONS } from './tools/catalogue.js'
const Journey = lazy(() => import('./pages/Journey.jsx'))
const ToolPage = lazy(() => import('./pages/ToolPage.jsx'))

// /simulations lists its tools as cards; every other slug is a page of generated content
function SlugPage() {
  const { slug } = useParams()
  return SECTIONS[slug] ? <ToolSection slug={slug} /> : <ContentPage />
}

export default function App() {
  return (
    <>
      <Starfield />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/journey" element={<Suspense fallback={null}><Journey /></Suspense>} />
        <Route path="/:slug" element={<SlugPage />} />
        <Route path="/:section/:tool" element={<Suspense fallback={null}><ToolPage /></Suspense>} />
      </Routes>
      <Footer />
    </>
  )
}
