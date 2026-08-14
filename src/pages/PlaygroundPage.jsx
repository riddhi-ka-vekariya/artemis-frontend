import React, { useState, useCallback, useRef, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'

/* ────────────────────────────────────────────────────────────────────
   DESIGN PLAYGROUND — Temporary page for color & font exploration.
   • 100% self-contained: inline styles only, no shared CSS classes.
   • Route: /#/playground  (no navbar link)
   • Safe to delete: removing this file + its route = full cleanup.
   ──────────────────────────────────────────────────────────────────── */

// ── Defaults (mirror current design system) ──────────────────────────
const DEFAULTS = {
  gold: '#F0C42D',
  background: '#141210',
  paper: '#F2F2F2',
  silver: '#C2C2C2',
  fontDisplay: "'Newsreader', Georgia, serif",
  fontBody: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono: "'IBM Plex Mono', 'Courier New', monospace",
}

// ── Font options ─────────────────────────────────────────────────────
const DISPLAY_FONTS = [
  { label: 'Newsreader (current)', value: "'Newsreader', Georgia, serif", google: 'Newsreader:ital,wght@0,400;0,500;1,400' },
  { label: 'Playfair Display', value: "'Playfair Display', Georgia, serif", google: 'Playfair+Display:ital,wght@0,400;0,500;1,400' },
  { label: 'Cormorant Garamond', value: "'Cormorant Garamond', Georgia, serif", google: 'Cormorant+Garamond:ital,wght@0,400;0,500;1,400' },
  { label: 'Source Serif 4', value: "'Source Serif 4', Georgia, serif", google: 'Source+Serif+4:ital,wght@0,400;0,500;1,400' },
  { label: 'DM Serif Display', value: "'DM Serif Display', Georgia, serif", google: 'DM+Serif+Display:ital@0;1' },
]

const BODY_FONTS = [
  { label: 'Inter (current)', value: "'Inter', sans-serif", google: 'Inter:wght@400;500' },
  { label: 'Neue Montreal*', value: "'Inter', sans-serif", google: null, note: '(commercial — Inter shown as proxy)' },
  { label: 'General Sans*', value: "'Inter', sans-serif", google: null, note: '(commercial — Inter shown as proxy)' },
  { label: 'DM Sans', value: "'DM Sans', sans-serif", google: 'DM+Sans:wght@400;500' },
  { label: 'Outfit', value: "'Outfit', sans-serif", google: 'Outfit:wght@400;500' },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif", google: 'Space+Grotesk:wght@400;500' },
]

const MONO_FONTS = [
  { label: 'IBM Plex Mono (current)', value: "'IBM Plex Mono', monospace", google: 'IBM+Plex+Mono:wght@400;500' },
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace", google: 'JetBrains+Mono:wght@400;500' },
  { label: 'Fira Code', value: "'Fira Code', monospace", google: 'Fira+Code:wght@400;500' },
  { label: 'Space Mono', value: "'Space Mono', monospace", google: 'Space+Mono:wght@400' },
  { label: 'Source Code Pro', value: "'Source Code Pro', monospace", google: 'Source+Code+Pro:wght@400;500' },
]

// ── Dynamically load Google Fonts ────────────────────────────────────
const loadedFonts = new Set()
function ensureFontLoaded(googleParam) {
  if (!googleParam || loadedFonts.has(googleParam)) return
  loadedFonts.add(googleParam)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${googleParam}&display=swap`
  document.head.appendChild(link)
}

// Preload all font options on mount
function preloadAllFonts() {
  ;[...DISPLAY_FONTS, ...BODY_FONTS, ...MONO_FONTS].forEach((f) => {
    if (f.google) ensureFontLoaded(f.google)
  })
}

export default function PlaygroundPage() {
  const [colors, setColors] = useState({
    gold: DEFAULTS.gold,
    background: DEFAULTS.background,
    paper: DEFAULTS.paper,
    silver: DEFAULTS.silver,
  })

  const [fonts, setFonts] = useState({
    display: DEFAULTS.fontDisplay,
    body: DEFAULTS.fontBody,
    mono: DEFAULTS.fontMono,
  })

  // Preload fonts once
  React.useEffect(() => { preloadAllFonts() }, [])

  const resetColors = useCallback(() => {
    setColors({ gold: DEFAULTS.gold, background: DEFAULTS.background, paper: DEFAULTS.paper, silver: DEFAULTS.silver })
  }, [])

  const resetFonts = useCallback(() => {
    setFonts({ display: DEFAULTS.fontDisplay, body: DEFAULTS.fontBody, mono: DEFAULTS.fontMono })
  }, [])

  const resetAll = useCallback(() => { resetColors(); resetFonts() }, [resetColors, resetFonts])

  const updateColor = (key, value) => setColors((c) => ({ ...c, [key]: value }))
  const updateFont = (key, value) => setFonts((f) => ({ ...f, [key]: value }))

  // ── Color picker popover state ─────────────────────────────────────
  const [openPicker, setOpenPicker] = useState(null)   // which colorKey is open
  const [stagedColor, setStagedColor] = useState('')    // color being previewed in popover
  const [stagedHex, setStagedHex] = useState('')        // hex text input value
  const pickerRef = useRef(null)

  // Close popover on outside click
  useEffect(() => {
    if (!openPicker) return
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setOpenPicker(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openPicker])

  const openColorPicker = (colorKey) => {
    const current = colors[colorKey]
    setOpenPicker(colorKey)
    setStagedColor(current)
    setStagedHex(current)
  }

  const applyColor = () => {
    if (openPicker) {
      updateColor(openPicker, stagedColor)
      setOpenPicker(null)
    }
  }

  // ── Copy to clipboard helpers ──────────────────────────────────────
  const [copyFeedback, setCopyFeedback] = useState(null)  // 'colors' | 'fonts' | null

  const copyColors = useCallback(() => {
    const text = [
      `--color-gold: ${colors.gold};`,
      `--color-ink: ${colors.background};`,
      `--color-ink-deep: ${colors.background};`,
      `--color-paper: ${colors.paper};`,
      `--color-silver: ${colors.silver};`,
    ].join('\n')
    navigator.clipboard.writeText(text)
    setCopyFeedback('colors')
    setTimeout(() => setCopyFeedback(null), 1500)
  }, [colors])

  const copyFonts = useCallback(() => {
    const text = [
      `--font-display: ${fonts.display};`,
      `--font-body: ${fonts.body};`,
      `--font-mono: ${fonts.mono};`,
    ].join('\n')
    navigator.clipboard.writeText(text)
    setCopyFeedback('fonts')
    setTimeout(() => setCopyFeedback(null), 1500)
  }, [fonts])

  // ── Derived colors ─────────────────────────────────────────────────
  const goldDim = colors.gold + '44'
  const borderHairline = colors.silver + '14'
  const textMuted = colors.silver + '73'

  // ── Shared inline style helpers ────────────────────────────────────
  const s = {
    page: {
      minHeight: '100vh',
      background: colors.background,
      color: colors.paper,
      fontFamily: fonts.body,
      fontSize: 16,
      lineHeight: 1.65,
      padding: '40px 48px 80px',
      overflowX: 'hidden',
    },
    maxWrap: {
      maxWidth: 1200,
      margin: '0 auto',
    },
    topBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 48,
      paddingBottom: 24,
      borderBottom: `1px solid ${borderHairline}`,
    },
    pageTitle: {
      fontFamily: fonts.display,
      fontSize: 28,
      fontWeight: 400,
      letterSpacing: '-0.01em',
      color: colors.paper,
      margin: 0,
    },
    pageTitleAccent: {
      fontStyle: 'italic',
      color: colors.gold,
    },
    resetAllBtn: {
      padding: '10px 24px',
      background: 'transparent',
      border: `1px solid ${colors.gold}`,
      borderRadius: 2,
      color: colors.gold,
      fontFamily: fonts.mono,
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
    },
    twoCol: {
      display: 'grid',
      gridTemplateColumns: '340px 1fr',
      gap: 48,
      alignItems: 'start',
    },
    controlPanel: {
      position: 'sticky',
      top: 40,
      display: 'flex',
      flexDirection: 'column',
      gap: 32,
      padding: 28,
      background: colors.background,
      border: `1px solid ${borderHairline}`,
      borderRadius: 4,
    },
    panelHeading: {
      fontFamily: fonts.mono,
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: colors.gold,
      margin: 0,
      paddingBottom: 12,
      borderBottom: `1px solid ${goldDim}`,
    },
    colorRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
      position: 'relative',
    },
    colorSwatch: (bg) => ({
      width: 36,
      height: 36,
      borderRadius: 4,
      border: `1px solid ${borderHairline}`,
      cursor: 'pointer',
      flexShrink: 0,
      background: bg,
      transition: 'box-shadow 0.2s ease',
    }),
    colorLabel: {
      fontFamily: fonts.mono,
      fontSize: 12,
      letterSpacing: '0.06em',
      color: colors.silver,
      flex: 1,
      cursor: 'pointer',
    },
    colorHex: {
      fontFamily: fonts.mono,
      fontSize: 11,
      color: textMuted,
      minWidth: 60,
      textAlign: 'right',
    },
    pickerPopover: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 8,
      background: colors.background,
      border: `1px solid ${colors.gold}33`,
      borderRadius: 6,
      padding: 16,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      boxShadow: `0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px ${colors.gold}11`,
      width: 240,
    },
    pickerHexInput: {
      width: '100%',
      padding: '8px 10px',
      background: 'transparent',
      border: `1px solid ${borderHairline}`,
      borderRadius: 4,
      color: colors.paper,
      fontFamily: fonts.mono,
      fontSize: 13,
      letterSpacing: '0.04em',
      outline: 'none',
      boxSizing: 'border-box',
    },
    pickerApplyBtn: {
      padding: '8px 0',
      background: colors.gold,
      border: 'none',
      borderRadius: 3,
      color: colors.background,
      fontFamily: fonts.mono,
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'opacity 0.2s ease',
    },
    btnRow: {
      display: 'flex',
      gap: 8,
      marginTop: 4,
    },
    fontSelect: {
      width: '100%',
      padding: '10px 12px',
      background: colors.background,
      border: `1px solid ${borderHairline}`,
      borderRadius: 4,
      color: colors.paper,
      fontFamily: fonts.body,
      fontSize: 14,
      marginBottom: 12,
      cursor: 'pointer',
      outline: 'none',
    },
    fontLabel: {
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: colors.silver,
      marginBottom: 6,
      display: 'block',
    },
    resetBtn: {
      padding: '8px 16px',
      background: 'transparent',
      border: `1px solid ${colors.silver}33`,
      borderRadius: 2,
      color: colors.silver,
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      marginTop: 4,
      transition: 'all 0.25s ease',
    },
    // ── Preview section ──────────────────────────────────────────────
    previewSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: 48,
    },
    sectionNumeral: {
      fontFamily: fonts.mono,
      fontSize: 13,
      fontWeight: 500,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: colors.gold,
      opacity: 0.7,
      marginBottom: 8,
    },
    goldLine: {
      width: 48,
      height: 1,
      background: colors.gold,
      opacity: 0.5,
      marginBottom: 16,
    },
    heroHeading: {
      fontFamily: fonts.display,
      fontSize: 'clamp(40px, 5vw, 72px)',
      fontWeight: 400,
      letterSpacing: '-0.01em',
      lineHeight: 1.0,
      color: colors.paper,
      margin: '0 0 16px',
    },
    heroAccent: {
      fontStyle: 'italic',
      color: colors.gold,
    },
    sectionHeading: {
      fontFamily: fonts.display,
      fontSize: 36,
      fontWeight: 500,
      letterSpacing: '-0.01em',
      lineHeight: 1.05,
      color: colors.paper,
      margin: '0 0 12px',
    },
    subheading: {
      fontFamily: fonts.body,
      fontSize: 19,
      fontWeight: 500,
      lineHeight: 1.4,
      color: colors.paper,
      margin: '0 0 8px',
    },
    bodyText: {
      fontFamily: fonts.body,
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.65,
      color: colors.silver,
      maxWidth: 600,
      margin: '0 0 20px',
    },
    monoCaption: {
      fontFamily: fonts.mono,
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: colors.silver,
      opacity: 0.6,
    },
    cardsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 20,
      marginTop: 8,
    },
    card: {
      background: colors.background,
      border: `1px solid ${borderHairline}`,
      borderRadius: 3,
      padding: 28,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },
    cardPaper: {
      background: colors.paper,
      border: `1px solid ${borderHairline}`,
      borderRadius: 3,
      padding: 28,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },
    cardTitle: {
      fontFamily: fonts.display,
      fontSize: 20,
      fontWeight: 500,
      color: colors.paper,
      margin: 0,
    },
    cardTitleDark: {
      fontFamily: fonts.display,
      fontSize: 20,
      fontWeight: 500,
      color: colors.background,
      margin: 0,
    },
    cardBody: {
      fontFamily: fonts.body,
      fontSize: 15,
      lineHeight: 1.65,
      color: colors.silver,
      margin: 0,
    },
    cardBodyDark: {
      fontFamily: fonts.body,
      fontSize: 15,
      lineHeight: 1.65,
      color: colors.silver,
      margin: 0,
    },
    cardLabel: {
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: colors.gold,
    },
    cardLabelDark: {
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: colors.gold,
    },
    primaryBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 14,
      padding: '16px 36px',
      background: 'transparent',
      border: `1px solid ${colors.gold}`,
      borderRadius: 2,
      color: colors.paper,
      fontFamily: fonts.display,
      fontSize: 17,
      fontWeight: 500,
      letterSpacing: '0.02em',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
    },
    primaryBtnArrow: {
      color: colors.gold,
      fontSize: 18,
    },

    textLink: {
      color: colors.gold,
      textDecoration: 'none',
      fontFamily: fonts.body,
      fontSize: 16,
      fontWeight: 500,
      borderBottom: `1px solid transparent`,
      transition: 'border-color 0.2s ease',
      cursor: 'pointer',
    },
    dividerLine: {
      width: '100%',
      height: 1,
      background: borderHairline,
      margin: '8px 0',
    },
    statBlock: {
      display: 'flex',
      gap: 48,
      marginTop: 8,
    },
    statItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    },
    statNumber: {
      fontFamily: fonts.mono,
      fontSize: 32,
      fontWeight: 500,
      color: colors.gold,
      lineHeight: 1,
    },
    statLabel: {
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: colors.silver,
      opacity: 0.6,
    },
    navPreview: {
      display: 'flex',
      gap: 32,
      padding: '16px 0',
      borderBottom: `1px solid ${borderHairline}`,
      marginBottom: 8,
    },
    navItem: (active) => ({
      fontFamily: fonts.mono,
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: active ? colors.gold : colors.silver,
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'color 0.2s ease',
    }),
  }

  // ── Color picker helper (with popover) ─────────────────────────────
  const ColorPicker = ({ label, colorKey }) => {
    const isOpen = openPicker === colorKey
    return (
      <div style={s.colorRow}>
        <div
          style={s.colorSwatch(colors[colorKey])}
          onClick={() => openColorPicker(colorKey)}
        />
        <span style={s.colorLabel} onClick={() => openColorPicker(colorKey)}>{label}</span>
        <span style={s.colorHex}>{colors[colorKey].toUpperCase()}</span>

        {isOpen && (
          <div ref={pickerRef} style={s.pickerPopover}>
            {/* react-colorful picker */}
            <div style={{ width: '100%' }}>
              <HexColorPicker color={stagedColor} onChange={(c) => { setStagedColor(c); setStagedHex(c) }} style={{ width: '100%' }} />
            </div>
            {/* Hex text input */}
            <input
              type="text"
              value={stagedHex.toUpperCase()}
              onChange={(e) => {
                const v = e.target.value
                setStagedHex(v)
                if (/^#[0-9A-Fa-f]{6}$/.test(v)) setStagedColor(v)
              }}
              style={s.pickerHexInput}
              placeholder="#FFFFFF"
              maxLength={7}
            />
            {/* Live preview swatch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: 3, background: colors[colorKey], border: `1px solid ${borderHairline}` }} />
              <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.silver, opacity: 0.5 }}>CURRENT</span>
              <span style={{ fontFamily: fonts.mono, fontSize: 14, color: colors.silver, margin: '0 4px' }}>→</span>
              <div style={{ width: 20, height: 20, borderRadius: 3, background: stagedColor, border: `1px solid ${borderHairline}` }} />
              <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.gold, opacity: 0.7 }}>NEW</span>
            </div>
            <button
              style={s.pickerApplyBtn}
              onClick={applyColor}
              onMouseEnter={(e) => { e.target.style.opacity = '0.85' }}
              onMouseLeave={(e) => { e.target.style.opacity = '1' }}
            >
              Apply
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Font select helper ─────────────────────────────────────────────
  const FontSelect = ({ label, fontKey, options }) => (
    <div style={{ marginBottom: 8 }}>
      <span style={s.fontLabel}>{label}</span>
      <select
        value={fonts[fontKey]}
        onChange={(e) => updateFont(fontKey, e.target.value)}
        style={s.fontSelect}
      >
        {options.map((f) => (
          <option key={f.label} value={f.value}>
            {f.label}{f.note ? ` ${f.note}` : ''}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.maxWrap}>
        {/* ── Top bar ─────────────────────────────────────────────── */}
        <div style={s.topBar}>
          <h1 style={s.pageTitle}>
            Design <span style={s.pageTitleAccent}>Playground</span>
          </h1>
          <button
            style={s.resetAllBtn}
            onClick={resetAll}
            onMouseEnter={(e) => { e.target.style.background = colors.gold; e.target.style.color = colors.background }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = colors.gold }}
          >
            Reset All
          </button>
        </div>

        {/* ── Two-column layout ───────────────────────────────────── */}
        <div style={s.twoCol}>

          {/* ── LEFT: Controls ────────────────────────────────────── */}
          <aside style={s.controlPanel}>

            {/* Colors */}
            <div>
              <h2 style={s.panelHeading}>Colors</h2>
              <div style={{ marginTop: 16 }}>
                <ColorPicker label="Gold (accent)" colorKey="gold" />
                <ColorPicker label="Background" colorKey="background" />
                <ColorPicker label="Paper (text)" colorKey="paper" />
                <ColorPicker label="Silver (secondary)" colorKey="silver" />
              </div>
              <div style={s.btnRow}>
                <button
                  style={s.resetBtn}
                  onClick={resetColors}
                  onMouseEnter={(e) => { e.target.style.borderColor = colors.gold; e.target.style.color = colors.gold }}
                  onMouseLeave={(e) => { e.target.style.borderColor = `${colors.silver}33`; e.target.style.color = colors.silver }}
                >
                  Reset
                </button>
                <button
                  style={{ ...s.resetBtn, borderColor: `${colors.gold}33`, color: copyFeedback === 'colors' ? colors.gold : colors.silver }}
                  onClick={copyColors}
                  onMouseEnter={(e) => { e.target.style.borderColor = colors.gold; e.target.style.color = colors.gold }}
                  onMouseLeave={(e) => { e.target.style.borderColor = `${colors.gold}33`; e.target.style.color = copyFeedback === 'colors' ? colors.gold : colors.silver }}
                >
                  {copyFeedback === 'colors' ? '✓ Copied' : 'Copy Values'}
                </button>
              </div>
            </div>

            <div style={s.dividerLine} />

            {/* Fonts */}
            <div>
              <h2 style={s.panelHeading}>Fonts</h2>
              <div style={{ marginTop: 16 }}>
                <FontSelect label="Display (headings)" fontKey="display" options={DISPLAY_FONTS} />
                <FontSelect label="Body (paragraphs)" fontKey="body" options={BODY_FONTS} />
                <FontSelect label="Mono (numerals, labels)" fontKey="mono" options={MONO_FONTS} />
              </div>
              <div style={s.btnRow}>
                <button
                  style={s.resetBtn}
                  onClick={resetFonts}
                  onMouseEnter={(e) => { e.target.style.borderColor = colors.gold; e.target.style.color = colors.gold }}
                  onMouseLeave={(e) => { e.target.style.borderColor = `${colors.silver}33`; e.target.style.color = colors.silver }}
                >
                  Reset
                </button>
                <button
                  style={{ ...s.resetBtn, borderColor: `${colors.gold}33`, color: copyFeedback === 'fonts' ? colors.gold : colors.silver }}
                  onClick={copyFonts}
                  onMouseEnter={(e) => { e.target.style.borderColor = colors.gold; e.target.style.color = colors.gold }}
                  onMouseLeave={(e) => { e.target.style.borderColor = `${colors.gold}33`; e.target.style.color = copyFeedback === 'fonts' ? colors.gold : colors.silver }}
                >
                  {copyFeedback === 'fonts' ? '✓ Copied' : 'Copy Values'}
                </button>
              </div>
            </div>
          </aside>

          {/* ── RIGHT: Live Preview ───────────────────────────────── */}
          <div style={s.previewSection}>

            {/* Nav preview */}
            <div>
              <span style={s.sectionNumeral}>Navigation Preview</span>
              <div style={s.navPreview}>
                <span style={s.navItem(true)}>Home</span>
                <span style={s.navItem(false)}>Projects</span>
                <span style={s.navItem(false)}>Philosophy</span>
                <span style={s.navItem(false)}>About</span>
              </div>
            </div>

            {/* Hero */}
            <div>
              <span style={s.sectionNumeral}>01 — Hero Display</span>
              <div style={s.goldLine} />
              <h2 style={s.heroHeading}>
                Designing the <span style={s.heroAccent}>invisible</span>.
              </h2>
              <p style={s.bodyText}>
                The best interfaces disappear — they let intention flow directly into
                action. Every decision here serves that principle: restraint over decoration,
                clarity over cleverness.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  style={s.primaryBtn}
                  onMouseEnter={(e) => { e.target.style.background = colors.gold; e.target.style.color = colors.background }}
                  onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = colors.paper }}
                >
                  View Projects <span style={s.primaryBtnArrow}>→</span>
                </button>

              </div>
            </div>

            <div style={s.dividerLine} />

            {/* Stats */}
            <div>
              <span style={s.sectionNumeral}>02 — Statistics Block</span>
              <div style={s.goldLine} />
              <div style={s.statBlock}>
                <div style={s.statItem}>
                  <span style={s.statNumber}>47</span>
                  <span style={s.statLabel}>Projects</span>
                </div>
                <div style={s.statItem}>
                  <span style={s.statNumber}>12</span>
                  <span style={s.statLabel}>Clients</span>
                </div>
                <div style={s.statItem}>
                  <span style={s.statNumber}>03</span>
                  <span style={s.statLabel}>Awards</span>
                </div>
                <div style={s.statItem}>
                  <span style={s.statNumber}>8+</span>
                  <span style={s.statLabel}>Years</span>
                </div>
              </div>
            </div>

            <div style={s.dividerLine} />

            {/* Section heading + body */}
            <div>
              <span style={s.sectionNumeral}>03 — Section Content</span>
              <div style={s.goldLine} />
              <h3 style={s.sectionHeading}>
                Where craft meets <span style={s.heroAccent}>intention</span>
              </h3>
              <h4 style={s.subheading}>
                Every pixel serves a purpose — nothing is decorative by accident.
              </h4>
              <p style={s.bodyText}>
                From colour theory to typographic rhythm, each layer of the system
                is calibrated to create an experience that feels considered and
                quietly luxurious. The dark canvas isn't merely aesthetic — it's
                functional, reducing distraction and foregrounding content.
              </p>
              <span style={s.monoCaption}>Scroll to explore ↓</span>
            </div>

            <div style={s.dividerLine} />

            {/* Cards */}
            <div>
              <span style={s.sectionNumeral}>04 — Cards</span>
              <div style={s.goldLine} />

              {/* Dark cards */}
              <h4 style={{ ...s.subheading, marginBottom: 16 }}>Dark surface cards</h4>
              <div style={s.cardsRow}>
                <div style={s.card}>
                  <span style={s.cardLabel}>Featured</span>
                  <h5 style={s.cardTitle}>Project Alpha</h5>
                  <p style={s.cardBody}>
                    A complete brand identity system for a next-gen fintech startup.
                  </p>
                </div>
                <div style={s.card}>
                  <span style={s.cardLabel}>Case Study</span>
                  <h5 style={s.cardTitle}>Visual System</h5>
                  <p style={s.cardBody}>
                    Designing a unified component language across web and mobile.
                  </p>
                </div>
                <div style={s.card}>
                  <span style={s.cardLabel}>Exploration</span>
                  <h5 style={s.cardTitle}>Motion Design</h5>
                  <p style={s.cardBody}>
                    Micro-interactions and transition choreography for a SaaS product.
                  </p>
                </div>
              </div>

              {/* Light card */}
              <h4 style={{ ...s.subheading, marginTop: 32, marginBottom: 16 }}>Paper surface card (rare)</h4>
              <div style={{ maxWidth: 340 }}>
                <div style={s.cardPaper}>
                  <span style={s.cardLabelDark}>Highlight</span>
                  <h5 style={s.cardTitleDark}>About the Process</h5>
                  <p style={s.cardBodyDark}>
                    Light surfaces are deliberate — reserved for moments that need contrast.
                  </p>
                </div>
              </div>
            </div>

            <div style={s.dividerLine} />

            {/* Buttons & Links */}
            <div>
              <span style={s.sectionNumeral}>05 — Buttons & Links</span>
              <div style={s.goldLine} />
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
                <button
                  style={s.primaryBtn}
                  onMouseEnter={(e) => { e.target.style.background = colors.gold; e.target.style.color = colors.background }}
                  onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = colors.paper }}
                >
                  Primary CTA <span style={s.primaryBtnArrow}>→</span>
                </button>

                <span
                  style={s.textLink}
                  onMouseEnter={(e) => { e.target.style.borderBottomColor = colors.gold }}
                  onMouseLeave={(e) => { e.target.style.borderBottomColor = 'transparent' }}
                >
                  Text link with hover →
                </span>
              </div>
            </div>

            <div style={s.dividerLine} />

            {/* Type specimen */}
            <div>
              <span style={s.sectionNumeral}>06 — Type Specimen</span>
              <div style={s.goldLine} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <span style={s.monoCaption}>Display — {fonts.display.split("'")[1]}</span>
                  <p style={{ fontFamily: fonts.display, fontSize: 48, fontWeight: 400, color: colors.paper, margin: '8px 0 0', lineHeight: 1.1 }}>
                    Aa Bb Cc Dd Ee Ff Gg
                  </p>
                  <p style={{ fontFamily: fonts.display, fontSize: 48, fontWeight: 400, fontStyle: 'italic', color: colors.gold, margin: '4px 0 0', lineHeight: 1.1 }}>
                    Aa Bb Cc Dd Ee Ff Gg
                  </p>
                </div>
                <div>
                  <span style={s.monoCaption}>Body — {fonts.body.split("'")[1]}</span>
                  <p style={{ fontFamily: fonts.body, fontSize: 16, fontWeight: 400, color: colors.paper, margin: '8px 0 0', lineHeight: 1.65 }}>
                    The quick brown fox jumps over the lazy dog. 0123456789 — designed for sustained reading at body sizes.
                  </p>
                  <p style={{ fontFamily: fonts.body, fontSize: 16, fontWeight: 500, color: colors.silver, margin: '4px 0 0', lineHeight: 1.65 }}>
                    Medium weight — used for UI labels, subheadings, and emphasis.
                  </p>
                </div>
                <div>
                  <span style={s.monoCaption}>Mono — {fonts.mono.split("'")[1]}</span>
                  <p style={{ fontFamily: fonts.mono, fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.gold, margin: '8px 0 0' }}>
                    01 — Section numeral · 02 — Navigation · 03 — Caption
                  </p>
                  <p style={{ fontFamily: fonts.mono, fontSize: 13, fontWeight: 400, color: colors.silver, margin: '4px 0 0', letterSpacing: '0.06em' }}>
                    {"{ code: 'block', status: 200, data: [1, 2, 3] }"}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
