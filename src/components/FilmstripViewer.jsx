import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

// ── Filmstrip path points (Möbius loop centerline, 180 pts, closed) ──
const PATH_POINTS = [
  [1.1774, -1.4149, 0.5685], [1.2404, -1.3725, 0.5795], [1.303, -1.3291, 0.5885], [1.365, -1.2847, 0.5954],
  [1.4261, -1.2394, 0.6], [1.4861, -1.1929, 0.6022], [1.5448, -1.1454, 0.602], [1.6019, -1.0967, 0.5992],
  [1.6571, -1.0468, 0.5937], [1.7103, -0.9957, 0.5853], [1.7611, -0.9433, 0.5741], [1.8094, -0.8896, 0.5598],
  [1.8549, -0.8345, 0.5424], [1.8974, -0.778, 0.5217], [1.9366, -0.7201, 0.4976], [1.9725, -0.6608, 0.4703],
  [2.0049, -0.6003, 0.4399], [2.0339, -0.5388, 0.4068], [2.0596, -0.4765, 0.3713], [2.0817, -0.4136, 0.3336],
  [2.1005, -0.3503, 0.2939], [2.1158, -0.2867, 0.2526], [2.1276, -0.223, 0.21], [2.136, -0.1595, 0.1663],
  [2.1408, -0.0963, 0.1217], [2.1422, -0.0335, 0.0767], [2.1402, 0.0289, 0.0315], [2.1346, 0.0909, -0.0136],
  [2.1257, 0.1525, -0.0583], [2.1133, 0.2136, -0.1022], [2.0976, 0.2743, -0.1451], [2.0784, 0.3346, -0.1865],
  [2.0559, 0.3944, -0.2262], [2.0301, 0.4537, -0.2639], [2.0009, 0.5125, -0.2994], [1.9686, 0.5709, -0.3325],
  [1.9334, 0.6288, -0.3632], [1.8954, 0.6863, -0.3915], [1.8548, 0.7433, -0.4175], [1.8119, 0.7999, -0.4411],
  [1.7667, 0.8562, -0.4622], [1.7196, 0.9121, -0.4809], [1.6706, 0.9676, -0.4972], [1.62, 1.0228, -0.511],
  [1.568, 1.0776, -0.5223], [1.5147, 1.1321, -0.5312], [1.4604, 1.1863, -0.5375], [1.4051, 1.2401, -0.5413],
  [1.3489, 1.2933, -0.5426], [1.292, 1.3458, -0.5413], [1.2343, 1.3974, -0.5373], [1.176, 1.4479, -0.5308],
  [1.1171, 1.4972, -0.5216], [1.0578, 1.5451, -0.5097], [0.9981, 1.5915, -0.4951], [0.938, 1.6361, -0.4779],
  [0.8777, 1.6789, -0.4578], [0.8173, 1.7196, -0.435], [0.7567, 1.7581, -0.4094], [0.6962, 1.7942, -0.381],
  [0.6357, 1.8279, -0.3498], [0.5753, 1.8588, -0.3159], [0.515, 1.887, -0.2796], [0.4548, 1.9123, -0.2413],
  [0.3945, 1.9345, -0.2012], [0.3342, 1.9536, -0.1597], [0.2739, 1.9694, -0.1171], [0.2135, 1.9818, -0.0736],
  [0.153, 1.9908, -0.0297], [0.0924, 1.9961, 0.0144], [0.0316, 1.9976, 0.0584], [-0.0294, 1.9953, 0.102],
  [-0.0905, 1.9892, 0.1449], [-0.1518, 1.9795, 0.1871], [-0.2132, 1.9664, 0.2283], [-0.2747, 1.95, 0.2685],
  [-0.3363, 1.9304, 0.3075], [-0.3978, 1.9078, 0.345], [-0.4594, 1.8825, 0.3811], [-0.521, 1.8545, 0.4154],
  [-0.5825, 1.8239, 0.448], [-0.6439, 1.7911, 0.4785], [-0.7052, 1.756, 0.5069], [-0.7664, 1.7189, 0.533],
  [-0.8274, 1.68, 0.5567], [-0.8882, 1.6393, 0.5778], [-0.9488, 1.5971, 0.5961], [-1.0091, 1.5535, 0.6116],
  [-1.0691, 1.5087, 0.624], [-1.1289, 1.4628, 0.6332], [-1.1883, 1.416, 0.6391], [-1.2473, 1.3684, 0.6414],
  [-1.306, 1.3202, 0.6402], [-1.3642, 1.2716, 0.6351], [-1.422, 1.2227, 0.626], [-1.4792, 1.1736, 0.613],
  [-1.5355, 1.1243, 0.5962], [-1.5906, 1.0747, 0.5758], [-1.6442, 1.0249, 0.552], [-1.6959, 0.9747, 0.5251],
  [-1.7455, 0.9242, 0.4951], [-1.7927, 0.8734, 0.4623], [-1.8371, 0.8221, 0.427], [-1.8783, 0.7703, 0.3893],
  [-1.9162, 0.7181, 0.3494], [-1.9503, 0.6654, 0.3075], [-1.9804, 0.6121, 0.2638], [-2.0062, 0.5583, 0.2186],
  [-2.0279, 0.5038, 0.1721], [-2.0456, 0.4487, 0.1247], [-2.0595, 0.393, 0.0766], [-2.0696, 0.3365, 0.0282],
  [-2.0761, 0.2794, -0.0202], [-2.0792, 0.2215, -0.0683], [-2.079, 0.1628, -0.1158], [-2.0755, 0.1033, -0.1624],
  [-2.0691, 0.043, -0.2078], [-2.0597, -0.0182, -0.2517], [-2.0476, -0.0803, -0.2937], [-2.0328, -0.1432, -0.3338],
  [-2.0154, -0.2068, -0.3718], [-1.9956, -0.2711, -0.4077], [-1.9733, -0.3359, -0.4415], [-1.9486, -0.4011, -0.4731],
  [-1.9218, -0.4666, -0.5026], [-1.8927, -0.5322, -0.5298], [-1.8616, -0.5979, -0.5548], [-1.8284, -0.6635, -0.5775],
  [-1.7933, -0.729, -0.5979], [-1.7564, -0.7941, -0.6159], [-1.7177, -0.8589, -0.6316], [-1.6773, -0.9231, -0.6448],
  [-1.6352, -0.9866, -0.6556], [-1.5917, -1.0494, -0.6639], [-1.5467, -1.1113, -0.6697], [-1.5003, -1.1723, -0.6729],
  [-1.4527, -1.2321, -0.6736], [-1.4038, -1.2907, -0.6716], [-1.3538, -1.348, -0.667], [-1.3028, -1.4039, -0.6596],
  [-1.2508, -1.4581, -0.6496], [-1.1979, -1.5107, -0.6368], [-1.1442, -1.5615, -0.6213], [-1.0898, -1.6104, -0.6029],
  [-1.0347, -1.6572, -0.5816], [-0.9791, -1.702, -0.5575], [-0.923, -1.7444, -0.5304], [-0.8665, -1.7845, -0.5005],
  [-0.8095, -1.822, -0.4679], [-0.7522, -1.8567, -0.433], [-0.6944, -1.8884, -0.396], [-0.6362, -1.9169, -0.3572],
  [-0.5775, -1.9421, -0.317], [-0.5184, -1.9636, -0.2756], [-0.4588, -1.9814, -0.2333], [-0.3988, -1.9952, -0.1904],
  [-0.3383, -2.0048, -0.1472], [-0.2774, -2.0102, -0.104], [-0.2161, -2.0116, -0.061], [-0.1543, -2.0091, -0.0185],
  [-0.0922, -2.003, 0.0233], [-0.0298, -1.9934, 0.0641], [0.0329, -1.9805, 0.1036], [0.0958, -1.9645, 0.1416],
  [0.159, -1.9455, 0.1779], [0.2224, -1.9239, 0.2127], [0.286, -1.8999, 0.2459], [0.3497, -1.8737, 0.2778],
  [0.4134, -1.8457, 0.3082], [0.4773, -1.8161, 0.3375], [0.5411, -1.7852, 0.3655], [0.605, -1.7531, 0.3923],
  [0.6688, -1.7197, 0.4179], [0.7327, -1.6853, 0.4422], [0.7965, -1.6497, 0.465], [0.8602, -1.6131, 0.4864],
  [0.9238, -1.5754, 0.5062], [0.9874, -1.5368, 0.5244], [1.0508, -1.4971, 0.5409], [1.1142, -1.4565, 0.5556],
]

// ── Helpers ───────────────────────────────────────────────────────────
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

function drawCover(ctx, img, x, y, w, h) {
  const ir = img.width / img.height, tr = w / h
  let sx, sy, sw, sh
  if (ir > tr) { sh = img.height; sw = sh * tr; sx = (img.width - sw) / 2; sy = 0 }
  else { sw = img.width; sh = sw / tr; sx = 0; sy = (img.height - sh) / 2 }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

async function buildFilmTexture(renderer) {
  const frameCount = 16, cell = 220, holeRowH = 34
  const W = cell * frameCount, H = (cell - 12) + holeRowH * 2 + 8
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#040404'; ctx.fillRect(0, 0, W, H)
  const labels = ['STUDIO', 'LIGHT / SPACE', 'DETAIL', 'FORM', 'CINEMA', 'MATERIAL', 'FRAME', 'TEXTURE']
  const seeds = ['104', '1015', '1025', '1039', '1041', '1043', '1050', '1069', '1074', '1084', '1080', '1069', '1041', '1025', '1015', '104']
  const urls = seeds.map((s, i) => `https://picsum.photos/seed/${s}-${i}/400/400`)
  let images = []
  try { images = await Promise.all(urls.map(loadImage)) } catch { images = [] }
  for (let i = 0; i < frameCount; i++) {
    const x0 = i * cell, px = x0 + 6, py = holeRowH + 4, pw = cell - 12, ph = pw
    if (images[i]) {
      ctx.save(); roundRect(ctx, px, py, pw, ph, 4); ctx.clip()
      drawCover(ctx, images[i], px, py, pw, ph)
      ctx.fillStyle = 'rgba(4,4,4,0.32)'; ctx.fillRect(px, py, pw, ph); ctx.restore()
    } else {
      const grad = ctx.createLinearGradient(x0, py, x0, py + ph)
      grad.addColorStop(0, '#1c1917'); grad.addColorStop(1, '#040404')
      ctx.fillStyle = grad; ctx.fillRect(px, py, pw, ph)
    }
    ctx.fillStyle = 'rgba(239,233,223,0.75)'
    ctx.font = '500 12px "Behind The Nineties Sans SemiBold", "Behind The Nineties", monospace'
    ctx.textAlign = 'left'
    ctx.shadowColor = 'rgba(0,0,0,0.9)'
    ctx.shadowBlur = 4
    ctx.fillText(labels[i % labels.length], x0 + 12, H - holeRowH - 10)
    ctx.shadowBlur = 0
  }
  // ── Metallic silver border bands (top & bottom) ──
  function paintSilverBand(y0, bH) {
    // Layer 1: brushed-metal horizontal gradient (sweeps across strip length)
    const metalGrad = ctx.createLinearGradient(0, y0, W, y0)
    metalGrad.addColorStop(0, '#5E5E62')
    metalGrad.addColorStop(0.15, '#A0A0A4')
    metalGrad.addColorStop(0.35, '#7A7A7E')
    metalGrad.addColorStop(0.5, '#C2C2C6')
    metalGrad.addColorStop(0.65, '#888890')
    metalGrad.addColorStop(0.85, '#ABABAF')
    metalGrad.addColorStop(1, '#6A6A6E')
    ctx.fillStyle = metalGrad
    ctx.fillRect(0, y0, W, bH)
    // Layer 2: vertical hairline streaks
    ctx.globalAlpha = 0.07
    for (let sx = 0; sx < W; sx += 1.5) {
      const b = 140 + Math.floor(Math.random() * 60)
      ctx.fillStyle = `rgb(${b},${b},${b + 4})`
      ctx.fillRect(sx, y0, 0.8, bH)
    }
    ctx.globalAlpha = 1.0
    // Layer 3: central specular shine (horizontal)
    const shineGrad = ctx.createLinearGradient(0, y0, W, y0)
    shineGrad.addColorStop(0, 'rgba(255,255,255,0)')
    shineGrad.addColorStop(0.3, 'rgba(255,255,255,0.10)')
    shineGrad.addColorStop(0.5, 'rgba(255,255,255,0.18)')
    shineGrad.addColorStop(0.7, 'rgba(255,255,255,0.10)')
    shineGrad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = shineGrad
    ctx.fillRect(0, y0, W, bH)
    // Layer 4: left & right edge glow
    const glowW = W * 0.04
    const glowL = ctx.createLinearGradient(0, y0, glowW, y0)
    glowL.addColorStop(0, 'rgba(200,205,215,0.35)')
    glowL.addColorStop(1, 'rgba(200,205,215,0)')
    ctx.fillStyle = glowL; ctx.fillRect(0, y0, glowW, bH)
    const glowR = ctx.createLinearGradient(W, y0, W - glowW, y0)
    glowR.addColorStop(0, 'rgba(200,205,215,0.35)')
    glowR.addColorStop(1, 'rgba(200,205,215,0)')
    ctx.fillStyle = glowR; ctx.fillRect(W - glowW, y0, glowW, bH)
  }
  paintSilverBand(0, holeRowH + 4)              // top border
  paintSilverBand(H - holeRowH - 4, holeRowH + 4) // bottom border

  // ── Sprocket holes punched through the silver ──
  ctx.fillStyle = '#040404'
  const holeW = 16, holeH = 20, gap = 14
  for (let x = 8; x < W; x += holeW + gap) {
    roundRect(ctx, x, 8, holeW, holeH, 4); ctx.fill()
    roundRect(ctx, x, H - 8 - holeH, holeW, holeH, 4); ctx.fill()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
  tex.needsUpdate = true
  return tex
}

function buildStripFromPath(pathPts, width, vSeg, textureRepeats) {
  const N = pathPts.length
  const pts = pathPts.map(p => new THREE.Vector3(p[0], p[1], p[2]))
  function tangentAt(i) {
    return pts[(i + 1) % N].clone().sub(pts[(i - 1 + N) % N]).normalize()
  }
  const T0 = tangentAt(0)
  const upGuess = Math.abs(T0.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)
  let N0 = upGuess.clone().sub(T0.clone().multiplyScalar(upGuess.dot(T0))).normalize()
  const normals = [N0]
  for (let i = 1; i < N; i++) {
    const Ti = tangentAt(i), prev = normals[i - 1]
    let Ni = prev.clone().sub(Ti.clone().multiplyScalar(prev.dot(Ti)))
    normals.push(Ni.lengthSq() < 1e-10 ? prev.clone() : Ni.normalize())
  }
  const positions = [], uvs = [], indices = []
  for (let i = 0; i < N; i++) {
    const center = pts[i], normal = normals[i]
    for (let j = 0; j <= vSeg; j++) {
      const p = center.clone().addScaledVector(normal, (j / vSeg - 0.5) * width)
      positions.push(p.x, p.y, p.z); uvs.push((i / N) * textureRepeats, j / vSeg)
    }
  }
  for (let i = 0; i < N; i++) {
    const iN = (i + 1) % N
    for (let j = 0; j < vSeg; j++) {
      const a = i * (vSeg + 1) + j, b = iN * (vSeg + 1) + j, c2 = iN * (vSeg + 1) + j + 1, d = i * (vSeg + 1) + j + 1
      indices.push(a, b, d, b, c2, d)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setIndex(indices)
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.computeVertexNormals()
  return geo
}

// Fixed position & angle locked values
const CAM_POS = [1.10, 0.30, 6.00]
const MOBILE_CAM_POS = [1.10, 0.30, 6.80]
const MOBILE_FILM_OFFSET = 1
const ROT_VAL = [1.39, 0.42, 0.00]
const MOBILE_ROT_VAL = [-93, 115, 90].map(angle => THREE.MathUtils.degToRad(angle))
const MOBILE_STRIP_SCALE = 1.45

// ── Component ─────────────────────────────────────────────────────────
export default function FilmstripViewer() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let rafId = null, disposed = false
    let filmTexture = null

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x040404)
    scene.fog = new THREE.Fog(0x040404, 14, 30)

    const camera = new THREE.PerspectiveCamera(42, container.offsetWidth / container.offsetHeight, 0.1, 100)
    camera.position.set(...(window.matchMedia('(max-width: 768px)').matches ? MOBILE_CAM_POS : CAM_POS))
    camera.filmOffset = window.matchMedia('(max-width: 768px)').matches ? MOBILE_FILM_OFFSET : -8
    camera.updateProjectionMatrix()

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.offsetWidth, container.offsetHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.6
    container.appendChild(renderer.domElement)

    const ro = new ResizeObserver(() => {
      if (disposed) return
      camera.aspect = container.offsetWidth / container.offsetHeight
      camera.position.set(...(window.matchMedia('(max-width: 768px)').matches ? MOBILE_CAM_POS : CAM_POS))
      camera.filmOffset = window.matchMedia('(max-width: 768px)').matches ? MOBILE_FILM_OFFSET : -8
      camera.updateProjectionMatrix()
      renderer.setSize(container.offsetWidth, container.offsetHeight)
    })
    ro.observe(container)

    const clock = new THREE.Clock()

    function animate() {
      if (disposed) return
      rafId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Scroll film texture through the projector loop
      if (filmTexture) {
        filmTexture.offset.x = t * 0.015
      }

      // Pulse rim light
      scene.children.forEach(ch => {
        if (ch.isPointLight && ch._isRim) ch.intensity = 3.2 + Math.sin(t * 1.1) * 0.4
      })

      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }

    async function main() {
      filmTexture = await buildFilmTexture(renderer)
      if (disposed) { filmTexture.dispose(); return }

      const geo = buildStripFromPath(PATH_POINTS, 0.85, 32, 1)
      const mat = new THREE.MeshStandardMaterial({
        map: filmTexture, metalness: 0.3, roughness: 0.4, side: THREE.DoubleSide,
      })
      const mobius = new THREE.Mesh(geo, mat)
      const stripScale = window.matchMedia('(max-width: 768px)').matches ? MOBILE_STRIP_SCALE : 1.7
      mobius.scale.set(stripScale, stripScale, stripScale)
      mobius.position.set(0, -0.7, -2)
      mobius.rotation.set(...(window.matchMedia('(max-width: 768px)').matches ? MOBILE_ROT_VAL : ROT_VAL))
      scene.add(mobius)

      const reflection = mobius.clone()
      reflection.material = mat.clone()
      reflection.material.transparent = true
      reflection.material.opacity = 0.16
      reflection.scale.set(stripScale, -stripScale, stripScale)
      reflection.position.y = -4.0
      const activeAngles = window.matchMedia('(max-width: 768px)').matches ? MOBILE_ROT_VAL : ROT_VAL
      reflection.rotation.set(-activeAngles[0], activeAngles[1], activeAngles[2])
      scene.add(reflection)

      scene.add(new THREE.AmbientLight(0xffffff, 1.2))

      const key = new THREE.SpotLight(0xffffff, 5.0, 30, Math.PI / 4, 0.5, 1.0)
      key.position.set(4, 6, 6); key.target.position.set(0, 0, 0)
      scene.add(key, key.target)

      const rim = new THREE.PointLight(0xccddff, 2.5, 16)
      rim.position.set(-3, 1, -3); rim._isRim = true; scene.add(rim)

      const fill = new THREE.PointLight(0xaabbcc, 1.4, 14)
      fill.position.set(-2, -1, 4); scene.add(fill)

      const front = new THREE.PointLight(0xffffff, 2.0, 16)
      front.position.set(0, 1, 7); scene.add(front)

      animate()
    }

    main()

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      ro.disconnect()
      renderer.dispose(); filmTexture?.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      id="filmstrip-viewer"
      className="filmstrip-viewer"
      aria-label="Möbius filmstrip"
    />
  )
}
