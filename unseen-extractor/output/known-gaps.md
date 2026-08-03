# Known Gaps

## Gap 1 — Card Image Textures
- **Status**: BLOCKED_EXTERNAL
- **Impact**: Visual fidelity only (animation mechanics unaffected)
- **Details**: The actual project thumbnails are loaded from WordPress media URLs
  that require site-specific paths (e.g., `/wp-content/uploads/...`).
  Canvas-drawn placeholder textures are used instead.
- **Fidelity downgrade**: cosmetic only; shader and curl behaviour are exact.
- **Promotion path**: load any CORS-accessible images via `THREE.TextureLoader`.

## Gap 2 — FLUID Vertex Distortion (Mouse Hover Effect)
- **Status**: NOT PORTED
- **Impact**: Mouse-hover wobble is missing; curl animation still works
- **Details**: The original uses a multi-pass GPGPU fluid simulation
  (`velocitySim` + `divergenceSim` + `pressureSim`) with an FBO ping-pong loop.
  This is a significant sub-system (~200 lines) isolated from the curl shader.
  The curl shader still functions correctly without it (the `#ifdef FLUID`
  block is disabled in this port).
- **Promotion path**: Implement a GPUComputationRenderer fluid sim and bind its
  velocity texture to `u_fluidTex`. The shader already supports it.

## Gap 3 — Three.js Minor Version
- **Status**: PARTIAL
- **Impact**: Low (API surface used is stable across r140–r165)
- **Details**: The vendor bundle does not include a version string. CDN r158
  is used. `s._12 = PlaneGeometry`, `s.jyz = ShaderMaterial`, `s.Kj0 = Mesh`,
  `s.ZAu = Group`, `s.xsS = Scene`, `s.ybr = Fog` all confirmed from bundle.

## Gap 4 — Card Text Overlay
- **Status**: PARTIAL
- **Details**: The original renders a second PlaneGeometry per card (`s=t.children[1]`)
  with a Canvas2D text texture drawn onto it (title + description in Neue Montreal).
  This port omits the text overlay plane; text is baked into the card face texture instead.
- **Promotion path**: add a second THREE.Mesh per group using the same shader
  with `u_heightOffset: 0` (text overlay flag) and a Canvas2D texture.

## Gap 5 — Butterflies / Arch Environment
- **Status**: OUT OF SCOPE
- **Details**: The projects scene includes animated butterfly particles
  and arch-shaped environment geometry (instanced MatCap meshes).
  These are unrelated to the curl effect and not ported.
