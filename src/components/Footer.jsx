import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="footer-container" aria-label="Footer">
      <div className="footer-inner">
        {/* Brand / Tagline */}
        <div className="footer-col footer-col-brand">
          <div className="footer-logo-wrap" onClick={() => navigate('/home')}>
            <img
              src={`${import.meta.env.BASE_URL}artemis-logo-f.png`}
              alt="Artemis Studios"
              className="footer-logo-img"
            />
          </div>
          <p className="footer-tagline">
            Crafting architectural experiences &amp; spatial strategy with relentless precision.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-col-title">Navigation</h4>
          <ul className="footer-links-list">
            <li>
              <button onClick={() => navigate('/home')}>Home</button>
            </li>
            <li>
              <button onClick={() => navigate('/projects')}>Projects</button>
            </li>
            <li>
              <button onClick={() => navigate('/design-philosophy')}>Design Philosophy</button>
            </li>
            <li>
              <button onClick={() => navigate('/about')}>About Me</button>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-col">
          <h4 className="footer-col-title">Get in Touch</h4>
          <ul className="footer-contact-list">
            <li>
              <span className="contact-label">Email:</span>
              <a href="mailto:contact@artemis-studios.com" className="contact-value">
                contact@artemis-studios.com
              </a>
            </li>
            <li>
              <span className="contact-label">Phone:</span>
              <a href="tel:+15552348900" className="contact-value">
                +1 (555) 234-8900
              </a>
            </li>
            <li>
              <span className="contact-label">Instagram:</span>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-value contact-link-social"
              >
                @artemis.studios ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal / Copyright Bar */}

    </footer>
  )
}
