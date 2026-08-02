import React, { useRef, useMemo, useLayoutEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const GLB1 = `${import.meta.env.BASE_URL}chair.glb`
const GLB2 = `${import.meta.env.BASE_URL}chair2.glb`

const TARGET_HEIGHT     = 1.5
const SCROLL_ROTATIONS  = 3

/**
 * Clone the raw useGLTF scene so we fully own it (no shared-cache mutations).
 * Measures bounding box in clean model space, returns { scene, scale, groundY }.
 */
function prepareScene(rawScene) {
  const scene = rawScene.clone(true)

  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow    = true
      child.receiveShadow = true
      if (child.material) {
        child.material = child.material.clone()
        child.material.envMapIntensity = 1.2
        child.material.needsUpdate = true
      }
    }
  })

  scene.position.set(0, 0, 0)
  scene.scale.set(1, 1, 1)
  scene.rotation.set(0, 0, 0)
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

/**
 * Sample the dominant color from a scene's largest-mesh texture.
 * Draws the texture to a tiny offscreen canvas and averages non-extreme pixels.
 * Returns a THREE.Color, or null if no texture is found.
 */
function sampleDominantColor(scene) {
  // Find the mesh with the most vertices that has an albedo texture
  let bestMesh = null
  let bestCount = 0

  scene.traverse((child) => {
    if (child.isMesh && child.material?.map?.image) {
      const count = child.geometry?.attributes?.position?.count ?? 0
      if (count > bestCount) {
        bestCount = count
        bestMesh = child
      }
    }
  })

  // Fall back to any mesh with a solid material color
  if (!bestMesh) {
    let fallbackColor = null
    scene.traverse((child) => {
      if (child.isMesh && child.material?.color && !fallbackColor) {
        fallbackColor = child.material.color.clone()
      }
    })
    return fallbackColor
  }

  try {
    const img = bestMesh.material.map.image
    const canvas = document.createElement('canvas')
    canvas.width  = 16
    canvas.height = 16
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, 16, 16)
    const data = ctx.getImageData(0, 0, 16, 16).data

    let r = 0, g = 0, b = 0, n = 0
    for (let i = 0; i < data.length; i += 4) {
      // Skip near-black and near-white pixels — they skew the average
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
      if (brightness > 25 && brightness < 235) {
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
        n++
      }
    }

    if (n === 0) return null
    return new THREE.Color(r / n / 255, g / n / 255, b / n / 255)
  } catch {
    // Canvas tainted (shouldn't happen on same origin) or image not ready
    return null
  }
}

export function ChairModel({ scrollProgress = 0 }) {
  const { scene: raw1 } = useGLTF(GLB1)
  const { scene: raw2 } = useGLTF(GLB2)

  const c1 = useMemo(() => prepareScene(raw1), [raw1])
  const c2 = useMemo(() => prepareScene(raw2), [raw2])

  const ref1 = useRef()
  const ref2 = useRef()

  // Sample chair 1's dominant color and apply it to all of chair 2's meshes
  useLayoutEffect(() => {
    const color = sampleDominantColor(c1.scene)
    if (!color) return

    // Also grab roughness + metalness from chair 1's primary material for a closer match
    let roughness = 0.6
    let metalness = 0.1
    c1.scene.traverse((child) => {
      if (child.isMesh && child.material) {
        roughness = child.material.roughness ?? roughness
        metalness = child.material.metalness ?? metalness
      }
    })

    c2.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color,
          roughness,
          metalness,
          envMapIntensity: 1.2,
        })
      }
    })
  }, [c1, c2])

  useFrame(() => {
    if (!ref1.current || !ref2.current) return

    const totalRot = scrollProgress * SCROLL_ROTATIONS
    const targetY  = totalRot * Math.PI * 2

    ref1.current.rotation.y = THREE.MathUtils.lerp(ref1.current.rotation.y, targetY, 0.05)
    ref2.current.rotation.y = ref1.current.rotation.y

    const showChair2 = Math.floor(totalRot) % 2 === 1
    ref1.current.visible = !showChair2
    ref2.current.visible = showChair2
  })

  return (
    <>
      {/* Chair 1 */}
      <group ref={ref1} scale={c1.scale} position={[0, c1.groundY, 0]}>
        <primitive object={c1.scene} />
      </group>

      {/* Chair 2 — 180° Y offset so correct side faces camera */}
      <group ref={ref2} scale={c2.scale} position={[0, c2.groundY, 0]}>
        <primitive object={c2.scene} rotation={[0, Math.PI, 0]} />
      </group>
    </>
  )
}

useGLTF.preload(GLB1)
useGLTF.preload(GLB2)
