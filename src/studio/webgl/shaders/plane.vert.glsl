#ifdef GL_ES
precision highp float;
#endif

attribute vec2 uv;
attribute vec3 position;
attribute vec3 normal;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uFoldProgress;    // 0..PI  fold angle at the top edge
uniform float uDescendOffset;   // descendPx / cardHeight  (normalised)
uniform float uScrollVelocity;  // Lenis velocity — drives the skew

varying vec2 vUv;
varying float vFoldZone;

// How far back the top curls in Z, as a fraction of card height (local units).
// 0.5 = top recedes by half the card height at full quarter-turn.
const float CURL_DEPTH = 0.5;

void main() {
  vUv = uv;
  vec3 pos = position;

  // uv.y: 0 at the bottom of the plane, 1 at the top.
  // Each vertex bends proportionally to its height —
  // bottom stays fixed, top bends fully. This is what produces
  // the smooth continuous curve instead of discrete CSS bands.
  float foldZone = uv.y;
  vFoldZone = foldZone;

  // ── 1. Velocity skew ─────────────────────────────────────────────
  // Lean cards slightly in the scroll direction during fast scrolling.
  pos.x += uScrollVelocity * foldZone * 0.012;

  // ── 2. Curl: rotate around the bottom edge ────────────────────────
  // Per-vertex angle = foldZone * uFoldProgress
  //   → bottom vertex: angle = 0   (never moves)
  //   → top vertex:    angle = uFoldProgress  (0 → PI)
  // This creates a curved surface, not a rigid tilt.
  float angle = foldZone * uFoldProgress;

  // Lever arm from the pivot (bottom edge, local y = -0.5):
  float relY = pos.y + 0.5; // 0 at bottom, ~1 at top for a unit plane

  // Apply rotation — independent terms, no coupling:
  //   bendY moves the vertex vertically (forward / downward)
  //   bendZ pushes it away from the viewer
  pos.y = -0.5 + relY * cos(angle);
  pos.z -= relY * sin(angle) * CURL_DEPTH;

  // ── 3. Descend: screen-space slide (decoupled from Z) ─────────────
  // Once curled, content slides downward behind the current rows —
  // visible through the gaps as it recedes (MIN_OPACITY in JS).
  // This additive pos.y change is independent of the Z recession above.
  pos.y -= uDescendOffset * foldZone;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
