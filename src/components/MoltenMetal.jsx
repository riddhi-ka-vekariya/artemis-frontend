import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'
import './MoltenMetal.css'

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [1, 1, 1]
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
}
const colorModeToFloat = (mode) => (mode === 'ember' ? 1 : mode === 'frost' ? 2 : 0)
const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`
const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution; uniform float iTime; uniform float uSpeed; uniform float uScale; uniform float uDetail; uniform float uGlow; uniform float uCoreSize; uniform float uSwirl; uniform float uFold; uniform float uBlackPoint; uniform float uBrightness; uniform float uColorMode; uniform float uGrain; uniform float uGrainIntensity; uniform float uOpacity; uniform vec2 uMouse; uniform float uMouseStrength; uniform bool uEnableMouse; uniform vec3 uColor1; uniform vec3 uColor2; uniform vec3 uColor3; out vec4 fragColor;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  float time=iTime*uSpeed; vec2 p=uScale*((gl_FragCoord.xy-.5*iResolution.xy)/iResolution.y)-.5; if(uEnableMouse)p+=(uMouse-.5)*uMouseStrength*2.; vec2 i=p; float c=0.; float r=length(p+vec2(sin(time),sin(time*.3+5.))*.5); float d=length(p); float rot=d+time+p.x*uSwirl; float cosRot=cos(rot); mat2 warp=mat2(cos(rot-sin(time/5.)),sin(rot),-sin(cosRot-time),cosRot)*uFold; float glowCore=uGlow*uCoreSize;
  for(float n=0.;n<8.;n++){if(n>=uDetail)break;p*=warp;float t=r-time/(n+3.);i-=p+vec2(cos(t-i.x-r)+sin(t+i.y),sin(t-i.y)+cos(t+i.x)+r);c+=glowCore/length(vec2(sin(i.x+t),cos(i.y+t)));}
  c/=6.;float g=clamp(max(c-uBlackPoint,0.)*uBrightness,0.,1.);float mid=uColorMode>1.5?.65:(uColorMode>.5?.35:.5);vec3 col=mix(uColor1,uColor2,smoothstep(0.,mid,g));col=mix(col,uColor3,smoothstep(mid,1.,g));float a=g;if(uGrain>.5)a+=(hash(gl_FragCoord.xy+iTime)-.5)*uGrainIntensity;a=clamp(a,0.,1.)*uOpacity;fragColor=vec4(col*a,a);
}
`

export default function MoltenMetal({
  color1 = '#5227FF', color2 = '#FF9FFC', color3 = '#FFFFFF', speed = 0.35, scale = 4,
  detail = 3, glow = 1.6, coreSize = 0.1, swirl = 1, fold = -0.2, blackPoint = 0.05,
  brightness = 1.3, colorMode = 'molten', grain = true, grainIntensity = 0.05,
  mouseInteraction = true, mouseStrength = 0.3, opacity = 1, className = '',
}) {
  const containerRef = useRef(null)
  const contextRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    const renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 2) })
    const gl = renderer.gl; gl.clearColor(0, 0, 0, 0)
    const canvas = gl.canvas; canvas.style.width = '100%'; canvas.style.height = '100%'; canvas.style.display = 'block'; container.appendChild(canvas)
    const geometry = new Triangle(gl)
    const program = new Program(gl, { vertex, fragment, uniforms: {
      iTime: { value: 0 }, iResolution: { value: new Float32Array([1, 1]) }, uSpeed: { value: speed }, uScale: { value: scale }, uDetail: { value: detail }, uGlow: { value: glow }, uCoreSize: { value: coreSize }, uSwirl: { value: swirl }, uFold: { value: fold }, uBlackPoint: { value: blackPoint }, uBrightness: { value: brightness }, uColorMode: { value: colorModeToFloat(colorMode) }, uGrain: { value: grain ? 1 : 0 }, uGrainIntensity: { value: grainIntensity }, uOpacity: { value: opacity }, uMouse: { value: new Float32Array([0.5, 0.5]) }, uMouseStrength: { value: mouseStrength }, uEnableMouse: { value: mouseInteraction }, uColor1: { value: new Float32Array(hexToRgb(color1)) }, uColor2: { value: new Float32Array(hexToRgb(color2)) }, uColor3: { value: new Float32Array(hexToRgb(color3)) },
    } })
    const mesh = new Mesh(gl, { geometry, program }); contextRef.current = { renderer, program }
    const setSize = () => { const rect = container.getBoundingClientRect(); renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height))); const res = program.uniforms.iResolution.value; res[0] = gl.drawingBufferWidth; res[1] = gl.drawingBufferHeight; renderer.render({ scene: mesh }) }
    const ro = new ResizeObserver(setSize); ro.observe(container); setSize()
    const target = [0.5, 0.5]; const current = [0.5, 0.5]
    const move = (event) => { const rect = container.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) { leave(); return } target[0] = (event.clientX - rect.left) / rect.width; target[1] = 1 - (event.clientY - rect.top) / rect.height }
    const leave = () => { target[0] = 0.5; target[1] = 0.5 }
    window.addEventListener('mousemove', move); window.addEventListener('mouseleave', leave)
    let raf = 0; let visible = true; let pageVisible = !document.hidden; const startTime = performance.now()
    const loop = (time) => { program.uniforms.iTime.value = (time - startTime) * 0.001; current[0] += .05 * (target[0] - current[0]); current[1] += .05 * (target[1] - current[1]); program.uniforms.uMouse.value[0] = current[0]; program.uniforms.uMouse.value[1] = current[1]; renderer.render({ scene: mesh }); raf = requestAnimationFrame(loop) }
    const start = () => { if (visible && pageVisible && raf === 0) raf = requestAnimationFrame(loop) }; const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0 } }
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visible ? start() : stop() }); io.observe(container)
    const visibility = () => { pageVisible = !document.hidden; pageVisible ? start() : stop() }; document.addEventListener('visibilitychange', visibility); start()
    return () => { stop(); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('mousemove', move); window.removeEventListener('mouseleave', leave); contextRef.current = null; if (canvas.parentNode === container) container.removeChild(canvas); gl.getExtension('WEBGL_lose_context')?.loseContext() }
  }, [])

  useEffect(() => {
    const ctx = contextRef.current; if (!ctx) return
    const u = ctx.program.uniforms
    u.uSpeed.value = speed; u.uScale.value = scale; u.uDetail.value = detail; u.uGlow.value = glow; u.uCoreSize.value = Math.max(coreSize, 0.001); u.uSwirl.value = swirl; u.uFold.value = fold; u.uBlackPoint.value = blackPoint; u.uBrightness.value = brightness; u.uColorMode.value = colorModeToFloat(colorMode); u.uGrain.value = grain ? 1 : 0; u.uGrainIntensity.value = grainIntensity; u.uOpacity.value = opacity; u.uMouseStrength.value = mouseStrength; u.uEnableMouse.value = mouseInteraction
    ;[['uColor1', color1], ['uColor2', color2], ['uColor3', color3]].forEach(([name, value]) => { const rgb = hexToRgb(value); u[name].value[0] = rgb[0]; u[name].value[1] = rgb[1]; u[name].value[2] = rgb[2] })
  }, [color1, color2, color3, speed, scale, detail, glow, coreSize, swirl, fold, blackPoint, brightness, colorMode, grain, grainIntensity, mouseInteraction, mouseStrength, opacity])

  return <div ref={containerRef} className={`molten-metal-container ${className}`.trim()} />
}
