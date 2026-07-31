import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { ChairModel } from './ChairModel'
import * as THREE from 'three'

// Detects if the device is mobile/touch
const isMobile = () =>
  typeof window !== 'undefined' &&
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)

// Sets camera position imperatively — works even through Vite HMR
function CameraSetup() {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(0, 1.8, 4.5)
    camera.fov = 50
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

// Reads DeviceOrientation and smoothly rotates the chair group on mobile
function GyroChairRotation({ gyroRef, enabled }) {
  useFrame(() => {
    if (!enabled || !gyroRef.current) return
    // Smooth lerp toward target rotation
    gyroRef.current.rotation.y = THREE.MathUtils.lerp(
      gyroRef.current.rotation.y,
      gyroRef.current.userData.targetY ?? 0,
      0.08
    )
    gyroRef.current.rotation.x = THREE.MathUtils.lerp(
      gyroRef.current.rotation.x,
      gyroRef.current.userData.targetX ?? 0,
      0.08
    )
  })
  return null
}

export function Experience3D({
  autoRotate = false,
  envPreset = 'studio',
  floatEnabled = false,
  accentColor = '#38bdf8',
  showAnnotations = false,
  resetSignal = 0
}) {
  const controlsRef = useRef()
  const chairGroupRef = useRef()
  const [gyroEnabled, setGyroEnabled] = useState(false)
  const [showGyroPrompt, setShowGyroPrompt] = useState(false)
  const baseAlpha = useRef(null) // calibration baseline

  // Reset camera on signal
  useEffect(() => {
    if (controlsRef.current && resetSignal > 0) {
      controlsRef.current.reset()
    }
  }, [resetSignal])

  // DeviceOrientation handler
  const handleOrientation = useCallback((e) => {
    if (!chairGroupRef.current) return

    const alpha = e.alpha ?? 0 // Z-axis (compass heading) — yaw
    const beta  = e.beta  ?? 0 // X-axis — forward/back tilt (-180 to 180)
    const gamma = e.gamma ?? 0 // Y-axis — left/right tilt (-90 to 90)

    // Calibrate on first reading
    if (baseAlpha.current === null) baseAlpha.current = alpha

    // Map gamma (left/right tilt, ±90°) → Y rotation of chair
    const targetY = THREE.MathUtils.degToRad(gamma) * 1.2
    // Map beta (forward/back, ±90° useful range) → slight X tilt, clamped
    const targetX = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(beta - 45, -30, 30)) * 0.4

    chairGroupRef.current.userData.targetY = targetY
    chairGroupRef.current.userData.targetX = targetX
  }, [])

  // Start listening to gyro
  const enableGyro = useCallback(async () => {
    if (typeof DeviceOrientationEvent === 'undefined') return

    // iOS 13+ requires explicit permission
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission()
        if (permission !== 'granted') return
      } catch {
        return
      }
    }

    window.addEventListener('deviceorientation', handleOrientation, true)
    setGyroEnabled(true)
    setShowGyroPrompt(false)
  }, [handleOrientation])

  // On mobile: show the gyro prompt after mount
  useEffect(() => {
    if (isMobile()) {
      setShowGyroPrompt(true)
    }
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true)
    }
  }, [handleOrientation])

  return (
    <>
      <div className="canvas-container">
        <Canvas
          shadows
          camera={{ position: [0, 1.8, 4.5], fov: 50 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <CameraSetup />
          <color attach="background" args={['#0a0c10']} />

          <ambientLight intensity={0.7} />
          <spotLight
            position={[5, 8, 5]}
            angle={0.4}
            penumbra={1}
            intensity={2.5}
            color={accentColor}
            castShadow
            shadow-mapSize={2048}
            shadow-bias={-0.0001}
          />
          <directionalLight position={[-4, 5, -2]} intensity={1.2} color="#ffffff" />

          <Environment preset={envPreset} background={false} />

          {/* Chair group — gyro rotates this group */}
          <group ref={chairGroupRef} position={[0, 0, 0]}>
            <ChairModel
              floatEnabled={floatEnabled}
              accentColor={accentColor}
              showAnnotations={showAnnotations}
            />
          </group>

          {/* Gyro rotation driver (runs in render loop) */}
          <GyroChairRotation gyroRef={chairGroupRef} enabled={gyroEnabled} />

          <ContactShadows
            position={[0, -0.001, 0]}
            opacity={0.7}
            scale={12}
            blur={3}
            far={6}
            color="#000000"
          />

          <OrbitControls
            ref={controlsRef}
            makeDefault
            target={[0, 0.75, 0]}
            enablePan={false}
            enableZoom={true}
            minDistance={1.5}
            maxDistance={10}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 2 + 0.1}
            autoRotate={autoRotate}
            autoRotateSpeed={1.5}
            dampingFactor={0.05}
          />
        </Canvas>
      </div>

      {/* iOS Gyro Permission Prompt — shown only on mobile before permission */}
      {showGyroPrompt && !gyroEnabled && (
        <div style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          pointerEvents: 'auto'
        }}>
          <button
            onClick={enableGyro}
            style={{
              background: 'rgba(18, 22, 31, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              color: '#fff',
              padding: '12px 28px',
              borderRadius: '30px',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)',
              letterSpacing: '0.3px'
            }}
          >
            📱 Enable Gyroscope
          </button>
          <span style={{
            fontSize: '11px',
            color: 'rgba(156, 163, 175, 0.8)',
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}>
            Tilt your phone to rotate the chair
          </span>
        </div>
      )}

      {/* Active gyro indicator */}
      {gyroEnabled && (
        <div style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          background: 'rgba(18, 22, 31, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#10b981',
          padding: '8px 20px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none'
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block' }} />
          Gyroscope Active
        </div>
      )}
    </>
  )
}
