import type { Format, FormatId, TemplateConfig, ThumbnailContent } from './types';

export const FORMATS: Record<FormatId, Format> = {
  youtube: { id: 'youtube', label: 'YouTube · 1280×720', width: 1280, height: 720, scale: 1 },
  // Instagram feed post 4:5; the profile grid crops to centered 3:4.
  instagram: { id: 'instagram', label: 'Instagram · 1080×1350', width: 1080, height: 1350, scale: 1080 / 1280 },
};

// Direction A — "Lower amber band" house style.
export const DEFAULT_CONFIG: TemplateConfig = {
  width: 1280,
  height: 720,
  canvasBg: '#2b2620',

  band: {
    enabled: true,
    edge: 'bottom',
    color: '#d98e3a',
    height: 176,
    paddingX: 58,
    topKeyline: true,
  },

  title: {
    fontFamily: 'Inter Tight',
    weight: 900,
    maxSize: 112,
    minSize: 48,
    color: '#2b2620',
    letterSpacing: -0.015,
    uppercase: true,
    align: 'left',
  },

  caption: {
    enabled: true,
    fontSize: 23,
    weight: 700,
    color: '#2b2620',
    opacity: 0.82,
    letterSpacing: 0.14,
  },

  logo: {
    enabled: true,
    corner: 'top-left',
    color: '#faf6ee',
    wordmark: 'SGP',
    wordmarkSize: 32,
    image: null,
    imageHeight: 46,
    scrim: true,
    inset: 44,
    offsetX: 0,
    offsetY: 0,
  },

  hero: {
    objectFit: 'cover',
    tint: null,
    tintOpacity: 0,
  },
};

export const DEFAULT_CONTENT: ThumbnailContent = {
  title: 'THE HAAR',
  caption: 'STRANGE GOOSE · EDINBURGH',
  heroImage: null,
};

// Fixed samples for the channel-grid cohesion check.
export const GRID_SAMPLES: { title: string; heroColor: string }[] = [
  { title: 'SALT LINES', heroColor: '#7f8a86' },
  { title: 'NORTHERLY', heroColor: '#9a9484' },
  { title: 'THE QUIET TRADE', heroColor: '#6d6a62' },
];

// Bundled via @fontsource — always available, even offline.
export const BUNDLED_FONTS = ['Inter Tight', 'Archivo Black', 'Bebas Neue', 'Oswald'];

// Curated display-worthy families fetched from Google Fonts on demand.
export const GOOGLE_FONTS = [
  'Anton',
  'Barlow Condensed',
  'Bricolage Grotesque',
  'Chivo',
  'DM Sans',
  'Fjalla One',
  'League Gothic',
  'Libre Franklin',
  'Montserrat',
  'Outfit',
  'Playfair Display',
  'Sora',
  'Space Grotesk',
  'Teko',
  'Work Sans',
];

export const BRAND_SWATCHES = ['#d98e3a', '#2b2620', '#faf6ee', '#c47d2c'];

// Deep-ish merge: defaults per section so configs saved by older app
// versions (or presets) gain newly added fields.
export function mergeConfig(stored: Partial<TemplateConfig> | null | undefined): TemplateConfig {
  const s = stored ?? {};
  return {
    ...DEFAULT_CONFIG,
    ...s,
    band: { ...DEFAULT_CONFIG.band, ...s.band },
    title: { ...DEFAULT_CONFIG.title, ...s.title },
    caption: { ...DEFAULT_CONFIG.caption, ...s.caption },
    logo: { ...DEFAULT_CONFIG.logo, ...s.logo },
    hero: { ...DEFAULT_CONFIG.hero, ...s.hero },
  };
}
