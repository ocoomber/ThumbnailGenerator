import { useRef, useState } from 'react';
import type { Preset, TemplateConfig, ThumbnailContent } from './types';
import { DEFAULT_CONFIG, DEFAULT_CONTENT } from './defaults';
import { useLocalStorage } from './hooks/useLocalStorage';
import { exportPng } from './export';
import Header from './components/Header';
import Stage from './components/Stage';
import ThumbnailCanvas from './components/ThumbnailCanvas';
import ControlPanel from './components/ControlPanel';
import ChannelGrid from './components/ChannelGrid';

export default function App() {
  const [config, setConfig] = useLocalStorage<TemplateConfig>('sgp_thumb_config_v1', DEFAULT_CONFIG);
  const [content, setContent] = useLocalStorage<ThumbnailContent>('sgp_thumb_content_v1', DEFAULT_CONTENT);
  const [presets, setPresets] = useLocalStorage<Preset[]>('sgp_thumb_presets_v1', []);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const renderRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const fileInputProxy = useRef<() => void>();

  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1900);
  };

  const readHeroFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const r = new FileReader();
    r.onload = (e) => {
      setContent({ ...content, heroImage: e.target?.result as string });
      showToast('Hero still updated');
    };
    r.readAsDataURL(file);
  };

  const handleExport = async () => {
    if (!renderRef.current) return;
    setExporting(true);
    try {
      const name = await exportPng(renderRef.current, content.title, config.width, config.height);
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
            <p className="label">
              Live thumbnail · {config.width} × {config.height}
            </p>
            <Stage baseWidth={config.width} baseHeight={config.height} className="stage">
              <ThumbnailCanvas
                ref={renderRef}
                config={config}
                content={content}
                editable
                onTitleEdit={(t) => setContent({ ...content, title: t })}
                onCaptionEdit={(c) => setContent({ ...content, caption: c })}
                onHeroClick={() => fileInputProxy.current?.()}
                onHeroDrop={readHeroFile}
              />
            </Stage>
            <p className="editnote">
              <b>Tip:</b> click the title or the right-hand caption to type directly on the thumbnail, or use the
              panel. Click the still (or drag an image onto it) to drop in this film's frame.
            </p>
          </div>

          <ControlPanel
            config={config}
            content={content}
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

        <ChannelGrid config={config} content={content} />
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
