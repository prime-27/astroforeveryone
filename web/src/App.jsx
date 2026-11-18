import { Route, Routes } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Starfield from './components/Starfield.jsx'
import Home from './pages/Home.jsx'
import ContentPage from './pages/ContentPage.jsx'

export default function App() {
  return (
    <>
      <Starfield />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:slug" element={<ContentPage />} />
      </Routes>
      <Footer />
    </>
  )
}
