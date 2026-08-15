import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MoltenMetal from '../components/MoltenMetal'
import FilmstripViewer from '../components/FilmstripViewer'
import Footer from '../components/Footer'

const PRINCIPLES = [
  {
    tag: 'Visibility & Focus',
    title: 'Sightlines First',
    summary: 'Every seat optimized for screen visibility.',
    desc: 'Precision geometric sightline modeling guarantees unobstructed 100% viewing angles across every tier, eliminating dead zones and maximizing visual impact for every patron.',
  },
  {
    tag: 'Acoustic Engineering',
    title: 'Acoustically Driven Design',
    summary: 'Integrated architecture and sound planning.',
    desc: 'Custom surface geometry, tuned sound traps, and dampening materials engineered in tandem with spatial audio systems for pristine sonic resonance and zero sound bleed.',
  },
  {
    tag: 'Spatial Circulation',
    title: 'Crowd Flow Optimization',
    summary: 'Efficient entry, intermission, and exit circulation.',
    desc: 'Algorithmic pedestrian circulation design streamlining high-density foot traffic during arrivals, intermissions, and rapid emergency egress without bottleneck congestion.',
  },
  {
    tag: 'Commercial Strategy',
    title: 'Revenue-Oriented Planning',
    summary: 'Maximizing concession and lobby opportunities.',
    desc: 'Strategic integration of VIP lounges, concession hubs, and merchandising galleries directly into primary movement corridors to elevate guest engagement and yield.',
  },
  {
    tag: 'Adaptable Architecture',
    title: 'Future-Ready Infrastructure',
    summary: 'Flexible spatial framing and high-bandwidth tech integration.',
    desc: 'Scalable conduit pathways, modular seating configurations, and high-capacity electrical grids engineered to seamlessly adapt to next-generation immersive media and live formats.',
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <>
      <Navbar />
      <main className="page-wrapper page-enter" id="page-home">
        <section className="home-hero" aria-label="Hero">
          {/* ── Full-width canvas background ── */}
          <div className="home-hero-visual">
            <div className="home-molten-background">
              <MoltenMetal
                color1="#040404"
                color2="#d19400"
                color3="#FFFFFF"
                speed={0.35}
                scale={4}
                detail={3}
                glow={1.6}
                coreSize={0.1}
                swirl={1}
                fold={-0.2}
                blackPoint={0.05}
                brightness={1.5}
                colorMode="ember"
                grain
                grainIntensity={0.05}
                mouseInteraction
                mouseStrength={0.3}
                opacity={1}
              />
            </div>
            <div className="home-filmstrip-overlay">
              <FilmstripViewer />
            </div>
          </div>

          {/* ── Text overlay on top ── */}
          <div className="home-hero-text">
            <span className="home-eyebrow">Welcome</span>
            <h1 className="home-headline">
              One Surface<br />
              <em>Infinite possibilities</em>
            </h1>
            <div className="home-hero-divider" />
            <p className="home-hero-subtagline">
              WE DESIGN CINEMAS.<br />
              WE CRAFT EXPERIENCES.
            </p>
          </div>
        </section>

        {/* ── Architectural Principles / Framework Section ── */}
        <section className="home-principles-section" aria-label="Architectural Principles">
          <header className="home-principles-header">
            <span className="home-eyebrow">Design Philosophy</span>
            <h2 className="home-principles-title">
              Architectural Engineering and <em>Spatial Strategy</em>
            </h2>
          </header>

          <div className="home-principles-grid">
            {PRINCIPLES.map((item, idx) => (
              <div
                key={item.num}
                className={`principle-card${idx % 2 !== 0 ? ' principle-card--reverse' : ''}`}
              >
                <div className="principle-card-num-wrap">
                  <span className="principle-card-num">{item.num}</span>
                  <div className="principle-card-line" />
                </div>
                <div className="principle-card-content">
                  <span className="principle-card-tag">{item.tag}</span>
                  <h3 className="principle-card-heading">{item.title}</h3>
                  <p className="principle-card-summary">{item.summary}</p>
                  <p className="principle-card-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── View Projects CTA Button at Bottom ── */}
          <div className="home-view-projects-wrap">
            <button
              className="btn-view-projects"
              onClick={() => navigate('/projects')}
              aria-label="View Projects"
            >
              View Selected Projects <span className="btn-arrow">→</span>
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
