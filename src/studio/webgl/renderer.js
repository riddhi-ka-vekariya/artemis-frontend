import { Renderer, Camera, Transform } from 'ogl'

/**
 * Creates the OGL WebGL renderer, orthographic-style camera, and root scene.
 * The camera uses a perspective projection but is placed far enough that
 * world units ≈ screen pixels when fov is calibrated to the viewport.
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {{ renderer, gl, camera, scene, resize }}
 */
export function createRenderer(canvas) {
  const renderer = new Renderer({
    canvas,
    alpha: true,
    antialias: true,
    dpr: Math.min(window.devicePixelRatio, 2),
  })

  const gl = renderer.gl
  gl.clearColor(0, 0, 0, 0)
  gl.enable(gl.DEPTH_TEST)

  const camera = new Camera(gl, {
    fov: 45,
    near: 0.1,
    far: 1000,
  })

  const scene = new Transform()

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.perspective({
      aspect: gl.canvas.width / gl.canvas.height,
    })
    // Place camera so that 1 world unit ≈ 1 pixel at z=0
    // fov=45 → at distance d, half-height = d*tan(22.5°)
    // We want half-height = window.innerHeight / 2
    camera.position.z = (window.innerHeight / 2) / Math.tan((45 * Math.PI) / 360)
  }

  resize()
  window.addEventListener('resize', resize)

  return { renderer, gl, camera, scene, resize }
}
