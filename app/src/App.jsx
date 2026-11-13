import { HashRouter, MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { OptimizerProvider } from './context/OptimizerContext.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import Home from './pages/Home.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import TripPage from './pages/TripPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import ProgramsPage from './pages/ProgramsPage.jsx'
import ExplorePage from './pages/ExplorePage.jsx'
import './App.css'

// The artifact build keeps routes in memory: an artifact's link only carries a
// plain #name, so #/results-style hash routes can't live in its address.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : HashRouter

export default function App() {
  return (
    <Router>
      <OptimizerProvider>
        <SiteHeader />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/trip" element={<TripPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </OptimizerProvider>
    </Router>
  )
}
