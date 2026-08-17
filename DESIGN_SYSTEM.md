# Design System — Black & Gold

**Direction:** Cinematic near-black and gold architectural luxury. The site lives in true obsidian dark (`#040404`), with gold (`#C19400`) treated as *light catching an edge* (1px hairlines, highlighted words, numerals, active indicators) and clean paper white (`#F2F2F2`) for primary typography.

---

## 1. Color

| Token | Hex / Value | Role |
|---|---|---|
| `--color-ink` | `#040404` | Primary base surface & background across all pages |
| `--color-ink-deep` | `#040404` | Deep black background — hero edges, vignette falloff, behind 3D scenes |
| `--color-paper` | `#F2F2F2` | Primary headline and title text; small light surfaces (modals, stats) |
| `--color-silver` | `#C2C2C2` | Secondary body text, inactive navigation dots, quiet labels |
| `--color-gold` | `#C19400` | Signature gold accent — 1px dividers, numerals, active states, emphasized words |
| `--color-gold-dim` | `#C19400` | Low-emphasis gold for borders and subtle frames |

### Semantic & Alpha Tokens

| Token | Computed Value | Role |
|---|---|---|
| `--text-primary` | `var(--color-paper)` (`#F2F2F2`) | Main headings, titles, high-contrast text |
| `--text-secondary` | `var(--color-silver)` (`#C2C2C2`) | Body text, chapter copy, captions |
| `--text-muted` | `rgba(194, 194, 194, 0.45)` | Subtle tags, secondary captions, metadata |
| `--bg-default` | `var(--color-ink)` (`#040404`) | Default page wrapper background |
| `--bg-deep` | `var(--color-ink-deep)` (`#040404`) | True black backing |
| `--border-hairline` | `rgba(194, 194, 194, 0.08)` | Ultra-thin architectural borders (silver at 8%) |
| `--border-gold` | `var(--color-gold)` (`#C19400`) | Active gold borders and accents |
| `--border-gold-dim` | `rgba(193, 148, 0, 0.18)` | Subtle gold hairline borders |
| `--panel-bg` | `rgba(14, 14, 13, 0.72)` | Glassmorphic cards and modal backdrops |
| `--panel-border-hover`| `rgba(193, 148, 0, 0.22)` | Hover state glow border for cards |

---

## 2. Typography

### Display Headings
- **Font Stack:** `'The Seasons Bold'`, `'The Seasons'`, `'Newsreader'`, Georgia, serif
- **Role:** Hero titles, chapter headings, editorial statements
- **Weight:** 400 (regular) / 700 (bold), with authentic italic for emphasized words

### Body Copy
- **Font Stack:** `'Tenor Sans'`, `'Inter'`, -apple-system, sans-serif
- **Role:** Body text, descriptions, narrative paragraphs
- **Weight:** 400 / 500, clean architectural grotesk with generous line-height (`1.65–1.8`)

### Mono / Utility / Labels
- **Font Stack:** `'Behind The Nineties Sans SemiBold'`, `'Behind The Nineties Sans'`, `'IBM Plex Mono'`, monospace
- **Role:** Eyebrows, chapter tags, section numerals (`01`, `02`), navigation labels, captions
- **Style:** Tracked uppercase (`+0.12em` to `+0.3em`), small (`10px–13px`), gold or silver

---

## 3. Contrast & Application Rules

1. **Dark Dominance:** The page always lives in near-black (`#040404`); light paper surfaces are deliberate accents, never full full-bleed sections.
2. **Rule of Gold as Light:** Gold is an accent representing light, not a heavy paint fill. Prefer 1px hairline borders, glowing center diamonds (`--- ♦ ---`), or one italicized word over large solid gold blocks.
3. **Restraint:** Keep visible gold area under ~10% of any given viewport to maintain high visual impact and luxury feel.
4. **Vignettes & Overlays:** Background imagery uses double overlays (solid dark backing + smooth elliptical radial vignette) to ensure text contrast and legibility.
