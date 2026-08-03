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

A source that will not set costs only its own label — of a diagram *read from a file*, which is
where [ticket 02](./02-the-box-gesture.md) put this rule and where the argument for it always
lay: once Save exists, a file can carry LaTeX no form ever vetted, and refusing the whole drawing
would mean a file that cannot be opened to be repaired. So a loaded dot still draws, its source
stays in the diagram to be corrected, and what could not be set is reported. Of a *gesture*, nothing
is added at all and the source stays in the input — no typing puts into the diagram a source this
backend cannot draw.

**Blocked by:** [04](./04-term-dots-in-the-model.md).

**Status:** resolved

- [x] A term-dot carries a source and a side, and the LaTeX bar puts one on a dot
- [x] The source survives in the diagram after typesetting, and the glyphs do not
- [x] Labels are typeset once per source however often the diagram is redrawn
- [x] A source that will not typeset leaves its dot drawn, its source in the diagram, and a report
      naming what could not be set
- [x] One bad source never costs another label, nor the rest of the drawing
- [x] Labels no longer stack in rows, and nothing counts them out of the drawing to decide where the
      next one goes
- [x] The tests reach placement and failure through the bar, and the typesetting engine's own suite
      is untouched

`labelDot` is the transition and `addDot` now says which dot it placed, the two being the halves of
one gesture: the dot lands, then the bar goes to it. `setLabelsOf` is the backend's other half of
the failure rule — it sets what a diagram *brings*, and names what would not set — and the shell
draws through it, so the road a loaded diagram takes is already built and is a no-op for everything
a gesture makes. `label-form.ts` lost its placement, its row counter and its error region and is
now the bar and nothing else.

**The fourth criterion is ticked at the backend, and its shell half is wired but unreached.** That
a source which will not set leaves its dot drawn, its source in the diagram and a report naming it
is asserted of `setLabelsOf` and of the drawing. What has no test is the shell putting that report
on screen: no gesture can produce one, the editor holds its diagram privately, and giving
`createEditor` a diagram to start from would be API invented for a test. Save is what first hands
it one, and is where that wiring is first exercised.

Rendered through the real modules and rasterized with `rsvg-convert`,
[all four sides](../verification/term-dot-labels.png) sit clear of the dot and centred on it.

## Choices

- **A dot is placed first and named second, in two transitions** — a term-dot's label is optional,
  so a question given up on has to leave an unnamed dot rather than nothing, which is the opposite
  of a box; and asking before the release is judged would throw away a typed source whenever the
  model refuses the placement. Merge the two the day a dot's name stops being optional.
- **`addDot` answers with a record, `{ diagram, dot }`** — naming needs to say *which* dot, and
  [04](./04-term-dots-in-the-model.md) left the success arm bare because nothing yet asked. `typeof`
  still tells a refusal from it, so the discrimination is unchanged.
- **The default side is `above`, and it is the model's, beside a box's slot** — `goal.jpg` sets a
  term's name to its dot's left, which is the lane a path arrives on; above leaves that run clear.
  Where a *new* label goes is creation's business either way, so it sits next to `NEW_BOX_SLOT`
  rather than in the backend that draws it.
- **The backend's cache holds a refusal as an `Error`, and only a redraw takes it** — a redraw would
  otherwise retry every source that will not set and report it again on every frame, so what a
  source came to is remembered whichever it was. A *gesture* asks again instead: submitting the same
  source twice is asking for a retry, and a boot the engine got wrong once would otherwise leave
  that source unsettable for the session. Keeping the throwable rather than a note about it is what
  tells the second caller exactly what the first was told.
- **`setLabelsOf` runs on the shell's draw path, though nothing yet reaches it** — the criterion is
  about a diagram whose LaTeX no form vetted, and the only honest way to have that behaviour is to
  have the road it arrives by. It costs a redraw per gesture and is what Save will hand a loaded
  diagram to.
- **The bar sits at the dot, not at where its glyphs will land** — the dot is the mark the question
  is about, and how far off it a label stands is the backend's, which the shell would have to be
  told to place the input any better. Revisit if a label ever hides the bar.
- **`.label-error` went with the bar's placement** — with nothing left for the bar to report,
  keeping a second region would be the two error surfaces
  [02](./02-the-box-gesture.md) refused. That ticket's *"its failure reporting included"* was
  written while the bar still placed labels of its own, and is the one line of it this departs from.
  It is paid for: the bar now stands at the mark it is naming while the reason it was refused
  appears in the region at the top of the viewport, so the answer is further from the question than
  it was. Put a region back on the bar the day that reads badly — and then say what the canvas
  region is still for.
- **A dot's label keeps no room the model knows about** — [04](./04-term-dots-in-the-model.md)
  raised it, but no criterion here asks for it and nothing yet reads badly: a label's extent is
  glyph geometry, so a room would be a number in the model *and* a measurement in the backend on
  every hit test. Build it the day a dot lands under a name and the drawing suffers for it.
- **`diagram.test.ts` and `render-svg.test.ts` are left over the 300-line budget** — both were at
  it before this ticket, so any suite for a new transition trips it. It is a warning rather than a
  gate, and the fix is splitting a module's tests across files that name no module — or splitting
  `render-svg.ts` itself into the drawing and the gesture seam, which is a ticket of its own.
