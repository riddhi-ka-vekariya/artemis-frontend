import React, { useRef, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const GLB1 = `${import.meta.env.BASE_URL}chair.glb`
const GLB2 = `${import.meta.env.BASE_URL}chair2.glb`

const TARGET_HEIGHT    = 1.5  // normalized height in Three.js units
const SCROLL_ROTATIONS = 3    // total full rotations over the entire scroll range
const FADE_SPEED       = 0.08

/**
 * Clone the raw useGLTF scene so we fully own it.
 * Uses a screen-space dither dissolve shader so transparent=false and depthWrite=true
 * remain active — preventing complex 3D meshes from rendering inner/back faces through outer faces.
 */
function prepareScene(rawScene, correctionEuler = null) {
  const scene = rawScene.clone(true)

  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow    = true
      child.receiveShadow = true
      if (child.material) {
        const mat = child.material.clone()
        mat.envMapIntensity = 1.2
        mat.transparent     = false
        mat.depthWrite      = true

        mat.customProgramCacheKey = () => 'ditherFadeShader'
        mat.onBeforeCompile = (shader) => {
          shader.uniforms.uFadeOpacity = { value: 1.0 }
          shader.fragmentShader = `
            uniform float uFadeOpacity;
          ` + shader.fragmentShader
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <clipping_planes_fragment>',
            `
            #include <clipping_planes_fragment>
            if (uFadeOpacity < 0.999) {
              float rng = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
              if (uFadeOpacity < rng) discard;
            }
            `
          )
          mat.userData.shader = shader
        }

        child.material = mat
      }
    }
  })

  if (correctionEuler) {
    scene.rotation.copy(correctionEuler)
  } else {
    scene.rotation.set(0, 0, 0)
  }
  scene.position.set(0, 0, 0)
  scene.scale.set(1, 1, 1)
  scene.updateMatrixWorld(true)

  const box = new THREE.Box3().setFromObject(scene)
  const size = new THREE.Vector3()
  box.getSize(size)
  const maxDim  = Math.max(size.x, size.y, size.z)
  const scale   = TARGET_HEIGHT / maxDim
  const groundY = -box.min.y * scale

  scene.rotation.set(0, 0, 0)
  scene.updateMatrixWorld(true)

  return { scene, scale, groundY }
}

function applyOpacity(group, value) {
  if (!group) return
  const clamped = THREE.MathUtils.clamp(value, 0, 1)
  group.traverse((child) => {
    if (child.isMesh && child.material) {
      if (child.material.userData?.shader?.uniforms?.uFadeOpacity) {
        child.material.userData.shader.uniforms.uFadeOpacity.value = clamped
      }
    }
  })
}

export function ChairModel({ scrollProgress = 0 }) {
  const { scene: raw1 } = useGLTF(GLB1)
  const { scene: raw2 } = useGLTF(GLB2)

  const c1 = useMemo(() => prepareScene(raw1), [raw1])
  const c2 = useMemo(() => prepareScene(raw2), [raw2])

  const ref1 = useRef()
  const ref2 = useRef()
  const o1   = useRef(1)
  const o2   = useRef(0)

  useFrame(() => {
    if (!ref1.current || !ref2.current) return

    const totalRot = scrollProgress * SCROLL_ROTATIONS
    const targetY  = totalRot * Math.PI * 2

    ref1.current.rotation.y = THREE.MathUtils.lerp(ref1.current.rotation.y, targetY, 0.05)
    ref2.current.rotation.y = ref1.current.rotation.y

    const showChair2 = Math.floor(totalRot) % 2 === 1
    o1.current = THREE.MathUtils.lerp(o1.current, showChair2 ? 0 : 1, FADE_SPEED)
    o2.current = THREE.MathUtils.lerp(o2.current, showChair2 ? 1 : 0, FADE_SPEED)

    applyOpacity(ref1.current, o1.current)
    applyOpacity(ref2.current, o2.current)

    ref1.current.visible = o1.current > 0.001
    ref2.current.visible = o2.current > 0.001
  })

  return (
    <>
      {/* Chair 1 */}
      <group ref={ref1} scale={c1.scale} position={[0, c1.groundY, 0]}>
        <primitive object={c1.scene} />
      </group>

      {/* Chair 2 */}
      <group ref={ref2} scale={c2.scale} position={[0, c2.groundY, 0]}>
        <primitive object={c2.scene} rotation={[0, Math.PI, 0]} />
      </group>
    </>
  )
}

useGLTF.preload(GLB1)
useGLTF.preload(GLB2)
