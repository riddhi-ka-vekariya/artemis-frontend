import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Experience3D } from './components/Experience3D'
import { ControlsHUD } from './components/ControlsHUD'

// 6 sections × 100vh = 3 full rotations = 3 chair swaps
const SECTIONS = [
  { tag: 'The Manufacture',   heading: 'Cartier Inspired',    accent: '3D Experience',       color: '#ffd700' },
  { tag: 'Ergonomic Design',  heading: 'Built for the',       accent: 'long haul',          color: 'var(--accent-cyan)'    },
  { tag: 'Premium Materials', heading: 'Aircraft-grade',      accent: 'aluminum',            color: 'var(--accent-purple)'  },
  { tag: 'Personalization',   heading: 'Your chair,',         accent: 'your rules',          color: 'var(--accent-amber)'   },
  { tag: 'Next Generation',   heading: 'Redesigned from',     accent: 'the ground up',       color: 'var(--accent-emerald)' },
  { tag: 'Comfort Science',   heading: 'Feels like',          accent: 'floating',            color: 'var(--accent-rose)'    },
]

const BODIES = [
  'Showcasing your 3D GLB chair model lit with Cartier\'s warm key spotlights, teal wall panel reflections, and cinematic post-processing.',
  'Precision-engineered lumbar support and 4D armrests adapt to every posture, keeping you comfortable through even the longest sessions.',
  'Cold-forged aluminum alloy base paired with breathable mesh ensures durability that outlasts the competition — and looks stunning doing it.',
  'Infinite adjustment points, 12 color variants, and modular components make this chair a true extension of your personality.',
  'A completely rethought silhouette — lighter, more breathable, and engineered for the next decade of work.',
  'Adaptive foam layers and dynamic recline technology distribute your weight perfectly — no pressure points, ever.',
]

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const scrollRef = useRef(null)

  // HUD Control States
  const [materialPreset, setMaterialPreset] = useState('gold')
  const [lightsConfig, setLightsConfig] = useState({
    keySpot: true,
    tealPanels: true,
    rimLight: true
  })
  const [postConfig, setPostConfig] = useState({
    bloom: true,
    vignette: true,
    noise: true
  })

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
      {/* Sticky 3D Viewport */}
      <div style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', zIndex: 1 }}>
        <Suspense fallback={null}>
          <Experience3D
            scrollProgress={scrollProgress}
            materialPreset={materialPreset}
            lightsConfig={lightsConfig}
            postConfig={postConfig}
          />
        </Suspense>
      </div>

      {/* Floating Cartier Luxury Control HUD */}
      <ControlsHUD
        materialPreset={materialPreset}
        setMaterialPreset={setMaterialPreset}
        lightsConfig={lightsConfig}
        setLightsConfig={setLightsConfig}
        postConfig={postConfig}
        setPostConfig={setPostConfig}
      />

      {/* Scroll-driving content sections */}
      <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
        {SECTIONS.map((s, i) => (
          <section key={i} className="scroll-section" style={{ pointerEvents: 'none' }}>
            <div className="scroll-section-inner" style={{ pointerEvents: 'auto' }}>
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
