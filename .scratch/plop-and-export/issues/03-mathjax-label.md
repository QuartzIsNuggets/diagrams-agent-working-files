# 03 — MathJax LaTeX label → canvas

**What to build:** A text input takes LaTeX source (e.g. `\Sigma_{(x:A)} P(x)`). On submit,
MathJax typesets it and the result is dropped onto the canvas as a `<g>` of glyph `<path>`s —
**real geometry, never `<foreignObject>`**. Typing a LaTeX string and submitting makes it appear
typeset on the canvas.

This is the risk-proving slice for the math pipeline: it proves LaTeX renders *into* the same SVG
we will later export, as vector paths. Settled technical constraints (see planning ticket
[06](../../initial-planning/issues/06-build-tooling.md) and
[research/mathjax-v4-svg-font.md](../../initial-planning/research/mathjax-v4-svg-font.md)):

- **MathJax v4** (`@mathjax/src`) with **SVG output** and **`fontCache: 'none'`** so every glyph
  is an inline `<path>` (no shared `<defs>`/`<use>` cache that would break a standalone export).
- Default font is New Computer Modern (modern-LaTeX look), pulled in automatically.
- MathJax v4 loads its font/output jax **asynchronously** — the typeset call must await readiness
  before extracting the `<svg>`.

**Blocked by:** 01 — Scaffold build system + blank SVG canvas.

**Status:** resolved — implemented on branch `session-00` (2026-07-28).

- [x] A visible text input accepts a LaTeX string and has a submit affordance
- [x] On submit, MathJax typesets the input to SVG and its `<path>` output is appended to the canvas as a `<g>`
- [x] The rendered label is glyph `<path>`s — no `<foreignObject>`, no HTML/MathML leaked into the canvas
- [x] `fontCache: 'none'` is set, so glyph geometry is self-contained (verified in the DOM output)
- [x] Async MathJax initialisation is awaited so the first submit renders reliably

All five verified by `src/mathjax-label.test.ts` and `src/label-form.test.ts` (25 tests, jsdom)
driving the real MathJax pipeline through the form's submit button; every assertion was
mutation-checked (each fails when its production line is removed).
`pnpm build`/`lint`/`format:check`/`reuse lint` clean, 32 tests green.

Unlike tickets 01 and 02, this one **was** checked visually: the placed labels were serialized to
a standalone `.svg` and rasterized with `rsvg-convert` (no page CSS, no browser), which rendered
`\Sigma_{(x:A)} P(x)`, `\frac{a}{b} = \sqrt{c^2+d^2}`, `\int_0^\infty e^{-x^2}\,dx`,
`f : \mathbb{N} \to \mathbb{R}`, `\mathfrak{g} \cong \mathsf{Set}`, `\mathtt{code}` and
`\text{café naïve}` correctly typeset in New Computer Modern, on the right baselines, stacked
clear of each other. That also pre-verifies ticket 04's self-containment claim. There is still no
headless browser, so click plopping and the form's on-screen layout remain structurally verified
only.

Criterion 3 is checked against every way non-geometry could reach the canvas, not just
`<foreignObject>`: a placed label's leaf nodes must all be `<path>`, and both a TeX error and a
`<text>` fallback are refused. Nothing but glyph outlines can be placed.

## Choices

- **Browser adaptor, not the research note's `liteAdaptor`** — MathJax builds straight into the
  live document, so the glyph `<g>` is already a namespaced SVG node ready to append; the
  `liteAdaptor` recipe would mean serializing to a string and reparsing it. `liteAdaptor` is the
  server-side path and is what to switch to if typesetting ever moves off the main document
  (worker, SSR, build step).
- **MathJax is `import()`ed dynamically, memoized in a module-level promise, and prewarmed once
  the page is idle** — it is ~1.1 MB of output jax and font data, so keeping it out of the entry
  chunk is what gets the canvas on screen, while prewarming keeps the user from paying for it at
  the moment they ask for a label. `prewarmTypesetting()` fires from `main.ts` after the canvas
  and bar are appended, behind `requestIdleCallback` (2 s timeout) so it competes with neither the
  first paint nor anything the user does next, falling back to a macrotask where that API is
  missing. It resolves rather than reports: nothing is waiting on it, and a real submit retries.
  Collapse to static imports only if the entry chunk stops mattering.
- **A failed boot is un-memoized so the next label retries** — prewarming moves the first load to
  page-open, where being briefly offline is far likelier, and a rejected promise left in the memo
  would fail *every* label from then on with a stale error. The `.catch` clears the memo and
  rethrows, so the failure still reaches whoever is waiting. It has no natural seam to test
  through, hence the one heavy test in the suite: `browserAdaptor` mocked to throw once against a
  `vi.resetModules()` copy of the module.
- **Glyph ranges are loaded through the bundler, via `import.meta.glob`** — New Computer Modern
  keeps ~40 ranges out of its main entry (the `\mathbb`, `\mathfrak`, `\mathsf` and `\mathtt`
  alphabets, accented Latin, every non-Latin script) and asks `mathjax.asyncLoad` for one when a
  glyph needs it. MathJax's own loader builds that URL at runtime from `import.meta.url`, which
  Rollup cannot follow, so the files would never be emitted; `src/font-ranges.ts` states the set
  statically instead and registers `loadFontRange` in its place, matching by bare file name since
  MathJax asks under the package's `js/` alias and the files ship from `mjs/`. This is why
  `@mathjax/mathjax-newcm-font` is a **direct** dependency — under pnpm's strict layout the deep
  path is otherwise unresolvable — and why `src/vite-env.d.ts` exists. Swap the glob for an
  explicit map if some ranges must stop shipping.
- **MathJax is excluded from Vite's dev pre-bundling** — the glyph ranges register themselves by
  calling `dynamicSetup` on the font class, so the ranges and the output jax have to be the *same*
  module instance. Dev pre-bundling breaks that: it rewrites `@mathjax/src` into `.vite/deps` while
  the glob keeps serving ranges raw from `node_modules`, giving two `MathJaxNewcmFont` classes, and
  glyphs register on the one the renderer never consults. `optimizeDeps.exclude` for both packages
  keeps dev on one raw ESM graph, which is what the production build (a single Rollup graph) does
  anyway. **Removing it breaks on-demand ranges in dev only** — the build stays correct, so the
  tests and `pnpm build` will not catch it.
- **A dev-only plugin strips the font's source-map links** — the font ships `.js.map` files naming
  TypeScript it does not publish, so serving it raw logs "points to missing source files" for every
  module, in both the terminal and the browser console. The plugin has to do this in `load`, since
  Vite reads the link before `transform` runs; that needs `readFile`, hence `@types/node`. Drop the
  whole plugin if the package ever ships its sources.
- **Ranges stay lazy — no `loadDynamicFiles()` at boot or prewarm** — each is its own chunk (~10 MB
  of JS all told, largest ~1 MB), fetched only when a glyph calls for it, so ordinary maths costs
  the reader nothing; the entry chunk has zero static imports. The trade is a 25 MB `dist/` with
  source maps on. Preload eagerly only if a first-use pause on `\mathbb{R}` outweighs it.
- **A label with no outline for some glyph is refused, not drawn** — MathJax renders one it cannot
  outline as `<text>` in the machine's serif font: right on screen, and a font *reference* in an
  exported file, so it renders as something else or nothing at all elsewhere. `glyphsOf` rejects
  any output containing `<text>`, which is the only way that difference is ever noticed; it catches
  what no range supplies (CJK, emoji). `explainMissingRange` restates MathJax's internal
  `dynamic file '…' failed to load` for the case where a range chunk does not arrive — **the one
  untested branch in this module**, since with the ranges bundled there is no seam to simulate it.
- **Invalid LaTeX is refused, not typeset** — a TeX error does not throw: MathJax renders the
  message as an `merror` box whose `<rect>`/`<text>` are sized by a browser text measurement, so
  it reaches the canvas as `<text>` in a system font with `width="NaN"` — non-geometry against
  criterion 3, invalid SVG, and unremovable while there is no delete. `glyphsOf` raises anything
  carrying `data-mjx-error` instead. Relax this only if labels become editable in place.
- **A refused label reports in the form and keeps its source** — refusing without saying so would
  make a typo look like a dead button, and clearing the input would destroy the text to fix. The
  input is therefore cleared on success rather than on submit, and only when it still holds what
  was submitted; the message is cleared by whichever placement finishes last, not on submit, or a
  failure still in flight would overwrite a later success. Fold into a general notification
  surface once anything else needs to report.
- **`display: true`, and the TeX input fixed to `["base", "ams"]`** — display style is the one that
  matches diagrams-as-figures (full-size operators, limits above and below), and base+AMS is the
  set the research note's snippet uses. Neither was specified. Add packages (`newcommand`,
  `color`, …) as the notation demands; switch to inline style if labels start sitting in running
  text rather than standing alone.
- **`typesetLatex` returns the label unpositioned and the placer supplies the transform** — one
  `transform` attribute has to carry both the scale and the position, so producing a half-applied
  transform and composing later would only fight itself. The `<g>` comes back in MathJax's font
  units with its origin at the left baseline point, which is the one anchor the output defines
  exactly. Give it a `transform` of its own only if labels ever need nesting.
- **`UNITS_PER_EM = 1000` named rather than derived** — MathJax's SVG `viewBox` is in thousandths
  of an em (`output/svg.js`: `const px = this.math.metrics.em / 1000`). The alternative, deriving
  the scale from the container `<svg>`'s `width`-in-ex against the viewBox width, needs the font's
  x-height ratio and buys nothing while the constant holds. Revisit only if MathJax changes it.
- **Labels stack down a fixed left margin; the row is counted off the canvas** — the ticket says
  nothing about placement, and a single fixed drop point would pile every submit on one spot.
  Counting `g.math-label` children rather than keeping a counter holds ticket 02's line that the
  live tree *is* the document. `LABEL_EM = 24` with a 56-unit line height is placeholder sizing,
  named rather than inlined the way ticket 02 named `DOT_RADIUS`. This is placeholder layout:
  replace it wholesale when labels are placed by pointer or anchored to a term-dot.
- **Placements are serialized through a promise chain per form** — the row is read after an
  `await`, so two submits in flight would both claim the same row and overlap. The chain also
  keeps labels in submission order, and a `.catch` per link stops one failure silencing every
  later submit. Drop the chain once placement no longer depends on what is already on the canvas.
- **The form is built in TypeScript and styled from `index.html`** — mirrors ticket 02's
  `createCanvas`/`enablePlopping` split of factory from behaviour, and keeps the input under test
  rather than as untested markup. Page CSS is safe here precisely because the form is chrome, not
  canvas content, so it never enters the export.
