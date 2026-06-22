import { useId, useRef, useState } from 'react';
import type { Corner, Format, Preset, TemplateConfig, ThumbnailContent } from '../types';
import { BRAND_SWATCHES, BUNDLED_FONTS, DEFAULT_CONFIG, DEFAULT_FRAMING, GOOGLE_FONTS, mergeConfig } from '../defaults';
import { ensureFontLoaded } from '../fonts';

interface Props {
  config: TemplateConfig;
  content: ThumbnailContent;
  format: Format;
  presets: Preset[];
  exporting: boolean;
  onConfig: (c: TemplateConfig) => void;
  onContent: (c: ThumbnailContent) => void;
  onPresets: (p: Preset[]) => void;
  onHeroFile: (f: File) => void;
  onClearHero: () => void;
  onExport: () => void;
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="colorrow">
        {BRAND_SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            className={'swatch' + (value.toLowerCase() === c ? ' active' : '')}
            style={{ background: c }}
            title={c}
            aria-label={`Set ${label} to ${c}`}
            onClick={() => onChange(c)}
          />
        ))}
        <input
          id={id}
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          className="hexin"
          aria-label={`${label} hex value`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {label} <em>{value}px</em>
      </label>
      <input id={id} type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="togglerow">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

// Load any Google Fonts family by name, e.g. "Rubik Mono One".
function CustomFontInput({ onApply }: { onApply: (family: string) => void }) {
  const id = useId();
  const errorId = useId();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'failed'>('idle');

  const apply = async () => {
    const family = name.trim();
    if (!family) return;
    setStatus('loading');
    const ok = await ensureFontLoaded(family);
    if (ok) {
      onApply(family);
      setStatus('idle');
      setName('');
    } else {
      setStatus('failed');
    }
  };

  return (
    <div className="field">
      <label htmlFor={id}>Any Google Font</label>
      <div className="btnrow" style={{ marginTop: 0 }}>
        <input
          id={id}
          type="text"
          placeholder="e.g. Rubik Mono One"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setStatus('idle');
          }}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
          style={{ flex: 1, minWidth: 0 }}
          aria-invalid={status === 'failed'}
          aria-describedby={status === 'failed' ? errorId : undefined}
        />
        <button
          className="btn"
          style={{ flex: 'none' }}
          onClick={apply}
          disabled={status === 'loading'}
          aria-busy={status === 'loading'}
          data-agent-target="load-custom-font"
        >
          {status === 'loading' ? '…' : 'Load'}
        </button>
      </div>
      {status === 'failed' && (
        <p className="hint" id={errorId} role="alert">
          Couldn't load that font — check the exact name on fonts.google.com.
        </p>
      )}
    </div>
  );
}

const CORNERS: { key: Corner; label: string }[] = [
  { key: 'top-left', label: 'TL' },
  { key: 'top-right', label: 'TR' },
  { key: 'bottom-left', label: 'BL' },
  { key: 'bottom-right', label: 'BR' },
];

export default function ControlPanel({
  config,
  content,
  format,
  presets,
  exporting,
  onConfig,
  onContent,
  onPresets,
  onHeroFile,
  onClearHero,
  onExport,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const heroZoomId = useId();
  const fontSelectId = useId();
  const wordmarkId = useId();
  const tintOpacityId = useId();
  const presetSelectId = useId();

  const set = (patch: Partial<TemplateConfig>) => onConfig({ ...config, ...patch });
  const setBand = (p: Partial<TemplateConfig['band']>) => set({ band: { ...config.band, ...p } });
  const setTitle = (p: Partial<TemplateConfig['title']>) => set({ title: { ...config.title, ...p } });
  const setCaption = (p: Partial<TemplateConfig['caption']>) => set({ caption: { ...config.caption, ...p } });
  const setLogo = (p: Partial<TemplateConfig['logo']>) => set({ logo: { ...config.logo, ...p } });
  const setHero = (p: Partial<TemplateConfig['hero']>) => set({ hero: { ...config.hero, ...p } });
  const framing = content.framing?.[format.id] ?? DEFAULT_FRAMING;
  const setFraming = (f: typeof framing) =>
    onContent({ ...content, framing: { ...content.framing, [format.id]: f } });

  const savePreset = () => {
    const name = window.prompt('Preset name:', 'My preset');
    if (!name) return;
    onPresets([...presets.filter((p) => p.name !== name), { name, config }]);
  };

  return (
    <aside className="panel">
      {/* ---------- per-video content ---------- */}
      <p className="panelhead">This thumbnail</p>
      <div className="field">
        <label htmlFor="titleIn">Film title</label>
        <input
          id="titleIn"
          type="text"
          value={content.title}
          onChange={(e) =>
            onContent({ ...content, title: config.title.uppercase ? e.target.value.toUpperCase() : e.target.value })
          }
        />
      </div>
      <div className="field">
        <label htmlFor="metaIn">Caption / right line</label>
        <textarea
          id="metaIn"
          rows={2}
          value={content.caption}
          onChange={(e) => onContent({ ...content, caption: e.target.value })}
        />
        <p className="hint" style={{ margin: '6px 0 0' }}>Press Enter for a second line.</p>
      </div>

      <button className="btn amber" onClick={() => fileRef.current?.click()} data-agent-target="upload-hero-still">
        ⬆&nbsp; Upload hero still
      </button>
      <div className="btnrow">
        <button className="btn" onClick={() => fileRef.current?.click()} data-agent-target="replace-hero-still">
          Replace
        </button>
        <button className="btn" onClick={onClearHero} data-agent-target="clear-hero-still">
          Clear
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Hero still file"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onHeroFile(f);
          e.target.value = '';
        }}
      />

      {content.heroImage && (
        <div style={{ marginTop: 14 }}>
          <div className="field">
            <label htmlFor={heroZoomId}>
              Hero zoom · {format.id === 'youtube' ? 'YouTube' : 'Instagram'} <em>{Math.round(framing.zoom * 100)}%</em>
            </label>
            <input
              id={heroZoomId}
              type="range"
              min={100}
              max={300}
              value={Math.round(framing.zoom * 100)}
              onChange={(e) => setFraming({ ...framing, zoom: Number(e.target.value) / 100 })}
            />
          </div>
          <button className="btn" onClick={() => setFraming({ ...DEFAULT_FRAMING })} data-agent-target="reset-hero-framing">
            Reset framing
          </button>
          <p className="hint" style={{ margin: '8px 0 0' }}>
            Drag the still on the canvas to choose the crop. Framing is saved separately per format.
          </p>
        </div>
      )}

      <div className="sep" />

      <button
        className="btn primary"
        onClick={onExport}
        disabled={exporting}
        aria-busy={exporting}
        data-agent-target="export-png"
      >
        {exporting ? 'Rendering…' : `⬇  Export PNG · ${format.width}×${format.height}`}
      </button>
      <p className="tip">
        <b>Per video:</b> swap the still, retype the title, export. Template settings below change <b>every</b>{' '}
        thumbnail.
      </p>

      <div className="sep" />

      {/* ---------- template settings ---------- */}
      <button
        className="btn"
        onClick={() => setShowSettings(!showSettings)}
        aria-expanded={showSettings}
        data-agent-target="toggle-template-settings"
      >
        {showSettings ? '▾' : '▸'}&nbsp; Template settings
      </button>

      {showSettings && (
        <div className="settings">
          <p className="panelhead">Band</p>
          <ColorControl label="Band colour" value={config.band.color} onChange={(v) => setBand({ color: v })} />
          <Slider label="Band height" value={config.band.height} min={120} max={240} onChange={(v) => setBand({ height: v })} />
          <Toggle label="Band enabled" value={config.band.enabled} onChange={(v) => setBand({ enabled: v })} />
          <Toggle
            label="Band at top"
            value={config.band.edge === 'top'}
            onChange={(v) => setBand({ edge: v ? 'top' : 'bottom' })}
          />
          <Toggle
            label="Keyline (hairline above band)"
            value={config.band.topKeyline}
            onChange={(v) => setBand({ topKeyline: v })}
          />
          <p className="hint">The keyline is the subtle dark line separating the still from the band.</p>

          <p className="panelhead">Title</p>
          <div className="field">
            <label htmlFor={fontSelectId}>Font</label>
            <select
              id={fontSelectId}
              value={config.title.fontFamily}
              onChange={(e) => {
                const family = e.target.value;
                setTitle({ fontFamily: family });
                void ensureFontLoaded(family);
              }}
            >
              <optgroup label="Built in (work offline)">
                {BUNDLED_FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Google Fonts">
                {GOOGLE_FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
                {!BUNDLED_FONTS.includes(config.title.fontFamily) &&
                  !GOOGLE_FONTS.includes(config.title.fontFamily) && (
                    <option value={config.title.fontFamily}>{config.title.fontFamily}</option>
                  )}
              </optgroup>
            </select>
          </div>
          <CustomFontInput onApply={(family) => setTitle({ fontFamily: family })} />
          <Slider label="Max size" value={config.title.maxSize} min={72} max={140} onChange={(v) => setTitle({ maxSize: v })} />
          <ColorControl label="Title colour" value={config.title.color} onChange={(v) => setTitle({ color: v })} />
          <Toggle label="UPPERCASE" value={config.title.uppercase} onChange={(v) => setTitle({ uppercase: v })} />

          <p className="panelhead">Caption</p>
          <Toggle label="Show caption" value={config.caption.enabled} onChange={(v) => setCaption({ enabled: v })} />
          {config.caption.enabled && (
            <>
              <Slider
                label="Caption size"
                value={config.caption.fontSize}
                min={14}
                max={40}
                onChange={(v) => setCaption({ fontSize: v })}
              />
              <ColorControl label="Caption colour" value={config.caption.color} onChange={(v) => setCaption({ color: v })} />
            </>
          )}

          <p className="panelhead">Logo</p>
          <Toggle label="Show logo" value={config.logo.enabled} onChange={(v) => setLogo({ enabled: v })} />
          {config.logo.enabled && (
            <>
              <div className="field">
                <label id="logoCornerLabel">Corner</label>
                <div className="segmented" role="group" aria-labelledby="logoCornerLabel">
                  {CORNERS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      className={config.logo.corner === c.key ? 'active' : ''}
                      aria-pressed={config.logo.corner === c.key}
                      onClick={() => setLogo({ corner: c.key })}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <Slider
                label="Nudge horizontal"
                value={config.logo.offsetX}
                min={-40}
                max={400}
                onChange={(v) => setLogo({ offsetX: v })}
              />
              <Slider
                label="Nudge vertical"
                value={config.logo.offsetY}
                min={-40}
                max={400}
                onChange={(v) => setLogo({ offsetY: v })}
              />
              <p className="hint">Nudges move the logo inward from the chosen corner (negative = outward).</p>
              <div className="field">
                <label htmlFor={wordmarkId}>Wordmark</label>
                <input
                  id={wordmarkId}
                  type="text"
                  value={config.logo.wordmark}
                  onChange={(e) => setLogo({ wordmark: e.target.value })}
                />
              </div>
              <Slider
                label="Wordmark size"
                value={config.logo.wordmarkSize}
                min={18}
                max={64}
                onChange={(v) => setLogo({ wordmarkSize: v })}
              />
              <ColorControl label="Logo colour" value={config.logo.color} onChange={(v) => setLogo({ color: v })} />
              <Toggle label="Scrim behind logo" value={config.logo.scrim} onChange={(v) => setLogo({ scrim: v })} />
              <div className="btnrow">
                <button className="btn" onClick={() => logoFileRef.current?.click()} data-agent-target="upload-logo-image">
                  {config.logo.image ? 'Replace logo image' : 'Upload logo image'}
                </button>
                {config.logo.image && (
                  <button className="btn" onClick={() => setLogo({ image: null })} data-agent-target="reset-logo-image">
                    Default mark
                  </button>
                )}
              </div>
              {config.logo.image && (
                <Slider
                  label="Logo height"
                  value={config.logo.imageHeight}
                  min={24}
                  max={160}
                  onChange={(v) => setLogo({ imageHeight: v })}
                />
              )}
              <input
                ref={logoFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-label="Logo image file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = (ev) => setLogo({ image: ev.target?.result as string });
                    r.readAsDataURL(f);
                  }
                  e.target.value = '';
                }}
              />
            </>
          )}

          <p className="panelhead">Hero</p>
          <Toggle
            label="Tint overlay"
            value={config.hero.tint !== null}
            onChange={(v) => setHero(v ? { tint: config.band.color, tintOpacity: 0.2 } : { tint: null, tintOpacity: 0 })}
          />
          {config.hero.tint !== null && (
            <>
              <ColorControl label="Tint colour" value={config.hero.tint} onChange={(v) => setHero({ tint: v })} />
              <div className="field">
                <label htmlFor={tintOpacityId}>
                  Tint opacity <em>{Math.round(config.hero.tintOpacity * 100)}%</em>
                </label>
                <input
                  id={tintOpacityId}
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(config.hero.tintOpacity * 100)}
                  onChange={(e) => setHero({ tintOpacity: Number(e.target.value) / 100 })}
                />
              </div>
            </>
          )}

          <p className="panelhead">Presets</p>
          {presets.length > 0 && (
            <div className="field">
              <label htmlFor={presetSelectId}>Load preset</label>
              <select
                id={presetSelectId}
                value=""
                onChange={(e) => {
                  const p = presets.find((x) => x.name === e.target.value);
                  if (p) onConfig(mergeConfig(p.config));
                }}
              >
                <option value="" disabled>
                  Choose…
                </option>
                {presets.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="btnrow">
            <button className="btn" onClick={savePreset} data-agent-target="save-preset">
              Save preset
            </button>
            <button className="btn" onClick={() => onConfig(DEFAULT_CONFIG)} data-agent-target="reset-template">
              Reset to A
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
