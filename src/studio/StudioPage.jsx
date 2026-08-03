import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { PROJECTS, CATEGORIES } from './data/projects.js'
import './StudioPage.css'

// ─── Constants ────────────────────────────────────────────────────────────────
// CURL_LINE_Y must stay in sync with perspective-origin Y in StudioPage.css
const NUM_BANDS    = 40
const CURL_LINE_Y  = 180   // px from viewport top — fold happens here
const CURL_SPAN    = 140   // px of scroll to complete 0→90° quarter-turn
const MAX_ANGLE    = 90
const FLIP_SPAN    = 60    // px to finish 90→180° (flat/mirrored, faces viewer again)
const RECEDE_SPAN  = 160   // px to reach full Z recession
const MAX_DEPTH    = 260   // px back in Z (creates "going away" depth)
const DESCEND_RATE = 0.85  // screen-space descent px per extra px of scroll
const MAX_DESCEND  = 900
const FADE_START   = 550   // descent px at which bands begin dimming
const MIN_OPACITY  = 0.35  // stays visible — "through gaps" effect
const EASE         = 0.09  // lerp smoothing factor

// ─── HTML generators ──────────────────────────────────────────────────────────
function cardHTML(p) {
  return `<article class="studio-card" aria-label="${p.name}">
  <a href="${p.link}" class="studio-card__link" aria-label="View ${p.name} project">
    <div class="studio-card__media">
      <img src="${p.image}" alt="${p.name}" class="studio-card__img"
        crossorigin="anonymous" loading="eager" />
      <div class="studio-card__overlay">
        <span class="studio-card__view">View Project ↗</span>
      </div>
    </div>
    <div class="studio-card__info">
      <span class="studio-card__category">${p.category}</span>
      <h3 class="studio-card__name">${p.name}</h3>
      <p class="studio-card__subtitle">${p.subtitle}</p>
      <span class="studio-card__year">${p.year}</span>
    </div>
  </a>
</article>`
}

function rowHTMLStr(pair) {
  return `<div class="row-source">${pair.map(cardHTML).join('')}</div>`
}

// ─── Band builder ─────────────────────────────────────────────────────────────
// Slices each 2-card row into NUM_BANDS horizontal strips.
// Each strip shows only its portion of the full row via overflow:hidden + negative top offset.
// JS then drives each band's rotateX / translateZ / translateY per frame.
function buildCurlRows(gridEl, projects) {
  gridEl.innerHTML = ''
  const wrappers = []

  for (let i = 0; i < projects.length; i += 2) {
    const pair = projects.slice(i, i + 2)
    const html = rowHTMLStr(pair)

    // Off-screen probe: measure natural row height at the correct content width
    const contentW = Math.max((gridEl.offsetWidth || window.innerWidth) - 96, 300)
    const probe = document.createElement('div')
    probe.style.cssText =
      `position:absolute;visibility:hidden;left:-9999px;top:-9999px;width:${contentW}px;`
    probe.innerHTML = html
    document.body.appendChild(probe)
    const rowH = probe.firstElementChild?.offsetHeight || 400
    document.body.removeChild(probe)

    const bandH = rowH / NUM_BANDS

    const wrapper = document.createElement('div')
    wrapper.className = 'row-curl'
    wrapper.style.height = rowH + 'px'

    const bands = []
    for (let b = 0; b < NUM_BANDS; b++) {
      const band = document.createElement('div')
      band.className = 'band'
      band.style.height = bandH + 'px'

      const inner = document.createElement('div')
      inner.className = 'band-inner'
      inner.style.top    = (-b * bandH) + 'px'
      inner.style.height = rowH + 'px'
      inner.innerHTML    = html

      band.appendChild(inner)
      wrapper.appendChild(band)
      bands.push(band)
    }

    gridEl.appendChild(wrapper)
    wrappers.push({ el: wrapper, bands, rowH, bandH })
  }

  return wrappers
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StudioPage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const headerRef    = useRef(null)
  const filterBarRef = useRef(null)
  const trackRef     = useRef(null)
  const gridRef      = useRef(null)

  // Non-state refs — mutated every frame without triggering re-renders
  const rowWrappersRef = useRef([])
  const scrollRef      = useRef({ current: 0, target: 0 })
  const rafRef         = useRef(null)

  // ── Lock native scroll — we own it via wheel/touch + lerp ────────────────
  useLayoutEffect(() => {
    const root = document.getElementById('root')
    const saved = {
      html:  document.documentElement.style.overflow,
      body:  document.body.style.overflow,
      root:  root?.style.overflow ?? '',
      rootH: root?.style.height   ?? '',
    }
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow            = 'hidden'
    if (root) { root.style.overflow = 'hidden'; root.style.height = '100vh' }

    return () => {
      document.documentElement.style.overflow = saved.html
      document.body.style.overflow            = saved.body
      if (root) { root.style.overflow = saved.root; root.style.height = saved.rootH }
    }
  }, [])

  // ── Input events + RAF render loop (mount only) ──────────────────────────
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    // Entrance animation for the fixed UI panels
    gsap.fromTo(
      [headerRef.current, filterBarRef.current],
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out' }
    )

    // Max scrollable distance — recalculated each frame so it stays current
    const getMax = () => Math.max(0, track.scrollHeight - window.innerHeight + 200)

    // Wheel
    const onWheel = (e) => {
      e.preventDefault()
      const s = scrollRef.current
      s.target = Math.max(0, Math.min(s.target + e.deltaY, getMax()))
    }

    // Touch
    let touchY = 0
    const onTouchStart = (e) => { touchY = e.touches[0].clientY }
    const onTouchMove  = (e) => {
      const dy = touchY - e.touches[0].clientY
      touchY   = e.touches[0].clientY
      const s  = scrollRef.current
      s.target = Math.max(0, Math.min(s.target + dy * 2, getMax()))
    }

    window.addEventListener('wheel',      onWheel,      { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true  })
    window.addEventListener('touchmove',  onTouchMove,  { passive: true  })

    // ── Per-frame: lerp + curl math ─────────────────────────────────────────
    function frame() {
      const s    = scrollRef.current
      s.current += (s.target - s.current) * EASE
      const vel  = s.target - s.current
      // Velocity skew — subtle lean during fast scroll
      const skew = Math.max(-4, Math.min(4, vel * 0.03))

      track.style.transform = `translateY(${-s.current}px) skewY(${skew}deg)`

      rowWrappersRef.current.forEach(({ el, bands, bandH }) => {
        const rowTop = el.getBoundingClientRect().top

        bands.forEach((band, i) => {
          const bandTop = rowTop + i * bandH
          // dist > 0 once this band's top has crossed above the fold line
          const dist = CURL_LINE_Y - bandTop

          if (dist > 0) {
            // ── Phase 1: 0→90° quarter-turn ────────────────────────────────
            const t      = Math.min(dist / CURL_SPAN, 1)
            const angle1 = t * MAX_ANGLE
            const z1     = -t * 40
            const over   = Math.max(0, dist - CURL_SPAN)

            // ── Phase 2: 90→180° (face-forward again, mirrored) + Z recession
            const flipT  = Math.min(over / FLIP_SPAN, 1)
            const angle2 = angle1 + flipT * (180 - MAX_ANGLE)
            const receT  = Math.min(over / RECEDE_SPAN, 1)
            const z2     = z1 - receT * (MAX_DEPTH - 40)

            // ── Phase 3: screen-space descent ──────────────────────────────
            // Independent of rotation/Z — this is what lets folded content
            // slide away visibly through the gaps between current rows.
            const descSrc = Math.max(0, over - FLIP_SPAN)
            const downY   = Math.min(descSrc * DESCEND_RATE, MAX_DESCEND)
            const fadeT   = Math.max(0, Math.min(
              (downY - FADE_START) / (MAX_DESCEND - FADE_START), 1
            ))

            band.style.transform =
              `translateY(${downY}px) rotateX(${angle2}deg) translateZ(${z2}px)`
            // MIN_OPACITY (0.35) keeps receded content dimly visible — not invisible
            band.style.opacity = downY > 0
              ? String(1 - fadeT * (1 - MIN_OPACITY))
              : '1'
          } else {
            band.style.transform = 'none'
            band.style.opacity   = '1'
          }
        })
      })

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)

    return () => {
      window.removeEventListener('wheel',      onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove',  onTouchMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, []) // mount only — RAF loop lives for page lifetime

  // ── Rebuild bands when category filter changes ───────────────────────────
  useEffect(() => {
    const gridEl = gridRef.current
    if (!gridEl) return

    // Reset scroll position on category change
    scrollRef.current.target  = 0
    scrollRef.current.current = 0
    if (trackRef.current) trackRef.current.style.transform = 'none'

    const list = activeCategory === 'All'
      ? PROJECTS
      : PROJECTS.filter(p => p.category === activeCategory)

    rowWrappersRef.current = buildCurlRows(gridEl, list)
  }, [activeCategory])

  const visibleCount = activeCategory === 'All'
    ? PROJECTS.length
    : PROJECTS.filter(p => p.category === activeCategory).length

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="studio-page">

      {/* ── Compact fixed nav bar ────────────────────────────────────────── */}
      <header className="studio-header" ref={headerRef}>
        <nav className="studio-nav">
          <a href="#/" className="studio-nav__back" aria-label="Back to home">
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Home
          </a>

          <div className="studio-nav__logo">
            <span className="studio-nav__dot" aria-hidden="true" />
            STUDIO◎
          </div>

          <div className="studio-nav__links">
            <a href="#/unseen" style={{ color: '#38bdf8', fontWeight: 600 }}>WebGL Curl ↗</a>
            <a href="#contact">Contact</a>
          </div>
        </nav>
      </header>

      {/* ── Filter bar (title + category tabs) ───────────────────────────── */}
      <div className="studio-filter-bar" ref={filterBarRef}>
        <div className="studio-filter-bar__inner">
          <div className="studio-filter-bar__left">
            <h1 className="studio-filter-bar__title">Selected Work</h1>
            <span className="studio-filter-bar__count">{visibleCount} projects</span>
          </div>

          <div
            className="studio-filters__tabs"
            role="tablist"
            aria-label="Filter by category"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`studio-filter__btn${activeCategory === cat ? ' active' : ''}`}
                data-category={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={(e) => {
                  setActiveCategory(cat)
                  // Elastic bounce on active tab
                  gsap.fromTo(
                    e.currentTarget,
                    { scale: 0.88 },
                    { scale: 1, duration: 0.4, ease: 'elastic.out(1.2, 0.5)' }
                  )
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3D perspective viewport ───────────────────────────────────────── */}
      {/* perspective-origin Y = CURL_LINE_Y = 180px (keep in sync with CSS) */}
      <div id="studio-viewport">
        <div id="studio-track" ref={trackRef}>

          {/* Grid — .row-curl band wrappers injected here by buildCurlRows */}
          <div className="studio-grid" ref={gridRef} />

          {/* Footer travels with the track so it scrolls naturally */}
          <footer className="studio-footer" id="contact">
            <div className="studio-footer__inner">
              <div className="studio-footer__left">
                <p className="studio-footer__tagline">
                  Let's build something remarkable.
                </p>
                <a href="mailto:hello@studio.io" className="studio-footer__email">
                  hello@studio.io
                </a>
              </div>
              <div className="studio-footer__right">
                <p className="studio-footer__copy">
                  © 2024 Studio. All rights reserved.
                </p>
              </div>
            </div>
          </footer>

        </div>
      </div>

    </div>
  )
}
