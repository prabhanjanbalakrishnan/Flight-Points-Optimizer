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
