import { Mesh, Plane, Program, Texture } from 'ogl'
import vertShader from './shaders/plane.vert.glsl?raw'
import fragShader from './shaders/plane.frag.glsl?raw'

/**
 * One ProjectPlane corresponds to one <img> element in the DOM.
 * It creates a subdivided mesh, loads the texture, and exposes
 * syncToDom() to keep position/scale matched to the DOM element.
 *
 * Fold/descend effect uniforms are driven from outside (StudioPage).
 */
export class ProjectPlane {
  /**
   * @param {WebGLRenderingContext} gl
   * @param {Transform} scene
   * @param {HTMLImageElement} imgEl
   * @param {{ segments?: number }} options
   */
  constructor(gl, scene, imgEl, options = {}) {
    this.gl = gl
    this.imgEl = imgEl
    this.textureLoaded = false
    this.alpha = 0

    const segments = options.segments ?? 40

    // Geometry: subdivided plane (unit size, we'll scale it in syncToDom)
    const geometry = new Plane(gl, {
      width: 1,
      height: 1,
      widthSegments: segments,
      heightSegments: segments,
    })

    // Blank 1×1 texture while the real image loads
    const texture = new Texture(gl, {
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
    })
    this.texture = texture

    // Uniforms
    this.uniforms = {
      uTexture: { value: texture },
      uFoldProgress: { value: 0 },
      uDescendOffset: { value: 0 },
      uScrollVelocity: { value: 0 },
      uAlpha: { value: 0 },
    }

    const program = new Program(gl, {
      vertex: vertShader,
      fragment: fragShader,
      uniforms: this.uniforms,
      transparent: true,
      depthTest: true,
      depthWrite: true,
    })

    this.mesh = new Mesh(gl, { geometry, program })
    this.mesh.setParent(scene)

    // Load texture from the img src
    this._loadTexture(imgEl.src || imgEl.dataset.src)
  }

  _loadTexture(src) {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      this.texture.image = img
      this.textureLoaded = true
      // Fade the WebGL plane in
      this.alpha = 1
      this.uniforms.uAlpha.value = 1
    }
    img.src = src
  }

  /**
   * Convert DOM rect → OGL world space and update mesh transform.
   * Call every frame, after lenis has updated scroll.
   *
   * @param {number} scrollY  Current scroll position (lenis.scroll or scrollY)
   */
  syncToDom(scrollY = 0) {
    const rect = this.imgEl.getBoundingClientRect()

    // Width / height directly (rect is in screen pixels)
    const w = rect.width
    const h = rect.height

    // Center of element in screen pixels, from top-left
    const cx = rect.left + w / 2
    const cy = rect.top + h / 2

    // Convert to OGL world coordinates:
    // Origin is viewport center, Y axis flipped (OGL Y+ = up)
    const worldX = cx - window.innerWidth / 2
    const worldY = -(cy - window.innerHeight / 2)

    this.mesh.position.set(worldX, worldY, 0)
    this.mesh.scale.set(w, h, 1)
  }

  /**
   * Update the shader uniforms that drive the fold/descend effect.
   *
   * @param {number} foldProgress  0–PI (curl angle)
   * @param {number} descendOffset  px of downward travel
   * @param {number} scrollVelocity  lenis velocity
   */
  updateEffect(foldProgress, descendOffset, scrollVelocity) {
    this.uniforms.uFoldProgress.value = foldProgress
    this.uniforms.uDescendOffset.value = descendOffset / (window.innerHeight / 2)
    this.uniforms.uScrollVelocity.value = scrollVelocity
  }

  destroy(scene) {
    if (this.mesh) {
      scene.removeChild(this.mesh)
    }
  }
}
