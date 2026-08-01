# 05 — Term-dot labels

**What to build:** A [term-dot](../../../CONTEXT.md#term-dot) can be named. It carries a
[label](../../../CONTEXT.md#label) — a [source](../../../CONTEXT.md#source) and the side of the dot
it sits on — and the LaTeX bar labels a dot instead of stacking rows that name nothing. `goal.jpg`
labels dots nearly everywhere (`x`, `y`, `z′`, `q`, `w`, beside the dot and usually to its left);
until now the model had nowhere to put that.

This is the ticket that makes a label keep its source. Today the LaTeX is thrown away the moment it
is typeset, leaving [glyph geometry](../../../CONTEXT.md#glyph-geometry) that the TikZ backend could
never emit from. After this the diagram holds the source and the drawing holds the glyphs, which is
the division [ticket 08](../../initial-planning/issues/08-persistence-format.md)'s derived audit
already assumes.

[Typesetting](../../../CONTEXT.md#typesetting) belongs to the SVG backend and to no one else — the
TikZ emitter never typesets, it hands the source to the including document. The backend keeps what
it has set, keyed by source, so redrawing costs nothing after the first time.

A source that will not set costs only its own label. The dot still draws, the source stays in the
diagram to be corrected, and what could not be set is reported. This matters more than it looks:
once Save exists, a file can carry LaTeX no form ever vetted, and refusing the whole drawing would
mean a file that cannot be opened to be repaired.

**Blocked by:** [04](./04-term-dots-in-the-model.md).

**Status:** ready-for-agent

- [ ] A term-dot carries a source and a side, and the LaTeX bar puts one on a dot
- [ ] The source survives in the diagram after typesetting, and the glyphs do not
- [ ] Labels are typeset once per source however often the diagram is redrawn
- [ ] A source that will not typeset leaves its dot drawn, its source in the diagram, and a report
      naming what could not be set
- [ ] One bad source never costs another label, nor the rest of the drawing
- [ ] Labels no longer stack in rows, and nothing counts them out of the drawing to decide where the
      next one goes
- [ ] The tests reach placement and failure through the bar, and the typesetting engine's own suite
      is untouched

## Choices
