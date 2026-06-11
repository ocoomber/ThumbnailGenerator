import type { TemplateConfig, ThumbnailContent } from '../types';
import { GRID_SAMPLES } from '../defaults';
import ThumbnailCanvas from './ThumbnailCanvas';
import Stage from './Stage';

// 4-up cohesion check: card 1 mirrors the live edit, cards 2-4 are fixed samples.
export default function ChannelGrid({
  config,
  content,
}: {
  config: TemplateConfig;
  content: ThumbnailContent;
}) {
  const cards: ThumbnailContent[] = [
    { ...content, title: content.title || 'UNTITLED' },
    ...GRID_SAMPLES.map((s) => ({ title: s.title, caption: 'STRANGE GOOSE · EDINBURGH', heroImage: null })),
  ];

  return (
    <div className="series-wrap">
      <p className="label">Channel grid preview · how the series reads</p>
      <div className="series">
        {cards.map((c, i) => (
          <Stage key={i} baseWidth={config.width} baseHeight={config.height} className="scard">
            <ThumbnailCanvas
              config={config}
              content={c}
              heroOverlay={i > 0 ? <div style={{ position: 'absolute', inset: 0, background: GRID_SAMPLES[i - 1].heroColor }} /> : undefined}
            />
          </Stage>
        ))}
      </div>
      <p className="seriesnote">
        The first card mirrors your live edit; the rest are samples so you can see the row hold together at
        search / sidebar size.
      </p>
    </div>
  );
}
