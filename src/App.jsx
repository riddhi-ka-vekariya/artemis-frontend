import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Experience3D } from './components/Experience3D'

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="spinner-glow" />
      <div className="loading-text">Loading 3D Chair Model...</div>
    </div>
  )
}

// 6 sections × 100vh = 3 full rotations = 3 chair swaps
const SECTIONS = [
  { tag: 'Ergonomic Design',  heading: 'Built for the',       accent: 'long haul',          color: 'var(--accent-cyan)'    },
  { tag: 'Premium Materials', heading: 'Aircraft-grade',      accent: 'aluminum',            color: 'var(--accent-purple)'  },
  { tag: 'Personalization',   heading: 'Your chair,',         accent: 'your rules',          color: 'var(--accent-amber)'   },
  { tag: 'Next Generation',   heading: 'Redesigned from',     accent: 'the ground up',       color: 'var(--accent-emerald)' },
  { tag: 'Sustainability',    heading: 'Built to',            accent: 'last forever',        color: 'var(--accent-cyan)'    },
  { tag: 'Comfort Science',   heading: 'Feels like',          accent: 'floating',            color: 'var(--accent-rose)'    },
]

const BODIES = [
  'Precision-engineered lumbar support and 4D armrests adapt to every posture, keeping you comfortable through even the longest sessions.',
  'Cold-forged aluminum alloy base paired with breathable mesh ensures durability that outlasts the competition — and looks stunning doing it.',
  'Infinite adjustment points, 12 color variants, and modular components make this chair a true extension of your personality.',
  'A completely rethought silhouette — lighter, more breathable, and engineered for the next decade of work.',
  '100% recyclable materials, zero-waste manufacturing, and a lifetime warranty — because great design shouldn\'t cost the planet.',
  'Adaptive foam layers and dynamic recline technology distribute your weight perfectly — no pressure points, ever.',
]

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight
      if (max > 0) setScrollProgress(el.scrollTop / max)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      ref={scrollRef}
      style={{ width: '100vw', height: '100vh', overflowY: 'scroll', overflowX: 'hidden', position: 'relative' }}
    >
      {/* Floating navigation bar */}
      <nav style={{
        position: 'fixed', top: '1.25rem', left: '1.5rem', right: '1.5rem', zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none'
      }}>
        <div style={{
          background: 'rgba(18, 18, 18, 0.75)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.12)', padding: '0.45rem 1rem',
          borderRadius: '99px', color: '#fff', fontSize: '0.8rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'auto'
        }}>
          <span style={{ width: 7, height: 7, background: '#38bdf8', borderRadius: '50%', boxShadow: '0 0 8px #38bdf8' }} />
          ARTEMIS POC
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', pointerEvents: 'auto' }}>
          <a href="/artemis-frontend/unseen" style={{
            background: 'rgba(56, 189, 248, 0.2)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(56, 189, 248, 0.4)', padding: '0.45rem 0.9rem',
            borderRadius: '99px', color: '#38bdf8', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 600
          }}>
            WebGL Curl ↗
          </a>
        </div>
      </nav>

      {/* Sticky 3D viewport */}
      <div style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', zIndex: 1 }}>
        <Suspense fallback={<LoadingScreen />}>
          <Experience3D scrollProgress={scrollProgress} />
        </Suspense>
      </div>

      {/* Scroll-driving content sections */}
      <div style={{ position: 'relative', zIndex: 0 }}>
        {SECTIONS.map((s, i) => (
          <section key={i} className="scroll-section">
            <div className="scroll-section-inner">
              <span className="scroll-tag">{s.tag}</span>
              <h2 className="scroll-heading">
                {s.heading} <span style={{ color: s.color }}>{s.accent}</span>
              </h2>
              <p className="scroll-body">{BODIES[i]}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
