/**
 * Unseen.co "Selected Projects" — scrollable card curl effect
 * Architect portfolio demo with real photography from Unsplash
 */

import { vertexShader, fragmentShader } from './shaders.js';

const THREE = window.THREE;

// ─── Constants ────────────────────────────────────────────────────────────────
const MESH_SIZE_BASE = new THREE.Vector2(820, 430);
const SEGMENT_COUNT  = 12;
const SCROLL_LERP    = 0.05;
const VELOCITY_LERP  = 0.075;
const VELOCITY_SCALE = 5e-4;
const CAMERA_Z       = 2000;
const FOG_NEAR       = 500;    // fixed (not exposed)
const FOG_FAR        = 4500;   // fixed (not exposed)
const ANIM_SPEED     = 1.0;    // fixed (not exposed)

const MULTIPLIERS = { default: 0.21, sm: 0.30, md: 0.28, lg: 0.35 };

const MQ = {
  sm:  window.matchMedia('(min-width: 768px)'),
  md:  window.matchMedia('(min-width: 1024px)'),
  lg:  window.matchMedia('(min-width: 1366px)'),
  xlg: window.matchMedia('(min-width: 1921px)'),
};

// ─── Exposed control defaults ─────────────────────────────────────────────────
const DEFAULTS = {
  bendStart:  100,
  bendEnd:    700,
  zDepth:     1200,
  noiseAmp:   50,
  darkMode:   false,
  cardGap:    24,
  innerScale: 1.0,
};

const P = { ...DEFAULTS };

const COLORS = { light: '#e5e5e5', dark: '#212121' };

// ─── Architecture project data — Unsplash photography ─────────────────────────
// All photos: Unsplash open licence. Cropped to 820×430 (landscape 16:7.5).
const PROJECT_DATA = [
  {
    title: 'Vault House',
    desc:  'Residential · Lisbon, 2024',
    img:   'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=820&h=430&fit=crop&auto=format&q=85',
  },
  {
    title: 'Brutalist Pavilion',
    desc:  'Cultural · Brussels, 2023',
    img:   'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=820&h=430&fit=crop&auto=format&q=85',
  },
  {
    title: 'Helix Stair',
    desc:  'Interior · Stockholm, 2024',
    img:   'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=820&h=430&fit=crop&auto=format&q=85',
  },
  {
    title: 'Coastal Residence',
    desc:  'Residential · Lagos, 2023',
    img:   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=820&h=430&fit=crop&auto=format&q=85',
  },
  {
    title: 'Concrete Atrium',
    desc:  'Office · Tokyo, 2022',
    img:   'https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?w=820&h=430&fit=crop&auto=format&q=85',
  },
  {
    title: 'Light Vault',
    desc:  'Cultural · Oslo, 2024',
    img:   'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=820&h=430&fit=crop&auto=format&q=85',
  },
  {
    title: 'Market Hall',
    desc:  'Public · Rotterdam, 2023',
    img:   'https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=820&h=430&fit=crop&auto=format&q=85',
  },
  {
    title: 'Tower Studio',
    desc:  'Residential · Vienna, 2024',
    img:   'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=820&h=430&fit=crop&auto=format&q=85',
  },
];

// ─── Scene state ──────────────────────────────────────────────────────────────
let renderer, scene, camera, projectsGroup, clock;
let scrollPos = 0, smoothScrollPos = 0, scrollDelta = 0, smoothDelta = 0, velocity = 0;
let projectsHeight = 0;

// ─── Layout helpers ───────────────────────────────────────────────────────────
function getLayoutParams() {
  const w = window.innerWidth, h = window.innerHeight;
  const sceneScale = w / 2150;

  let mult = MULTIPLIERS.default;
  if      (MQ.lg.matches) mult = MULTIPLIERS.lg;
  else if (MQ.md.matches) mult = MULTIPLIERS.md;
  else if (MQ.sm.matches) mult = MULTIPLIERS.sm;

  let scaleAdj = 1;
  if      (MQ.xlg.matches) scaleAdj = sceneScale + 0.2;
  else if (MQ.lg.matches)  scaleAdj = sceneScale + 0.3;

  mult *= scaleAdj;
  const meshSize = MESH_SIZE_BASE.clone().multiplyScalar(mult);

  const bendPoint = new THREE.Vector2();
  if (MQ.lg.matches || MQ.md.matches) {
    bendPoint.set(P.bendStart, P.bendEnd).multiplyScalar(h / 1100);
  } else if (MQ.sm.matches) {
    bendPoint.set(P.bendStart, Math.min(P.bendEnd, 500));
  } else {
    bendPoint.set(P.bendStart, Math.min(P.bendEnd, 600));
  }

  const cols = MQ.md.matches ? 2 : 1;
  const gap  = (MQ.md.matches ? 20 : 10) * scaleAdj;
  const rowH = meshSize.y + P.cardGap;

  return { meshSize, bendPoint, cols, gap, rowH, scaleAdj };
}

function fogColor() { return new THREE.Color(P.darkMode ? COLORS.dark : COLORS.light); }

// ─── Renderer / camera / scene ────────────────────────────────────────────────
function initRenderer() {
  const canvas = document.getElementById('gl-canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
}

function initCamera() {
  const h = window.innerHeight;
  camera = new THREE.PerspectiveCamera(
    2 * Math.atan(h / 2 / CAMERA_Z) * (180 / Math.PI),
    window.innerWidth / h, 100, FOG_FAR
  );
  camera.position.z = CAMERA_Z;
  camera.updateProjectionMatrix();
}

function initScene() {
  scene = new THREE.Scene();
  applyFogAndBackground();
}

function applyFogAndBackground() {
  const fc = fogColor();
  scene.fog        = new THREE.Fog(fc, FOG_NEAR, FOG_FAR);
  scene.background = fc.clone();
  projectsGroup?.children.forEach(g => {
    const u = g.children[0].material.uniforms;
    u.fogColor.value.copy(fc);
    u.fogNear.value = FOG_NEAR;
    u.fogFar.value  = FOG_FAR;
  });
}

// ─── Card texture — photo + text overlay ─────────────────────────────────────
// Draw image (cover-cropped) onto a canvas then overlay title + metadata text.
// Returns a placeholder CanvasTexture immediately; updates it when the photo loads.
function makeCardTexture(data, w, h, onUpdate) {
  const cvs = document.createElement('canvas');
  cvs.width  = Math.max(1, Math.round(w));
  cvs.height = Math.max(1, Math.round(h));
  const ctx  = cvs.getContext('2d');

  // Placeholder fill
  ctx.fillStyle = '#c8c4be';
  ctx.fillRect(0, 0, cvs.width, cvs.height);

  const tex = new THREE.CanvasTexture(cvs);

  // Load the real photo
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    // Cover-crop: like CSS background-size:cover
    const ir = img.width / img.height;
    const cr = cvs.width / cvs.height;
    let sx, sy, sw, sh;
    if (ir > cr) {
      sh = img.height; sw = sh * cr;
      sx = (img.width - sw) / 2; sy = 0;
    } else {
      sw = img.width; sh = sw / cr;
      sx = 0; sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cvs.width, cvs.height);

    // Bottom gradient scrim for text legibility
    const scrim = ctx.createLinearGradient(0, cvs.height * 0.42, 0, cvs.height);
    scrim.addColorStop(0, 'rgba(0,0,0,0)');
    scrim.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    // Title
    const titlePx = Math.round(Math.max(cvs.height * 0.082, 16));
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    ctx.font = `500 ${titlePx}px "Neue Montreal", "Inter", system-ui, sans-serif`;
    ctx.fillText(data.title, 28, cvs.height * 0.74);

    // Description / location
    const descPx = Math.round(Math.max(cvs.height * 0.057, 11));
    ctx.fillStyle = 'rgba(255,255,255,0.58)';
    ctx.font = `400 ${descPx}px "Neue Montreal", "Inter", system-ui, sans-serif`;
    ctx.fillText(data.desc, 28, cvs.height * 0.74 + titlePx * 1.45);

    // Thin bottom rule
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(0, cvs.height - 1.5, cvs.width, 1.5);

    tex.needsUpdate = true;
    onUpdate?.();
  };
  img.onerror = () => {
    // Fallback: stylised placeholder with title
    drawFallback(ctx, data, cvs.width, cvs.height);
    tex.needsUpdate = true;
  };
  img.src = data.img;

  return tex;
}

function drawFallback(ctx, data, w, h) {
  // Elegant neutral fallback
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#c8c4be');
  grad.addColorStop(1, '#a8a4a0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const scrim = ctx.createLinearGradient(0, h * 0.42, 0, h);
  scrim.addColorStop(0, 'rgba(0,0,0,0)');
  scrim.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, w, h);

  const px = Math.round(Math.max(h * 0.082, 16));
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = `500 ${px}px system-ui, sans-serif`;
  ctx.fillText(data.title, 28, h * 0.74);

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `400 ${Math.round(px * 0.7)}px system-ui, sans-serif`;
  ctx.fillText(data.desc, 28, h * 0.74 + px * 1.45);
}

// ─── Build cards ──────────────────────────────────────────────────────────────
function buildProjects() {
  if (projectsGroup) {
    scene.remove(projectsGroup);
    projectsGroup.children.forEach(g =>
      g.children.forEach(m => { m.geometry?.dispose(); m.material?.dispose(); })
    );
  }
  projectsGroup = new THREE.Group();
  scene.add(projectsGroup);

  const { meshSize, bendPoint } = getLayoutParams();
  const fc = fogColor();

  PROJECT_DATA.forEach((data, i) => {
    const geo = new THREE.PlaneGeometry(1, 1, SEGMENT_COUNT, SEGMENT_COUNT);

    const mat = new THREE.ShaderMaterial({
      vertexShader, fragmentShader,
      uniforms: {
        uTexture:       { value: null },
        u_fluidTex:     { value: null },
        u_time:         { value: 0 },
        u_random:       { value: Math.random() + 1 },
        u_heightOffset: { value: 1 },
        u_bendPoint:    { value: bendPoint.clone() },
        u_zDepth:       { value: P.zDepth },
        u_noiseAmp:     { value: P.noiseAmp },
        u_rippleAmp:    { value: 12.0 },
        u_imageSize:    { value: meshSize.clone() },
        u_meshSize:     { value: meshSize.clone() },
        u_innerScale:   { value: P.innerScale },
        u_opacity:      { value: 1.0 },
        fogColor:       { value: fc.clone() },
        fogNear:        { value: FOG_NEAR },
        fogFar:         { value: FOG_FAR },
      },
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
    });

    // Build texture (async photo load — updates when ready)
    const tex = makeCardTexture(data, meshSize.x, meshSize.y, () => {
      // no-op; CanvasTexture.needsUpdate = true is enough
    });
    mat.uniforms.uTexture.value = tex;

    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(meshSize.x, meshSize.y, 1);
    mesh.renderOrder   = i;
    mesh.frustumCulled = false;

    const group = new THREE.Group();
    group.add(mesh);
    projectsGroup.add(group);
  });

  positionProjects();
}

// ─── Position into responsive grid ───────────────────────────────────────────
function positionProjects() {
  if (!projectsGroup) return;
  const { meshSize, bendPoint, cols, gap, rowH, scaleAdj } = getLayoutParams();
  const h = window.innerHeight;
  const yStartOffset = MQ.md.matches ? 80 : 30;

  projectsHeight = 0;
  projectsGroup.children.forEach((group, u) => {
    const mesh = group.children[0];
    const col  = u % cols;
    const row  = Math.floor(u / cols);

    let fx = col * (meshSize.x + gap);
    if (cols > 1) fx -= 0.5 * (meshSize.x + gap);
    const fy = -(row * rowH + row * gap + yStartOffset);

    if (col === 0) projectsHeight += rowH;
    group.position.set(fx, fy, 1000);

    mesh.scale.set(meshSize.x, meshSize.y, 1);
    mesh.material.uniforms.u_bendPoint.value.copy(bendPoint);
    mesh.material.uniforms.u_imageSize.value.copy(meshSize);
    mesh.material.uniforms.u_meshSize.value.copy(meshSize);
  });

  if (MQ.md.matches) {
    projectsHeight -= rowH - 250 * scaleAdj + 0.1 * h;
  } else {
    projectsHeight -= rowH - 250 + 0.1 * h;
  }
  projectsHeight = Math.max(projectsHeight, 0);
  scrollPos = THREE.MathUtils.clamp(scrollPos, 0, projectsHeight);
}

// ─── Uniform broadcast ────────────────────────────────────────────────────────
function setUniform(name, value) {
  projectsGroup?.children.forEach(g => {
    g.children[0].material.uniforms[name].value = value;
  });
}

// ─── Scroll & touch ───────────────────────────────────────────────────────────
function onWheel(e) {
  scrollPos = THREE.MathUtils.clamp(scrollPos + e.deltaY, 0, projectsHeight);
}
let touchY = 0;
function onTouchStart(e) { touchY = e.touches[0].clientY; }
function onTouchMove(e)  {
  const dy = touchY - e.touches[0].clientY;
  touchY = e.touches[0].clientY;
  scrollPos = THREE.MathUtils.clamp(scrollPos + dy * 1.2, 0, projectsHeight);
}

// ─── Resize ───────────────────────────────────────────────────────────────────
function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  camera.fov    = 2 * Math.atan(h / 2 / CAMERA_Z) * (180 / Math.PI);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  positionProjects();
  updateBreakpointBadge();
}

// ─── RAF loop ─────────────────────────────────────────────────────────────────
function tick() {
  requestAnimationFrame(tick);
  const t = clock.getElapsedTime() * ANIM_SPEED;

  smoothScrollPos += SCROLL_LERP * (scrollPos - smoothScrollPos);
  scrollDelta  = VELOCITY_SCALE * (scrollPos - smoothScrollPos);
  smoothDelta  = THREE.MathUtils.lerp(scrollDelta, 0, 0.01);
  velocity    += VELOCITY_LERP * (smoothDelta - velocity);

  projectsGroup.position.y = smoothScrollPos;
  projectsGroup.children.forEach(g => {
    g.children[0].material.uniforms.u_time.value = t;
  });

  updateScrollBar();
  renderer.render(scene, camera);
}

// ─── HUD ──────────────────────────────────────────────────────────────────────
function updateScrollBar() {
  const pct = projectsHeight > 0 ? (smoothScrollPos / projectsHeight) * 100 : 0;
  document.getElementById('scroll-fill').style.width = pct + '%';
}

function updateBreakpointBadge() {
  const w = window.innerWidth;
  let label = 'mobile · 1 col';
  if      (w >= 1921) label = 'xlg · 2 col';
  else if (w >= 1366) label = 'lg · 2 col';
  else if (w >= 1024) label = 'md · 2 col';
  else if (w >=  768) label = 'sm · 1 col';
  document.getElementById('hud-breakpoint').textContent = label;
}

// ─── Slider wiring ────────────────────────────────────────────────────────────
function wire(id, paramKey, onChange) {
  const el  = document.getElementById(id);
  const lbl = document.getElementById('lbl-' + id);
  el.addEventListener('input', () => {
    P[paramKey] = parseFloat(el.value);
    const decimals = parseFloat(el.step) < 1 ? 2 : 0;
    if (lbl) lbl.textContent = parseFloat(el.value).toFixed(decimals);
    onChange?.();
  });
  return el;
}

function wireAll() {
  // Curl
  wire('ctrl-bend-start', 'bendStart', () => positionProjects());
  wire('ctrl-bend-end',   'bendEnd',   () => positionProjects());
  wire('ctrl-z-depth',    'zDepth',    () => setUniform('u_zDepth', P.zDepth));

  // Wave
  wire('ctrl-noise-amp',  'noiseAmp',  () => setUniform('u_noiseAmp', P.noiseAmp));

  // Scene
  wire('ctrl-card-gap',    'cardGap',    () => buildProjects());
  wire('ctrl-inner-scale', 'innerScale', () => setUniform('u_innerScale', P.innerScale));

  // Dark mode
  document.getElementById('ctrl-dark-mode').addEventListener('change', e => {
    P.darkMode = e.target.checked;
    applyFogAndBackground();
    document.body.classList.toggle('dark-mode', P.darkMode);
  });

  // Reset
  document.getElementById('btn-reset').addEventListener('click', resetAll);
}

function resetAll() {
  Object.assign(P, { ...DEFAULTS });

  const sliders = [
    ['ctrl-bend-start', 'bendStart'],
    ['ctrl-bend-end',   'bendEnd'],
    ['ctrl-z-depth',    'zDepth'],
    ['ctrl-noise-amp',  'noiseAmp'],
    ['ctrl-card-gap',   'cardGap'],
    ['ctrl-inner-scale','innerScale'],
  ];
  sliders.forEach(([id, key]) => {
    const el  = document.getElementById(id);
    const lbl = document.getElementById('lbl-' + id);
    el.value = DEFAULTS[key];
    const decimals = parseFloat(el.step) < 1 ? 2 : 0;
    if (lbl) lbl.textContent = parseFloat(DEFAULTS[key]).toFixed(decimals);
  });

  document.getElementById('ctrl-dark-mode').checked = false;
  P.darkMode = false;
  document.body.classList.remove('dark-mode');

  applyFogAndBackground();
  setUniform('u_zDepth',     P.zDepth);
  setUniform('u_noiseAmp',   P.noiseAmp);
  setUniform('u_innerScale', P.innerScale);
  buildProjects(); // card gap may have changed
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
function init() {
  clock = new THREE.Clock();
  initRenderer();
  initCamera();
  initScene();
  buildProjects();
  wireAll();
  updateBreakpointBadge();

  window.addEventListener('wheel',      onWheel,      { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove',  onTouchMove,  { passive: true });
  window.addEventListener('resize',     onResize);

  tick();
}

init();
