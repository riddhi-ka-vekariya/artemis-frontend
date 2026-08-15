import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { vertexShader, fragmentShader } from '../components/UnseenCurlDemo/shaders.js'

// ─── Constants ─────────────────────────────────────────────────────────────
const MESH_SIZE_BASE = new THREE.Vector2(820, 430)
const SEGMENT_COUNT = 12
const SCROLL_LERP = 0.05
const VELOCITY_LERP = 0.075
const VELOCITY_SCALE = 5e-4
const CAMERA_Z = 2000
const FOG_NEAR = 500
const FOG_FAR = 4500

const MULTIPLIERS = { default: 0.21, sm: 0.30, md: 0.28, lg: 0.35 }
const DARK_BG = '#141210'

const DEFAULTS = {
  bendStart: 100,
  bendEnd: 700,
  zDepth: 1200,
  noiseAmp: 50,
  cardGap: 28,
  innerScale: 1.0,
}

const PROJECT_DATA = [
  {
    id: 1,
    title: 'Vault House',
    desc: 'Residential · Lisbon, 2024',
    img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600&h=900&fit=crop&auto=format&q=85',
    fullDesc: 'A monolith carved from local limestone. Vault House negotiates extreme topography with quiet architectural restraint, forming raw concrete lightwells and subterranean courtyards.'
  },
  {
    id: 2,
    title: 'Brutalist Pavilion',
    desc: 'Cultural · Brussels, 2023',
    img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&h=900&fit=crop&auto=format&q=85',
    fullDesc: 'Designed as a temporary exhibition venue, the pavilion utilizes textured cast-in-place concrete walls to filter natural daylight into solemn, atmospheric gallery chambers.'
  },
  {
    id: 3,
    title: 'Helix Stair',
    desc: 'Interior · Stockholm, 2024',
    img: 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=1600&h=900&fit=crop&auto=format&q=85',
    fullDesc: 'A continuous spiral forged from raw black steel, serving as the vertical spine for a multi-level art foundation in central Stockholm.'
  },
  {
    id: 4,
    title: 'Coastal Residence',
    desc: 'Residential · Lagos, 2023',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=900&fit=crop&auto=format&q=85',
    fullDesc: 'Perched along rugged Atlantic ocean bluffs, this cantilevered glass and timber home balances exposure to panoramic sea vistas with deep solar shading overhangs.'
  },
  {
    id: 5,
    title: 'Concrete Atrium',
    desc: 'Office · Tokyo, 2022',
    img: 'https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?w=1600&h=900&fit=crop&auto=format&q=85',
    fullDesc: 'A seven-story central atrium enveloped in geometric acoustic concrete baffles, drawing soft diffuse overhead daylight deep into the interior office floors.'
  },
  {
    id: 6,
    title: 'Light Vault',
    desc: 'Cultural · Oslo, 2024',
    img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&h=900&fit=crop&auto=format&q=85',
    fullDesc: 'An underground subterranean archive illuminated solely by vertical skylight tubes, combining timber ceiling ribbons with polished dark terrazzo flooring.'
  },
  {
    id: 7,
    title: 'Market Hall',
    desc: 'Public · Rotterdam, 2023',
    img: 'https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=1600&h=900&fit=crop&auto=format&q=85',
    fullDesc: 'A civic roof canopy constructed from prefabricated glulam arches, spanning 60 meters to shelter an open-air artisanal food market.'
  },
  {
    id: 8,
    title: 'Tower Studio',
    desc: 'Residential · Vienna, 2024',
    img: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=1600&h=900&fit=crop&auto=format&q=85',
    fullDesc: 'A vertical penthouse restoration featuring blackened brass joinery, full-height double-glazed apertures, and bespoke minimalist furniture pieces.'
  },
]

export default function ProjectsPage() {
  const canvasRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [selectedProject, setSelectedProject] = useState(null)

  const stateRef = useRef({
    renderer: null,
    scene: null,
    camera: null,
    projectsGroup: null,
    filmstripGroup: null,
    clock: null,
    scrollPos: 0,
    smoothScrollPos: 0,
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
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    state.renderer = renderer

    // ── Camera ───────────────────────────────────────────────────────────────
    const h = window.innerHeight
    const fov = 2 * Math.atan(h / 2 / CAMERA_Z) * (180 / Math.PI)
    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / h, 100, FOG_FAR)
    camera.position.z = CAMERA_Z
    state.camera = camera

    // ── Scene + Dark Mode Fog ────────────────────────────────────────────────
    const scene = new THREE.Scene()
    const fogCol = new THREE.Color(DARK_BG)
    scene.fog = new THREE.Fog(fogCol, FOG_NEAR, FOG_FAR)
    scene.background = fogCol
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

      let scaleAdj = 1
      if (MQ.xlg.matches) scaleAdj = sceneScale + 0.2
      else if (MQ.lg.matches) scaleAdj = sceneScale + 0.3

      mult *= scaleAdj

      const meshSize = MESH_SIZE_BASE.clone().multiplyScalar(mult)
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
      const gap = state.params.cardGap
      const rowH = meshSize.y

      return { meshSize, bendPoint, cols, gap, rowH, scaleAdj }
    }

    // ── Texture Builder ──────────────────────────────────────────────────────
    function makeCardTexture(data, w, h) {
      const cvs = document.createElement('canvas')
      cvs.width = Math.max(1, Math.round(w))
      cvs.height = Math.max(1, Math.round(h))
      const ctx = cvs.getContext('2d')

      ctx.fillStyle = '#1e1e24'
      ctx.fillRect(0, 0, cvs.width, cvs.height)

      const tex = new THREE.CanvasTexture(cvs)

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const ir = img.width / img.height
        const cr = cvs.width / cvs.height
        let sx, sy, sw, sh
        if (ir > cr) {
          sh = img.height; sw = sh * cr; sx = (img.width - sw) / 2; sy = 0;
        } else {
          sw = img.width; sh = sw / cr; sx = 0; sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cvs.width, cvs.height)

        // Gradient Scrim
        const scrim = ctx.createLinearGradient(0, cvs.height * 0.35, 0, cvs.height)
        scrim.addColorStop(0, 'rgba(0,0,0,0)')
        scrim.addColorStop(1, 'rgba(0,0,0,0.85)')
        ctx.fillStyle = scrim
        ctx.fillRect(0, 0, cvs.width, cvs.height)

        // Typography — Black & Gold style
        const titlePx = Math.round(Math.max(cvs.height * 0.082, 16))
        ctx.fillStyle = 'rgba(242,242,242,0.96)'
        ctx.font = `700 ${titlePx}px "The Seasons Bold", "The Seasons", Georgia, serif`
        ctx.fillText(data.title, 28, cvs.height * 0.74)

        const descPx = Math.round(Math.max(cvs.height * 0.057, 11))
        ctx.fillStyle = 'rgba(194,194,194,0.65)'
        ctx.font = `600 ${descPx}px "Behind The Nineties Sans SemiBold", "Behind The Nineties Sans", "IBM Plex Mono", monospace`
        ctx.fillText(data.desc.toUpperCase(), 28, cvs.height * 0.74 + titlePx * 1.45)

        // Gold Bottom Rule
        ctx.fillStyle = 'rgba(193,148,0,0.4)'
        ctx.fillRect(0, cvs.height - 2, cvs.width, 2)

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

      const { meshSize, bendPoint } = getLayoutParams()

      PROJECT_DATA.forEach((data, i) => {
        const geo = new THREE.PlaneGeometry(1, 1, SEGMENT_COUNT, SEGMENT_COUNT)
        const tex = makeCardTexture(data, meshSize.x, meshSize.y)

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

      const { meshSize, bendPoint, cols, gap, rowH, scaleAdj } = getLayoutParams()

      // Cache layout for strip positioning
      state.meshSize = meshSize
      state.cols = cols
      state.gap = gap

      const winH = window.innerHeight
      const yStartOffset = MQ.md.matches ? 80 : 30

      state.projectsHeight = 0

      state.projectsGroup.children.forEach((group, u) => {
        const mesh = group.children[0]
        const col = u % cols
        const row = Math.floor(u / cols)

        let fx = col * (meshSize.x + gap)
        if (cols > 1) fx -= 0.5 * (meshSize.x + gap)

        const fy = -(row * rowH + row * gap + yStartOffset)

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
      }
    }

    let touchY = 0
    function onTouchStart(e) { touchY = e.touches[0].clientY }
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
      }
    }

    function onResize() {
      const w = window.innerWidth, winH = window.innerHeight
      renderer.setSize(w, winH)
      camera.fov = 2 * Math.atan(winH / 2 / CAMERA_Z) * (180 / Math.PI)
      camera.aspect = w / winH
      camera.updateProjectionMatrix()
      positionProjects()
      buildFilmstripBorders()
    }

    // ── Filmstrip Texture (Canvas2D) ─────────────────────────────────
    // Metallic silver strip with brushed-metal sheen and soft glow.
    function makeFilmstripTexture(side, w, h) {
      const res = Math.min(window.devicePixelRatio, 2)
      const cvs = document.createElement('canvas')
      cvs.width = Math.round(w * res)
      cvs.height = Math.round(h * res)
      const ctx = cvs.getContext('2d')
      ctx.scale(res, res)

      // ── Layer 1: Brushed-metal vertical gradient ──
      const metalGrad = ctx.createLinearGradient(0, 0, 0, h)
      metalGrad.addColorStop(0,    '#8A8A8E')
      metalGrad.addColorStop(0.15, '#D0D0D4')
      metalGrad.addColorStop(0.35, '#A8A8AC')
      metalGrad.addColorStop(0.5,  '#E8E8EC')
      metalGrad.addColorStop(0.65, '#B0B0B4')
      metalGrad.addColorStop(0.85, '#D8D8DC')
      metalGrad.addColorStop(1,    '#9A9A9E')
      ctx.fillStyle = metalGrad
      ctx.fillRect(0, 0, w, h)

      // ── Layer 2: Subtle horizontal streaks (brushed-metal texture) ──
      ctx.globalAlpha = 0.07
      for (let sy = 0; sy < h; sy += 1.5) {
        const brightness = 180 + Math.floor(Math.random() * 75)
        ctx.fillStyle = `rgb(${brightness},${brightness},${brightness + 4})`
        ctx.fillRect(0, sy, w, 0.8)
      }
      ctx.globalAlpha = 1.0

      // ── Layer 3: Central specular highlight (horizontal shine band) ──
      const shineGrad = ctx.createLinearGradient(0, 0, 0, h)
      shineGrad.addColorStop(0,    'rgba(255,255,255,0)')
      shineGrad.addColorStop(0.3,  'rgba(255,255,255,0.12)')
      shineGrad.addColorStop(0.5,  'rgba(255,255,255,0.22)')
      shineGrad.addColorStop(0.7,  'rgba(255,255,255,0.12)')
      shineGrad.addColorStop(1,    'rgba(255,255,255,0)')
      ctx.fillStyle = shineGrad
      ctx.fillRect(0, 0, w, h)

      // ── Layer 4: Soft edge glow (top & bottom luminous edges) ──
      const glowH = h * 0.18
      // Top edge glow
      const glowT = ctx.createLinearGradient(0, 0, 0, glowH)
      glowT.addColorStop(0, 'rgba(220,225,235,0.35)')
      glowT.addColorStop(1, 'rgba(220,225,235,0)')
      ctx.fillStyle = glowT
      ctx.fillRect(0, 0, w, glowH)
      // Bottom edge glow
      const glowB = ctx.createLinearGradient(0, h, 0, h - glowH)
      glowB.addColorStop(0, 'rgba(220,225,235,0.35)')
      glowB.addColorStop(1, 'rgba(220,225,235,0)')
      ctx.fillStyle = glowB
      ctx.fillRect(0, h - glowH, w, glowH)

      // ── Sprocket holes ──
      const holeW = w * 0.52
      const holeH = holeW             // SQUARE
      const tileH = holeH * 1.9      // repeat period (hole + gap)
      const holeX = (w - holeW) / 2  // centered horizontally

      ctx.fillStyle = '#0D0D0D'
      for (let y = (tileH - holeH) / 2; y < h + tileH; y += tileH) {
        if (ctx.roundRect) {
          ctx.beginPath()
          ctx.roundRect(holeX, y, holeW, holeH, 2)
          ctx.fill()
        } else {
          ctx.fillRect(holeX, y, holeW, holeH)
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

      const { meshSize, bendPoint, cols, gap, rowH, scaleAdj } = getLayoutParams()
      const yStartOffset = MQ.md.matches ? 80 : 30
      const rows = Math.ceil(PROJECT_DATA.length / cols)

      // Strip world-space width — proportional to card size (7.5% = half of original 15%)
      const STRIP_W = meshSize.x * 0.075

      // Outer X edges of the card columns
      const leftFx = cols > 1 ? -0.5 * (meshSize.x + gap) : 0
      const rightFx = cols > 1 ? 0.5 * (meshSize.x + gap) : 0
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
        const fy = -(row * rowH + row * gap + yStartOffset)

          ;['left', 'right'].forEach(side => {
            const geo = new THREE.PlaneGeometry(1, 1, SEGMENT_COUNT, SEGMENT_COUNT)
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

      if (state.projectsHeight > 0) {
        setScrollProgress((state.smoothScrollPos / state.projectsHeight) * 100)
      }

      renderer.render(scene, camera)
    }

    buildProjects()

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('resize', onResize)
    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointerup', handlePointerUp)

    tick()

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
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
        <div className="unseen-curl-page" style={{ height: '100vh', width: '100vw', position: 'relative' }}>
          {/* Header Title Overlay */}
          <header className="projects-header-overlay">
            <span className="projects-eyebrow">02 — Selected Work</span>
            <h1 className="projects-title">
              Our <em>Projects</em>
            </h1>
          </header>

          <canvas ref={canvasRef} id="unseen-gl-canvas" style={{ cursor: 'pointer' }} />
        </div>

        {/* ── Enlarged Flat Image Modal ── */}
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
                <span className="project-modal-eyebrow">
                  Project 0{selectedProject.id} — Selected View
                </span>
                <h2 className="project-modal-title">{selectedProject.title}</h2>
                <p className="project-modal-desc">{selectedProject.desc}</p>
                <p className="project-modal-full-desc">{selectedProject.fullDesc}</p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
