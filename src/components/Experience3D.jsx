import React, { /*useRef,*/ useEffect, /*useCallback, useState*/ } from 'react'
import { Canvas, useThree, /*useFrame*/ } from '@react-three/fiber'
import { /*OrbitControls,*/ Environment, ContactShadows } from '@react-three/drei'
import { ChairModel } from './ChairModel'
import * as THREE from 'three'

// // Detects if the device is mobile/touch
// const isMobile = () =>
//   typeof window !== 'undefined' &&
//   /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)

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

// // Reads DeviceOrientation and smoothly rotates the chair group on mobile
// function GyroChairRotation({ gyroRef, enabled }) {
//   useFrame(() => {
//     if (!enabled || !gyroRef.current) return
//     gyroRef.current.rotation.y = THREE.MathUtils.lerp(
//       gyroRef.current.rotation.y,
//       gyroRef.current.userData.targetY ?? 0,
//       0.08
//     )
//     gyroRef.current.rotation.x = THREE.MathUtils.lerp(
//       gyroRef.current.rotation.x,
//       gyroRef.current.userData.targetX ?? 0,
//       0.08
//     )
//   })
//   return null
// }

export function Experience3D({ scrollProgress = 0 }) {
  // const controlsRef = useRef()
  // const chairGroupRef = useRef()
  // const [gyroEnabled, setGyroEnabled] = useState(false)
  // const baseAlpha = useRef(null)

  // // DeviceOrientation handler
  // const handleOrientation = useCallback((e) => {
  //   if (!chairGroupRef.current) return
  //   const alpha = e.alpha ?? 0
  //   const beta = e.beta ?? 0
  //   const gamma = e.gamma ?? 0

  //   if (baseAlpha.current === null) baseAlpha.current = alpha

  //   const targetY = THREE.MathUtils.degToRad(gamma) * 1.2
  //   const targetX = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(beta - 45, -30, 30)) * 0.4

  //   chairGroupRef.current.userData.targetY = targetY
  //   chairGroupRef.current.userData.targetX = targetX
  // }, [])

  // // Auto-enable gyro on mobile (no prompt needed)
  // useEffect(() => {
  //   if (!isMobile()) return

  //   const tryEnable = async () => {
  //     if (typeof DeviceOrientationEvent === 'undefined') return
  //     if (typeof DeviceOrientationEvent.requestPermission === 'function') {
  //       try {
  //         const permission = await DeviceOrientationEvent.requestPermission()
  //         if (permission !== 'granted') return
  //       } catch {
  //         return
  //       }
  //     }
  //     window.addEventListener('deviceorientation', handleOrientation, true)
  //     setGyroEnabled(true)
  //   }

  //   tryEnable()
  //   return () => window.removeEventListener('deviceorientation', handleOrientation, true)
  // }, [handleOrientation])

  return (
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
          color="#38bdf8"
          castShadow
          shadow-mapSize={2048}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-4, 5, -2]} intensity={1.2} color="#ffffff" />

        <Environment preset="studio" background={false} />

        {/* Chair group — gyro rotates this group */}
        {/* <group ref={chairGroupRef} position={[0, 0, 0]}> */}
          <ChairModel scrollProgress={scrollProgress} />
        {/* </group> */}

        {/* Gyro rotation driver (runs in render loop) */}
        {/* <GyroChairRotation gyroRef={chairGroupRef} enabled={gyroEnabled} /> */}

        <ContactShadows
          position={[0, -0.001, 0]}
          opacity={0.7}
          scale={12}
          blur={3}
          far={6}
          color="#000000"
        />

        {/* <OrbitControls
          ref={controlsRef}
          makeDefault
          target={[0, 0.75, 0]}
          enablePan={false}
          enableZoom={false}
          minDistance={1.5}
          maxDistance={10}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2 + 0.1}
          autoRotate={false}
          autoRotateSpeed={1.5}
          dampingFactor={0.05}
        /> */}
      </Canvas>
    </div>
  )
}
