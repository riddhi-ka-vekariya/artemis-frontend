import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <>
      <Navbar />
      <main className="page-wrapper page-enter about-page" id="page-about">
        {/* ── Editorial Header ── */}
        <header className="about-hero">
          <div className="about-hero-inner">
            <span className="about-eyebrow">04 — Profile &amp; Philosophy</span>
            <h1 className="about-hero-title">
              Meet the <em>Designer</em>
            </h1>
            <div className="about-gold-line" />
            <p className="about-hero-subtitle">
              The journey, vision, and architectural pursuit behind Artemis Studios.
            </p>
          </div>
        </header>

        {/* ── Monograph Chapters Container ── */}
        <div className="about-content-wrap">

          {/* ── Chapter 01: Genesis ── */}
          <section className="about-chapter about-chapter--grid">
            <div className="about-chapter-meta">
              <span className="about-chapter-num">01</span>
              <span className="about-chapter-tag">Genesis &amp; Passion</span>
              <h2 className="about-chapter-heading">Meet the Designer ...</h2>
              <div className="about-meta-divider" />

              {/* Artist Portrait Placeholder
              <div className="artist-portrait-wrap">
                <div className="artist-portrait-frame">
                  <div className="artist-portrait-placeholder">
                    <div className="artist-portrait-icon">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="artist-portrait-label">Designer Portrait</span>
                    <span className="artist-portrait-sublabel">Artemis Studios</span>
                  </div>
                  Subtle architectural corner accents
                  <div className="portrait-bracket portrait-bracket--tl" />
                  <div className="portrait-bracket portrait-bracket--tr" />
                  <div className="portrait-bracket portrait-bracket--bl" />
                  <div className="portrait-bracket portrait-bracket--br" />
                </div>
                <span className="artist-portrait-caption">Founder &amp; Principal Architect</span>
              </div> */}
      </div>
      <div className="about-chapter-body">
        <p className="about-lead-text">
          My journey into architecture began with a fascination for buildings and the way thoughtfully designed spaces influence how people feel and interact.
        </p>
        <p className="about-sub-text">
          What started as an interest in design gradually became a passion for creating meaningful experience through architecture.
        </p>
      </div>
    </section >

      <div className="about-section-divider" />

  {/* ── Chapter 02: Finding My Niche ── */ }
          <section className="about-chapter about-chapter--grid about-chapter--reverse">
            <div className="about-chapter-meta">
              <span className="about-chapter-num">02</span>
              <span className="about-chapter-tag">Specialization</span>
              <h2 className="about-chapter-heading">Finding my Niche ...</h2>
              <div className="about-meta-divider" />
            </div>
            <div className="about-chapter-body">
              <p className="about-body-text">
                Before starting my firm, I've worked on residential and commercial projects that gave me practical experience in planning, design development, consultant coordination, and technical drawings.
              </p>
              <p className="about-body-text">
                My first cinema project changed the way I looked at architecture. I discovered a field where design, technology, storytelling, and human experience comes together. At the same time, I noticed that very few studios focus exclusively on cinema design.
              </p>
              <div className="about-quote-callout">
                <span className="callout-indicator">❖</span>
                <p className="callout-statement">
                  This realization led me to establish <strong>Artemis Studios</strong>.
                </p>
              </div>
            </div>
          </section>

          <div className="about-section-divider" />

  {/* ── Chapter 03: The Name (Lunar Feature Card) ── */ }
          <section className="about-lunar-card">
            <div className="about-lunar-glow" />
            <div className="about-lunar-inner">
              <div className="about-lunar-header">
                <span className="about-chapter-num">03</span>
                <span className="about-chapter-tag">The Identity &amp; Symbolism</span>
              </div>
              
              <h2 className="about-lunar-title">Artemis</h2>
              
              <div className="about-lunar-quote-wrap">
                <blockquote className="about-lunar-quote">
                  "For me, the moon symbolizes a light that shines through darkness, similarly a cinema transforms a dark auditorium into an immersive world through light."
                </blockquote>
              </div>

              <div className="about-lunar-description">
                <p>
                  The name <strong>Artemis</strong> is inspired by the Greek goddess associated with the moon.
                </p>
                <p>
                  This idea became the inspiration behind the identity and ethos of the studio.
                </p>
              </div>
            </div>
          </section>

          <div className="about-section-divider" />

  {/* ── Chapter 04: Looking Ahead ── */ }
  <section className="about-chapter about-chapter--grid">
    <div className="about-chapter-meta">
      <span className="about-chapter-num">04</span>
      <span className="about-chapter-tag">Vision &amp; Delivery</span>
      <h2 className="about-chapter-heading">Looking Ahead ...</h2>
      <div className="about-meta-divider" />
    </div>
    <div className="about-chapter-body">
      <p className="about-body-text">
        I believe great cinema design isn't just about aesthetics; it's about understanding audience behavior, operational efficiency, and the business behind every project.
      </p>
      <p className="about-body-text">
        Each project has reinforced my belief that credibility is built through expertise, attention to detail, and consistently delivering value.
      </p>

      {/* Mission Card */}
      <div className="about-mission-card">
        <span className="mission-badge">Today, my focus remains the same:</span>
        <p className="mission-statement">
          To design cinemas that are thoughtful, functional, and memorable spaces where great design brings together the audience's experience and the exhibitor's vision.
        </p>
      </div>

      <p className="about-closing-note">
        Follow along as we share our work, ideas and journey in Cinema Design.
      </p>

      <div className="about-actions-wrap">
        <button
          className="btn-view-projects"
          onClick={() => navigate('/projects')}
          aria-label="View Selected Projects"
        >
          View Selected Projects <span className="btn-arrow">→</span>
        </button>
      </div>
    </div>
  </section>

        </div >
      </main >
    <Footer />
    </>
  )
}
