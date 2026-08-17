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
        {/* ── Editorial Hero ── */}
        <header className="about-hero">
          {/* Responsive Cinema Background & Overlays */}
          <div className="about-hero-bg">
            <picture>
              <source media="(max-width: 640px)" srcSet={`${import.meta.env.BASE_URL}hero-cinema.jpg`} />
              <img
                src={`${import.meta.env.BASE_URL}hero-cinema.jpg`}
                alt="Dark luxury cinema auditorium with gold wall lighting"
                width={1920}
                height={1080}
                className="about-hero-img"
                fetchPriority="high"
                decoding="async"
              />
            </picture>
            <div className="about-hero-overlay" />
            <div className="about-hero-vignette" />
          </div>

          {/* Hero Content */}
          <div className="about-hero-inner">
            <span className="about-eyebrow">Profile &amp; Philosophy</span>
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

          {/* ── Chapter: Genesis ── */}
          <section className="about-chapter about-chapter--grid">
            <div className="about-chapter-meta">

              {/* Designer Portrait */}
              <div className="artist-portrait-wrap">
                <div className="artist-portrait-frame">
                  <img
                    src={`${import.meta.env.BASE_URL}designer.jpeg`}
                    alt="The Designer — Founder of Artemis Studios"
                    className="artist-portrait-img"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="portrait-bracket portrait-bracket--tl" />
                  <span className="portrait-bracket portrait-bracket--tr" />
                  <span className="portrait-bracket portrait-bracket--bl" />
                  <span className="portrait-bracket portrait-bracket--br" />
                </div>
                <h2 className="about-chapter-heading">AR Tanvi Chaag</h2>

                <p className="artist-portrait-caption">Founder & principal architect · Artemis Studios</p>
              </div>

            </div>
            <div className="about-chapter-body">
              <p className="about-lead-text">
                My journey into architecture began with a fascination for buildings and the way thoughtfully designed spaces influence how people feel and interact.
              </p>
              <p className="about-sub-text">
                What started as an interest in design gradually became a passion for creating meaningful experience through architecture.
              </p>
            </div>
          </section>

          <div className="about-section-divider" />

          {/* ── Chapter: Finding My Niche ── */}
          <section className="about-chapter about-chapter--grid about-chapter--reverse">
            <div className="about-chapter-meta">
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

          {/* ── Chapter: The Name (Lunar Feature Card) ── */}
          <section className="about-lunar-card">
            <div className="about-lunar-glow" />
            <div className="about-lunar-inner">
              <div className="about-lunar-header">
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

          {/* ── Chapter: Looking Ahead ── */}
          <section className="about-chapter about-chapter--grid">
            <div className="about-chapter-meta">
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
