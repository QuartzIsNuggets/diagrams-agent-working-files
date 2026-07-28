# 02 — Plop term-dots

**What to build:** Clicking anywhere on empty canvas places a **term-dot** — an SVG `<circle>` —
at the click point. Dots accumulate: each click adds another, and every dot placed so far stays
visible on screen. No selection, moving, or removal — just plop-and-persist.

**Blocked by:** 01 — Scaffold build system + blank SVG canvas.

**Status:** resolved — implemented on branch `session-00` (2026-07-28).

- [x] Clicking empty canvas places a `<circle>` centred at the click point
- [x] Multiple clicks accumulate multiple dots; earlier dots persist
- [x] Dots survive as real SVG children of the canvas (present in the DOM, not redrawn imperatively each frame)

All three verified by `src/canvas.test.ts` (7 tests, jsdom) driving real dispatched `click`
events through the public API, plus `pnpm build`/`lint`/`format:check`/`reuse lint` clean. As in
ticket 01, no on-screen pixel check — there is still no headless browser here, so the canvas has
been verified structurally and in the built bundle (the click wiring is present in
`dist/assets/index-*.js`) rather than visually.

## Choices

- **jsdom as the Vitest environment** — ticket 06 picked Vitest but named no DOM environment, and
  the canvas is DOM all the way down, so there was nothing to test against. Added `jsdom` as a
  devDependency and `test: { environment: "jsdom" }` to `vite.config.ts`, which also moved the
  config import to `vitest/config`. **This makes ticket 06's verbatim `vite.config.ts` stale** —
  amend it there if that file is still meant to be the config of record. Swap to `happy-dom` for
  speed if suite time ever matters; neither implements SVG geometry, so a test needing real
  layout wants Vitest browser mode instead.
- **Tests stub `getBoundingClientRect()` rather than trusting jsdom's zero rect** — jsdom has no
  layout, so an all-zero rect makes `clientX - left` an identity and the coordinate mapping would
  be asserted vacuously. One case pins the canvas at a non-zero viewport offset; both it and the
  empty-canvas guard were mutation-checked (each fails when its production line is removed).
- **Plopping is opt-in via `enablePlopping(canvas)`, not baked into `createCanvas()`** — keeps the
  factory pure so ticket 04 can serialize an inert canvas, and keeps construction separate from
  behaviour. Collapse the two if `main.ts` is the only caller that ever wires them.
- **Click point derived from `getBoundingClientRect()`, not `getScreenCTM()`** — the canvas has no
  `viewBox`, border, padding or transform, so one user unit is one CSS pixel and the SVG viewport
  origin *is* the border-box origin the rect reports — subtracting it is exact today, and unlike
  `getScreenCTM` it is stubbable under jsdom. It only handles translation: the moment a `viewBox`
  or a pan/zoom transform lands, scale is missed silently and this must become
  `point.matrixTransform(canvas.getScreenCTM().inverse())`.
- **Only bare canvas plops: `event.target !== canvas` returns early** — `click` bubbles, so
  without the guard a click on an existing dot stacks another on top, and at ticket 03 a click on
  a typeset label would plop a dot straight through the glyph paths. The guard tracks the
  criterion's wording ("clicking **empty** canvas"). It is also the seam where selection
  eventually branches instead of returning.
- **Dot fill is a presentation attribute (`fill`), not a CSS rule on `.term-dot`** — page CSS does
  not travel with a serialized `<svg>`, and ticket 04 needs the download to be self-contained.
  The class stays as a query hook only. Any later dot styling belongs on the element too.
- **`DOT_RADIUS = 5` / `DOT_FILL = "#111111"` as module constants** — the ticket specifies no dot
  appearance, so these are placeholder aesthetics named rather than inlined; the fill is set
  explicitly even though SVG already defaults to black, so export fidelity does not rest on a
  default. Promote to a shared token module when a second shape needs the same palette.
- **Dots are appended to the `<svg>` root, not to a dedicated `<g>` layer** — nothing yet needs
  z-ordering or "which children are dots", and ticket 04 serializes the whole tree either way.
  Introduce layer `<g>`s when labels (03) and dots need independent stacking or selection.
- **`click`, not `pointerdown`** — plopping should follow a completed click, so a drag released
  over the canvas is one deliberate plop rather than a stray press. Move to pointer events when
  dragging a dot becomes a gesture that must be distinguished from placing one.
