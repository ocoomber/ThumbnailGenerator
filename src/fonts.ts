import { BUNDLED_FONTS } from './defaults';

const requested = new Set<string>();

// Inject a Google Fonts stylesheet for the family (once) and wait for the
// face to be usable, so auto-fit and export measure the real glyphs.
export async function ensureFontLoaded(family: string): Promise<boolean> {
  if (!family || BUNDLED_FONTS.includes(family)) return true;

  if (!requested.has(family)) {
    requested.add(family);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    // crossorigin lets html-to-image read the stylesheet rules and embed the
    // font in exported PNGs (Google Fonts serves CORS headers).
    link.crossOrigin = 'anonymous';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(
      /%20/g,
      '+'
    )}:wght@400;700;900&display=swap`;
    document.head.appendChild(link);
    await new Promise<void>((resolve) => {
      link.onload = () => resolve();
      link.onerror = () => resolve();
      setTimeout(resolve, 4000);
    });
  }

  try {
    await Promise.all(
      [400, 700, 900].map((w) => document.fonts.load(`${w} 32px '${family}'`).catch(() => []))
    );
  } catch {
    /* font loading API hiccup — fall through to the check */
  }
  // fonts.check() returns true for unknown families in some browsers, so
  // confirm a face for this family was actually registered by the stylesheet.
  const norm = family.toLowerCase();
  for (const face of document.fonts) {
    if (face.family.replace(/['"]/g, '').toLowerCase() === norm) return true;
  }
  return false;
}
