# Extraction Report — Unseen.co Selected Projects Curl Effect

## Summary

**Target URL**: https://unseen.co (homepage / `/projects/` menu page)  
**Target effect**: "Selected Projects" scrollable grid — project cards that curl/wrap over the top of the viewport as you scroll past them  
**Extraction date**: 2026-08-03  
**Final status**: `DONE_BASELINE_WITH_GAPS`

---

## Technique Determination

> **The curl effect is WebGL (Three.js), NOT CSS 3D transforms or GSAP.**

### Evidence

The HTML `<html>` element carries the class `asscroll-disabled`, indicating ASScroll custom scroll.  
The theme.js bundle (418 KB) contains a Three.js WebGL renderer with a dedicated project scene:

- `o.Gl` — global `THREE.WebGLRenderer` singleton
- `o.World` — scene manager; on the projects/home-contact page it instantiates a
  `ProjectMenu` scene class
- `buildProjects()` — loops over `window.projects[]` (CMS data) and creates
  one `THREE.Group` per card, each containing a `THREE.Mesh`

### NOT CSS
No `perspective`, `rotateX`, or `rotateY` CSS transforms drive the curl.
GSAP is present but used only for UI tweens (opacity, scale transitions) —
not ScrollTrigger timelines controlling the card geometry.

---

## Technique: Scrollable 3D WebGL Scene with Vertex Shader Curl

| Aspect | Detail |
|---|---|
| **Renderer** | Three.js WebGLRenderer (main thread) |
| **Scene** | Dedicated sub-scene with cloned PerspectiveCamera |
| **Geometry** | `PlaneGeometry(1, 1, 12, 12)` — 12×12 vertex subdivisions per card |
| **Material** | `ShaderMaterial` with custom vertex + fragment GLSL |
| **Scroll input** | Raw `wheel` event → `scrollPos` → lerp → `projectsGroup.position.y` |
| **Curl mechanism** | `smoothstep` ramp on world-space Y drives Z-displacement in vertex shader |
| **Fluid distortion** | GPGPU fluid sim (mouse hover only, desktop only) — NOT ported |
| **Camera** | Pixel-perfect FOV: `2 * atan(height/2 / 2000) * 180/PI`, position.z = 2000 |

---

## The Curl — Technical Detail

```glsl
// Core curl lines from vertex shader (Ts), extracted verbatim:
float smoothCurl = smoothstep(u_bendPoint.x, u_bendPoint.y, vWorldPos.y);

transformedPos.z -= 1200.0 * smoothCurl;          // primary Z push (fold)
transformedPos.z -= noise  * smoothCurl;           // organic noise ripple
transformedPos.y -= (1.5 - noise2) * smoothstep(  // Y compression (squish)
  u_bendPoint.x * 1.1, u_bendPoint.y * 0.7, vWorldPos.y
) * u_heightOffset;
```

- `u_bendPoint.x` (default 100) — world-Y where folding starts
- `u_bendPoint.y` (default 530) — world-Y where folding is complete
- The card is 430 world-units tall × multiplier; vertices span from ~–215 to +215 Y
- The camera is at Z=2000; the curl pushes vertices 1200 units back — far enough to visually "disappear over the top"

### Geometry: 12×12 subdivisions — why it matters

With fewer segments (e.g., 4×4), the curl would look faceted/banded.
At 12×12 (144 quads), the smoothstep ramp has enough vertices to produce
a smooth, continuous curl curve with no visible banding.

### Scroll → World mapping

```js
// (SOURCE labels: all extracted from theme.js)
smoothScrollPos += 0.05 * (scrollPos - smoothScrollPos);  // lerp
projectsGroup.position.y = smoothScrollPos;                // world Y
```

No coordinate conversion — scroll pixels map 1:1 to world units. The camera's
pixel-perfect FOV formula ensures `1 CSS pixel = 1 Three.js world unit` at z=0.

---

## Extracted Artifacts

| File | Content | Truth |
|---|---|---|
| `output/editable-project/src/shaders.js` | Both GLSL shaders verbatim + annotations | SOURCE |
| `output/editable-project/src/main.js` | Standalone Three.js scene + scroll tracking | SOURCE (scene), GUESS (texture colours) |
| `output/editable-project/index.html` | HTML entry point | NEW |
| `output/editable-project/src/style.css` | Styles | NEW |
| `output/scout-card.json` | Hypothesis ledger + evidence | — |
| `output/known-gaps.md` | Gaps + promotion paths | — |

---

## Extracted Constants (SOURCE)

| Constant | Value | Source location |
|---|---|---|
| Geometry segments | 12 × 12 | `new s._12(1,1,12,12)` at index ~326617 |
| meshSize base | (820, 430) | `this.meshSize = new s.FM8(820,430)` at index ~323892 |
| meshSizeMultiplier (lg) | 0.35 | `meshSizeMultiplers.lg` at index ~323839 |
| u_bendPoint default | (100, 530) | `a.set(100,500..600)` / `(100,700)` depending on breakpoint |
| Z curl depth | 1200 | `1200. * smoothstep(...)` in Ts at index ~300713 |
| Scroll lerp | 0.05 | `+= .05*(scrollPos - smoothScrollPos)` at index ~337296 |
| Velocity scale | 5e-4 | `scrollDelta = 5e-4*(...)` at index ~337296 |
| Velocity lerp | 0.075 | `velocity += .075*(smoothDelta - velocity)` |
| Camera position.z | 2000 | `initialCameraPos=2e3` at index ~321299 |
| Fog near | 500 | `scene.fog = new s.ybr(color, 500, this.camera.far)` |
| Fog far | 4500 | `camera.far=4500` |
| Camera near clip | 100 | `camera.near=100` |

---

## Parts Extracted As-Is vs Reconstructed

### Extracted As-Is (trust these values fully)
- Complete vertex shader GLSL
- Complete fragment shader GLSL  
- All uniform names and types
- Geometry segment count (12×12)
- All numeric constants listed above
- Scroll lerp and velocity formulas

### Reconstructed / GUESS (trust less)
- Card image textures — canvas-drawn placeholders (actual images not fetched)
- Card colours — procedurally generated
- Text overlay layer — simplified into baked-in card texture

### Not Ported (with reasoning)
- GPGPU fluid simulation — out of scope (large sub-system, not related to curl)
- Butterfly particle system — out of scope
- Arch/floor environment geometry — out of scope
- GSAP transition animations — not needed for isolated demo
