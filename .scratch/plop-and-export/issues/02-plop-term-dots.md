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
- **Only bare canvas plops: `event.target !== canvas` returns early** — without the guard a
  release over a typeset label would plop a dot straight through the glyph paths. Since the
  overlap check landed (see the fix below) this guard no longer carries the dot-on-dot case on
  its own; labels are what keep it. It is also the seam where selection eventually branches
  instead of returning.
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
- **~~`click`, not `pointerdown`~~ — superseded, see "Fix: dots could be dropped on top of each
  other" below.** The original reasoning still holds in spirit (plopping follows a completed
  gesture, not a stray press); `click` was the wrong event to express it with.

## Fix: dots could be dropped on top of each other (2026-07-29)

**Symptom.** Press the left button on empty canvas, drag onto an existing dot, release there — a
second dot was plopped overlapping the first, violating the non-overlap constraint the
`event.target` guard was supposed to uphold.

**Cause.** Plopping listened for `click`, and the DOM fires `click` on the nearest common
ancestor of the press and release targets. Press on canvas + release on a dot means that ancestor
is the canvas itself, so `event.target === canvas` passed the guard while `clientX`/`clientY`
pointed at the dot. The guard was reading the *gesture's* target, never the *release point's*.

**Decision — dots are placed at release, not at press.** A press is now provisional: drag before
letting go and the dot follows the pointer to wherever it is dropped. The alternative (place on
`pointerdown`, so the dot appears under the finger immediately) was rejected — release-time
placement is what makes "look where it will actually land, then decide" possible, and it is the
only option under which the drag-onto-a-dot gesture has a correct answer. A consequence worth
knowing: a press that *starts* on a dot and is released on bare canvas does plop, because only
the release point is consulted. That is release semantics working as chosen, not a leak.

- **`pointerup` with `event.button !== 0` returning early** — `pointerup` targets the element
  actually under the pointer at release, which is precisely the check the bug needed. Pointer
  events also cover pen and touch, and the button guard keeps a right-click release inert the way
  `click` used to for free. No pointer capture is set, so the target is a live hit-test.
- **A real geometric overlap check, not just DOM hit-testing** — `event.target` only rejects
  releases *inside* an existing circle. A release 7 units from a dot's centre is on bare canvas
  yet still produces two intersecting circles, so the target guard alone never actually enforced
  the stated constraint. `overlapsPlacedDot` compares centre distance against `2 * DOT_RADIUS`:
  touching rims are allowed, anything tighter is refused. It is also the only form of the check
  jsdom can exercise, since jsdom has no hit-testing at all.
- **Placed dots are read back out of the DOM (`circle.term-dot`)** — consistent with the slice's
  premise that the live tree is the model; no parallel array to keep in sync. This is a linear
  scan per release, which is nothing at diagram scale; a spatial index is the answer if dot
  counts ever reach the thousands.
- **`2 * DOT_RADIUS` with strict `<`** — tangency is not overlap, so dots may touch. Change to
  `<=` plus a gap constant if the diagram ever wants breathing room between terms.

Verified by `src/canvas.test.ts` (17 tests, jsdom), including the reported gesture replayed as
`pointerdown` on the canvas followed by `pointerup` on the dot. Every guard was mutation-checked:
dropping the button check, the target check, or the overlap check, halving the overlap distance,
and moving placement back to `pointerdown` each turn the suite red. `pnpm build`/`lint`/
`format:check`/`reuse lint` clean.
