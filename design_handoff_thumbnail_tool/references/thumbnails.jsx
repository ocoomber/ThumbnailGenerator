// thumbnails.jsx — SGP YouTube thumbnail directions.
// Every thumbnail renders at a true 1280×720 base; <Scale w=…> shrinks it
// uniformly so the same component serves both the big preview and the
// channel-grid coherence strip. Brand tokens live in CSS vars in the host file.

// --- Goose-in-flight chevron mark (simple, single stroke) ---
function Goose({ stroke = "var(--ink)", w = 1 }) {
  return (
    <svg className="sgp-goose" viewBox="0 0 100 46" style={{ width: 100 * w, height: 46 * w }} aria-hidden="true">
      <path d="M4 40 Q30 8 50 26 Q70 8 96 40" fill="none" stroke={stroke}
        strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// --- Wordmark lockups ---
function Wordmark({ tone = "ink", size = 1, stacked = false }) {
  const c = tone === "ink" ? "var(--ink)" : tone === "cream" ? "var(--cream)" : "var(--amber)";
  if (stacked) {
    return (
      <div className="sgp-mark sgp-mark--stacked" style={{ "--mk": c, fontSize: 100 * size }}>
        <Goose stroke={c} w={0.42 * size} />
        <div className="sgp-mark__name">STRANGE GOOSE</div>
        <div className="sgp-mark__sub">PRODUCTIONS · EDINBURGH</div>
      </div>
    );
  }
  return (
    <div className="sgp-mark sgp-mark--row" style={{ "--mk": c, fontSize: 100 * size }}>
      <Goose stroke={c} w={0.34 * size} />
      <div className="sgp-mark__name">STRANGE&nbsp;GOOSE</div>
    </div>
  );
}

// --- Hero still placeholder (drop-in zone for each film's frame) ---
function Hero({ label = "FILM STILL", tint = "warm", className = "" }) {
  return (
    <div className={`sgp-hero sgp-hero--${tint} ${className}`}>
      <div className="sgp-hero__grain" />
      <div className="sgp-hero__tag">
        <span className="sgp-hero__dot" />
        {label} · 16:9 — drop hero here
      </div>
    </div>
  );
}

// --- Uniform downscaler: base is always 1280×720 ---
function Scale({ w = 512, children }) {
  const s = w / 1280;
  return (
    <div className="sgp-scale" style={{ width: w, height: 720 * s }}>
      <div className="sgp-scale__inner" style={{ transform: `scale(${s})` }}>{children}</div>
    </div>
  );
}

/* ============================ DIRECTIONS ============================ */

// A — Lower amber band. Hero full-frame, solid amber plate carries the title.
function ThumbA({ title = "THE HAAR", still = "harbour at dawn", year = "2026" }) {
  return (
    <div className="thumb dir-a">
      <Hero label={still} tint="cool" />
      <div className="a-corner"><Goose stroke="var(--cream)" w={0.3} /><span>SGP</span></div>
      <div className="a-band">
        <div className="a-band__title">{title}</div>
        <div className="a-band__meta">STRANGE GOOSE · {year}</div>
      </div>
    </div>
  );
}

// B — Left cream sidebar. Editorial split, title stacked in the panel.
function ThumbB({ title = "SALT LINES", still = "trawler deck, grey sea", kicker = "A FILM BY SGP" }) {
  return (
    <div className="thumb dir-b">
      <div className="b-panel">
        <div className="b-kicker">{kicker}</div>
        <div className="b-title">{title}</div>
        <div className="b-foot"><Wordmark tone="ink" size={0.62} /></div>
      </div>
      <div className="b-stage"><Hero label={still} tint="warm" /></div>
    </div>
  );
}

// C — Inset print frame. Hero floated inside a cream margin, amber keyline.
function ThumbC({ title = "NORTHERLY", still = "lighthouse, long lens", idx = "NO. 04" }) {
  return (
    <div className="thumb dir-c">
      <div className="c-tab">{idx}</div>
      <div className="c-frame"><Hero label={still} tint="cool" /></div>
      <div className="c-foot">
        <Goose stroke="var(--ink)" w={0.26} />
        <div className="c-title">{title}</div>
        <div className="c-org">STRANGE&nbsp;GOOSE&nbsp;PRODUCTIONS</div>
      </div>
    </div>
  );
}

// D — Full bleed + cinematic scrim. Oversized title bottom-left.
function ThumbD({ title = "THE QUIET TRADE", still = "tenement stair, night" }) {
  return (
    <div className="thumb dir-d">
      <Hero label={still} tint="dark" />
      <div className="d-scrim" />
      <div className="d-top"><Goose stroke="var(--cream)" w={0.26} /><span>STRANGE&nbsp;GOOSE</span></div>
      <div className="d-title">{title}</div>
      <div className="d-rule" />
    </div>
  );
}

// E — Masthead bar. Amber top bar as a series header, title on an ink chip.
function ThumbE({ title = "CLOSE SEASON", still = "moorland, low cloud", ep = "SGP FILMS" }) {
  return (
    <div className="thumb dir-e">
      <div className="e-bar">
        <Wordmark tone="ink" size={0.5} />
        <div className="e-bar__r">{ep} · EST. EDINBURGH</div>
      </div>
      <div className="e-stage">
        <Hero label={still} tint="warm" />
        <div className="e-chip">{title}</div>
      </div>
    </div>
  );
}

// F — Corner slate card. Handmade luggage-tag lockup over a full-bleed still.
function ThumbF({ title = "FERRYMAN'S REST", still = "ferry wake, dusk" }) {
  return (
    <div className="thumb dir-f">
      <Hero label={still} tint="dark" />
      <div className="f-vig" />
      <div className="f-card">
        <div className="f-card__head"><Goose stroke="var(--amber)" w={0.28} /><span>STRANGE GOOSE</span></div>
        <div className="f-title">{title}</div>
        <div className="f-card__foot">PRODUCTIONS · PROPER FILM. BUILT DIFFERENTLY.</div>
        <div className="f-punch" />
      </div>
    </div>
  );
}

Object.assign(window, { Goose, Wordmark, Hero, Scale, ThumbA, ThumbB, ThumbC, ThumbD, ThumbE, ThumbF });
