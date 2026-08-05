import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import './CartierBgPage.css'

export default function CartierBgPage() {
  const canvasRef = useRef(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // ─── Scene & Camera ───────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#110e0c')

    const winW = window.innerWidth
    const winH = window.innerHeight

    const camera = new THREE.PerspectiveCamera(45, winW / winH, 0.1, 100)
    // Initial camera position looking at the SC06 room bench
    camera.position.set(0, 1.6, 6)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(winW, winH)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1

    // ─── Lighting Setup ───────────────────────────────────────────────────────
    // Warm ambient lighting matching Cartier room mood
    const ambientLight = new THREE.AmbientLight('#ebd5b3', 1.4)
    scene.add(ambientLight)

    // Soft warm directional key light
    const dirLight = new THREE.DirectionalLight('#fff2d6', 1.8)
    dirLight.position.set(2, 6, 4)
    scene.add(dirLight)

    // Dynamic cursor mouse light
    const cursorLight = new THREE.PointLight('#ffdfa9', 3.5, 12)
    cursorLight.position.set(0, 2, 4)
    scene.add(cursorLight)

    // ─── Mouse tracking ───────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 }

    function onPointerMove(e) {
      // Normalized mouse coordinates (-1 to +1)
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('pointermove', onPointerMove)

    // ─── Lightmap Loader ──────────────────────────────────────────────────────
    const textureLoader = new THREE.TextureLoader()
    let lightmapTex = null
    textureLoader.load('/cartier/LIGHTMAP_SC06.webp', (tex) => {
      tex.flipY = false
      tex.colorSpace = THREE.SRGBColorSpace
      lightmapTex = tex
    })

    // ─── GLTF Room Loader ─────────────────────────────────────────────────────
    const loader = new GLTFLoader()
    let roomGroup = new THREE.Group()
    scene.add(roomGroup)

    loader.load(
      '/cartier/mainScene.glb',
      (gltf) => {
        const root = gltf.scene

        root.traverse((child) => {
          if (!child.isMesh && !child.isGroup) return

          const name = child.name || ''

          // Hide all floating watch cards (user specified: no floating watch gallery)
          if (
            name.includes('SC06_Image') ||
            name.includes('MOBILE_SC06_Image') ||
            name.includes('FontPlane') ||
            name.includes('Screen') ||
            name.includes('decal')
          ) {
            child.visible = false
            return
          }

          // Hide rooms SC00 - SC05 so only SC06 3D room remains visible
          if (
            name.includes('SC00') ||
            name.includes('SC01') ||
            name.includes('SC02') ||
            name.includes('SC03') ||
            name.includes('SC04') ||
            name.includes('SC05')
          ) {
            child.visible = false
            return
          }

          // Enhance materials for SC06 Room & Bench
          if (child.isMesh) {
            child.material.side = THREE.DoubleSide
            if (lightmapTex) {
              child.material.lightMap = lightmapTex
              child.material.lightMapIntensity = 1.2
            }
          }
        })

        // Position & scale room to center around camera
        root.position.set(0, -1.2, 0)
        roomGroup.add(root)

        setLoading(false)
      },
      undefined,
      (err) => {
        console.error('Error loading Cartier GLB:', err)
        setLoading(false)
      }
    )

    // ─── Resize Handler ───────────────────────────────────────────────────────
    function onResize() {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // ─── Render Loop ──────────────────────────────────────────────────────────
    let animId
    const clock = new THREE.Clock()

    function tick() {
      animId = requestAnimationFrame(tick)

      // Smooth lerp mouse targets
      mouse.x += (mouse.targetX - mouse.x) * 0.05
      mouse.y += (mouse.targetY - mouse.y) * 0.05

      // Parallax camera rotation & position shift
      camera.position.x = mouse.x * 0.6
      camera.position.y = 1.6 + mouse.y * 0.35
      camera.lookAt(mouse.x * 0.2, 0.4 + mouse.y * 0.1, 0)

      // Cursor light follows mouse position in 3D space
      cursorLight.position.x = mouse.x * 3.5
      cursorLight.position.y = 2 + mouse.y * 1.5
      cursorLight.position.z = 4 + mouse.y * 0.5

      // Gentle subtle room breathing
      const t = clock.getElapsedTime()
      if (roomGroup) {
        roomGroup.position.y = Math.sin(t * 0.5) * 0.02
      }

      renderer.render(scene, camera)
    }

    tick()

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(animId)
      renderer.dispose()
    }
  }, [])

  return (
    <div className="cartier-bg-page">
      <canvas ref={canvasRef} id="cartier-bg-canvas" />

      {/* Top Header Navigation */}
      <nav className="cartier-bg-nav">
        <a href="/artemis-frontend/" className="cartier-bg-nav__back">
          ← Home
        </a>

        <div className="cartier-bg-nav__center">
          <span className="cartier-bg-nav__dot" />
          <span className="cartier-bg-nav__title">Cartier 3D Room Background</span>
        </div>
      </nav>

      {/* Bottom HUD */}
      <div className="cartier-bg-hud-bottom">
        <span className="cartier-bg-hud-title">Interactive Parallax · Move Cursor</span>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="cartier-bg-loading">
          <div className="cartier-bg-spinner" />
          <div className="cartier-bg-loading-text">Loading 3D Room Model...</div>
        </div>
      )}
    </div>
  )
}
