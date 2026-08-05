import React, { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { ChairModel } from './ChairModel'
import { ManufactureEnvironment } from './ManufactureEnvironment'
import * as THREE from 'three'

// Sets camera position & ACES Filmic Tone Mapping
function CameraSetup() {
  const { camera, gl } = useThree()
  useEffect(() => {
    camera.position.set(0, 1.8, 4.5)
    camera.fov = 50
    camera.updateProjectionMatrix()

    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.15
  }, [camera, gl])
  return null
}

export function Experience3D({
  scrollProgress = 0,
  materialPreset = 'gold',
  lightsConfig = { keySpot: true, tealPanels: true, rimLight: true },
  postConfig = { bloom: true, vignette: true, noise: true }
}) {
  return (
    <div className="canvas-container">
      <Canvas
        shadows
        camera={{ position: [0, 1.8, 4.5], fov: 50 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <CameraSetup />
        <color attach="background" args={['#06070a']} />

        {/* --- CARTIER EXTRACTED LIGHT RIG --- */}

        {/* Ambient Fill Light */}
        <ambientLight intensity={0.4} color="#fff4e6" />

        {/* Warm Golden Key Spotlight (Top Front-Right) */}
        {lightsConfig.keySpot && (
          <spotLight
            position={[5, 8, 4]}
            target-position={[0, 0.8, 0]}
            angle={0.4}
            penumbra={0.8}
            intensity={3.5}
            color="#ffd700"
            castShadow
            shadow-mapSize={2048}
            shadow-bias={-0.0001}
          />
        )}

        {/* Warm Rim Light (Rear Back-Left catching gold bevels) */}
        {lightsConfig.rimLight && (
          <spotLight
            position={[-5, 6, -3]}
            target-position={[0, 0.75, 0]}
            angle={0.5}
            penumbra={0.9}
            intensity={2.8}
            color="#ffdf9e"
            castShadow
          />
        )}

        {/* Directional Fill Light */}
        <directionalLight position={[-4, 5, 2]} intensity={0.8} color="#ffffff" />

        {/* Studio PMREM Environment Map for Metallic Reflections */}
        <Environment preset="studio" background={false} />

        {/* --- "THE MANUFACTURE" ENVIRONMENT BACKDROP --- */}
        <ManufactureEnvironment
          showPanels={lightsConfig.tealPanels}
          showVolumetricBeams={lightsConfig.volumetricBeams ?? true}
        />

        {/* --- HERO 3D CHAIR MODEL --- */}
        <ChairModel scrollProgress={scrollProgress} materialPreset={materialPreset} />

        {/* Ground Contact Shadows */}
        <ContactShadows
          position={[0, -0.001, 0]}
          opacity={0.8}
          scale={12}
          blur={2.5}
          far={6}
          color="#000000"
        />

        {/* --- CARTIER EXTRACTED POST-PROCESSING CHAIN --- */}
        <EffectComposer disableNormalPass>
          {postConfig.bloom && (
            <Bloom
              intensity={0.6}
              luminanceThreshold={0.7}
              luminanceSmoothing={0.3}
              mipmapBlur
            />
          )}
          {postConfig.vignette && (
            <Vignette
              eskil={false}
              offset={0.3}
              darkness={0.85}
              blendFunction={BlendFunction.NORMAL}
            />
          )}
          {postConfig.noise && (
            <Noise
              opacity={0.025}
              blendFunction={BlendFunction.OVERLAY}
            />
          )}
          <ChromaticAberration
            offset={[0.0015, 0.0015]}
            radialModulation={false}
            modulationOffset={0}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
