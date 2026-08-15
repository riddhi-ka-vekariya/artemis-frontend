# Design System — Black & Gold

**Direction:** cinematic-dark, not light-and-dark alternating. The page lives almost entirely in near-black, gold is used as *light* — thin hairlines, single numerals, one italic word — rather than as fills or blocks. That's a real shift from my first pass, which alternated paper/ink sections. This version leans into the dark register throughout, with paper reserved for small, deliberate moments (card surfaces, a stat block) rather than full sections.

Fonts below favor a restrained, editorial tone with distinct typefaces suited to the system.

---

## 1. Color

| Token | Hex | Role |
|---|---|---|
| `--color-ink` | `#1A1A1A` | Base surface — this is now the *default* background, not a section that alternates with light ones |
| `--color-ink-deep` | `#0E0E0D` *(derived)* | True-black areas — hero edges, vignette falloff, behind 3D scenes |
| `--color-paper` | `#F2F2F2` | Reserved for small light surfaces only: a card, a stat block, a modal — never a full section |
| `--color-silver` | `#C2C2C2` | Secondary/body text on dark backgrounds, inactive nav-dots, hairline borders at low opacity |
| `--color-gold` | `#C19400` | The one accent — numerals, one italic word per headline, hairline dividers, active states, the drag-to-rotate ring. Read as *light catching an edge*, not paint |
| `--color-gold-dim` | `#7A5E00` *(derived)* | Gold at rest / low emphasis — inactive icon strokes, subtle borders |

**Rule of one accent, restated for a dark-dominant page:** gold should look like it's being *lit*, not colored. Prefer 1px gold strokes, single glowing numerals, or one italic word over any gold fill larger than a button. If a screen has more than roughly three gold moments (one numeral, one divider, one CTA/link), pull one back.

**Contrast pairings:**
- Ink/near-black background → Paper (primary text) or Silver (secondary text) or Gold (accent only)
- Paper surfaces (rare) → Ink text, gold only for a small label or icon
- Never silver-on-silver or gold-on-gold; gold always sits directly on ink or true-black

---

## 2. Type

**Display — [Newsreader](https://fonts.google.com/specimen/Newsreader)**  
A literary transitional serif with real optical sizes and a genuine italic (not a faux-slant) — set the italic for exactly one word per headline, the way "move" carries the reference's headline. Roman weight for the rest of the line. Use `opsz` large + `wght 400` for hero size, italic only on the emphasis word, `wght 500` for section heads. Quieter and more bookish than a display-drama serif — it reads as considered rather than decorative.

**Body — [Neue Montreal](https://pangrampangram.com/products/neue-montreal)**  
A precise, slightly technical grotesk — colder and more architectural than General Sans, which suits a dark, engineered feel better than a warm humanist face would. `wght 400` body copy, `wght 500` UI labels and buttons.

**Utility / numerals — [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono)**  
Unchanged from before, and doing more work now: section numerals (01, 02...), nav tracking labels, "scroll to explore" / "drag to rotate" captions, dot-nav index. Tracked out (+0.08–0.12em), uppercase, small (11–13px) — this is the face that carries the reference's precise, instrument-panel feeling.

**Type scale (desktop, 8px base):**
| Role | Font | Size | Line-height | Tracking |
|---|---|---|---|---|
| Hero display | Newsreader 400 (italic on 1 word) | 56–88px | 1.0 | -0.01em |
| Section head | Newsreader 500 | 32–44px | 1.05 | -0.01em |
| Subhead | Neue Montreal 500 | 18–20px | 1.4 | 0 |
| Body | Neue Montreal 400 | 15–17px | 1.65 | 0 |
| Eyebrow/numeral | IBM Plex Mono 500 | 11–13px | 1.4 | +0.1em, uppercase |
| Nav label | IBM Plex Mono 500 | 12px | 1 | +0.12em, uppercase |

---

## 4. Components (quick reference)

- **Primary CTA:** a text link, not a filled button — label + a thin gold arrow, underline draws in on hover. Reserve solid gold-fill buttons for one true action per page (e.g. a form submit), not for every "learn more"
- **Nav label:** IBM Plex Mono, tracked, silver at rest, gold on hover/active — no underline, the color shift is enough
- **Dot-index (scroll/section):** small circles, silver at 30% opacity when inactive, solid gold when active, current numeral in mono gold above/beside the stack
- **Card:** paper or ink-deep surface, 1px silver border at 8% opacity, no shadow at rest, no radius flourish — keep it architectural (0–4px radius, not the softer 12–16px from a lighter-toned page)
- **Corner affordance:** icon (outline, 1px, silver) + mono caption, gold ring only when interactive (e.g. the drag-to-rotate dial)

---

## 5. General principles

- The page defaults to dark; light surfaces are the exception and should feel deliberate when they appear, not like a returning "normal" state
- Gold reads as light, not fill — favor 1px strokes, single glowing elements, and restraint over saturated gold blocks
- No gradients between ink and paper; where black transitions to near-black, use a soft vignette, not a visible band
- Keep gold under ~10% of any given viewport's visible area — tighter than a lighter-toned page, because dark backgrounds make gold read stronger per pixel
