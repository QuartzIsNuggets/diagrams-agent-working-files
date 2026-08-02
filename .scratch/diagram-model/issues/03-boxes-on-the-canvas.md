# 03 — Boxes on the canvas

**What to build:** Making a box, end to end. A press on empty canvas asks for a type expression and
puts a [box](../../../CONTEXT.md#box) on screen — drawn from the diagram rather than appended to it,
which is the whole point of the ticket. This is where the model stops being a type and starts being
the document.

Three things arrive together because none is demonstrable without the others: the transitions that
take a diagram to the next one, the SVG [render backend](../../../CONTEXT.md#render-backend) that
draws a diagram into the [canvas](../../../CONTEXT.md#canvas), and the editor shell that holds the
current diagram and drives the two.

The diagram is a **value**, not a store: a transition returns the next diagram or a refusal, never
mutating what it was given. The shell holds *current*, which is what makes undo a stack of past
values whenever [ticket 09](../../initial-planning/issues/09-targeting-anchors.md)'s deferred work
lands.

The seam runs one way. The backend reads the diagram and draws it; nothing reads the drawing back.
Pointer positions cross into [diagram units](../../../CONTEXT.md#diagram-unit) at the backend and
never travel as pixels beyond it, and the y-up flip
([ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md)) happens once at the canvas
root. Because the diagram owns every extent, it also answers the geometric questions — what a press
landed inside, and which boxes a new one has to push aside — so no caller needs a laid-out page to
ask.

Term-dot plopping and the LaTeX bar are left exactly as they are, drawing alongside. They move into
the model in [ticket 04](./04-term-dots-in-the-model.md) and
[ticket 05](./05-term-dot-labels.md).

**Blocked by:** [01](./01-diagram-schema.md), [02](./02-the-box-gesture.md).

**Status:** resolved

- [x] A press on empty canvas makes a box, sized by the drag and asking for a source as
      [ticket 02](./02-the-box-gesture.md) settled; a click, being a drag of no size, needs no rule
      or threshold of its own
- [x] A box too small for its label is grown to fit it, per ticket 02's floor
- [x] A box needing room another holds pushes it aside — least axis, transitively — so creation is
      never refused for overlap and no two boxes overlap once it settles
- [x] A source that will not typeset makes no box, and the rectangle and its input go with it
- [x] What is on screen is drawn from the diagram — a box appears because the diagram holds one,
      never because a gesture appended it
- [x] A transition returns the next diagram or a refusal, and the diagram handed in is unchanged
- [x] The refusal reaches the user in the canvas's own region rather than being dropped
- [x] Pointer positions become diagram units at the backend, and the y-axis points up in the model
- [x] The diagram answers what a point lands inside, with no reference to layout
- [x] Term-dots and typeset labels still work as before, and survive a redraw
- [x] Transitions and geometry are tested purely — no DOM, no pointer events, no faked layout — and
      the conversion, the flip and the gesture rules are tested at the backend

Built as three modules over the schema: `diagram.ts` grows the transition and the hit test,
`render-svg.ts` is the backend, and `editor.ts` is the shell holding *current*. The browser build
was **driven** on a 1280×800 kiosk, the rig [tauri-shell 03](../../tauri-shell/issues/03-native-writer.md)
left already standing, because the flip, the label's place in its slot and the unpinned input are
all layout and jsdom has none: a drag drew its rectangle and the input arrived at its top edge, the
named box landed on exactly that rectangle with its label upright and centred inside the top wall, a
click made a box grown to `\mathbb{N}`, a box released across another
[pushed it clear](../verification/pushed-aside.png) along the shorter axis while landing exactly on
the rectangle drawn for it, and `\notacontrolsequence{x}` left no box, took its rectangle with it and
[said so](../verification/boxes-on-the-canvas.png) in the canvas's region with the source still in
the bar.

The review found the cascade moving the **new** box — the one thing in it that must not move, being
the mark the user was looking at — in 1.5% of randomly drawn diagrams. Pinning it is what the first
Choice below records, and a fuzz over 500 drawings now holds both halves of the rule.

## Choices

- **The origin is the canvas's top-left corner, so the visible plane is the one below it** — the
  render root's transform is `scale(1,-1)` and nothing else, which keeps the drawing a function of
  the diagram alone: no layout is read to draw, so a resize can never leave what is drawn out of
  step with what a pointer converts to. A bottom-left origin would have put the canvas's height in
  that transform and bought a redraw on every resize. Everything drawn has negative `y` until
  panning arrives and makes the origin a stored offset, which is when to move it.
- **The LaTeX bar is unpinned rather than the gesture being given an input of its own** — this
  ticket says the bar is left as it is and [02](./02-the-box-gesture.md) says there stays exactly
  one place LaTeX is typed; moving it is the only reading that leaves both true, and a second field
  is precisely the two error surfaces 02 refused. At rest it still places free-floating labels,
  which is the half [05](./05-term-dot-labels.md) takes away.
- **The grower never moves, and settling is bounded** — the rectangle the user just drew is the one
  fixed thing in the cascade, since a box coming to rest anywhere else makes the mark they were
  looking at a lie. Letting it give way like any other box moved it in 1.5% of randomly drawn
  diagrams. Pinning it costs a second sweep, because a box shoved against it has to be pushed off
  by the sweep after; `SETTLING_SWEEPS` bounds that, a packing tight enough being able to cycle
  instead, and a rule the model runs having to come back. Nothing in 500 randomly drawn diagrams at
  editor density needed more than that, and the fuzz that says so is in `diagram.test.ts`. Raise the
  bound, or find a rule that provably settles, if a real drawing ever leaves two boxes overlapping.
- **`addBox` returns the next diagram and no refusal** — [02](./02-the-box-gesture.md) retired the
  only refusal box creation had, so a refusal arm would be a branch no caller could reach, and the
  refusal this ticket does raise is the typesetter's, outside the transition by 02's design. The
  checklist's *"or a refusal"* is therefore unexercised here rather than implemented.
  [Ticket 04](./04-term-dots-in-the-model.md)'s dot placement is the first transition that can say
  no, and is what should pick the shape a refusal comes back in.
- **The diagram's ink takes no pointer events at all** — so a press over a box still lands on the
  canvas and it is the model, not the DOM, that says what it fell inside. The side of it worth
  knowing is that term-dot plopping goes on working untouched, since a release inside a box still
  reaches `canvas.ts`'s listener with the canvas as its target.
- **A drag claims its own release, from a capturing listener on the window** — one gesture leaves
  one mark, so a box drag must not also plop a dot, and capturing at the window says so without
  making the order `main.ts` wires things in load-bearing. It leaves plopping reachable only from a
  press that started inside a box, which is where [02](./02-the-box-gesture.md) puts a dot anyway
  and where [04](./04-term-dots-in-the-model.md) will take it into the model.
- **While a question is open, a press on the canvas is dropped, and the bar leaves the rectangle on
  submit** — one input can hold one question, and a press that quietly cancelled it would throw away
  a typed source; Escape is the way out [02](./02-the-box-gesture.md) settled. The bar goes home
  before the answer is known to be good because a refused source takes its rectangle with it, so
  staying would pin the input to a mark no longer there. Revisit together if correcting a refusal in
  the corner reads as too far from where it was asked.
- **`messageOf` extracted to `failure.ts`, touching three files this ticket otherwise left alone** —
  [tauri-shell 04](../../tauri-shell/issues/04-export-error-region.md) recorded the trigger as
  *"extract when a third caller wants it"*, and the canvas's refusal region is the fourth.
- **A box and its type expression are drawn in one blue, and it is the darkest light blue there
  is** — asked for after the review. One colour for walls and label, a box being a rectangle
  *labelled with* its type expression rather than a rectangle with something else inside it; and
  `#3a7ca5` because a type expression has to be read, which puts a 4.5:1 floor under it that every
  paler blue fails. Boxes are the only thing on the canvas that is not black, so the hue channel
  [role](../../../CONTEXT.md#role) owns is untouched — red and green stay free. It is ink, so it
  lives in `palette.ts` and the model never learns of it.
