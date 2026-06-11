import type { TemplateConfig, ThumbnailContent } from './types';

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

export const FONT_OPTIONS = ['Inter Tight', 'Archivo Black', 'Bebas Neue', 'Oswald'];

export const BRAND_SWATCHES = ['#d98e3a', '#2b2620', '#faf6ee', '#c47d2c'];
