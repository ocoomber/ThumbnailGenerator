# ThumbnailGenerator — developer handover

SGP YouTube / Instagram thumbnail generator for Strange Goose Productions.
React + TypeScript + Vite. Runs entirely in the browser; nothing is uploaded.

Live app: **https://ocoomber.github.io/ThumbnailGenerator/**
Repo: `ocoomber/ThumbnailGenerator` (public)
Auto-deploys to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`.

---

## Running locally

```bash
npm install        # first time only
npm run dev        # dev server → open the printed localhost URL
npm run build      # production build → dist/
npm run preview    # serve dist/ locally
```

Node 18+ required. Must be served (not opened as `file://`).

---

## Architecture

One render path, three uses: live preview on canvas, platform context previews, and PNG export all call the same `ThumbnailCanvas` component. What you see is exactly what exports.

### Data model (`src/types.ts`)

Two separate objects:

| Object | Stored in localStorage | Purpose |
|---|---|---|
| `TemplateConfig` | `sgp_thumb_config_v1` | House style — band, fonts, logo, colours. Shared across all thumbnails. |
| `ThumbnailContent` | `sgp_thumb_content_v1` | Per-video — title, caption, hero still (dataURL), per-format framing. |

Supporting types:
- `FormatId` — `'youtube' | 'instagram'`
- `Format` — `{ id, label, destination, width, height, scale }`. `scale = width / 1280`; all template px values multiply by this inside ThumbnailCanvas.
- `HeroFraming` — `{ x, y, zoom }` — per-format crop position (0–100) and zoom (≥ 1).
- `Preset` — `{ name, config }` — saved template snapshots; stored as `sgp_thumb_presets_v1`.

### Key files

```
src/
  types.ts                  — all TypeScript interfaces
  defaults.ts               — FORMATS, DEFAULT_CONFIG, DEFAULT_CONTENT, DEFAULT_FRAMING,
                              BUNDLED_FONTS, GOOGLE_FONTS, BRAND_SWATCHES, mergeConfig()
  fonts.ts                  — ensureFontLoaded(): injects Google Fonts <link> + awaits load
  export.ts                 — exportPng(): html-to-image toPng, guide filter, filename
  App.tsx                   — root: format state, hero file reading, export wiring
  hooks/useLocalStorage.ts  — persists state; only object-merges plain objects
  components/
    ThumbnailCanvas.tsx     — the one render path (live preview, context previews, export)
    ControlPanel.tsx        — all settings UI (right sidebar)
    ContextPreviews.tsx     — platform mock-ups below the stage
    Stage.tsx               — CSS scale wrapper (fits canvas to available width)
    Header.tsx              — top bar
```

### Formats

`FORMATS` in `defaults.ts`:
- `youtube` — 1280×720, scale 1
- `instagram` — 1080×1350, scale 0.84375 (1080/1280)

Adding a new format: add an entry to `FORMATS` and a matching `FormatId` union in `types.ts`. Everything else (canvas scaling, export, filename, previews) picks it up automatically.

### localStorage and backward compatibility

`mergeConfig()` does a per-section deep merge of a stored config over `DEFAULT_CONFIG`, so configs saved by older versions of the app gain any newly added fields automatically. When adding a new field to `TemplateConfig`, add its default to `DEFAULT_CONFIG` — no migration code needed.

`useLocalStorage` only object-merges when both the initial value and the stored value are plain objects. Primitives (strings like `FormatId`) and arrays (presets) pass through as-is.

---

## Components in detail

### ThumbnailCanvas

- Template px values are multiplied by `k = format.scale` throughout, so the same design renders proportionally at any format size.
- Text sync runs in `useLayoutEffect` with **no dependency array** (every render). This is intentional: when the band or caption is toggled off→on, the DOM node remounts empty. A deps-based effect would never refill it.
- `fontEpoch` state is bumped by a `document.fonts` `loadingdone` listener, triggering a re-render and re-fit of the title after a Google Font loads.
- Hero framing: when `objectFit === 'cover'` and the natural image size is known, the crop is done manually (absolute position + explicit width/height) so `x/y/zoom` can be applied. `onPointerDown` → `startPan` handles drag-to-pan; a `moved` flag on the pan ref suppresses the `onClick` → file picker if the user dragged.
- Instagram safe-area guide: rendered as `<div data-guide>` so `exportPng`'s filter can exclude it. It is never inside the exported node path.

### ControlPanel

- **Content section** (top): title, caption (textarea, Enter = line break), hero upload/replace/clear, zoom + reset framing, export button.
- **Template settings** (collapsible): band, title font/size/case/colour, caption, logo corner + nudge, hero tint. Changes write to `TemplateConfig` via `onConfig`.
- **Presets**: save/load named snapshots of `TemplateConfig`. Loaded via `mergeConfig()` to absorb any schema drift.
- Font select: optgroup split between bundled (`BUNDLED_FONTS`) and Google (`GOOGLE_FONTS`). Custom font input calls `ensureFontLoaded()` then updates `config.title.fontFamily`.

### ContextPreviews

Shows only the live edit (sample cards were removed). YouTube format: desktop feed card, mobile phone mock, sidebar suggestion row. Instagram format: profile-grid tile (3:4 centre-crop), feed-post mock. Each preview uses the same `ThumbnailCanvas` + `Stage` scaled down.

### Export (`src/export.ts`)

- `exportPng(node, title, destination, width, height)` — renders the live canvas node at exact pixel dimensions (no display scaling).
- Filename: `Film Title - Thumbnail - Destination.png` (e.g. `Crossfire - Thumbnail - YouTube.png`). Illegal filename characters are replaced with spaces.
- Guide elements (`data-guide`) are filtered out of the render.
- Google Fonts: `<link crossOrigin="anonymous">` is required for `html-to-image` to embed the font in the PNG (browsers block reading cssRules from cross-origin stylesheets otherwise).

---

## Known quirks / things to watch

- **`execCommand('insertLineBreak')`** is used in the caption's `onKeyDown` to insert a `<br>` on Enter. This API is deprecated but no standards replacement exists for `contenteditable` in 2025.
- **Hero dataURL in localStorage**: large images can hit the 5 MB quota. The `useLocalStorage` write is wrapped in try/catch; if storage is full the app keeps working in memory but the still won't survive a reload. Consider IndexedDB if this becomes a problem.
- **Fonts on export**: if a Google Font was loaded mid-session, it must still be in `document.fonts` at export time. `document.fonts.ready` is awaited before the `toPng` call. Works in practice; if an export renders in the fallback font, reload the page and re-export.
- **GitHub Actions Pages deploy**: repo must be public and the Pages source must be set to **"GitHub Actions"** (not "Deploy from a branch") in repo Settings → Pages. The competing `pages-build-deployment` job overwrites the built app if the source is set wrong.

---

## Adding a feature — checklist

1. New `TemplateConfig` field → add to `types.ts` + `DEFAULT_CONFIG` in `defaults.ts`. The `mergeConfig()` spread picks it up automatically for old saved configs.
2. New `ThumbnailContent` field → add to `types.ts` + `DEFAULT_CONTENT`.
3. New format → add to `FORMATS` + `FormatId` union.
4. UI for a new setting → `ControlPanel.tsx`; render effect in `ThumbnailCanvas.tsx`; multiply any px value by `k`.
5. Build: `npm run build` — must complete with zero TypeScript errors.
6. Test: `npm run preview` then open `http://localhost:4173` (or use the Playwright scripts in `/tmp/` from earlier sessions as a reference).
7. Push to `main` — GitHub Actions deploys automatically in ~1 minute.
