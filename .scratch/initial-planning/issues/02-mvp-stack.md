# MVP stack: build tool, math, framework

Type: grilling
Status: resolved

## Question

Given TS + SVG, what specific libraries and build tooling does the MVP use?

## Answer

- **Build / dev server:** **Vite** — `npm run dev` for a live window, `npm run build` for a
  static bundle. Minimal config.
- **Math typesetting:** **KaTeX** — renders LaTeX-quality labels; the risky lib worth proving
  in the MVP.
- **UI framework:** **none yet** — plain TypeScript + direct SVG DOM. A lean reactive
  framework (Solid or Svelte) is deferred until toolbars / property panels / undo actually
  demand it (tracked as fog on the map).
- **Backend:** none — fully client-side; SVG export happens in-browser.
