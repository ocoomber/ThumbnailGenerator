import type { ReactNode } from 'react';
import type { Format, TemplateConfig, ThumbnailContent } from '../types';
import { GRID_SAMPLES } from '../defaults';
import ThumbnailCanvas from './ThumbnailCanvas';
import Stage from './Stage';

interface Props {
  config: TemplateConfig;
  content: ThumbnailContent;
  format: Format;
}

const sampleContent = (i: number): ThumbnailContent => ({
  title: GRID_SAMPLES[i].title,
  caption: 'STRANGE GOOSE · EDINBURGH',
  heroImage: null,
});

const sampleHero = (i: number) => (
  <div style={{ position: 'absolute', inset: 0, background: GRID_SAMPLES[i].heroColor }} />
);

function Thumb({
  config,
  content,
  format,
  heroOverlay,
  duration,
  radius = 12,
}: Props & { heroOverlay?: ReactNode; duration?: string; radius?: number }) {
  return (
    <div className="ctx-thumb" style={{ borderRadius: radius }}>
      <Stage baseWidth={format.width} baseHeight={format.height}>
        <ThumbnailCanvas config={config} content={content} format={format} heroOverlay={heroOverlay} />
      </Stage>
      {duration && <span className="ctx-duration">{duration}</span>}
    </div>
  );
}

const Avatar = () => (
  <span className="ctx-avatar">
    <svg viewBox="0 0 100 46" width="18" height="9" aria-hidden="true">
      <path
        d="M4 40 Q30 8 50 26 Q70 8 96 40"
        fill="none"
        stroke="#faf6ee"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

function YouTubePreviews({ config, content, format }: Props) {
  const cards: { content: ThumbnailContent; hero?: ReactNode; meta: string; dur: string }[] = [
    { content: { ...content, title: content.title || 'UNTITLED' }, meta: '12K views · 2 days ago', dur: '12:42' },
    { content: sampleContent(0), hero: sampleHero(0), meta: '8.4K views · 3 weeks ago', dur: '9:18' },
    { content: sampleContent(1), hero: sampleHero(1), meta: '15K views · 1 month ago', dur: '17:05' },
  ];

  return (
    <>
      <p className="label">Desktop feed · youtube.com home</p>
      <div className="ctx-desktop">
        {cards.map((c, i) => (
          <div key={i} className="ctx-card">
            <Thumb config={config} content={c.content} format={format} heroOverlay={c.hero} duration={c.dur} />
            <div className="ctx-card-meta">
              <Avatar />
              <div>
                <b>{(c.content.title || 'UNTITLED').toUpperCase()}</b>
                <span>Strange Goose Productions</span>
                <span>{c.meta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="ctx-row2">
        <div>
          <p className="label">Mobile feed</p>
          <div className="ctx-phone">
            <Thumb config={config} content={cards[0].content} format={format} duration="12:42" radius={0} />
            <div className="ctx-card-meta" style={{ padding: '10px 12px 14px' }}>
              <Avatar />
              <div>
                <b>{(content.title || 'UNTITLED').toUpperCase()}</b>
                <span>Strange Goose Productions · 12K views · 2 days ago</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="label">Sidebar · suggested videos</p>
          <div className="ctx-sidebar">
            {cards.map((c, i) => (
              <div key={i} className="ctx-side-row">
                <Thumb config={config} content={c.content} format={format} heroOverlay={c.hero} duration={c.dur} radius={8} />
                <div className="ctx-side-text">
                  <b>{(c.content.title || 'UNTITLED').toUpperCase()}</b>
                  <span>Strange Goose Productions</span>
                  <span>{c.meta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function InstagramPreviews({ config, content, format }: Props) {
  const tiles = [
    { content: { ...content, title: content.title || 'UNTITLED' }, hero: undefined as ReactNode },
    { content: sampleContent(0), hero: sampleHero(0) },
    { content: sampleContent(1), hero: sampleHero(1) },
  ];

  return (
    <div className="ctx-row2">
      <div>
        <p className="label">Profile grid · 3:4 tiles (centre crop)</p>
        <div className="ctx-ig-grid">
          {tiles.map((t, i) => (
            <div key={i} className="ctx-ig-tile">
              {/* 4:5 render centre-cropped to the 3:4 tile */}
              <div className="ctx-ig-crop">
                <Stage baseWidth={format.width} baseHeight={format.height}>
                  <ThumbnailCanvas config={config} content={t.content} format={format} heroOverlay={t.hero} />
                </Stage>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="label">Feed post · 4:5</p>
        <div className="ctx-ig-post">
          <div className="ctx-ig-head">
            <Avatar />
            <b>strangegooseproductions</b>
          </div>
          <Thumb config={config} content={tiles[0].content} format={format} radius={0} />
          <div className="ctx-ig-actions">♡&nbsp;&nbsp;&nbsp;💬&nbsp;&nbsp;&nbsp;✈&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⌑</div>
        </div>
      </div>
    </div>
  );
}

// How the thumbnail "reads" in the real placements it will live in.
export default function ContextPreviews(props: Props) {
  return (
    <div className="series-wrap">
      <p className="label">
        Platform previews · how it reads on {props.format.id === 'youtube' ? 'YouTube' : 'Instagram'}
      </p>
      {props.format.id === 'youtube' ? <YouTubePreviews {...props} /> : <InstagramPreviews {...props} />}
      <p className="seriesnote">
        The first card mirrors your live edit; the others are fixed samples so you can judge how the series
        holds together at real placement sizes.
      </p>
    </div>
  );
}
