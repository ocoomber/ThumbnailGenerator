import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Format, TemplateConfig, ThumbnailContent } from '../types';

interface Props {
  config: TemplateConfig;
  content: ThumbnailContent;
  format: Format;
  // Editable title/caption (live preview only — context previews and export are static)
  editable?: boolean;
  showGuide?: boolean; // platform safe-area guide (excluded from export)
  onTitleEdit?: (title: string) => void;
  onCaptionEdit?: (caption: string) => void;
  onHeroClick?: () => void;
  onHeroDrop?: (file: File) => void;
  heroOverlay?: ReactNode;
}

function displayTitle(config: TemplateConfig, title: string) {
  const t = title || 'UNTITLED';
  return config.title.uppercase ? t.toUpperCase() : t;
}

// Shrink the title until it fits the band on one line; if even the floor
// overflows, allow two lines a touch smaller (matches the prototype).
function fitTitle(el: HTMLElement, maxPx: number, minPx: number) {
  el.style.whiteSpace = 'nowrap';
  let size = maxPx;
  el.style.fontSize = size + 'px';
  const avail = el.clientWidth;
  while (el.scrollWidth > avail && size > minPx) {
    size -= 2;
    el.style.fontSize = size + 'px';
  }
  if (el.scrollWidth > avail) {
    el.style.whiteSpace = 'normal';
    el.style.lineHeight = '.86';
    size = Math.min(size, maxPx * 0.57);
    el.style.fontSize = size + 'px';
  } else {
    el.style.lineHeight = '.88';
  }
}

const GooseMark = ({ color, height }: { color: string; height: number }) => (
  <svg viewBox="0 0 100 46" width={(height * 100) / 46} height={height} aria-hidden="true">
    <path
      d="M4 40 Q30 8 50 26 Q70 8 96 40"
      fill="none"
      stroke={color}
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ThumbnailCanvas = forwardRef<HTMLDivElement, Props>(function ThumbnailCanvas(
  {
    config,
    content,
    format,
    editable,
    showGuide,
    onTitleEdit,
    onCaptionEdit,
    onHeroClick,
    onHeroDrop,
    heroOverlay,
  },
  ref
) {
  const titleRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const dragDepth = useRef(0);
  const heroRef = useRef<HTMLDivElement>(null);
  // Bumped when a webfont finishes loading so auto-fit re-measures.
  const [fontEpoch, setFontEpoch] = useState(0);

  // Template values are authored at 1280px width; scale to this format.
  const k = format.scale;
  const title = displayTitle(config, content.title);
  const bandOnTop = config.band.edge === 'top';
  const bandHeight = config.band.height * k;
  const logoTop = config.logo.corner.startsWith('top');
  const logoLeft = config.logo.corner.endsWith('left');

  // Sync contenteditable text + run auto-fit on every render. The text sync
  // must live here (not in a value-keyed effect): when the band or caption is
  // toggled off and back on, the node remounts empty without the value
  // changing, so a deps-based effect would never refill it.
  useLayoutEffect(() => {
    const tEl = titleRef.current;
    if (tEl) {
      if (tEl.textContent !== title && document.activeElement !== tEl) {
        tEl.textContent = title;
      }
      fitTitle(tEl, config.title.maxSize * k, config.title.minSize * k);
    }
    const cEl = captionRef.current;
    if (cEl && cEl.textContent !== content.caption && document.activeElement !== cEl) {
      cEl.textContent = content.caption;
    }
  });

  // Re-fit when webfonts finish loading (metrics change after swap).
  useEffect(() => {
    const onDone = () => setFontEpoch((e) => e + 1);
    document.fonts.addEventListener('loadingdone', onDone);
    return () => document.fonts.removeEventListener('loadingdone', onDone);
  }, []);
  void fontEpoch; // consumed by triggering the layout effect above

  const scrimStyle = (top: boolean): React.CSSProperties => ({
    position: 'absolute',
    left: 0,
    right: 0,
    [top ? 'top' : 'bottom']: 0,
    height: 230 * k,
    pointerEvents: 'none',
    background: `linear-gradient(to ${top ? 'bottom' : 'top'}, rgba(18,15,12,.46), rgba(18,15,12,0))`,
  });

  // Logo anchor: corner inset plus the user's fine offset (positive = inward).
  const logoVerticalBase = logoTop
    ? bandOnTop && config.band.enabled
      ? bandHeight
      : 0
    : !bandOnTop && config.band.enabled
      ? bandHeight
      : 0;

  return (
    <div
      ref={ref}
      className="thumb"
      style={{
        width: format.width,
        height: format.height,
        position: 'relative',
        overflow: 'hidden',
        background: config.canvasBg,
        fontFamily: `'${config.title.fontFamily}', 'Inter Tight', sans-serif`,
      }}
    >
      {/* Hero */}
      <div
        ref={heroRef}
        className={content.heroImage ? 'hero' : 'hero empty'}
        style={{ position: 'absolute', inset: 0, overflow: 'hidden', cursor: onHeroClick ? 'pointer' : undefined }}
        onClick={onHeroClick}
        onDragEnter={
          onHeroDrop
            ? (e) => {
                e.preventDefault();
                dragDepth.current++;
                heroRef.current?.classList.add('dragover');
              }
            : undefined
        }
        onDragOver={onHeroDrop ? (e) => e.preventDefault() : undefined}
        onDragLeave={
          onHeroDrop
            ? (e) => {
                e.preventDefault();
                if (--dragDepth.current <= 0) {
                  dragDepth.current = 0;
                  heroRef.current?.classList.remove('dragover');
                }
              }
            : undefined
        }
        onDrop={
          onHeroDrop
            ? (e) => {
                e.preventDefault();
                dragDepth.current = 0;
                heroRef.current?.classList.remove('dragover');
                const f = e.dataTransfer.files[0];
                if (f) onHeroDrop(f);
              }
            : undefined
        }
      >
        {content.heroImage ? (
          <img
            src={content.heroImage}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: config.hero.objectFit,
              display: 'block',
            }}
          />
        ) : (
          heroOverlay ?? (
            <div className="ph">
              <div className="ico" />
              <span style={{ fontSize: 20 * k }}>Drop hero still here</span>
            </div>
          )
        )}
        {config.hero.tint && config.hero.tintOpacity > 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: config.hero.tint,
              opacity: config.hero.tintOpacity,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Scrim behind the logo corner */}
      {config.logo.enabled && config.logo.scrim && <div style={scrimStyle(logoTop)} />}

      {/* Logo lockup */}
      {config.logo.enabled && (
        <div
          style={{
            position: 'absolute',
            [logoTop ? 'top' : 'bottom']:
              logoVerticalBase + (config.logo.inset - 4 + config.logo.offsetY) * k,
            [logoLeft ? 'left' : 'right']: (config.logo.inset + 4 + config.logo.offsetX) * k,
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 14 * k,
            filter: 'drop-shadow(0 2px 10px rgba(0,0,0,.5))',
          }}
        >
          {config.logo.image ? (
            <img
              src={config.logo.image}
              alt=""
              style={{ height: config.logo.imageHeight * k, display: 'block' }}
            />
          ) : (
            <GooseMark color={config.logo.color} height={(config.logo.wordmarkSize * 23 * k) / 32} />
          )}
          {config.logo.wordmark && (
            <span
              style={{
                color: config.logo.color,
                fontWeight: 800,
                letterSpacing: '.16em',
                fontSize: config.logo.wordmarkSize * k,
              }}
            >
              {config.logo.wordmark}
            </span>
          )}
        </div>
      )}

      {/* Band */}
      {config.band.enabled && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            [bandOnTop ? 'top' : 'bottom']: 0,
            height: bandHeight,
            background: config.band.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `0 ${(config.band.paddingX - 2) * k}px 0 ${(config.band.paddingX + 2) * k}px`,
            gap: 28 * k,
            zIndex: 2,
          }}
        >
          {config.band.topKeyline && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                [bandOnTop ? 'bottom' : 'top']: -6 * k,
                height: 6 * k,
                background: '#2b2620',
                opacity: 0.18,
              }}
            />
          )}
          <div
            ref={titleRef}
            contentEditable={editable || undefined}
            suppressContentEditableWarning
            spellCheck={false}
            onInput={
              editable && onTitleEdit ? (e) => onTitleEdit((e.target as HTMLElement).textContent ?? '') : undefined
            }
            onBlur={
              editable && onTitleEdit && config.title.uppercase
                ? (e) => {
                    const el = e.target as HTMLElement;
                    const up = (el.textContent ?? '').toUpperCase();
                    if (el.textContent !== up) {
                      el.textContent = up;
                      onTitleEdit(up);
                    }
                  }
                : undefined
            }
            style={{
              flex: 1,
              minWidth: 0,
              fontWeight: config.title.weight,
              lineHeight: 0.88,
              letterSpacing: `${config.title.letterSpacing}em`,
              color: config.title.color,
              textTransform: config.title.uppercase ? 'uppercase' : 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textAlign: config.title.align,
              outline: 'none',
            }}
          >
            {editable ? null : title}
          </div>
          {config.caption.enabled && (
            <div
              ref={captionRef}
              contentEditable={editable || undefined}
              suppressContentEditableWarning
              spellCheck={false}
              onInput={
                editable && onCaptionEdit
                  ? (e) => onCaptionEdit((e.target as HTMLElement).textContent ?? '')
                  : undefined
              }
              style={{
                flex: 'none',
                whiteSpace: 'nowrap',
                textAlign: 'right',
                fontWeight: config.caption.weight,
                fontSize: config.caption.fontSize * k,
                letterSpacing: `${config.caption.letterSpacing}em`,
                color: config.caption.color,
                opacity: config.caption.opacity,
                lineHeight: 1.25,
                outline: 'none',
              }}
            >
              {editable ? null : content.caption}
            </div>
          )}
        </div>
      )}

      {/* Instagram profile-grid crop guide (preview only — filtered from export) */}
      {showGuide && format.id === 'instagram' && (
        <div data-guide style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
          {(() => {
            // Grid tiles are centered 3:4 crops of the 4:5 post.
            const safeW = format.height * (3 / 4);
            const side = (format.width - safeW) / 2;
            const edge: React.CSSProperties = {
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: side,
              background: 'rgba(18,15,12,.45)',
            };
            return (
              <>
                <div style={{ ...edge, left: 0, borderRight: '2px dashed rgba(250,246,238,.8)' }} />
                <div style={{ ...edge, right: 0, borderLeft: '2px dashed rgba(250,246,238,.8)' }} />
                <div
                  style={{
                    position: 'absolute',
                    top: 18,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(250,246,238,.9)',
                    background: 'rgba(18,15,12,.55)',
                    padding: '6px 14px',
                    borderRadius: 999,
                  }}
                >
                  Profile grid crop · 3:4
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
});

export default ThumbnailCanvas;
