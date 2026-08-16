import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MoltenMetal from '../components/MoltenMetal'
import FilmstripViewer from '../components/FilmstripViewer'
import Footer from '../components/Footer'
import GlareHover from '../components/GlareHover'

const BASE = import.meta.env.BASE_URL || '/'

const PRINCIPLES = [
  {
    num: '01',
    tag: 'Visibility & Focus',
    title: 'Sightlines First',
    summary: 'Every seat optimized for screen visibility.',
    desc: 'Precision geometric sightline modeling guarantees unobstructed viewing angles across every tier.',
    icon: `${BASE}Sightline.png`,
  },
  {
    num: '02',
    tag: 'Acoustic Engineering',
    title: 'Acoustically Driven Design',
    summary: 'Integrated architecture and sound planning.',
    desc: 'Custom surface geometry, tuned sound traps, and dampening materials engineered in tandem with spatial audio systems.',
    icon: `${BASE}acoustic.png`,
  },
  {
    num: '03',
    tag: 'Spatial Circulation',
    title: 'Crowd Flow Optimization',
    summary: 'Efficient entry, intermission, and exit circulation.',
    desc: 'Clear movement paths streamline high-density foot traffic without bottleneck congestion.',
    icon: `${BASE}crowd.png`,
  },
  {
    num: '04',
    tag: 'Commercial Strategy',
    title: 'Revenue-Oriented Planning',
    summary: 'Maximizing concession and lobby opportunities.',
    desc: 'VIP lounges, concession hubs, and merchandising galleries are integrated into the guest journey.',
    icon: `${BASE}revenue.png`,
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
            <span className="home-eyebrow"></span>
            <h1 className="home-headline">
              Shaping the World
              <em>Where Stories Begin</em>
            </h1>
            <div className="home-hero-divider" />
            <p className="home-hero-subtagline">
              WHERE SPACE BECOMES<br />
              A PART OF THE STORY
            </p>
          </div>
        </section>

        {/* ── Architectural Principles / Framework Section ── */}
        <section className="home-principles-section" aria-label="Architectural Principles">
          <header className="home-principles-header">
            <span className="home-eyebrow"></span>
            <h2 className="home-principles-title">
              Designing the experience <em>beyond the screen</em>
            </h2>
          </header>

          <div className="home-principles-grid">
            {PRINCIPLES.map((item, idx) => (
              <div
                key={item.num}
                className={`principle-card${idx % 2 !== 0 ? ' principle-card--reverse' : ''}`}
              >
                <div className="principle-card-num-wrap">
                  {item.icon && (
                    <div className="principle-card-icon-box">
                      <img src={item.icon} alt={item.title} className="principle-card-icon" />
                    </div>
                  )}
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
            <GlareHover
              width="auto"
              height="auto"
              background="transparent"
              borderRadius="2px"
              borderColor="transparent"
              glareColor="#ffffff"
              glareOpacity={0.7}
              glareAngle={-30}
              glareSize={300}
              transitionDuration={700}
              playOnce={true}
            >
              <button
                className="btn-view-projects"
                onClick={() => navigate('/projects')}
                aria-label="View Projects"
              >
                View Selected Projects <span className="btn-arrow">→</span>
              </button>
            </GlareHover>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
