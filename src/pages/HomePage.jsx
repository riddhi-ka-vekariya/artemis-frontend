import React, { useRef, useState, useEffect } from 'react'
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
    tag: 'Acoustic Insulation',
    title: 'Acoustics & Design',
    summary: 'Integrated design and sound planning.',
    desc: 'Every surface of auditorium is treated to ensure adequate absroptions and prevention of sound leaks.',
    icon: `${BASE}acoustic.png`,
  },
  {
    num: '03',
    tag: 'Spatial Circulation',
    title: 'Crowd Flow Optimization',
    summary: 'Efficient entry and exit circulation.',
    desc: 'Clear movement paths streamline high density foot traffic without congestion.',
    icon: `${BASE}crowd.png`,
  },
  {
    num: '04',
    tag: 'Commercial Strategy',
    title: 'Revenue Oriented Planning',
    summary: 'Maximizing seating capacity while balancing concessions and lobby.',
    desc: 'Lounges, concession hubs, and waiting areas are integrated into the guest journey.',
    icon: `${BASE}revenue.png`,
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [activeCardIndex, setActiveCardIndex] = useState(null)
  const [isTopBtnActive, setIsTopBtnActive] = useState(false)
  const [isBottomBtnActive, setIsBottomBtnActive] = useState(false)
  const cardRefs = useRef([])
  const topBtnRef = useRef(null)
  const bottomBtnRef = useRef(null)

  useEffect(() => {
    const isMobileQuery = window.matchMedia('(max-width: 900px)')

    const handleScroll = () => {
      if (!isMobileQuery.matches) {
        setActiveCardIndex(null)
        setIsTopBtnActive(false)
        setIsBottomBtnActive(false)
        return
      }

      const centerY = window.innerHeight * 0.5
      let closestIdx = null
      let minDistance = Infinity

      cardRefs.current.forEach((el, idx) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        if (rect.bottom < 0 || rect.top > window.innerHeight) return

        const cardCenter = rect.top + rect.height / 2
        const distance = Math.abs(cardCenter - centerY)

        if (distance < 220 && distance < minDistance) {
          minDistance = distance
          closestIdx = idx
        }
      })

      setActiveCardIndex(closestIdx)

      // Top CTA Button center-active detection on mobile
      if (topBtnRef.current) {
        const rect = topBtnRef.current.getBoundingClientRect()
        const btnCenter = rect.top + rect.height / 2
        setIsTopBtnActive(Math.abs(btnCenter - centerY) < 180)
      }

      // Bottom CTA Button center-active detection on mobile
      if (bottomBtnRef.current) {
        const rect = bottomBtnRef.current.getBoundingClientRect()
        const btnCenter = rect.top + rect.height / 2
        setIsBottomBtnActive(Math.abs(btnCenter - centerY) < 180)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

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
              <span>Shaping the World</span>
              <em>
                Where Stories<br />
                Begin
              </em>
            </h1>
            <div className="home-hero-divider" />
            <p className="home-hero-subtagline">
              An Architecture Studio <br />specialising in Cinema Design            </p>
          </div>
        </section>

        {/* ── View Selected Projects CTA Banner below Hero ── */}
        <div className="home-hero-cta-banner" ref={topBtnRef}>
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
            className={isTopBtnActive ? 'is-active' : ''}
          >
            <button
              className={`btn-view-projects${isTopBtnActive ? ' is-center-active' : ''}`}
              onClick={() => navigate('/projects')}
              aria-label="View Selected Projects"
            >
              View Selected Projects <span className="btn-arrow">→</span>
            </button>
          </GlareHover>
        </div>

        {/* ── Architectural Principles / Framework Section ── */}
        <section className="home-principles-section" aria-label="Architectural Principles">
          <header className="home-principles-header">
            <span className="home-eyebrow"></span>
            <h2 className="home-principles-title">
              Designing the Experience <em>beyond the Screen</em>
            </h2>
          </header>

          <div className="home-principles-grid">
            {PRINCIPLES.map((item, idx) => (
              <div
                key={item.num}
                ref={(el) => (cardRefs.current[idx] = el)}
                className={`principle-card${idx % 2 !== 0 ? ' principle-card--reverse' : ''}${activeCardIndex === idx ? ' is-center-active' : ''
                  }`}
              >
                <div className="principle-card-num-wrap">
                  {item.icon && (
                    <div className="principle-card-icon-box">
                      <img src={item.icon} alt={item.title} className="principle-card-icon" />
                    </div>
                  )}
                  <span className="principle-card-tag">{item.tag}</span>
                </div>
                <div className="principle-card-content">
                  <h3 className="principle-card-heading">{item.title}</h3>
                  <p className="principle-card-summary">{item.summary}</p>
                  <p className="principle-card-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── View Projects CTA Button at Bottom ── */}
          <div className="home-view-projects-wrap" ref={bottomBtnRef}>
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
              className={isBottomBtnActive ? 'is-active' : ''}
            >
              <button
                className={`btn-view-projects${isBottomBtnActive ? ' is-center-active' : ''}`}
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
