# MVP Spec — "Plop & Export"

The first executable for the **HoTT Diagram Editor**. Deliberately tiny: it exists to stand up
the build system and a window, and to **prove the two libraries that carry real risk** —
MathJax (LaTeX math → SVG paths) and SVG serialization (clean vector export). Everything else is deferred.

Parent effort: [./map.md](./map.md) · Decisions: [01](./issues/01-rendering-layer.md) ·
[02](./issues/02-mvp-stack.md) · [03](./issues/03-mvp-scope.md) ·
[06 build tooling](./issues/06-build-tooling.md).

## Stack

- **Language:** TypeScript — pure ESM, `moduleResolution: bundler`, `verbatimModuleSyntax`,
  max-strict tsconfig. `tsc` type-checks only (`--noEmit`); Vite transpiles.
- **Package manager / toolchain:** **pnpm**, pinned with **mise** (`mise.toml`).
- **Build / dev server:** Vite
- **Rendering:** SVG in the DOM (no canvas, no UI framework)
- **Math:** MathJax (SVG output, `fontCache: 'none'`) — LaTeX in, glyph `<path>`s out
- **Lint / format / test / hooks:** oxlint · Prettier · Vitest · Lefthook.
- **Run:** `pnpm dev` → a browser tab (the "window"); `pnpm build` (= `tsc --noEmit &&
  vite build`) → static bundle.
- **Full config:** [ticket 06 — build system & tooling](./issues/06-build-tooling.md) holds the
  exact `mise.toml`, `package.json`, `tsconfig.json`, `vite.config.ts`, `.oxlintrc.json`,
  `.prettierrc.json`, `lefthook.yml`, and source layout — turnkey.
- **Location:** the code project lives one directory up (`../`, the `diagrams` repo), per
  `AGENTS.md`. This spec and the map stay here in `agents-working-files`.

## Functionality

1. **A canvas.** A full-viewport `<svg>` element fills the window.
2. **Plop dots.** Clicking empty canvas places a term-dot — an SVG `<circle>` — at the click
   point. Dots accumulate.
3. **A math label.** A text input takes LaTeX source (e.g. `\Sigma_{(x:A)} P(x)`). On submit,
   MathJax typesets it to SVG `<path>`s, dropped onto the canvas as a `<g>`. This proves math
   renders *into* the SVG we will export — as real geometry, no `<foreignObject>`.
4. **Export SVG.** A button serializes the canvas `<svg>` — including the MathJax path output — to a
   standalone, valid `.svg` file and triggers a download.

## Acceptance

- `pnpm dev` opens a window with a visible SVG canvas.
- Clicking places dots that persist on screen.
- A typed LaTeX string appears typeset on the canvas.
- Export produces a `.svg` file that, opened standalone (browser / Inkscape), renders the
  dots **and** the typeset label as vector graphics.
- `pnpm build` succeeds (type-check + bundle), and `pnpm lint` is clean.

## Explicit non-goals (later sessions)

Arrows & role-colors · selection / move / drag · undo/redo · the theorem-highlight ·
saving/loading diagrams · any UI framework · Tauri desktop packaging.

## Math → paths (settled)

MathJax's **SVG output** (`fontCache: 'none'`) renders each glyph as an inline `<path>`, so a
label goes onto the canvas as real geometry — **never `<foreignObject>`**. That makes the
exported `.svg` truly standalone (identical in a browser, Inkscape, or a PDF converter) and
retires the one pipeline risk KaTeX would have carried.
