/* ─────────────────────────────────────────────────────────────────────────────
   VERTEX & FRAGMENT SHADERS — Unseen.co WebGL Card Curl
   Extracted directly from unseen.co theme.js
   ───────────────────────────────────────────────────────────────────────────── */

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
  uniform float     u_zDepth;
  uniform float     u_noiseAmp;
  uniform float     u_rippleAmp;

  void main() {
    vUv = uv;
    vViewDir   = -vec3(modelViewMatrix * vec4(position, 1.0));
    vWorldPos  =  vec3(modelMatrix    * vec4(position, 1.0));

    /* ── Animated noise terms ─────────────────────────────────────────────── */
    float noise  = sin(
      (vWorldPos.x - vWorldPos.y * 0.1) * 0.03
      + -u_time * 1.1
      + cos(vWorldPos.z * 0.04) * 10.
    ) * u_noiseAmp;

    float noise2 = sin(
      (vWorldPos.x + vWorldPos.y * 0.1) * 0.01
      + -u_time * 0.4
    ) * 0.5;

    vec3 transformedPos = position;

    /* ── Ripple wave ──────────────────────────────────────────────────────── */
    float ripple = sin(
      (vWorldPos.x - vWorldPos.y) * 0.02
      + -u_time * 2.
    ) * u_rippleAmp;
    transformedPos.z += ripple;

    /* ── CURL — primary Z-push driven by world-Y position ────────────────── */
    float curlRamp = smoothstep(u_bendPoint.x, u_bendPoint.y, vWorldPos.y);
    transformedPos.z -= u_zDepth * curlRamp;

    /* ── CURL — secondary noise displacement ─────────────────────────────── */
    transformedPos.z -= noise * curlRamp;

    /* ── Y compression: top edge squishes down as it curls ───────────────── */
    transformedPos.y -= (1.5 - noise2)
      * smoothstep(u_bendPoint.x * 1.1, u_bendPoint.y * 0.7, vWorldPos.y)
      * u_heightOffset;

    zPos = ripple;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPos, 1.0);
  }
`;

export const fragmentShader = /* glsl */`
  #define GLSLIFY 1

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
    vec2 uv = backgroundCoverUv(u_meshSize, u_imageSize, vUv);
    uv = vec2(vec2(uv - scaleOrigin) / u_innerScale + scaleOrigin);

    vec4 imageColor = texture2D(uTexture, uv);

    imageColor.rgb += smoothstep(0., 10., zPos * 0.3) * 0.3;

    gl_FragColor = imageColor;

    float depth = gl_FragCoord.z / gl_FragCoord.w;
    gl_FragColor.a *= smoothstep(2000., 1500., depth);

    float fogFactor = smoothstep(fogNear, fogFar, depth);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);

    gl_FragColor.a *= u_opacity;
  }
`;
