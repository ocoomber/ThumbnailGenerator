# ThumbnailGenerator

SGP YouTube Thumbnail Generator — a configurable tool for producing consistent
1280×720 YouTube thumbnails for the Strange Goose Productions channel.

## Live app

**https://ocoomber.github.io/ThumbnailGenerator/**

Runs entirely in the browser — drop in a hero still, set the title, adjust the
template, and export a pixel-exact 1280×720 PNG. Nothing is uploaded; all images
and settings stay on your device (localStorage).

The live site redeploys automatically via GitHub Actions on every push to `main`.

## What it does

- **Per-video content:** film title, caption, and a hero still (upload, drag-and-drop,
  or click the canvas). Title and caption are also editable directly on the thumbnail.
- **Template settings** (apply to *every* thumbnail, kept separate from per-video content):
  band colour/height/edge, title font/size/case/colour, caption, logo corner/wordmark/
  colour/custom image upload, and an optional hero tint. Save and load named presets.
- **Channel grid preview** to check the series reads consistently at small size.
- **Export** a 1280×720 PNG, named `sgp-<title>-1280x720.png`.

## Run it locally

Requires Node.js 18+.

```bash
npm install      # first time only
npm run dev      # start the dev server, then open the printed localhost URL
```

To produce a self-contained offline build:

```bash
npm run build    # outputs to dist/
npm run preview  # serve the built app at a localhost URL
```

> Note: the app must be *served* (via `npm run dev`/`preview` or any static
> server), not opened as a `file://` path — browsers block ES-module loading
> over `file://`. Fonts are bundled locally, so once built it runs fully offline.

## Tech

React + TypeScript + Vite. A single `ThumbnailCanvas` component is the one render
path shared by the live preview, the grid cards, and the PNG export, so what you
see is exactly what exports.

## Design reference

The original design handoff and HTML prototypes live in
[`design_handoff_thumbnail_tool/`](design_handoff_thumbnail_tool/).
