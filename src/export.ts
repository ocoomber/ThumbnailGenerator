import { toPng } from 'html-to-image';

// Strip characters that are illegal in filenames, collapse whitespace, and
// trim — keeps spaces and case so the name reads like the on-screen title.
export function cleanForFilename(s: string) {
  return (
    s
      .replace(/[\\/:*?"<>|]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'Untitled'
  );
}

export async function exportPng(node: HTMLElement, title: string, destination: string, width: number, height: number) {
  await document.fonts.ready;
  const dataUrl = await toPng(node, {
    width,
    height,
    pixelRatio: 1,
    cacheBust: true,
    // Safe-area guides are preview-only chrome — keep them out of the file.
    filter: (el) => !(el instanceof HTMLElement && el.dataset && 'guide' in el.dataset),
  });
  const a = document.createElement('a');
  a.download = `${cleanForFilename(title)} - Thumbnail - ${destination}.png`;
  a.href = dataUrl;
  a.click();
  return a.download;
}
