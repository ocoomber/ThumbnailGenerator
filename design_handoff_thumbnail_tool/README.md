# Handoff: SGP Thumbnail Template Tool

## Overview
A small web tool that lets the Strange Goose Productions (SGP) team generate **consistent YouTube
thumbnails** (1280×720) for every film on the channel. For each video the user drops in a hero still
and types a film title; the tool locks the SGP "house style" (logo mark, bottom colour band, type,
palette) around it and exports a pixel-exact PNG ready to upload. The goal is that the channel grid
reads as one intentional series rather than auto-grabbed frames.

The chosen design direction is **"A — Lower amber band"**: hero still fills the whole frame, the film
title sits on a solid colour band across the bottom, and the SGP mark locks to the top-left corner.

**The new requirement driving this build:** the design must become **configurable**. The user wants to
adjust the *template variables themselves* — band colour, band height, title font/size/case, logo
placement, etc. — not just the per-video content. The core architectural idea below separates those two
concerns.

---

## About the Design Files
The files in `references/` are **design references created in HTML** — working prototypes that show the
intended look, behaviour, and export, **not production code to ship as-is**. The task is to **recreate
this as a real, configurable app** in whatever environment fits the project (see "Recommended Stack"),
using its established patterns. The HTML prototype is the source of truth for *visual values and
interactions*; lift exact numbers from it (they're also tabulated below).

- **`references/SGP Thumbnail Template.html`** — the primary reference: the working Direction-A tool
  (editable title/caption, hero drop-zone, PNG export, live channel-grid preview, localStorage
  persistence). All design tokens and the auto-fit algorithm live here.
- **`references/SGP Thumbnail Templates.html`** (+ `thumbnails.jsx`, `design-canvas.jsx`) — the earlier
  six-direction exploration (A–F). Useful if you later want the template to support **multiple
  switchable layouts**. Direction A is the one to build first.

## Fidelity
**High-fidelity.** Final colours, typography, spacing, and interactions are all specified. Recreate the
thumbnail render pixel-perfectly — the export is a real deliverable, so the rendered 1280×720 output
must match these values exactly. The surrounding app chrome (control panel, buttons) is hifi too but you
may re-skin it to match an existing design system if this lives inside a larger product.

---

## Core Concept: two separate data models

The single most important design decision: split state into **Template config** and **Content**.

### 1. `TemplateConfig` — the house style (rarely changes, shared by every thumbnail)
These are the variables the user wants to expose as adjustable controls. Suggested shape:

```ts
type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface TemplateConfig {
  // Canvas
  width: number;            // 1280 (export width, fixed for YouTube)
  height: number;           // 720
  canvasBg: string;         // '#2b2620' (shows behind/around hero)

  // Bottom band (the "strip")
  band: {
    enabled: boolean;       // true
    edge: 'bottom' | 'top'; // 'bottom'
    color: string;          // '#d98e3a' (amber)  ← key adjustable
    height: number;         // 176  (px at 1280×720)  ← key adjustable
    paddingX: number;       // 56–60
    topKeyline: boolean;    // true (6px ink hairline at .18 opacity)
  };

  // Title
  title: {
    fontFamily: string;     // 'Inter Tight'
    weight: number;         // 900
    maxSize: number;        // 112  (auto-fit ceiling)
    minSize: number;        // 48   (auto-fit floor before wrapping)
    color: string;          // '#2b2620' (ink)
    letterSpacing: number;  // -0.015em  (store as em number, e.g. -0.015)
    uppercase: boolean;     // true
    align: 'left' | 'center';
  };

  // Caption (the right-hand line in the band)
  caption: {
    enabled: boolean;       // true
    fontSize: number;       // 23
    weight: number;         // 700
    color: string;          // '#2b2620'
    opacity: number;        // 0.82
    letterSpacing: number;  // 0.14em
  };

  // Logo lockup
  logo: {
    enabled: boolean;       // true
    corner: Corner;         // 'top-left'
    color: string;          // '#faf6ee' (cream) — flips to ink on light heroes
    wordmark: string;       // 'SGP'
    scrim: boolean;         // true (gradient behind logo for legibility)
    inset: number;          // 40–48 px
  };

  // Hero treatment
  hero: {
    objectFit: 'cover' | 'contain'; // 'cover'
    tint: string | null;            // optional colour grade overlay, e.g. null
    tintOpacity: number;            // 0
  };
}
```

A `TemplateConfig` is the thing the user edits in a **"Template settings" panel** and **saves as a
preset**. The default preset == the values above (Direction A).

### 2. `ThumbnailContent` — per video (changes every export)
```ts
interface ThumbnailContent {
  title: string;        // e.g. 'THE HAAR'
  caption: string;      // e.g. 'STRANGE GOOSE · EDINBURGH'
  heroImage: string;    // object URL / dataURL / uploaded asset URL
}
```

The render is a pure function: `render(TemplateConfig, ThumbnailContent) → 1280×720 node`. Both the live
preview and the PNG export use the same render — never two code paths.

---

## Screens / Views

### Main screen — Editor
A single page, two-column on desktop, stacking under ~980px.

**Layout**
- **App header** (sticky, full width): height ~64px, `#faf6ee` background, `1px solid #e4dfd3` bottom
  border. Left: goose mark SVG + "STRANGE GOOSE" (800, 18px, letter-spacing .06em) + a pill badge
  ("Thumbnail template · A": 11px 700 uppercase, `#c47d2c` text, `1px solid #d98e3a`, border-radius 999px,
  padding 3px 10px). Right: a one-line hint, 12.5px, `#8a8478`.
- **Body**: `max-width: 1240px`, centered, padding `34px 30px 80px`.
- **Two-column grid**: `grid-template-columns: minmax(0,1fr) 312px; gap: 34px; align-items:start`.
  ⚠️ The `minmax(0,1fr)` (not `1fr`) matters — the 1280px-wide render must not force the column open.
  Each column needs `min-width: 0`.

**Left column — live preview**
- Section label ("LIVE THUMBNAIL · 1280 × 720"): 11px 700 uppercase, `#8a8478`, with a trailing hairline rule.
- **Stage**: responsive wrapper, `border-radius: 8px`, `overflow: hidden`,
  `box-shadow: 0 18px 50px -18px rgba(43,38,32,.45)`. Inside, a `transform: scale()`'d wrapper holds the
  true **1280×720 render node**. Scale = `stage.clientWidth / 1280`, recomputed on resize
  (ResizeObserver). Stage height is set to `720 * scale` so it doesn't reserve the full 720px.
- Helper note beneath, 12.5px `#8a8478`.

**Right column — control panel** (sticky, `top: 84px`)
- Card: `#faf6ee`, `1px solid #e4dfd3`, `border-radius: 10px`, padding `22px`.
- For the **content** controls (this build already has these): Film title (text input), Caption (text
  input), Upload hero still (primary amber button), Replace / Clear (split row), Export PNG (dark
  primary button).
- **NEW — add a "Template settings" section** here (or a separate tab/drawer) exposing the
  `TemplateConfig` fields: band colour (swatch picker — offer the brand set + custom), band height
  (slider 120–240), title font (select), title max size (slider 72–140), uppercase (toggle), logo corner
  (4-way segmented), caption on/off (toggle), scrim on/off (toggle). See "Controls spec" below.

**Bottom — channel-grid preview**
- Section label ("CHANNEL GRID PREVIEW · HOW THE SERIES READS").
- 4-up grid (`repeat(4,1fr)`, gap 16px; 2-up under 980px). Card 1 mirrors the live edit; cards 2–4 are
  fixed samples (SALT LINES, NORTHERLY, THE QUIET TRADE) so the user can judge cohesion at small size.
  Each card is the same render node scaled to card width. This is the "does the series hold together"
  check — keep it.

---

## The render (Direction A) — exact spec

Everything below is at the **true 1280×720 base** (the export size). Scale uniformly for previews.

**Frame**
- `1280 × 720`, `position: relative`, `overflow: hidden`, background `#2b2620`.

**Hero (layer 1, fills frame)**
- `position: absolute; inset: 0`. `<img>` with `object-fit: cover; width/height: 100%`.
- Empty state placeholder: `repeating-linear-gradient(135deg, #a3aaa6 0 18px, #99a19c 18px 36px)` with a
  centered monospace label "DROP HERO STILL HERE · 16:9" (`ui-monospace`, 20px, `rgba(43,38,32,.5)`).

**Top scrim (layer 2, for logo legibility)**
- `position:absolute; left/right/top:0; height:230px`,
  `linear-gradient(to bottom, rgba(18,15,12,.46), rgba(18,15,12,0))`, `pointer-events:none`.
- Only needed when logo is in a top corner; mirror to bottom if logo moves down.

**Logo lockup (layer 3)**
- Default top-left: `top:40px; left:48px`, flex row, `gap:14px`,
  `filter: drop-shadow(0 2px 10px rgba(0,0,0,.5))`.
- Goose mark: inline SVG, `viewBox="0 0 100 46"`, single path
  `M4 40 Q30 8 50 26 Q70 8 96 40`, `stroke` = logo color, `stroke-width:7`, round caps/joins, no fill.
  Rendered ~50×23px here. **This is a placeholder mark** — see Assets; swap for SGP's real logo.
- Wordmark "SGP": `#faf6ee`, weight 800, `letter-spacing:.16em`, `font-size:32px`.

**Bottom band (layer 4)**
- `position:absolute; left/right/bottom:0; height:176px`, background `#d98e3a`.
- `display:flex; align-items:center; justify-content:space-between; padding:0 56px 0 60px; gap:28px`.
- Top keyline: `::before` 6px tall, `#2b2620` at `opacity:.18`, sitting just above the band.
- **Title**: `flex:1; min-width:0`, weight 900, `line-height:.88`, `letter-spacing:-.015em`,
  color `#2b2620`, `text-transform:uppercase`, `white-space:nowrap`, `overflow:hidden`. Size set by
  auto-fit (below).
- **Caption**: `flex:none; white-space:nowrap; text-align:right`, weight 700, `font-size:23px`,
  `letter-spacing:.14em`, color `#2b2620`, `opacity:.82`.

**Title auto-fit algorithm** (so any film name fits the band on one line)
```
set whiteSpace=nowrap, fontSize = title.maxSize (112)
while (el.scrollWidth > el.clientWidth && size > minSize) size -= 2
if still overflowing at minSize:
    whiteSpace = normal; lineHeight = .86; fontSize = min(size, 64)   // allow 2 lines
else lineHeight = .88
```
Recompute on every title change and on resize. (Verified: "THE LONG DARK WINTERING" settles at 54px,
one line.)

---

## Interactions & Behavior
- **Title editing**: editable both in the panel input *and* directly on the band (contenteditable in the
  prototype). Typing re-runs auto-fit live. Title is upper-cased (on input from the panel; on blur from
  the on-canvas edit). Keep panel ⇄ canvas in sync (two-way).
- **Caption editing**: same dual editing; no case transform.
- **Hero upload**: click the still, click "Upload"/"Replace", or **drag-and-drop** an image file onto
  the still. On dragover show a dashed amber outline (`outline:6px dashed #d98e3a; outline-offset:-12px`).
  Read via FileReader → dataURL (prototype) or upload to asset storage (production).
- **Clear**: returns the hero to the empty placeholder state.
- **Export PNG**: render the 1280×720 node to PNG at `pixelRatio:1` (exact 1280×720 — verified). Wait for
  `document.fonts.ready` first so Inter Tight is loaded before capture. Download as
  `sgp-<title-slugified>-1280x720.png`. Button shows a "Rendering…" busy state.
- **Live grid**: every content/config change re-renders card 1 of the bottom grid.
- **Responsive**: editor columns stack under 980px; grid goes 4→2 columns. The render itself never
  reflows — it's always 1280×720 internally, only scaled.

## State Management
- `templateConfig: TemplateConfig` — current house style. Persist; support **named presets**
  (save/load/duplicate). Default preset = Direction A values above.
- `content: ThumbnailContent` — `{ title, caption, heroImage }`. Persist the in-progress one.
- `previewScale` — derived from container width (ResizeObserver), not stored.
- Prototype persists to `localStorage` under key `sgp_thumb_A_v1` as `{title, meta, img}`. In production,
  persist config/presets server-side or in localStorage; hero images to real asset storage (dataURLs in
  localStorage won't scale).

## Design Tokens
| Token | Value | Use |
|---|---|---|
| Cream | `#faf6ee` | logo wordmark, panel bg, app header |
| Amber | `#d98e3a` | **bottom band**, primary action button |
| Amber deep | `#c47d2c` | hover, pill text, accents |
| Ink | `#2b2620` | title, caption, dark text, canvas bg |
| Ink soft | `#3a332a` | dark button hover |
| Line | `#e4dfd3` | borders, hairline rules |
| Muted | `#8a8478` | secondary/label text |
| Scrim | `rgba(18,15,12, .46→0)` | top gradient behind logo |

**Type**: Inter Tight (Google Fonts), weights 500/600/700/800/900 + italic 600. Title 900; wordmark/labels
700–800; body 500–600.
**Band height**: 176px (of 720). **Logo inset**: 40/48px. **Radii**: app cards 8–10px; render itself has
square corners (0). **Key shadow**: `0 18px 50px -18px rgba(43,38,32,.45)`.

## Controls spec (the adjustable variables the user asked for)
| Control | Type | Default | Range / options |
|---|---|---|---|
| Band colour | swatch + custom | `#d98e3a` | brand set (amber/ink/cream) + hex picker |
| Band height | slider | 176 | 120–240 px |
| Band edge | toggle | bottom | bottom / top |
| Title font | select | Inter Tight | curated list (keep it small) |
| Title max size | slider | 112 | 72–140 |
| Title case | toggle | UPPER | upper / as-typed |
| Title colour | swatch | ink | brand set |
| Caption | toggle + text | on | on/off |
| Logo corner | 4-way segmented | top-left | TL / TR / BL / BR |
| Logo colour | toggle | cream | cream / ink |
| Logo scrim | toggle | on | on/off |
| Hero tint | swatch + opacity | none | optional grade overlay |

Group these under a clearly separated **"Template settings"** area, distinct from the per-video
title/caption/upload controls, so it's obvious which edits change *this thumbnail* vs *every thumbnail*.

## Recommended Stack
- **React + TypeScript** (or the project's existing framework). One `<ThumbnailCanvas config content />`
  component used by the live preview, every grid card, and the export — single render path.
- **Export**: client-side `html-to-image` (`toPng`, width 1280 / height 720 / pixelRatio 1) is what the
  prototype uses and is sufficient. If you need **batch/server** generation (e.g. a CSV of titles → many
  PNGs), use **Satori + resvg** or **node-canvas / Puppeteer** server-side, driven by the same
  `TemplateConfig`.
- Load Inter Tight via Google Fonts and **await `document.fonts.ready` before any capture**.

## Possible enhancements (not required, but the structure invites them)
- **Multiple layouts**: promote Directions A–F (see the exploration file) into selectable `layout` presets.
- **Batch mode**: upload N stills + a list of titles → export a ZIP of thumbnails.
- **Focal point**: let the user drag to reposition `object-position` on the hero.
- **Safe-area guide**: overlay the YouTube duration-chip corner and title-truncation zones while editing.

## Assets
- **No external image assets** are required by the design — hero stills are user-supplied per video.
- **Goose logo mark** is currently a **placeholder** (the simple chevron SVG path given above). Replace
  with SGP's real logo artwork (supply as SVG ideally). The render references it as an inline SVG / `<img>`.
- Fonts: Inter Tight from Google Fonts (no local files needed).

## Files
- `references/SGP Thumbnail Template.html` — primary: the working Direction-A tool (all values + auto-fit).
- `references/SGP Thumbnail Templates.html` — six-direction exploration (A–F).
- `references/thumbnails.jsx`, `references/design-canvas.jsx` — components used by the exploration file.
