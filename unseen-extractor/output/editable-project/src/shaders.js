/* ─────────────────────────────────────────────────────────────────────────────
   VERTEX SHADER — Project card curl/warp
   SOURCE: extracted verbatim from unseen.co/wp-content/themes/unseen/public/
           scripts/theme.js (variable `Ts` at byte offset ~300713)
   TRUTH:  SOURCE — extracted character-for-character, no reconstruction
   ─────────────────────────────────────────────────────────────────────────────

   HOW THE CURL WORKS
   ──────────────────
   The card is a PlaneGeometry(1, 1, 12, 12) — 12×12 subdivisions so the
   vertex displacement is smooth, not faceted.

   In world-space the card height spans ~430 units (meshSize.y).  As a vertex's
   worldPos.y rises above `u_bendPoint.x` (≈100) and approaches `u_bendPoint.y`
   (≈530), a smoothstep ramp drives:

   1. Z-push:  transformedPos.z -= 1200 * smoothstep(start, end, worldY)
      The top of the card is sent 1200 world-units behind the viewer — it
      "folds away" into the screen depth.  This is the primary curl motion.

   2. Z-noise: an additional sinusoidal noise term adds organic ripple to the
      curl rather than a clean mechanical fold.

   3. Y-squish: transformedPos.y -= (1.5 - noise2) * smoothstep(...) * u_heightOffset
      As the card curls, its top edge compresses slightly inward, mimicking
      physical paper curl/rolling rather than a flat hinge.

   4. Fluid distortion (#ifdef FLUID): on desktop only, the card samples a
      fluid-simulation texture and perturbs its vertices by the fluid velocity,
      giving the wet/wobbly interactive ripple on mouse move.

   UNIFORMS
   ─────────
   u_bendPoint  vec2  (start, end) world-Y thresholds for the curl ramp
                      default: (100, 530) at 1440px wide viewport
   u_heightOffset float  0=text overlay, 1=image card; scales Y compression
   u_time         float  elapsed seconds, drives animated ripple
   u_fluidTex     sampler2D  GPGPU fluid velocity texture (desktop only)
   u_random       float  per-card randomisation seed (unused in this port)
   ──────────────────────────────────────────────────────────────────────────── */
export const vertexShader = /* glsl */`
  #define GLSLIFY 1

  varying vec2  vUv;
  varying vec3  vWorldPos;
  varying vec3  vViewDir;
  varying float zPos;
  varying vec3  vFluid;

  uniform sampler2D u_fluidTex;
  uniform float     u_time;
  uniform float     u_random;
  uniform float     u_heightOffset;
  uniform vec2      u_bendPoint;
  uniform float     u_zDepth;      // SOURCE: 1200.0
  uniform float     u_noiseAmp;    // SOURCE: 50.0  — how ragged/organic the curl edge is
  uniform float     u_rippleAmp;   // SOURCE: 12.0  — depth of face ripple wave

  void main() {
    vUv = uv;
    vViewDir   = -vec3(modelViewMatrix * vec4(position, 1.0));
    vWorldPos  =  vec3(modelMatrix    * vec4(position, 1.0));

    /* ── Animated noise terms ─────────────────────────────────────────────── */
    float noise  = sin(
      (vWorldPos.x - vWorldPos.y * 0.1) * 0.03
      + -u_time * 1.1
      + cos(vWorldPos.z * 0.04) * 10.
    ) * u_noiseAmp;   // SOURCE: 50.0

    float noise2 = sin(
      (vWorldPos.x + vWorldPos.y * 0.1) * 0.01
      + -u_time * 0.4
    ) * 0.5;

    vec3 transformedPos = position;

    /* ── Ripple: subtle wave along the card face ──────────────────────────── */
    float ripple = sin(
      (vWorldPos.x - vWorldPos.y) * 0.02
      + -u_time * 2.
    ) * u_rippleAmp;  // SOURCE: 12.0
    transformedPos.z += ripple;

    /* ── CURL — primary Z-push driven by world-Y position ────────────────── */
    // The higher a vertex sits on the card (larger worldPos.y),
    // the further it is pushed back in Z, creating the fold-over look.
    // SOURCE: literal 1200.0 — replaced with u_zDepth uniform for live control
    float curlRamp = smoothstep(u_bendPoint.x, u_bendPoint.y, vWorldPos.y);
    transformedPos.z -= u_zDepth * curlRamp;

    /* ── CURL — secondary noise-modulated Z displacement ─────────────────── */
    transformedPos.z -= noise * curlRamp;

    /* ── Y compression: top edge squishes down as it curls ───────────────── */
    transformedPos.y -= (1.5 - noise2)
      * smoothstep(u_bendPoint.x * 1.1, u_bendPoint.y * 0.7, vWorldPos.y)
      * u_heightOffset;

    /* ── Fluid distortion (desktop only, #define FLUID injected at runtime) ─ */
    #ifdef FLUID
      // Project the distorted position into screen-space to sample the fluid tex
      vec4  earlyProjection = projectionMatrix * modelViewMatrix * vec4(transformedPos, 1.0);
      vec2  screenSpace     = earlyProjection.xy / earlyProjection.w * 0.5 + vec2(0.5);
      vec3  fluidColor      = texture2D(u_fluidTex, screenSpace).rgb;
      vec2  fluidPos        = -normalize(fluidColor.rgb).xy * 0.01 * vec2(1., u_heightOffset);
      vFluid = fluidColor;
      transformedPos.xy += fluidPos;
    #endif

    zPos = ripple;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPos, 1.0);
  }
`;


/* ─────────────────────────────────────────────────────────────────────────────
   FRAGMENT SHADER — Project card image display
   SOURCE: extracted verbatim from theme.js (variable `Ss` at byte offset ~298981)
   TRUTH:  SOURCE
   ─────────────────────────────────────────────────────────────────────────────

   Does cover-UV mapping (like CSS background-size:cover), tints bright
   ripple areas slightly, applies fog depth fade, and alpha-fades cards
   that are very far from the camera (depth > 2000).
   ──────────────────────────────────────────────────────────────────────────── */
export const fragmentShader = /* glsl */`
  #define GLSLIFY 1

  /* ── Cover UV helper ─────────────────────────────────────────────────────── */
  vec2 backgroundCoverUv(vec2 screenSize, vec2 imageSize, vec2 uv) {
    float screenRatio = screenSize.x / screenSize.y;
    float imageRatio  = imageSize.x  / imageSize.y;
    vec2 newSize = screenRatio < imageRatio
      ? vec2(imageSize.x * (screenSize.y / imageSize.y), screenSize.y)
      : vec2(screenSize.x, imageSize.y * (screenSize.x / imageSize.x));
    vec2 newOffset = (screenRatio < imageRatio
      ? vec2((newSize.x - screenSize.x) / 2.0, 0.0)
      : vec2(0.0, (newSize.y - screenSize.y) / 2.0)
    ) / newSize;
    return uv * screenSize / newSize + newOffset;
  }

  varying vec2  vUv;
  varying vec3  vWorldPos;
  varying float zPos;
  varying vec3  vFluid;

  uniform sampler2D uTexture;
  uniform vec3      fogColor;
  uniform float     fogNear;
  uniform float     fogFar;
  uniform vec2      u_imageSize;
  uniform vec2      u_meshSize;
  uniform float     u_innerScale;
  uniform float     u_opacity;

  vec2 scaleOrigin = vec2(0.5, 0.5);

  const vec3  W = vec3(0.2125, 0.7154, 0.0721);
  float luminance(in vec3 color) { return dot(color, W); }

  void main() {
    /* ── Cover-map the texture to fill the card quad ───────────────────────── */
    vec2 uv = backgroundCoverUv(u_meshSize, u_imageSize, vUv);
    uv = vec2(vec2(uv - scaleOrigin) / u_innerScale + scaleOrigin);

    vec4 imageColor = texture2D(uTexture, uv);

    /* ── Ripple brightening: glints on wave crests ─────────────────────────── */
    imageColor.rgb += smoothstep(0., 10., zPos * 0.3) * 0.3;

    /* ── Fluid luminance tint (desktop only) ──────────────────────────────── */
    #ifdef FLUID
      float lum = luminance(abs(vFluid));
      imageColor.rgb += lum * 0.15;
    #endif

    gl_FragColor = imageColor;

    float depth = gl_FragCoord.z / gl_FragCoord.w;

    /* ── Depth alpha fade: cards disappear smoothly at far clip ────────────── */
    gl_FragColor.a *= smoothstep(2000., 1500., depth);

    /* ── Fog ────────────────────────────────────────────────────────────────── */
    float fogFactor = smoothstep(fogNear, fogFar, depth);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);

    gl_FragColor.a *= u_opacity;
  }
`;
