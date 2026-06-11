import { useEffect, useRef, useState } from 'react';
import type { FormatId, Preset, TemplateConfig, ThumbnailContent } from './types';
import { DEFAULT_CONFIG, DEFAULT_CONTENT, FORMATS, mergeConfig } from './defaults';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ensureFontLoaded } from './fonts';
import { exportPng } from './export';
import Header from './components/Header';
import Stage from './components/Stage';
import ThumbnailCanvas from './components/ThumbnailCanvas';
import ControlPanel from './components/ControlPanel';
import ContextPreviews from './components/ContextPreviews';

export default function App() {
  const [rawConfig, setConfig] = useLocalStorage<TemplateConfig>('sgp_thumb_config_v1', DEFAULT_CONFIG);
  const [content, setContent] = useLocalStorage<ThumbnailContent>('sgp_thumb_content_v1', DEFAULT_CONTENT);
  const [presets, setPresets] = useLocalStorage<Preset[]>('sgp_thumb_presets_v1', []);
  const [formatId, setFormatId] = useLocalStorage<FormatId>('sgp_thumb_format_v1', 'youtube');
  const [showGuide, setShowGuide] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const renderRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const fileInputProxy = useRef<() => void>();

  // Older saved configs may predate newly added fields.
  const config = mergeConfig(rawConfig);
  const format = FORMATS[formatId] ?? FORMATS.youtube;

  // Re-load the active Google Font on startup (it isn't bundled).
  useEffect(() => {
    void ensureFontLoaded(config.title.fontFamily);
  }, [config.title.fontFamily]);

  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1900);
  };

  const readHeroFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const r = new FileReader();
    r.onload = (e) => {
      // New still — start from a centred frame in every format.
      setContent({ ...content, heroImage: e.target?.result as string, framing: {} });
      showToast('Hero still updated');
    };
    r.readAsDataURL(file);
  };

  const handleExport = async () => {
    if (!renderRef.current) return;
    setExporting(true);
    try {
      const name = await exportPng(renderRef.current, content.title, format.width, format.height);
      showToast(`Exported ${name}`);
    } catch (err) {
      console.error(err);
      showToast('Export failed — see console');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="wrap">
        <div className="grid2">
          <div>
            <div className="stagehead">
              <div className="segmented formatswitch">
                {Object.values(FORMATS).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={formatId === f.id ? 'active' : ''}
                    onClick={() => setFormatId(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {formatId === 'instagram' && (
                <label className="togglerow" style={{ margin: 0 }}>
                  <input type="checkbox" checked={showGuide} onChange={(e) => setShowGuide(e.target.checked)} />
                  <span>Grid-crop guide</span>
                </label>
              )}
            </div>
            <p className="label">
              Live thumbnail · {format.width} × {format.height}
            </p>
            <Stage key={format.id} baseWidth={format.width} baseHeight={format.height} className="stage">
              <ThumbnailCanvas
                ref={renderRef}
                config={config}
                content={content}
                format={format}
                editable
                showGuide={showGuide}
                onTitleEdit={(t) => setContent({ ...content, title: t })}
                onCaptionEdit={(c) => setContent({ ...content, caption: c })}
                onHeroClick={() => fileInputProxy.current?.()}
                onHeroDrop={readHeroFile}
                onFramingChange={(f) =>
                  setContent({ ...content, framing: { ...content.framing, [formatId]: f } })
                }
              />
            </Stage>
            <p className="editnote">
              <b>Tip:</b> click the title or the right-hand caption to type directly on the thumbnail, or use the
              panel. Click the still (or drag an image onto it) to drop in this film's frame, then <b>drag the
              still to reframe it</b> — each format remembers its own framing. The same design exports for
              every platform — just switch format above.
            </p>
          </div>

          <ControlPanel
            config={config}
            content={content}
            format={format}
            presets={presets}
            exporting={exporting}
            onConfig={setConfig}
            onContent={setContent}
            onPresets={setPresets}
            onHeroFile={readHeroFile}
            onClearHero={() => {
              setContent({ ...content, heroImage: null });
              showToast('Hero cleared');
            }}
            onExport={handleExport}
          />
        </div>

        <ContextPreviews config={config} content={content} format={format} />
      </div>

      <div className={'toast' + (toast ? ' show' : '')}>{toast}</div>
      <HiddenHeroInput onPick={readHeroFile} proxy={fileInputProxy} />
    </>
  );
}

// Hidden file input so clicking the hero still on the canvas opens the picker.
function HiddenHeroInput({
  onPick,
  proxy,
}: {
  onPick: (f: File) => void;
  proxy: React.MutableRefObject<(() => void) | undefined>;
}) {
  const ref = useRef<HTMLInputElement>(null);
  proxy.current = () => ref.current?.click();
  return (
    <input
      ref={ref}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onPick(f);
        e.target.value = '';
      }}
    />
  );
}
