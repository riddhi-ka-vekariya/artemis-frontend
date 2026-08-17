import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MoltenMetal from '../components/MoltenMetal'
import { vertexShader, fragmentShader } from '../components/UnseenCurlDemo/shaders.js'

// ─── Constants ─────────────────────────────────────────────────────────────
const MESH_SIZE_BASE = new THREE.Vector2(820, 430)
const SEGMENTS_X = 24
const SEGMENTS_Y = 80
const SCROLL_LERP = 0.05
const VELOCITY_LERP = 0.075
const VELOCITY_SCALE = 5e-4
const CAMERA_Z = 2000
const FOG_NEAR = 500
const FOG_FAR = 4500

const MULTIPLIERS = { default: 0.21, sm: 0.30, md: 0.28, lg: 0.35 }
const DARK_BG = '#040404'

const DEFAULTS = {
  bendStart: 100,
  bendEnd: 700,
  zDepth: 750,
  noiseAmp: 50,
  cardGap: 28,
  innerScale: 1.0,
}

const BASE = import.meta.env.BASE_URL || '/'

const PROJECT_DATA = [
  {
    id: 1,
    title: 'Cineprime Cinema, Ahmedabad',
    desc: 'Cinema Architecture · Mumbai, 2024',
    img: `${BASE}gallery/1.avif`,
    fullDesc: 'Designed to make an impression with flowing lines, integrated lighting, and premium seating. An auditorium that is bold, immersive, and built for comfort.'
  },
  {
    id: 2,
    title: 'Cineprime Cinema, Ahmedabad',
    desc: 'VIP Experience · Dubai, 2024',
    img: `${BASE}gallery/2.avif`,
    fullDesc: 'Designed to make an impression with flowing lines, integrated lighting, and premium seating. An auditorium that is bold, immersive, and built for comfort.'
  },
  {
    id: 3,
    title: 'Cineprime Cinema, Ahmedabad',
    desc: 'Commercial Cinema · London, 2023',
    img: `${BASE}gallery/3.avif`,
    fullDesc: 'The auditorium features warm tones, refined lighting and comfortable seats with premium upholstery.'
  },
  {
    id: 4,
    title: 'Cineprime Cinema, Ahmedabad',
    desc: 'Auditorium Design · Singapore, 2024',
    img: `${BASE}gallery/4.avif`,
    fullDesc: 'The auditorium features warm tones, refined lighting and comfortable seats with premium upholstery.'
  },
  {
    id: 5,
    title: 'Cineprime Cinema, Ahmedabad',
    desc: 'Boutique Cinema · Paris, 2023',
    img: `${BASE}gallery/5.avif`,
    fullDesc: 'This auditorium uses clean geometric forms, integrated blue LED lighting, and layered materials to create a calm, futuristic atmosphere.'


  },
  {
    id: 6,
    title: 'Cineprime Cinema, Ahmedabad',
    desc: 'Flagship Venue · New York, 2024',
    img: `${BASE}gallery/6.avif`,
    fullDesc: 'This auditorium uses clean geometric forms, integrated blue LED lighting, and layered materials to create a calm, futuristic atmosphere.'
  },
  {
    id: 7,
    title: 'Star Cinemas, Tadepalligudem',
    desc: 'Private Screening Room · Zurich, 2023',
    img: `${BASE}gallery/7.avif`,
    fullDesc: 'The custom illuminated wall feature creates rhythm, defines circulation, and adds depth to the auditorium. A simple detail, executed with precision, transforms the entire space.'
  },
  {
    id: 8,
    title: 'Star Cinemas, Tadepalligudem',
    desc: 'Immersive Theater · Tokyo, 2024',
    img: `${BASE}gallery/8.avif`,
    fullDesc: 'The custom illuminated wall feature creates rhythm, defines circulation, and adds depth to the auditorium. A simple detail, executed with precision, transforms the entire space.'
  },
  {
    id: 9,
    title: 'Star Cinemas, Tadepalligudem',
    desc: 'Cinema Architecture · Berlin, 2023',
    img: `${BASE}gallery/9.avif`,
    fullDesc: 'The custom illuminated wall feature creates rhythm, defines circulation, and adds depth to the auditorium. A simple detail, executed with precision, transforms the entire space.'
  },
  {
    id: 10,
    title: 'Star Cinemas, Tadepalligudem',
    desc: 'Luxury Screening · Los Angeles, 2024',
    img: `${BASE}gallery/10.1.avif`,
    fullDesc: 'The custom illuminated wall feature creates rhythm, defines circulation, and adds depth to the auditorium. A simple detail, executed with precision, transforms the entire space.'
  },
  {
    id: 11,
    title: 'Star Cinemas, Tadepalligudem',
    desc: 'Multiplex Development · Doha, 2024',
    img: `${BASE}gallery/11.avif`,
    fullDesc: 'With premium recliners, layered ambient lighting, curated fabric prints, and acoustically integrated wall panels, this auditorium was designed to deliver comfort, luxury, and grandeur for every guest.'
  },
  {
    id: 12,
    title: 'Star Cinemas, Tadepalligudem',
    desc: 'Premium Large Format · Sydney, 2023',
    img: `${BASE}gallery/12.avif`,
    fullDesc: 'With premium recliners, layered ambient lighting, curated fabric prints, and acoustically integrated wall panels, this auditorium was designed to deliver comfort, luxury, and grandeur for every guest.'
  },
  {
    id: 13,
    title: 'Star Cinemas, Tadepalligudem',
    desc: 'Cultural Architecture · Milan, 2024',
    img: `${BASE}gallery/13.avif`,
    fullDesc: 'With premium recliners, layered ambient lighting, curated fabric prints, and acoustically integrated wall panels, this auditorium was designed to deliver comfort, luxury, and grandeur for every guest.'
  },
]

export default function ProjectsPage() {
  const canvasRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [selectedProject, setSelectedProject] = useState(null)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const isHeaderHiddenRef = useRef(false)

  const setHeaderHidden = (val) => {
    if (isHeaderHiddenRef.current !== val) {
      isHeaderHiddenRef.current = val
      setIsHeaderHidden(val)
    }
  }

  const stateRef = useRef({
    renderer: null,
    scene: null,
    camera: null,
    projectsGroup: null,
    filmstripGroup: null,
    clock: null,
    scrollPos: 50,
    smoothScrollPos: 20,
    scrollDelta: 0,
    smoothDelta: 0,
    velocity: 0,
    projectsHeight: 0,
    params: { ...DEFAULTS },
  })

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedProject(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const state = stateRef.current
    state.clock = new THREE.Clock()

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setClearColor(0x000000, 0)  // fully transparent clear
    state.renderer = renderer

    // ── Camera ───────────────────────────────────────────────────────────────
    const h = window.innerHeight
    const fov = 2 * Math.atan(h / 2 / CAMERA_Z) * (180 / Math.PI)
    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / h, 100, FOG_FAR)
    camera.position.z = CAMERA_Z
    state.camera = camera

    // ── Scene + Fog (no solid background — canvas is transparent) ────────────
    const scene = new THREE.Scene()
    const fogCol = new THREE.Color(DARK_BG)
    scene.fog = new THREE.Fog(fogCol, FOG_NEAR, FOG_FAR)
    // No scene.background so the WebGL canvas stays transparent,
    // letting the MoltenMetal layer show through on the sides.
    state.scene = scene

    // ── Layout Calculation ───────────────────────────────────────────────────
    const MQ = {
      sm: window.matchMedia('(min-width: 768px)'),
      md: window.matchMedia('(min-width: 1024px)'),
      lg: window.matchMedia('(min-width: 1366px)'),
      xlg: window.matchMedia('(min-width: 1921px)'),
    }

    function getLayoutParams() {
      const w = window.innerWidth, winH = window.innerHeight
      const sceneScale = w / 2150

      let mult = MULTIPLIERS.default
      if (MQ.lg.matches) mult = MULTIPLIERS.lg
      else if (MQ.md.matches) mult = MULTIPLIERS.md
      else if (MQ.sm.matches) mult = MULTIPLIERS.sm
      else {
        // Mobile view (< 768px): add margin on left and right side of gallery list
        // Total screen gallery width = (cardWidth + 2 * stripWidth) * 2 = cardWidth * (1 + 2 * 0.075) * 2 = 2.3 * cardWidth
        const horizontalMargin = Math.max(24, Math.min(36, Math.round(w * 0.08)))
        const targetGalleryWidthOnScreen = w - horizontalMargin * 2
        const targetCardWidth3D = targetGalleryWidthOnScreen / 2.3
        mult = targetCardWidth3D / MESH_SIZE_BASE.x
      }

      let scaleAdj = 1
      if (MQ.xlg.matches) scaleAdj = sceneScale + 0.2
      else if (MQ.lg.matches) scaleAdj = sceneScale + 0.3

      mult *= scaleAdj

      const baseMeshSize = MESH_SIZE_BASE.clone().multiplyScalar(mult)
      const p = state.params
      const bendPoint = new THREE.Vector2()
      if (MQ.lg.matches || MQ.md.matches) {
        bendPoint.set(p.bendStart, p.bendEnd).multiplyScalar(winH / 1100)
      } else if (MQ.sm.matches) {
        bendPoint.set(p.bendStart, Math.min(p.bendEnd, 500))
      } else {
        bendPoint.set(p.bendStart, Math.min(p.bendEnd, 600))
      }

      const cols = MQ.md.matches ? 2 : 1
      const colGap = Math.round(state.params.cardGap * 0.5) // Reduced by half (14px)
      const isMobile = !MQ.sm.matches
      const rowGapAmount = isMobile ? 6 : state.params.cardGap // 6px tight film reel gap on mobile (< 768px), 28px on desktop
      const padRatio = rowGapAmount / (baseMeshSize.y + rowGapAmount)

      // Total mesh height includes the former gap amount
      const meshSize = new THREE.Vector2(baseMeshSize.x, baseMeshSize.y + rowGapAmount)
      const rowH = meshSize.y

      // Starting Y position offset: gentle -10px offset on mobile (< 768px)
      const yStartOffset = MQ.md.matches ? 80 : (MQ.sm.matches ? 30 : -10)

      return { meshSize, baseMeshSize, bendPoint, cols, colGap, rowGapAmount, padRatio, rowH, scaleAdj, yStartOffset }
    }

    // ── Texture Builder ──────────────────────────────────────────────────────
    function makeCardTexture(data, w, h, padRatio) {
      // ── Supersampling: draw at 3× world-space size so WebGL never upscales ──
      // This is the root fix for blur — no color-space conversion needed/used.
      const QUALITY = 3
      const cvs = document.createElement('canvas')
      cvs.width = Math.max(1, Math.round(w * QUALITY))
      cvs.height = Math.max(1, Math.round(h * QUALITY))
      const ctx = cvs.getContext('2d')
      ctx.scale(QUALITY, QUALITY)   // all draw calls remain in world-space coords

      // Transparent base canvas for bottom padding
      ctx.clearRect(0, 0, w, h)

      const tex = new THREE.CanvasTexture(cvs)
      // Anisotropic filtering + mipmaps keep textures sharp at oblique angles
      // ⚠️  Do NOT set tex.colorSpace — it applies gamma and darkens the images
      tex.generateMipmaps = true
      tex.minFilter = THREE.LinearMipmapLinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy()

      const imgH = h * (1 - padRatio)   // world-space height (ctx is scaled)

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const ir = img.width / img.height
        const cr = w / imgH
        let sx, sy, sw, sh
        if (ir > cr) {
          sh = img.height; sw = sh * cr; sx = (img.width - sw) / 2; sy = 0;
        } else {
          sw = img.width; sh = sw / cr; sx = 0; sy = (img.height - sh) / 2;
        }

        // Draw image in upper region
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, imgH)

        // Gradient Scrim inside image region
        const scrim = ctx.createLinearGradient(0, imgH * 0.35, 0, imgH)
        scrim.addColorStop(0, 'rgba(0,0,0,0)')
        scrim.addColorStop(1, 'rgba(0,0,0,0.85)')
        ctx.fillStyle = scrim
        ctx.fillRect(0, 0, w, imgH)

        // Typography — micro-scale title sizing attached to picture bottom
        const isMobile = !MQ.sm.matches
        const titlePx = isMobile
          ? Math.round(Math.max(imgH * 0.015, 5))
          : Math.round(Math.max(imgH * 0.030, 8))
        const textIndent = titlePx
        const textY = imgH - titlePx

        ctx.fillStyle = 'rgba(242,242,242,0.96)'
        ctx.font = `700 ${titlePx}px "The Seasons Bold", "The Seasons", Georgia, serif`
        ctx.textBaseline = 'bottom'
        ctx.fillText(data.title, textIndent, textY)

        tex.needsUpdate = true
      }
      img.src = data.img
      return tex
    }

    // ── Build & Position ─────────────────────────────────────────────────────
    function buildProjects() {
      if (state.projectsGroup) {
        scene.remove(state.projectsGroup)
        state.projectsGroup.children.forEach(g =>
          g.children.forEach(m => { m.geometry?.dispose(); m.material?.dispose() })
        )
      }

      const projectsGroup = new THREE.Group()
      scene.add(projectsGroup)
      state.projectsGroup = projectsGroup

      const { meshSize, padRatio, bendPoint } = getLayoutParams()

      PROJECT_DATA.forEach((data, i) => {
        const geo = new THREE.PlaneGeometry(1, 1, SEGMENTS_X, SEGMENTS_Y)
        const tex = makeCardTexture(data, meshSize.x, meshSize.y, padRatio)

        const mat = new THREE.ShaderMaterial({
          vertexShader, fragmentShader,
          uniforms: {
            uTexture: { value: tex },
            u_fluidTex: { value: null },
            u_time: { value: 0 },
            u_random: { value: Math.random() + 1 },
            u_heightOffset: { value: 1 },
            u_bendPoint: { value: bendPoint.clone() },
            u_zDepth: { value: state.params.zDepth },
            u_noiseAmp: { value: state.params.noiseAmp },
            u_rippleAmp: { value: 12.0 },
            u_imageSize: { value: meshSize.clone() },
            u_meshSize: { value: meshSize.clone() },
            u_innerScale: { value: state.params.innerScale },
            u_opacity: { value: 1.0 },
            fogColor: { value: fogCol.clone() },
            fogNear: { value: FOG_NEAR },
            fogFar: { value: FOG_FAR },
          },
          transparent: true, depthWrite: false, side: THREE.DoubleSide,
        })

        const mesh = new THREE.Mesh(geo, mat)
        mesh.scale.set(meshSize.x, meshSize.y, 1)
        mesh.renderOrder = i
        mesh.frustumCulled = false
        mesh.userData = { projectIndex: i }

        const group = new THREE.Group()
        group.add(mesh)
        projectsGroup.add(group)
      })

      positionProjects()
      buildFilmstripBorders()
    }

    function positionProjects() {
      if (!state.projectsGroup) return

      const { meshSize, bendPoint, cols, colGap, rowH, scaleAdj, yStartOffset } = getLayoutParams()

      // Cache layout for strip positioning
      state.meshSize = meshSize
      state.cols = cols
      state.colGap = colGap

      const winH = window.innerHeight

      state.projectsHeight = 0

      state.projectsGroup.children.forEach((group, u) => {
        const mesh = group.children[0]
        const col = u % cols
        const row = Math.floor(u / cols)

        let fx = col * (meshSize.x + colGap)
        if (cols > 1) fx -= 0.5 * (meshSize.x + colGap)

        const fy = -(row * rowH + yStartOffset)

        if (col === 0) state.projectsHeight += rowH
        group.position.set(fx, fy, 1000)

        mesh.scale.set(meshSize.x, meshSize.y, 1)
        mesh.material.uniforms.u_bendPoint.value.copy(bendPoint)
        mesh.material.uniforms.u_imageSize.value.copy(meshSize)
        mesh.material.uniforms.u_meshSize.value.copy(meshSize)
      })

      if (MQ.md.matches) {
        state.projectsHeight -= rowH - 250 * scaleAdj + 0.1 * winH
      } else {
        state.projectsHeight -= rowH - 250 + 0.1 * winH
      }
      state.projectsHeight = Math.max(state.projectsHeight, 0)
      state.scrollPos = THREE.MathUtils.clamp(state.scrollPos, 0, state.projectsHeight)
    }

    // ── Input Listeners & Click Detection ────────────────────────────────────
    function onWheel(e) {
      const isGalleryAtEnd = state.scrollPos >= state.projectsHeight - 2
      const isGalleryAtStart = state.scrollPos <= 2
      const isPageAtTop = window.scrollY <= 2

      // Lock page scroll at top while user is scrolling through gallery cards
      if (isPageAtTop && e.deltaY > 0 && !isGalleryAtEnd) {
        if (e.cancelable) e.preventDefault()
        state.scrollPos = THREE.MathUtils.clamp(state.scrollPos + e.deltaY, 0, state.projectsHeight)
      } else if (isPageAtTop && e.deltaY < 0 && !isGalleryAtStart) {
        if (e.cancelable) e.preventDefault()
        state.scrollPos = THREE.MathUtils.clamp(state.scrollPos + e.deltaY, 0, state.projectsHeight)
      } else if (isPageAtTop && e.deltaY > 0 && isGalleryAtEnd) {
        // Gallery exhausted — smoothly scroll page down to footer
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
      }

      // Hide title a bit later once user has scrolled past 280px into the gallery
      if (state.scrollPos > 280 || window.scrollY > 30) {
        setHeaderHidden(true)
      } else if (state.scrollPos <= 80 && window.scrollY <= 5) {
        setHeaderHidden(false)
      }
    }

    let touchY = 0
    let footerScrollTriggered = false
    function onTouchStart(e) {
      touchY = e.touches[0].clientY
      footerScrollTriggered = false
    }
    function onTouchMove(e) {
      const currentY = e.touches[0].clientY
      const dy = touchY - currentY
      touchY = currentY

      const isGalleryAtEnd = state.scrollPos >= state.projectsHeight - 2
      const isGalleryAtStart = state.scrollPos <= 2
      const isPageAtTop = window.scrollY <= 2

      if (isPageAtTop && dy > 0 && !isGalleryAtEnd) {
        if (e.cancelable) e.preventDefault()
        state.scrollPos = THREE.MathUtils.clamp(state.scrollPos + dy * 1.2, 0, state.projectsHeight)
      } else if (isPageAtTop && dy < 0 && !isGalleryAtStart) {
        if (e.cancelable) e.preventDefault()
        state.scrollPos = THREE.MathUtils.clamp(state.scrollPos + dy * 1.2, 0, state.projectsHeight)
      } else if (isPageAtTop && dy > 0 && isGalleryAtEnd && !footerScrollTriggered) {
        // Gallery exhausted — smoothly scroll page down to reveal footer
        footerScrollTriggered = true
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
      }

      // Hide title a bit later once user has swiped past 280px into the gallery
      if (state.scrollPos > 280 || window.scrollY > 30) {
        setHeaderHidden(true)
      } else if (state.scrollPos <= 80 && window.scrollY <= 5) {
        setHeaderHidden(false)
      }
    }

    function onScroll() {
      const currentScrollY = window.scrollY
      if (currentScrollY > 30 || state.scrollPos > 280) {
        setHeaderHidden(true)
      } else if (currentScrollY <= 5 && state.scrollPos <= 80) {
        setHeaderHidden(false)
      }
    }

    function onResize() {
      const w = window.innerWidth, winH = window.innerHeight
      renderer.setSize(w, winH)
      camera.fov = 2 * Math.atan(winH / 2 / CAMERA_Z) * (180 / Math.PI)
      camera.aspect = w / winH
      camera.updateProjectionMatrix()
      buildProjects()
    }

    // ── Filmstrip Texture (Canvas2D) ─────────────────────────────────
    // Darker flat filmstrip with warm golden tint
    function makeFilmstripTexture(side, w, h) {
      const res = Math.min(window.devicePixelRatio, 2)
      const cvs = document.createElement('canvas')
      cvs.width = Math.round(w * res)
      cvs.height = Math.round(h * res)
      const ctx = cvs.getContext('2d')
      ctx.scale(res, res)

      // Solid flat background (slightly lightened warm obsidian gold shade)
      ctx.fillStyle = '#26221b'
      ctx.fillRect(0, 0, w, h)

      // Side edge border lines in gold
      ctx.fillStyle = 'rgba(209, 148, 0, 0.36)'
      ctx.fillRect(0, 0, 1, h)
      ctx.fillRect(w - 1, 0, 1, h)

      // ── Sprocket holes (evenly distributed to tile seamlessly across rows) ──
      const holeW = w * 0.52
      const holeH = holeW             // SQUARE
      const rawTileH = holeH * 1.9    // target repeat period
      const holeCount = Math.max(1, Math.round(h / rawTileH))
      const tileH = h / holeCount     // exact tile size so holes align across row boundaries
      const holeX = (w - holeW) / 2  // centered horizontally

      ctx.fillStyle = '#040404'
      for (let i = 0; i < holeCount; i++) {
        const y = i * tileH + (tileH - holeH) / 2
        if (ctx.roundRect) {
          ctx.beginPath()
          ctx.roundRect(holeX, y, holeW, holeH, 2)
          ctx.fill()
          ctx.strokeStyle = 'rgba(209, 148, 0, 0.30)'
          ctx.lineWidth = 1
          ctx.stroke()
        } else {
          ctx.fillRect(holeX, y, holeW, holeH)
          ctx.strokeStyle = 'rgba(209, 148, 0, 0.30)'
          ctx.lineWidth = 1
          ctx.strokeRect(holeX, y, holeW, holeH)
        }
      }

      return new THREE.CanvasTexture(cvs)
    }

    // ── Build WebGL Filmstrip Borders ───────────────────────────────

    // Creates one PlaneGeometry strip per card row per side, using the same
    // curl shader as the gallery cards, so they flow identically.
    function buildFilmstripBorders() {
      // Tear down previous filmstrip group
      if (state.filmstripGroup) {
        scene.remove(state.filmstripGroup)
        state.filmstripGroup.children.forEach(g =>
          g.children.forEach(m => { m.geometry?.dispose(); m.material?.dispose() })
        )
      }

      const { meshSize, bendPoint, cols, colGap, rowH, scaleAdj, yStartOffset } = getLayoutParams()
      const rows = Math.ceil(PROJECT_DATA.length / cols)

      // Strip world-space width — proportional to card size (7.5% = half of original 15%)
      const STRIP_W = meshSize.x * 0.075

      // Outer X edges of the card columns
      const leftFx = cols > 1 ? -0.5 * (meshSize.x + colGap) : 0
      const rightFx = cols > 1 ? 0.5 * (meshSize.x + colGap) : 0
      const leftEdge = leftFx - meshSize.x / 2
      const rightEdge = rightFx + meshSize.x / 2

      // Pre-build textures (reused across rows)
      const texL = makeFilmstripTexture('left', Math.round(STRIP_W * 4), Math.round(meshSize.y * 4))
      const texR = makeFilmstripTexture('right', Math.round(STRIP_W * 4), Math.round(meshSize.y * 4))

      const filmstripGroup = new THREE.Group()
      scene.add(filmstripGroup)
      state.filmstripGroup = filmstripGroup

      const stripSize = new THREE.Vector2(STRIP_W, meshSize.y)

      for (let row = 0; row < rows; row++) {
        const fy = -(row * rowH + yStartOffset)

          ;['left', 'right'].forEach(side => {
            const geo = new THREE.PlaneGeometry(1, 1, 8, SEGMENTS_Y)
            const tex = side === 'left' ? texL : texR

            const mat = new THREE.ShaderMaterial({
              vertexShader, fragmentShader,
              uniforms: {
                uTexture: { value: tex },
                u_fluidTex: { value: null },
                u_time: { value: 0 },
                u_random: { value: Math.random() + 1 },
                u_heightOffset: { value: 1 },
                u_bendPoint: { value: bendPoint.clone() },
                u_zDepth: { value: state.params.zDepth },
                u_noiseAmp: { value: state.params.noiseAmp * 0.6 },
                u_rippleAmp: { value: 8.0 },
                u_imageSize: { value: stripSize.clone() },
                u_meshSize: { value: stripSize.clone() },
                u_innerScale: { value: state.params.innerScale },
                u_opacity: { value: 1.0 },
                fogColor: { value: fogCol.clone() },
                fogNear: { value: FOG_NEAR },
                fogFar: { value: FOG_FAR },
              },
              transparent: true, depthWrite: false, side: THREE.DoubleSide,
            })

            const mesh = new THREE.Mesh(geo, mat)
            mesh.scale.set(STRIP_W, meshSize.y, 1)
            mesh.frustumCulled = false
            mesh.userData = { isFilmstrip: true }

            // X centre of this strip
            const fx = side === 'left'
              ? leftEdge - STRIP_W / 2
              : rightEdge + STRIP_W / 2

            const group = new THREE.Group()
            group.add(mesh)
            group.position.set(fx, fy, 1000)
            filmstripGroup.add(group)
          })
      }
    }

    // Raycaster for card clicks
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let downX = 0, downY = 0

    const handlePointerDown = (e) => {
      downX = e.clientX
      downY = e.clientY
    }

    const handlePointerUp = (e) => {
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY)
      if (dist > 8) return // user was dragging/scrolling, not clicking

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, camera)

      if (state.projectsGroup) {
        const meshes = state.projectsGroup.children.map(g => g.children[0])
        const intersects = raycaster.intersectObjects(meshes)
        if (intersects.length > 0) {
          const hitMesh = intersects[0].object
          const idx = hitMesh.userData.projectIndex
          if (idx !== undefined && PROJECT_DATA[idx]) {
            setSelectedProject(PROJECT_DATA[idx])
          }
        }
      }
    }

    // ── Animation Loop ───────────────────────────────────────────────────────
    let animId
    function tick() {
      animId = requestAnimationFrame(tick)
      const t = state.clock.getElapsedTime()

      state.smoothScrollPos += SCROLL_LERP * (state.scrollPos - state.smoothScrollPos)
      state.scrollDelta = VELOCITY_SCALE * (state.scrollPos - state.smoothScrollPos)
      state.smoothDelta = THREE.MathUtils.lerp(state.scrollDelta, 0, 0.01)
      state.velocity += VELOCITY_LERP * (state.smoothDelta - state.velocity)

      if (state.projectsGroup) {
        state.projectsGroup.position.y = state.smoothScrollPos
        state.projectsGroup.children.forEach(g => {
          g.children[0].material.uniforms.u_time.value = t
        })
      }

      // Filmstrip borders — same scroll position + time as cards
      if (state.filmstripGroup) {
        state.filmstripGroup.position.y = state.smoothScrollPos
        state.filmstripGroup.children.forEach(g => {
          g.children[0].material.uniforms.u_time.value = t
        })
      }

      // Header visibility is driven purely by user scroll events (onWheel / onTouchMove / onScroll)
      // — no position-based logic here to avoid conflicts with pre-scroll offset.

      if (state.projectsHeight > 0) {
        setScrollProgress((state.smoothScrollPos / state.projectsHeight) * 100)
      }

      renderer.render(scene, camera)
    }

    buildProjects()

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointerup', handlePointerUp)

    tick()

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointerup', handlePointerUp)
      cancelAnimationFrame(animId)
      renderer.dispose()
    }
  }, [])

  return (
    <>
      <Navbar />
      <main className="page-wrapper page-enter" id="page-projects" style={{ paddingTop: 0 }}>
        <div className="unseen-curl-page" style={{ height: '100vh', width: '100vw', position: 'relative', background: '#040404' }}>
          {/* ── MoltenMetal ambient background ── */}
          <div className="projects-molten-bg">
            <MoltenMetal
              color1="#040404"
              color2="#d19400"
              color3="#FFFFFF"
              speed={0.25}
              scale={4}
              detail={3}
              glow={1.4}
              coreSize={0.08}
              swirl={0.8}
              fold={-0.2}
              blackPoint={0.06}
              brightness={1.2}
              colorMode="ember"
              grain
              grainIntensity={0.04}
              mouseInteraction={false}
              opacity={1}
            />
          </div>

          {/* ── Side fade masks so molten only shows on sides ── */}
          <div className="projects-molten-mask" />

          {/* Header Title Overlay */}
          <header className={`projects-header-overlay${isHeaderHidden ? ' hidden' : ''}`}>
            <span className="projects-eyebrow"></span>
            <h1 className="projects-title">
              Studio <em>Showcase</em>
            </h1>
          </header>

          <canvas ref={canvasRef} id="unseen-gl-canvas" style={{ cursor: 'pointer' }} />
        </div>
      </main>

      {/* ── Enlarged Flat Image Modal (rendered outside main to overlay navbar) ── */}
      {selectedProject && (
        <div
          className="project-modal-backdrop"
          onClick={() => setSelectedProject(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedProject.title}
        >
          <div
            className="project-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="project-modal-close"
              onClick={() => setSelectedProject(null)}
              aria-label="Close enlarged view"
            >
              ✕
            </button>

            {/* Flat High-Res Image View */}
            <div className="project-modal-img-wrap">
              <img
                src={selectedProject.img}
                alt={selectedProject.title}
                className="project-modal-img"
              />
            </div>

            {/* Text Info */}
            <div className="project-modal-info">
              <h2 className="project-modal-title">{selectedProject.title}</h2>
              <p className="project-modal-full-desc">{selectedProject.fullDesc}</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
