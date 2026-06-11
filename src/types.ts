export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type FormatId = 'youtube' | 'instagram';

export interface Format {
  id: FormatId;
  label: string;
  width: number;
  height: number;
  // Template values are authored at 1280px width; renders multiply by this.
  scale: number;
}

export interface TemplateConfig {
  // Canvas
  width: number; // 1280 (export width, fixed for YouTube)
  height: number; // 720
  canvasBg: string; // shows behind/around hero

  band: {
    enabled: boolean;
    edge: 'bottom' | 'top';
    color: string;
    height: number; // px at 1280×720
    paddingX: number;
    topKeyline: boolean;
  };

  title: {
    fontFamily: string;
    weight: number;
    maxSize: number; // auto-fit ceiling
    minSize: number; // auto-fit floor before wrapping
    color: string;
    letterSpacing: number; // em
    uppercase: boolean;
    align: 'left' | 'center';
  };

  caption: {
    enabled: boolean;
    fontSize: number;
    weight: number;
    color: string;
    opacity: number;
    letterSpacing: number; // em
  };

  logo: {
    enabled: boolean;
    corner: Corner;
    color: string;
    wordmark: string;
    wordmarkSize: number;
    image: string | null; // custom uploaded logo (dataURL); null = default goose mark
    imageHeight: number; // px height of custom logo
    scrim: boolean;
    inset: number;
    offsetX: number; // fine nudge from the corner anchor (positive = inward)
    offsetY: number;
  };

  hero: {
    objectFit: 'cover' | 'contain';
    tint: string | null;
    tintOpacity: number;
  };
}

// How the hero still sits inside a format's frame. x/y are 0–100: which part
// of the image's overflow is shown (50/50 = centred). zoom ≥ 1.
export interface HeroFraming {
  x: number;
  y: number;
  zoom: number;
}

export interface ThumbnailContent {
  title: string;
  caption: string;
  heroImage: string | null;
  // Per-format reframing of the hero (a 16:9 still crops very differently
  // into the 4:5 Instagram frame, so each format keeps its own).
  framing?: Partial<Record<FormatId, HeroFraming>>;
}

export interface Preset {
  name: string;
  config: TemplateConfig;
}
