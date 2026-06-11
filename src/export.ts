import { toPng } from 'html-to-image';

export function slugify(title: string) {
  return (
    title
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'thumbnail'
  );
}

export async function exportPng(node: HTMLElement, title: string, width: number, height: number) {
  await document.fonts.ready;
  const dataUrl = await toPng(node, { width, height, pixelRatio: 1, cacheBust: true });
  const a = document.createElement('a');
  a.download = `sgp-${slugify(title)}-${width}x${height}.png`;
  a.href = dataUrl;
  a.click();
  return a.download;
}
