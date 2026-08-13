import React from 'react'
import Navbar from '../components/Navbar'
import FilmstripViewer from '../components/FilmstripViewer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="page-wrapper page-enter" id="page-home">
        <section className="home-hero" aria-label="Hero">
          {/* ── Left: editorial text ── */}
          <div className="home-hero-text">
            <span className="home-eyebrow">01 — Welcome</span>
            <h1 className="home-headline">
              Craft that<br /><em>speaks</em> for itself.
            </h1>
          </div>

          {/* ── Right: Möbius filmstrip ── */}
          <div className="home-hero-visual">
            <FilmstripViewer />
          </div>
        </section>
      </main>
    </>
  )
}
