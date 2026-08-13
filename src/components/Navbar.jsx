import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Home',              path: '/home'   },
  { label: 'Projects',          path: '/projects' },
  { label: 'Design Philosophy', path: '/design-philosophy' },
  { label: 'About Me',          path: '/about'  },
]

export default function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()

  return (
    <nav className="navbar" aria-label="Main navigation">
      {/* Wordmark / logo */}
      <button
        id="nav-wordmark"
        className="navbar-wordmark"
        onClick={() => navigate('/home')}
        aria-label="Go to home"
      >
        Arte<em>mis</em>
      </button>

      {/* Nav links */}
      <ul className="navbar-links" role="list">
        {NAV_ITEMS.map(({ label, path }) => {
          const isActive = location.pathname === path
          return (
            <li key={path}>
              <button
                id={`nav-${path.replace(/\//g, '').replace(/-/g, '_')}`}
                className={`nav-link${isActive ? ' active' : ''}`}
                onClick={() => navigate(path)}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
