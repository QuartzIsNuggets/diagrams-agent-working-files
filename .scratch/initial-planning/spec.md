# MVP Spec — "Plop & Export"

The first executable for the **HoTT Diagram Editor**. Deliberately tiny: it exists to stand up
the build system and a window, and to **prove the two libraries that carry real risk** —
KaTeX (math into SVG) and SVG serialization (clean vector export). Everything else is deferred.

Parent effort: [./map.md](./map.md) · Decisions: [01](./issues/01-rendering-layer.md) ·
[02](./issues/02-mvp-stack.md) · [03](./issues/03-mvp-scope.md) ·
[06 build tooling](./issues/06-build-tooling.md).

## Stack

- **Language:** TypeScript — pure ESM, `moduleResolution: bundler`, `verbatimModuleSyntax`,
  max-strict tsconfig. `tsc` type-checks only (`--noEmit`); Vite transpiles.
- **Package manager / toolchain:** **pnpm**, pinned with **mise** (`mise.toml`).
- **Build / dev server:** Vite
- **Rendering:** SVG in the DOM (no canvas, no UI framework)
- **Math:** KaTeX
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
   KaTeX typesets it and the result is placed on the canvas. This proves math renders *into*
   the SVG we will export.
4. **Export SVG.** A button serializes the canvas `<svg>` — including the KaTeX output — to a
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

## Known build-time detail to settle during implementation

KaTeX renders to HTML(+MathML) by default. To live *inside* exported SVG it must be embedded
via `<foreignObject>` (simplest) or rendered to SVG paths. Pick during the build — it's an
implementation detail, not a design decision, and it is the one thing worth verifying early
because it's the crux of "does the whole pipeline hold together."
