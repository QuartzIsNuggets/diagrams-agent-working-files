# MVP stack: build tool, math, framework

Type: grilling
Status: resolved

## Question

Given TS + SVG, what specific libraries and build tooling does the MVP use?

## Answer

- **Build / dev server:** **Vite** — `npm run dev` for a live window, `npm run build` for a
  static bundle. Minimal config.
- **Math typesetting:** **MathJax** (SVG output, `fontCache: 'none'`) — takes LaTeX, emits
  glyph `<path>`s that embed directly in the canvas SVG (no `<foreignObject>`). Chosen over
  KaTeX, which only emits HTML/CSS; paths are what make the export standalone. The risky lib
  worth proving in the MVP.
- **UI framework:** **none yet** — plain TypeScript + direct SVG DOM. A lean reactive
  framework (Solid or Svelte) is deferred until toolbars / property panels / undo actually
  demand it (tracked as fog on the map).
- **Backend:** none — fully client-side; SVG export happens in-browser.
