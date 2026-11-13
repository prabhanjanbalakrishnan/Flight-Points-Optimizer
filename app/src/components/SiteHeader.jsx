import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import './SiteHeader.css'

// Where Back goes when there is nothing in this app's history to go back to
// (the page was opened directly, or after a refresh): one step up the flow.
const FALLBACK = {
  '/profile': '/',
  '/trip': '/profile',
  '/results': '/trip',
  '/programs': '/',
}

export default function SiteHeader() {
  const navigate = useNavigate()
  const { pathname, key } = useLocation()
  const showBack = pathname !== '/'
  const goBack = () => (key === 'default' ? navigate(FALLBACK[pathname] ?? '/') : navigate(-1))

  return (
    <header className="site-header">
      <div className="site-header__left">
        {showBack && (
          <button type="button" className="site-header__back" onClick={goBack}>
            <span aria-hidden="true">←</span> Back
          </button>
        )}
        <NavLink to="/" className="site-header__brand">
          <span className="site-header__logo" aria-hidden="true">
            <PlaneIcon />
          </span>
          Flight Points Optimizer
        </NavLink>
      </div>
      <nav className="site-header__nav">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/profile">My points</NavLink>
        <NavLink to="/programs">Programs</NavLink>
      </nav>
    </header>
  )
}

function PlaneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" focusable="false">
      <path d="M21 15.5v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V8.5l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-6z" />
    </svg>
  )
}
