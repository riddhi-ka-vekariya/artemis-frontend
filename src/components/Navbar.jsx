import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Home', path: '/home' },
  { label: 'Projects', path: '/projects' },
  { label: 'Design Philosophy', path: '/design-philosophy' },
  { label: 'About Me', path: '/about' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  const handleNavClick = (path) => {
    setIsMobileOpen(false)
    navigate(path)
  }

  return (
    <>
      <nav className="navbar" aria-label="Main navigation">
        {/* Logo */}
        <button
          id="nav-wordmark"
          className="navbar-wordmark"
          onClick={() => handleNavClick('/home')}
          aria-label="Artemis Studios - Home"
        >
          <img
            src={`${import.meta.env.BASE_URL}artemis-logo.png`}
            alt="Artemis Studios"
            className="navbar-logo-img"
          />
        </button>

        {/* Desktop Nav links */}
        <ul className="navbar-links" role="list">
          {NAV_ITEMS.map(({ label, path }) => {
            const isActive = location.pathname === path
            return (
              <li key={path}>
                <button
                  id={`nav-${path.replace(/\//g, '').replace(/-/g, '_')}`}
                  className={`nav-link${isActive ? ' active' : ''}`}
                  onClick={() => handleNavClick(path)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Mobile Hamburger Toggle */}
        <button
          id="nav-mobile-toggle"
          className={`navbar-toggle${isMobileOpen ? ' active' : ''}`}
          onClick={() => setIsMobileOpen(prev => !prev)}
          aria-label={isMobileOpen ? 'Close menu' : 'Open navigation menu'}
          aria-expanded={isMobileOpen}
          aria-controls="mobile-nav-drawer"
        >
          <span className="toggle-line toggle-line--top" />
          <span className="toggle-line toggle-line--mid" />
          <span className="toggle-line toggle-line--bot" />
        </button>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        id="mobile-nav-drawer"
        className={`mobile-nav-overlay${isMobileOpen ? ' open' : ''}`}
        aria-hidden={!isMobileOpen}
      >
        <div className="mobile-nav-backdrop" onClick={() => setIsMobileOpen(false)} />
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-header">
            <span className="mobile-nav-eyebrow"></span>
            <div className="mobile-nav-divider" />
          </div>

          <ul className="mobile-nav-links" role="list">
            {NAV_ITEMS.map(({ label, path }, idx) => {
              const isActive = location.pathname === path
              return (
                <li key={path} className="mobile-nav-item" style={{ animationDelay: `${idx * 0.06}s` }}>
                  <button
                    className={`mobile-nav-link${isActive ? ' active' : ''}`}
                    onClick={() => handleNavClick(path)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="mobile-nav-text">{label}</span>
                    {isActive && <span className="mobile-nav-active-dot">•</span>}
                  </button>
                </li>
              )
            })}
          </ul>

        </div>
      </div>
    </>
  )
}
