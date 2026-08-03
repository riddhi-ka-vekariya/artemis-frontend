import React from 'react'
import { Link } from 'react-router-dom'
import {
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  Sun,
  Layers,
  Info,
  Box,
  Compass,
  ArrowRight
} from 'lucide-react'

export function ControlsHUD({
  autoRotate,
  setAutoRotate,
  envPreset,
  setEnvPreset,
  floatEnabled,
  setFloatEnabled,
  accentColor,
  setAccentColor,
  showAnnotations,
  setShowAnnotations,
  onResetCamera
}) {
  const envOptions = [
    { id: 'studio', label: 'Studio' },
    { id: 'sunset', label: 'Sunset' },
    { id: 'city', label: 'City' },
    { id: 'night', label: 'Night' }
  ]

  const colorOptions = [
    { hex: '#38bdf8', label: 'Cyan' },
    { hex: '#a855f7', label: 'Purple' },
    { hex: '#f59e0b', label: 'Amber' },
    { hex: '#10b981', label: 'Emerald' },
    { hex: '#f43f5e', label: 'Rose' }
  ]

  return (
    <div className="hud-overlay">
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
        {/* Brand Badge */}
        <div className="glass-panel hud-interactive header-brand" style={{ padding: '10px 16px' }}>
          <div className="brand-icon-box">
            <Box size={20} />
          </div>
          <div>
            <div className="brand-title">CHAIR 3D STUDIO</div>
            <div className="brand-tag">Drei & Three.js POC</div>
          </div>
        </div>

        {/* Studio Page Link */}
        <Link
          to="/studio"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(200, 240, 96, 0.1)',
            border: '1px solid rgba(200, 240, 96, 0.35)',
            borderRadius: '100px',
            color: '#c8f060',
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'background 0.25s ease',
          }}
        >
          Studio Portfolio <ArrowRight size={14} />
        </Link>

        {/* Info Card */}
        <div className="top-right-info hud-interactive">
          <div className="glass-panel info-card">
            <div className="info-title">Model Asset</div>
            <div className="info-val" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
              chair.glb
            </div>
          </div>
        </div>
      </div>

      {/* Floating Guidance Badge */}
      <div style={{ alignSelf: 'center', pointerEvents: 'auto' }}>
        <div className="hint-badge">
          <Compass size={14} color="#38bdf8" />
          <span>Scroll to Rotate &bull; Drag to Orbit &bull; Pinch to Zoom</span>
        </div>
      </div>

      {/* Bottom Main Controls Toolbar */}
      <div className="glass-panel toolbar-container hud-interactive">
        {/* Auto Rotate Toggle */}
        <button
          className={`toolbar-btn ${autoRotate ? 'active' : ''}`}
          onClick={() => setAutoRotate(!autoRotate)}
          title="Toggle Auto Rotation"
        >
          {autoRotate ? <Pause size={16} /> : <Play size={16} />}
          <span>{autoRotate ? 'Pause' : 'Rotate'}</span>
        </button>

        {/* Floating Effect Toggle */}
        <button
          className={`toolbar-btn ${floatEnabled ? 'active' : ''}`}
          onClick={() => setFloatEnabled(!floatEnabled)}
          title="Toggle Hover / Float Animation"
        >
          <Sparkles size={16} />
          <span>Float</span>
        </button>

        {/* Annotations Toggle */}
        <button
          className={`toolbar-btn ${showAnnotations ? 'active' : ''}`}
          onClick={() => setShowAnnotations(!showAnnotations)}
          title="Toggle Hotspot Labels"
        >
          <Info size={16} />
          <span>Labels</span>
        </button>

        <div style={{ width: 1, height: 24, background: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Environment Lighting Presets */}
        <div className="presets-group">
          <Sun size={14} style={{ color: 'var(--text-muted)', marginLeft: 6, marginRight: 2 }} />
          {envOptions.map((opt) => (
            <button
              key={opt.id}
              className={`preset-dot-btn ${envPreset === opt.id ? 'active' : ''}`}
              onClick={() => setEnvPreset(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Spotlight Accent Color Picker */}
        <div className="color-picker-group">
          <Layers size={14} style={{ color: 'var(--text-muted)' }} />
          {colorOptions.map((c) => (
            <div
              key={c.hex}
              className={`color-swatch ${accentColor === c.hex ? 'active' : ''}`}
              style={{ backgroundColor: c.hex }}
              onClick={() => setAccentColor(c.hex)}
              title={`Accent: ${c.label}`}
            />
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Reset Camera View */}
        <button
          className="toolbar-btn"
          onClick={onResetCamera}
          title="Reset Camera Angle"
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  )
}
