# 02 — The box gesture

Type: grilling

**Blocked by:** None — can start immediately, and runs alongside
[ticket 01](./01-diagram-schema.md).

**Status:** resolved

## Question

A [box](../../../CONTEXT.md#box) is made in two ways, and both ask for its type expression:

- **Drag** on empty canvas — the drag sets the extent, and the box is resized upward if the drag
  made it too small for its label.
- **Click** on empty canvas — outside a box a release cannot mean *place a term*, so it means
  *make a box*, auto-sized.

That much is settled. What is not:

**What the prompt is, and what a cancelled one leaves behind.** A modal, an input on the box
itself, or the existing LaTeX bar retargeted? And on cancel: a box with no source, or no box?
`CONTEXT.md` says a box *is* a type drawn labelled with its type expression — which suggests an
unlabelled box is the meaningless state
[ticket 01](./01-diagram-schema.md) keeps out of the model rather than a state the
[checking layer](../../../CONTEXT.md#checking-layer) warns about.

**Who measures the floor.** Auto-sizing needs the label's extent, and only the render backend can
[typeset](../../../CONTEXT.md#typesetting) — asynchronously, and with two ways to fail. So making a
box becomes an asynchronous gesture, and a source that will not typeset has no extent to be floored
against. What is the box then?

**Whether the floor survives the label.** [Ticket 08](../../initial-planning/issues/08-persistence-format.md)
says a box auto-sizes on creation as *"an initial value, not an invariant"*, the extent being the
user's from then on. If editing a source later can force the box to grow, it is an invariant after
all. If it cannot, a box can end up too small for its own label.

**What refuses.** Boxes never overlap, so creation needs a refusal of its own — and a drag that
starts on empty canvas and ends inside an existing box needs an answer.

**Which [label slot](../../../CONTEXT.md#label-slot) a new box's label takes**, of the six.

Whatever this settles about *asking for a source* is expected to carry to term-dot labels in
[ticket 05](./05-term-dot-labels.md). If it cannot, say so — that ticket then needs its own
session.

## Answer

**The press decides what is made; the release decides where and how big.** Press on empty
[canvas](../../../CONTEXT.md#canvas) and a [box](../../../CONTEXT.md#box) is being made; press
inside a box and a [term-dot](../../../CONTEXT.md#term-dot) is being placed. This inverts
[`CONTEXT.md`](../../../CONTEXT.md#plop), where the release decided both, and it is what makes the
rest cheap: because the kind is settled before the pointer moves, **no threshold tells a click from
a drag**. A click is a drag of no size, and the floor below grows it to its label — so *"a click
makes an auto-sized box"* turns out to need no rule of its own. A dot released outside any box is
refused, [the spec](../spec.md)'s *"a term outside a type is not representable"* being exactly
this case.

The drag sizes the box wherever it ends, so a drag from empty canvas released inside an existing box
makes a box that pushes that one aside. The press had already said which of the two was being made;
letting the release change its mind is what would have made a threshold load-bearing — a hand
wobbling a few units while clicking inside a box would have created a box there and evicted the box
it was aimed at.

### One LaTeX input, unpinned

There stays exactly one place LaTeX is typed, and it goes to whatever it names: inside the
provisional rectangle while a box is being made, and at the dot being named in
[ticket 05](./05-term-dot-labels.md). Not a modal, which would cover the rectangle it asks
about; not an input beside the standing bar, which would be two error surfaces answering one
question. What `createLabelForm` already is survives whole — its failure reporting included — and
only its placement changes.

It sits at the box's [label slot](../../../CONTEXT.md#label-slot), so the source is typed where
the label will be. A new box's slot is **`top-center`**, which diverges from `goal.jpg` knowingly:
the reference drawings put box labels top-left almost throughout, and
[ticket 08](../../initial-planning/issues/08-persistence-format.md)'s worked row writes
`top-left`. The cost is that a centred label crosses the run of space dots most use, and the remedy
is the drag between slots ticket 08 already anticipated.

The rectangle is [chrome](../../../CONTEXT.md#chrome), not diagram. **The box enters the diagram
only on confirm**, in one transition, so a cancelled prompt leaves no box — there was never one to
leave. That is what keeps `Box.source` genuinely required: [ticket 01](./01-diagram-schema.md)
made it non-optional, and a gesture that admitted the box first would have had to write `""` into it
and call that a state. Escape cancels, and so does submitting nothing, there being nothing to name.

### The backend measures; the transition receives a number

Auto-sizing needs an extent only the [render backend](../../../CONTEXT.md#render-backend) can
produce, so the shell asks it to measure the source, awaits it, and hands
[ticket 03](./03-boxes-on-the-canvas.md)'s transition an already-floored extent in
[diagram units](../../../CONTEXT.md#diagram-unit). The transition stays pure and synchronous,
the asynchrony and the failure living outside it — which is what lets 03 go on testing transitions
with no DOM. Nothing is injected into the model, per the spec's *"the backend owns typesetting and
its cache; no injected port"*. How much room the label is given inside the walls is the backend's
constant, spent once and frozen into the diagram at creation.

**The floor is permanent and one-way.** A box grows whenever a later source no longer fits it, and
never shrinks. Ticket 08 called auto-sizing *"an initial value, not an invariant"*; that is amended
here. The extent stays the user's in the direction that matters — room given to a box is never taken
back — while a box can no longer end up too small for its own label. What ticket 08 actually refused
was *deriving* the extent, which would have made a label's size an input to geometry on both
backends and left a MathJax release free to move every box; a floor that only rises is a weaker
thing, and the number it leaves behind is still stored, still the user's, and still what TikZ draws.

### Boxes never overlap, and room is made rather than refused

A box needing space another holds **pushes it aside**, and this covers the newly made box as much as
the grown one: creation pushes too, dragged extent and floor alike. So **nothing about making a box
is refused for overlap**, which retires ticket 03's *"creation is refused where the box would
overlap one already placed"*. What that criterion would have cost is a rename refused because of a
neighbour, and a drag that fitted refused because a label the user could not see in advance made it
too wide.

The rule, whole: growth is symmetric about the stored centre; a box the grown extent enters moves
along **whichever axis needs least** — horizontal or vertical overlap, whichever is smaller — away
from the grower, by exactly that overlap; a box so moved moves its own neighbours in turn.
Breadth-first from the grower, repeated until nothing overlaps. It terminates because every
displacement is outward and the boxes are finite, and it cannot fail because nothing bounds the
plane — the [export](../../../CONTEXT.md#export)'s frame is derived from what is drawn. Ties break
toward the axis that grew more, then toward x, so one edit always moves the same boxes.

Least-axis is what keeps grids grid-shaped without being told they are grids: a box in the same row
is clipped by a sliver horizontally and by its full height vertically, so it slides sideways rather
than jumping a row. Dots need no bookkeeping at all — ticket 01 put their positions relative to
their box's centre, so they ride along.

Two things are traded away knowingly. Alignment is not preserved: a box in the same column as a
displaced one, but not itself in the way, stays put, so a neat column can go ragged after one
rename. And a rectangle dragged deliberately across an existing box evicts it rather than being
turned away.

### A source that will not typeset cancels the gesture

Nothing is added, the rectangle goes, and the source stays in the input to be corrected. The canvas
gains one **refusal region** to say so, built to the precedent
[tauri-shell ticket 04](../../tauri-shell/issues/04-export-error-region.md) set: a
`role="alert"` paragraph inside the affordance, in the tree before it has anything to say,
describing only the last attempt, cleared by anything that lands. One region rather than one per
gesture, because *"why did nothing appear?"* is one question.

**The two ways to fail are not alike, and the engine was asked rather than recalled.** The source
`(\foo : \mathbb{N})` comes back with **zero** glyph paths: MathJax abandons the whole expression
for an error box, so the valid `(`, `:` and `\mathbb{N})` are not drawn either and there is
genuinely no extent to floor against. `A \times \text{漢}` comes back with two paths **and** a
`<text>` — the run is complete and measurable, and `typesetLatex` refuses it only because `<text>`
in an exported file is a font reference, which [standalone](../../../CONTEXT.md#standalone) forbids.
The first refusal is forced, the second elective. They reach the user identically, which is right;
but the second means a refused source is not a *wrong* source, `\text{漢}` being valid LaTeX the
TikZ emitter would set perfectly.

So the rule runs by provenance rather than by kind: **no gesture puts a source into the diagram that
this backend cannot draw, and a diagram read from a file always keeps one.** Loaded, such a source
draws its box or dot unlabelled and is reported — never dropped, never a refused file. A machine
with other glyph ranges bundled, or a drawing on its way to TikZ, would otherwise lose LaTeX the
user wrote.

### It carries to ticket 05

All of it. The input is the same one, at a dot rather than at a rectangle, and the failure rule is
the one above: ticket 05's *"a source that will not set costs only its own label"* is true of a
**loaded** diagram, which is where 05's own argument already put it — *"a file can carry LaTeX no
form ever vetted, and refusing the whole drawing would mean a file that cannot be opened to be
repaired"*. Of a gesture, the source stays in the input rather than in the diagram. Ticket 05 needs
no session of its own.

### What this amends

- **`CONTEXT.md`** — Plop (the press decides the kind, the release only the placement), Box
  (a permanent floor; room made by pushing), Label slot (`top-center` by default), Typesetting
  (a source one engine will not set is not a wrong source), Chrome (a gesture's provisional marks).
- **[Ticket 03](./03-boxes-on-the-canvas.md)** — creation pushes instead of being refused, and
  grow-to-fit is no longer creation-only.
- **[Ticket 08](../../initial-planning/issues/08-persistence-format.md)** — *"an initial value, not
  an invariant"* becomes a floor that rises.
- **[Ticket 05](./05-term-dot-labels.md)** — its failure half is settled here.
- **[The spec](../spec.md)** — the label-to-wall padding joins the numbers still unset.
