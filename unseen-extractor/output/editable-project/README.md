# Run Instructions — Unseen.co Selected Projects Curl Effect

## Quick Start (no build step required)

```bash
cd output/editable-project
npx serve .
# or: python -m http.server 8080
# then open http://localhost:3000 (or :8080)
```

> **You need a local HTTP server** because the JS uses ES modules (`import`).
> Opening `index.html` directly from the filesystem (`file://`) will fail with a CORS error.

## What You'll See

- 8 project cards in a Three.js 3D scene
- Scroll down — cards curl over the top of the viewport (the core extracted effect)
- Three live-editable sliders (top-left):
  - **Bend start** — world-Y where curling begins (original: ~100)
  - **Bend end** — world-Y where curl is complete (original: ~530)
  - **Z depth** — how far back the curl pushes (original: 1200) *(visual guide only — see Known Gaps #5)*

## Dependencies

Only one dependency: **Three.js r158** loaded from jsDelivr CDN.
No npm install, no bundler, no build step.

## File Structure

```
editable-project/
├── index.html          ← entry point
└── src/
    ├── style.css       ← layout + HUD styles
    ├── main.js         ← scene, scroll tracking, card geometry  (ES module)
    └── shaders.js      ← vertex + fragment shaders, extracted verbatim
```

## Replacing Placeholder Textures

To use real images instead of canvas-drawn placeholders:

```js
// In src/main.js, replace makeCardTexture() call with:
const loader = new THREE.TextureLoader();
const tex = loader.load('path/to/your-image.jpg');
```

Or pass `{ imageUrl }` in PROJECT_DATA and load asynchronously.

## Enabling the Fluid Distortion (Advanced)

The vertex shader already has the `#ifdef FLUID` block.
To enable it:

1. Add `defines: { FLUID: true }` to the `ShaderMaterial` constructor
2. Implement a GPUComputationRenderer fluid sim and assign its velocity FBO
   texture to the `u_fluidTex` uniform

The original fluid sim uses 3 render targets: velocity, divergence, pressure.

## Adjusting Card Count / Layout

In `src/main.js`, edit the `PROJECT_DATA` array — add or remove objects:

```js
const PROJECT_DATA = [
  { title: 'My Project', desc: 'Category', color: '#c8b8a8' },
  // ...
];
```

Cards are stacked vertically and scroll distance scales automatically.
