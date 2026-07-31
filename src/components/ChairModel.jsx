import React, { useRef, useLayoutEffect, useState } from 'react'
import { useGLTF, Float, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Resolve GLB path relative to Vite base (works on GitHub Pages and locally)
const GLB_PATH = `${import.meta.env.BASE_URL}chair.glb`

// Target height for the chair in Three.js units (1.5 = ~1.5m, fits nicely in view)
const TARGET_HEIGHT = 1.5

export function ChairModel({ floatEnabled = false, accentColor = '#38bdf8', showAnnotations = false }) {
  const { scene } = useGLTF(GLB_PATH)
  const modelRef = useRef()
  const [transform, setTransform] = useState({ scale: 1, groundY: 0 })

  useLayoutEffect(() => {
    // 1. Configure shadows & materials first
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          child.material.envMapIntensity = 1.2
          child.material.needsUpdate = true
        }
      }
    })

    // 2. Compute raw bounding box of the unscaled scene
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    box.getSize(size)

    // 3. Normalize scale so the tallest dimension = TARGET_HEIGHT
    const maxDimension = Math.max(size.x, size.y, size.z)
    const normalizedScale = TARGET_HEIGHT / maxDimension

    // 4. With the normalized scale applied, the bottom of the chair
    //    would be at (box.min.y * normalizedScale). Negate to lift to Y=0.
    const groundY = -box.min.y * normalizedScale

    setTransform({ scale: normalizedScale, groundY })
  }, [scene])

  useFrame((state) => {
    if (modelRef.current && floatEnabled) {
      modelRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.15
    }
  })

  const content = (
    <primitive
      ref={modelRef}
      object={scene}
      scale={transform.scale}
      position={[0, transform.groundY, 0]}
    />
  )

  return (
    <group>
      {floatEnabled ? (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
          {content}
        </Float>
      ) : (
        content
      )}

      {showAnnotations && (
        <>
          <Html position={[0, TARGET_HEIGHT * 0.85, 0.3]} distanceFactor={6} center>
            <div style={{
              background: 'rgba(10, 12, 16, 0.85)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${accentColor}`,
              padding: '6px 12px',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '11px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              boxShadow: `0 0 12px ${accentColor}40`
            }}>
              ✨ Lumbar Support
            </div>
          </Html>
          <Html position={[0.4, TARGET_HEIGHT * 0.35, 0]} distanceFactor={6} center>
            <div style={{
              background: 'rgba(10, 12, 16, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '6px 12px',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '11px',
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}>
              🪑 Precision Aluminum
            </div>
          </Html>
        </>
      )}
    </group>
  )
}

useGLTF.preload(GLB_PATH)
