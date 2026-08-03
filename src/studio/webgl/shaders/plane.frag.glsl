#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uTexture;
uniform float uFoldProgress;
uniform float uAlpha;

varying vec2 vUv;
varying float vFoldProgress;

void main() {
  vec4 texColor = texture2D(uTexture, vUv);

  // Darken folded area slightly as it curls away
  float darkness = 1.0 - vFoldProgress * 0.35;
  vec3 color = texColor.rgb * darkness;

  // Slight desaturation on deep fold
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(color, vec3(luma), vFoldProgress * 0.25);

  gl_FragColor = vec4(color, texColor.a * uAlpha);
}
