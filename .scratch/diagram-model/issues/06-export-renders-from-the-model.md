# 06 — The export renders from the model

**What to build:** An [export](../../../CONTEXT.md#export) stops being a copy of the screen and
becomes a drawing of the diagram. The SVG [render backend](../../../CONTEXT.md#render-backend) draws
into a document of its own and frames it from the diagram's extent, so the file holds the drawing
rather than the window that happened to be showing it.

Today the export clones the live canvas and takes its width, height and `viewBox` from the browser's
layout. Three things follow from that, and all three go here: the same diagram exports differently
at two window sizes; an export can only be made from a rendered page, so no batch or headless caller
can make one; and the pixel measurement is the class of leak
[ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md) exists to keep out of the model.

It also opens the seam [ticket 07](../../initial-planning/issues/07-output-formats.md) has been
waiting for. Once emitting a file means *draw this diagram*, the TikZ emitter is another backend at
the same seam rather than a second path bolted beside the first.

What the export already promises does not change. It stays
[standalone](../../../CONTEXT.md#standalone) — glyph outlines rather than font references,
presentation attributes rather than page CSS, nothing pointing back at the document that produced
it — and it stays one-way. The [writer](../../../CONTEXT.md#writer) is untouched: this changes what
bytes it is handed, not what it promises about them.

The renderer check under `.scratch/plop-and-export/verification/` builds its canvas through
functions this effort has deleted, and is rewritten here — it is the only evidence that a real
renderer draws the file the way the screen does, and that claim now needs re-making against a file
the screen never drew.

**Blocked by:** [05](./05-term-dot-labels.md).

**Status:** resolved

- [x] Exporting draws the diagram rather than copying the canvas — no clone, and no reading of
      layout anywhere on the path
- [x] The file is framed from the diagram's own extent, so the same diagram exports identically
      whatever the window size
- [x] An export can be produced without a laid-out page
- [x] The file still stands alone: every glyph an outline, every mark carrying its own presentation,
      no reference to this page's stylesheet, fonts or defs
- [x] The writer is unchanged, and both [surfaces](../../../CONTEXT.md#surface) export as they did
- [x] The renderer check is rebuilt on the new path, and two independent renderers still draw the
      file as the screen draws it

Recorded in [`verification/export-fidelity.md`](../verification/export-fidelity.md): the app's own
export and a headless one, each opened by `rsvg-convert` and Inkscape, beside the screenshot of the
window the first was exported from. The web surface's hand-off was exercised in Firefox too.

## Choices

- **The frame is the union of what was drawn, not of the extents the model holds** — a term-dot's
  label stands off the dot and can reach past its box's walls, and only the backend that set the run
  knows how far, so a frame derived in the model would crop glyphs off. The backend collects each
  mark's extent as it draws it. Move it into the model if a label's size ever stops being the
  backend's.
- **A label contributes the extent the typesetter declares, not a bound on its outlines** — a tight
  bound needs path geometry no one can read without a page to measure on, and the declared extent is
  the one the run was *placed* by, so the frame and the placement agree by construction. The margin
  absorbs a flourish that overhangs it. Revisit only if a glyph is ever seen to touch an edge.
- **Each frame edge is rounded outward to a whole unit** — the exact union serializes as
  `10.79359999999997`, seventeen digits standing for a fifth of a unit, in a file a person may open.
  Outward is what makes rounding free: it only ever adds air. Drop the rounding if a diagram unit
  ever means something fine enough for a whole one to matter.
- **An export still needs a DOM, just not a rendered one** — the ticket wanted a batch caller, and
  this gets as far as jsdom rather than a bare Node process: the backend builds elements and
  `XMLSerializer` writes them, and the glyph runs MathJax hands back are DOM nodes anyway, so
  emitting markup as a string would still have to serialize those. Revisit when a real batch caller
  exists to say whether jsdom is a cost.
- **The export margin, and an empty diagram's frame, are the SVG backend's own** — 16 diagram units
  of air, and, with nothing drawn, that margin alone about the origin rather than a file of no size.
  Both are facts about an emitted file rather than about the drawing, so TikZ will answer them
  separately. Edit `EXPORT_MARGIN` in `render-svg.ts` to move them together.
- **The editor hands out a reader for the diagram it holds, and the export asks at every press** —
  a diagram is a value, so anything given one at wiring time would export the empty one forever.
  `Editor.diagramNow` is the one way out of the shell, and save joins it there rather than growing
  a second.
- **`render-svg.ts` is 8 lines over the length budget and was not split** — the natural cut is the
  gesture seam, and taking it would put the single y-up `FLIP` behind an import, which is the one
  thing that module exists to keep in one place. Split when it next grows, moving `FLIP` with the
  drawing.
- **Ticket 04's verification directory is retired in place, not deleted** — its harness could no
  longer compile and is gone, but the dated result and the artifacts it describes are the record of
  a claim that was true, and three closed tickets link to them. The README now points at this
  ticket's check for the recipe.
