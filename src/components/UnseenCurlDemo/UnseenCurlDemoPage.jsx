import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from './shaders.js'
import './UnseenCurlDemoPage.css'

// ─── Source Constants ────────────────────────────────────────────────────────
const MESH_SIZE_BASE = new THREE.Vector2(820, 430)
const SEGMENT_COUNT  = 12
const SCROLL_LERP    = 0.05
const VELOCITY_LERP  = 0.075
const VELOCITY_SCALE = 5e-4
const CAMERA_Z       = 2000
const FOG_NEAR       = 500
const FOG_FAR        = 4500

const MULTIPLIERS = { default: 0.21, sm: 0.30, md: 0.28, lg: 0.35 }

// Dark mode by default
const DARK_BG = '#040404'

// Default parameters (Dark mode default, Centered layout)
const DEFAULTS = {
  bendStart:  100,
  bendEnd:    700,
  zDepth:     1200,
  noiseAmp:   50,
  cardGap:    28,
  innerScale: 1.0,
}

const PROJECT_DATA = [
  {
    title: 'Vault House',
    desc:  'Residential · Lisbon, 2024',
    img:   'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=820&h=430&fit=crop&auto=format&q=85',
  },
  {
    title: 'Brutalist Pavilion',
    desc:  'Cultural · Brussels, 2023',
    img:   'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=820&h=430&fit=crop&auto=format&q=85',
  },
  {
    title: 'Helix Stair',
    desc:  'Interior · Stockholm, 2024',
    img:   'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=820&h=430&fit=crop&auto=format&q=85',
  },
  {
    title: 'Coastal Residence',
    desc:  'Residential · Lagos, 2023',
    img:   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=820&h=430&fit=crop&auto=format&q=85',
  },
  {
    title: 'Concrete Atrium',
    desc:  'Office · Tokyo, 2022',
    img:   'https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?w=820&h=430&fit=crop&auto=format&q=85',
  },
  {
    title: 'Light Vault',
    desc:  'Cultural · Oslo, 2024',
    img:   'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=820&h=430&fit=crop&auto=format&q=85',
  },
  {
    title: 'Market Hall',
    desc:  'Public · Rotterdam, 2023',
    img:   'https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=820&h=430&fit=crop&auto=format&q=85',
  },
  {
    title: 'Tower Studio',
    desc:  'Residential · Vienna, 2024',
    img:   'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=820&h=430&fit=crop&auto=format&q=85',
  },
]

export default function UnseenCurlDemoPage() {
  const canvasRef = useRef(null)
  const [params, setParams] = useState({ ...DEFAULTS })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [breakpointLabel, setBreakpointLabel] = useState('')

  // Scene references
  const stateRef = useRef({
    renderer: null,
    scene: null,
    camera: null,
    projectsGroup: null,
    clock: null,
    scrollPos: 0,
    smoothScrollPos: 0,
    scrollDelta: 0,
    smoothDelta: 0,
    velocity: 0,
    projectsHeight: 0,
    params: { ...DEFAULTS },
  })

  // Sync state ref with slider state
  useEffect(() => {
    stateRef.current.params = { ...params }
  }, [params])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const state = stateRef.current
    state.clock = new THREE.Clock()

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace;
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
      sm:  window.matchMedia('(min-width: 768px)'),
      md:  window.matchMedia('(min-width: 1024px)'),
      lg:  window.matchMedia('(min-width: 1366px)'),
      xlg: window.matchMedia('(min-width: 1921px)'),
    }

    function getLayoutParams() {
      const w = window.innerWidth, winH = window.innerHeight
      const sceneScale = w / 2150

      let mult = MULTIPLIERS.default
      if      (MQ.lg.matches) mult = MULTIPLIERS.lg
      else if (MQ.md.matches) mult = MULTIPLIERS.md
      else if (MQ.sm.matches) mult = MULTIPLIERS.sm

      let scaleAdj = 1
      if      (MQ.xlg.matches) scaleAdj = sceneScale + 0.2
      else if (MQ.lg.matches)  scaleAdj = sceneScale + 0.3

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
      const gap  = (MQ.md.matches ? 20 : 10) * scaleAdj
      const rowH = meshSize.y + p.cardGap

      return { meshSize, bendPoint, cols, gap, rowH, scaleAdj }
    }

    function updateBreakpointLabel() {
      const w = window.innerWidth
      let label = 'mobile · 1 col'
      if      (w >= 1921) label = 'xlg · 2 col'
      else if (w >= 1366) label = 'lg · 2 col'
      else if (w >= 1024) label = 'md · 2 col'
      else if (w >=  768) label = 'sm · 1 col'
      setBreakpointLabel(label)
    }

    // ── Texture Builder ──────────────────────────────────────────────────────
    function makeCardTexture(data, w, h) {
      const cvs = document.createElement('canvas')
      cvs.width  = Math.max(1, Math.round(w))
      cvs.height = Math.max(1, Math.round(h))
      const ctx  = cvs.getContext('2d')

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

        // Typography
        const titlePx = Math.round(Math.max(cvs.height * 0.082, 16))
        ctx.fillStyle = 'rgba(255,255,255,0.96)'
        ctx.font = `600 ${titlePx}px "Neue Montreal", "Inter", system-ui, sans-serif`
        ctx.fillText(data.title, 28, cvs.height * 0.74)

        const descPx = Math.round(Math.max(cvs.height * 0.057, 11))
        ctx.fillStyle = 'rgba(255,255,255,0.58)'
        ctx.font = `400 ${descPx}px "Neue Montreal", "Inter", system-ui, sans-serif`
        ctx.fillText(data.desc, 28, cvs.height * 0.74 + titlePx * 1.45)

        // Bottom Rule
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
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
            uTexture:       { value: tex },
            u_fluidTex:     { value: null },
            u_time:         { value: 0 },
            u_random:       { value: Math.random() + 1 },
            u_heightOffset: { value: 1 },
            u_bendPoint:    { value: bendPoint.clone() },
            u_zDepth:       { value: state.params.zDepth },
            u_noiseAmp:     { value: state.params.noiseAmp },
            u_rippleAmp:    { value: 12.0 },
            u_imageSize:    { value: meshSize.clone() },
            u_meshSize:     { value: meshSize.clone() },
            u_innerScale:   { value: state.params.innerScale },
            u_opacity:      { value: 1.0 },
            fogColor:       { value: fogCol.clone() },
            fogNear:        { value: FOG_NEAR },
            fogFar:         { value: FOG_FAR },
          },
          transparent: true, depthWrite: false, side: THREE.DoubleSide,
        })

        const mesh = new THREE.Mesh(geo, mat)
        mesh.scale.set(meshSize.x, meshSize.y, 1)
        mesh.renderOrder = i
        mesh.frustumCulled = false

        const group = new THREE.Group()
        group.add(mesh)
        projectsGroup.add(group)
      })

      positionProjects()
    }

    // ── CENTERED PAGE POSITIONING ────────────────────────────────────────────
    // Position the cards so that the grid starts CENTERED vertically in the viewport
    function positionProjects() {
      if (!state.projectsGroup) return

      const { meshSize, bendPoint, cols, gap, rowH, scaleAdj } = getLayoutParams()
      const winH = window.innerHeight
      const yStartOffset = MQ.md.matches ? 80 : 30

      state.projectsHeight = 0

      state.projectsGroup.children.forEach((group, u) => {
        const mesh = group.children[0]
        const col  = u % cols
        const row  = Math.floor(u / cols)

        let fx = col * (meshSize.x + gap)
        if (cols > 1) fx -= 0.5 * (meshSize.x + gap)

        const fy = -(row * rowH + row * gap + yStartOffset)

        if (col === 0) state.projectsHeight += rowH
        group.position.set(fx, fy, 1000)

        mesh.scale.set(meshSize.x, meshSize.y, 1)
        mesh.material.uniforms.u_bendPoint.value.copy(bendPoint)
        mesh.material.uniforms.u_imageSize.value.copy(meshSize)
        mesh.material.uniforms.u_meshSize.value.copy(meshSize)
        mesh.material.uniforms.u_zDepth.value = state.params.zDepth
        mesh.material.uniforms.u_noiseAmp.value = state.params.noiseAmp
        mesh.material.uniforms.u_innerScale.value = state.params.innerScale
      })

      if (MQ.md.matches) {
        state.projectsHeight -= rowH - 250 * scaleAdj + 0.1 * winH
      } else {
        state.projectsHeight -= rowH - 250 + 0.1 * winH
      }
      state.projectsHeight = Math.max(state.projectsHeight, 0)
      state.scrollPos = THREE.MathUtils.clamp(state.scrollPos, 0, state.projectsHeight)
    }

    // ── Input Listeners ──────────────────────────────────────────────────────
    function onWheel(e) {
      state.scrollPos = THREE.MathUtils.clamp(state.scrollPos + e.deltaY, 0, state.projectsHeight)
    }

    let touchY = 0
    function onTouchStart(e) { touchY = e.touches[0].clientY }
    function onTouchMove(e) {
      const dy = touchY - e.touches[0].clientY
      touchY = e.touches[0].clientY
      state.scrollPos = THREE.MathUtils.clamp(state.scrollPos + dy * 1.2, 0, state.projectsHeight)
    }

    function onResize() {
      const w = window.innerWidth, winH = window.innerHeight
      renderer.setSize(w, winH)
      camera.fov = 2 * Math.atan(winH / 2 / CAMERA_Z) * (180 / Math.PI)
      camera.aspect = w / winH
      camera.updateProjectionMatrix()
      positionProjects()
      updateBreakpointLabel()
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

      if (state.projectsHeight > 0) {
        setScrollProgress((state.smoothScrollPos / state.projectsHeight) * 100)
      }

      renderer.render(scene, camera)
    }

    buildProjects()
    updateBreakpointLabel()

    window.addEventListener('wheel',      onWheel,      { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove',  onTouchMove,  { passive: true })
    window.addEventListener('resize',     onResize)

    tick()

    return () => {
      window.removeEventListener('wheel',      onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove',  onTouchMove)
      window.removeEventListener('resize',     onResize)
      cancelAnimationFrame(animId)
      renderer.dispose()
    }
  }, [])

  const handleParamChange = (key, value) => {
    const val = parseFloat(value)
    setParams(prev => ({ ...prev, [key]: val }))
    const state = stateRef.current
    state.params[key] = val

    if (key === 'bendStart' || key === 'bendEnd' || key === 'cardGap') {
      state.projectsGroup?.children.forEach(g => {
        const u = g.children[0].material.uniforms
        u.u_bendPoint.value.set(state.params.bendStart, state.params.bendEnd)
      })
    } else if (key === 'zDepth') {
      state.projectsGroup?.children.forEach(g => {
        g.children[0].material.uniforms.u_zDepth.value = val
      })
    } else if (key === 'noiseAmp') {
      state.projectsGroup?.children.forEach(g => {
        g.children[0].material.uniforms.u_noiseAmp.value = val
      })
    } else if (key === 'innerScale') {
      state.projectsGroup?.children.forEach(g => {
        g.children[0].material.uniforms.u_innerScale.value = val
      })
    }
  }

  const handleReset = () => {
    setParams({ ...DEFAULTS })
    stateRef.current.params = { ...DEFAULTS }
    stateRef.current.projectsGroup?.children.forEach(g => {
      const u = g.children[0].material.uniforms
      u.u_bendPoint.value.set(DEFAULTS.bendStart, DEFAULTS.bendEnd)
      u.u_zDepth.value = DEFAULTS.zDepth
      u.u_noiseAmp.value = DEFAULTS.noiseAmp
      u.u_innerScale.value = DEFAULTS.innerScale
    })
  }

  return (
    <div className="unseen-curl-page">
      {/* Scrollable container for native track length */}
      <div className="unseen-scroll-container">
        <div className="unseen-sticky-viewport">
          <canvas ref={canvasRef} id="unseen-gl-canvas" />

          {/* Bottom HUD */}
          <div className="unseen-hud-bottom">
            <div className="unseen-hud-scroll-bar">
              <div
                className="unseen-hud-scroll-fill"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          </div>

          {/* Control Panel */}
          <aside className="unseen-ctrl-panel">
            <div className="unseen-ctrl-inner">
              <div className="unseen-ctrl-group">
                <div className="unseen-ctrl-group-label">Curl Geometry</div>
                <label className="unseen-ctrl-row">
                  <span>Bend Start</span>
                  <span className="unseen-ctrl-val">{params.bendStart}</span>
                  <input
                    type="range" min="0" max="600" step="5"
                    value={params.bendStart}
                    onChange={e => handleParamChange('bendStart', e.target.value)}
                  />
                </label>
                <label className="unseen-ctrl-row">
                  <span>Bend End</span>
                  <span className="unseen-ctrl-val">{params.bendEnd}</span>
                  <input
                    type="range" min="100" max="1400" step="5"
                    value={params.bendEnd}
                    onChange={e => handleParamChange('bendEnd', e.target.value)}
                  />
                </label>
                <label className="unseen-ctrl-row">
                  <span>Z Depth</span>
                  <span className="unseen-ctrl-val">{params.zDepth}</span>
                  <input
                    type="range" min="0" max="3000" step="50"
                    value={params.zDepth}
                    onChange={e => handleParamChange('zDepth', e.target.value)}
                  />
                </label>
              </div>

              <div className="unseen-ctrl-group">
                <div className="unseen-ctrl-group-label">Wave & Zoom</div>
                <label className="unseen-ctrl-row">
                  <span>Noise Amp</span>
                  <span className="unseen-ctrl-val">{params.noiseAmp}</span>
                  <input
                    type="range" min="0" max="200" step="1"
                    value={params.noiseAmp}
                    onChange={e => handleParamChange('noiseAmp', e.target.value)}
                  />
                </label>
                <label className="unseen-ctrl-row">
                  <span>Image Zoom</span>
                  <span className="unseen-ctrl-val">{params.innerScale.toFixed(2)}</span>
                  <input
                    type="range" min="0.5" max="2" step="0.01"
                    value={params.innerScale}
                    onChange={e => handleParamChange('innerScale', e.target.value)}
                  />
                </label>
              </div>

              <button className="unseen-btn-reset" onClick={handleReset}>
                Reset Defaults
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
