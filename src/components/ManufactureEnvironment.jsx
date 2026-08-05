import React, { useRef } from 'react'
import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Cartier "The Manufacture" Environment Backdrop with Atmospheric Background Effects:
 * - Volumetric Light Cones (Spotlight beams)
 * - Floating Gold Dust & Ember Particles
 * - Cool Teal Wall Panel Glow & Shimmer
 * - Rolling Floor Atmosphere Mist
 * - Architectural Silhouettes (Staircase & Workbenches)
 */
export function ManufactureEnvironment({ showPanels = true, showVolumetricBeams = true }) {
  const leftPanelRef = useRef()
  const rightPanelRef = useRef()
  const mistRef = useRef()

  // Gentle pulsing animation for panel emissive glow and floor mist drift
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (leftPanelRef.current && rightPanelRef.current) {
      const pulse = 0.5 + Math.sin(t * 1.5) * 0.15
      leftPanelRef.current.emissiveIntensity = pulse
      rightPanelRef.current.emissiveIntensity = pulse
    }
    if (mistRef.current) {
      mistRef.current.rotation.z = t * 0.03
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Dark Ambient Room Box */}
      <mesh position={[0, 5, -8]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#050608" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* --- ATMOSPHERIC VOLUMETRIC LIGHT CONE --- */}
      {showVolumetricBeams && (
        <group position={[4.5, 7.5, 3.5]} rotation={[0.45, 0.4, -0.6]}>
          <mesh>
            <coneGeometry args={[2.5, 12, 32, 1, true]} />
            <meshBasicMaterial
              color="#ffd700"
              transparent
              opacity={0.08}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {/* --- FLOATING GOLD DUST & EMBER PARTICLES --- */}
      <Sparkles
        count={80}
        scale={[12, 8, 12]}
        size={3.5}
        speed={0.4}
        opacity={0.7}
        color="#ffd700"
        position={[0, 3, 0]}
      />

      {/* --- COOL TEAL PARTICLES NEAR WALL PANELS --- */}
      <Sparkles
        count={45}
        scale={[14, 6, 8]}
        size={2.5}
        speed={0.3}
        opacity={0.6}
        color="#008b8b"
        position={[0, 2.5, -3]}
      />

      {/* Dual Illuminated Teal Artwork Panels */}
      {showPanels && (
        <>
          {/* Left Teal Artwork Panel */}
          <group position={[-5.5, 2.5, -4.5]} rotation={[0, Math.PI * 0.08, 0]}>
            {/* Outer Gold Frame */}
            <mesh>
              <boxGeometry args={[2.4, 4.2, 0.08]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.25} />
            </mesh>
            {/* Inner Teal Canvas */}
            <mesh position={[0, 0, 0.05]}>
              <planeGeometry args={[2.2, 4.0]} />
              <meshStandardMaterial
                ref={leftPanelRef}
                color="#006666"
                emissive="#004d4d"
                emissiveIntensity={0.6}
                roughness={0.4}
                metalness={0.3}
              />
            </mesh>
            {/* Geometric Gold Accent Inlay */}
            <mesh position={[0, 0, 0.07]}>
              <ringGeometry args={[0.6, 0.75, 32]} />
              <meshStandardMaterial color="#f3e5ab" metalness={0.95} roughness={0.15} />
            </mesh>
            {/* Panel Point Light Glow */}
            <pointLight position={[0, 0, 0.5]} color="#008b8b" intensity={3.5} distance={7} />
          </group>

          {/* Right Teal Artwork Panel */}
          <group position={[5.5, 2.5, -4.5]} rotation={[0, -Math.PI * 0.08, 0]}>
            {/* Outer Gold Frame */}
            <mesh>
              <boxGeometry args={[2.4, 4.2, 0.08]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.25} />
            </mesh>
            {/* Inner Teal Canvas */}
            <mesh position={[0, 0, 0.05]}>
              <planeGeometry args={[2.2, 4.0]} />
              <meshStandardMaterial
                ref={rightPanelRef}
                color="#006666"
                emissive="#004d4d"
                emissiveIntensity={0.6}
                roughness={0.4}
                metalness={0.3}
              />
            </mesh>
            {/* Geometric Gold Accent Inlay */}
            <mesh position={[0, 0, 0.07]}>
              <ringGeometry args={[0.6, 0.75, 32]} />
              <meshStandardMaterial color="#f3e5ab" metalness={0.95} roughness={0.15} />
            </mesh>
            {/* Panel Point Light Glow */}
            <pointLight position={[0, 0, 0.5]} color="#008b8b" intensity={3.5} distance={7} />
          </group>
        </>
      )}

      {/* Silhouetted Spiral Staircase Motif in Background */}
      <group position={[0, 0, -6.5]}>
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 1.5 - Math.PI * 0.75
          const radius = 2.8
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          const y = i * 0.35 - 1.5
          return (
            <mesh key={i} position={[x, y, z]} rotation={[0, -angle, 0]} receiveShadow castShadow>
              <boxGeometry args={[1.2, 0.08, 0.5]} />
              <meshStandardMaterial color="#12151c" roughness={0.7} metalness={0.4} />
            </mesh>
          )
        })}
        {/* Staircase Central Pillar */}
        <mesh position={[-0.5, 1, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 6, 16]} />
          <meshStandardMaterial color="#1a1d26" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Silhouetted Workbenches in Background Left and Right */}
      <group position={[-4, -0.4, -4]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[2.5, 0.7, 1.2]} />
          <meshStandardMaterial color="#10131a" roughness={0.8} metalness={0.2} />
        </mesh>
      </group>
      <group position={[4, -0.4, -4]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[2.5, 0.7, 1.2]} />
          <meshStandardMaterial color="#10131a" roughness={0.8} metalness={0.2} />
        </mesh>
      </group>

      {/* Rolling Floor Atmosphere Mist */}
      <mesh ref={mistRef} position={[0, 0.05, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1, 12, 32]} />
        <meshBasicMaterial
          color="#152028"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Workshop Floor */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial
          color="#07080b"
          roughness={0.4}
          metalness={0.5}
        />
      </mesh>
    </group>
  )
}
