import React from 'react'
import { Sparkles, Sun, Palette, Eye, Sliders, Layers } from 'lucide-react'

export function ControlsHUD({
  materialPreset,
  setMaterialPreset,
  lightsConfig,
  setLightsConfig,
  postConfig,
  setPostConfig
}) {
  return (
    <div className="cartier-hud-panel">
      <div className="cartier-hud-header">
        <div className="cartier-hud-badge">CARTIER IMPRESSION</div>
        <h3 className="cartier-hud-title">The Manufacture</h3>
      </div>

      {/* Material Preset Switcher */}
      <div className="hud-section">
        <div className="hud-section-label">
          <Palette size={14} /> <span>PBR Material Finish</span>
        </div>
        <div className="hud-button-group">
          <button
            className={`hud-btn ${materialPreset === 'gold' ? 'active' : ''}`}
            onClick={() => setMaterialPreset('gold')}
          >
            Santos Gold
          </button>
          <button
            className={`hud-btn ${materialPreset === 'platinum' ? 'active' : ''}`}
            onClick={() => setMaterialPreset('platinum')}
          >
            Platinum
          </button>
          <button
            className={`hud-btn ${materialPreset === 'original' ? 'active' : ''}`}
            onClick={() => setMaterialPreset('original')}
          >
            Original
          </button>
        </div>
      </div>

      {/* Cartier Light Rig Toggles */}
      <div className="hud-section">
        <div className="hud-section-label">
          <Sun size={14} /> <span>Light Rig Elements</span>
        </div>
        <div className="hud-toggle-grid">
          <label className="hud-toggle-item">
            <input
              type="checkbox"
              checked={lightsConfig.keySpot}
              onChange={(e) => setLightsConfig({ ...lightsConfig, keySpot: e.target.checked })}
            />
            <span>Warm Key Spotlight</span>
          </label>
          <label className="hud-toggle-item">
            <input
              type="checkbox"
              checked={lightsConfig.tealPanels}
              onChange={(e) => setLightsConfig({ ...lightsConfig, tealPanels: e.target.checked })}
            />
            <span>Teal Wall Panels</span>
          </label>
          <label className="hud-toggle-item">
            <input
              type="checkbox"
              checked={lightsConfig.rimLight}
              onChange={(e) => setLightsConfig({ ...lightsConfig, rimLight: e.target.checked })}
            />
            <span>Gold Rim Light</span>
          </label>
          <label className="hud-toggle-item">
            <input
              type="checkbox"
              checked={lightsConfig.volumetricBeams ?? true}
              onChange={(e) => setLightsConfig({ ...lightsConfig, volumetricBeams: e.target.checked })}
            />
            <span>Volumetric Light Beams</span>
          </label>
        </div>
      </div>

      {/* Post Processing Passes */}
      <div className="hud-section">
        <div className="hud-section-label">
          <Sparkles size={14} /> <span>Cinematic Post Passes</span>
        </div>
        <div className="hud-toggle-grid">
          <label className="hud-toggle-item">
            <input
              type="checkbox"
              checked={postConfig.bloom}
              onChange={(e) => setPostConfig({ ...postConfig, bloom: e.target.checked })}
            />
            <span>Bloom (0.6)</span>
          </label>
          <label className="hud-toggle-item">
            <input
              type="checkbox"
              checked={postConfig.vignette}
              onChange={(e) => setPostConfig({ ...postConfig, vignette: e.target.checked })}
            />
            <span>Vignette (2.0)</span>
          </label>
          <label className="hud-toggle-item">
            <input
              type="checkbox"
              checked={postConfig.noise}
              onChange={(e) => setPostConfig({ ...postConfig, noise: e.target.checked })}
            />
            <span>Film Grain (0.025)</span>
          </label>
        </div>
      </div>
    </div>
  )
}
