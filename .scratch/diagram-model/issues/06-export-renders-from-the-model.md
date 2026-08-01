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

**Status:** ready-for-agent

- [ ] Exporting draws the diagram rather than copying the canvas — no clone, and no reading of
      layout anywhere on the path
- [ ] The file is framed from the diagram's own extent, so the same diagram exports identically
      whatever the window size
- [ ] An export can be produced without a laid-out page
- [ ] The file still stands alone: every glyph an outline, every mark carrying its own presentation,
      no reference to this page's stylesheet, fonts or defs
- [ ] The writer is unchanged, and both [surfaces](../../../CONTEXT.md#surface) export as they did
- [ ] The renderer check is rebuilt on the new path, and two independent renderers still draw the
      file as the screen draws it

## Choices
