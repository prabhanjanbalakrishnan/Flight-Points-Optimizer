import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { OptimizerProvider } from './context/OptimizerContext.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import Home from './pages/Home.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import TripPage from './pages/TripPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import ProgramsPage from './pages/ProgramsPage.jsx'
import './App.css'

export default function App() {
  return (
    <HashRouter>
      <OptimizerProvider>
        <SiteHeader />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/trip" element={<TripPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </OptimizerProvider>
    </HashRouter>
  )
}
