# 04 — Term-dots in the model

**What to build:** A [term-dot](../../../CONTEXT.md#term-dot) becomes something the diagram holds
rather than something the canvas remembers. Releasing inside a [box](../../../CONTEXT.md#box) puts a
dot in it; releasing on empty canvas makes a box, as
[ticket 03](./03-boxes-on-the-canvas.md) established, so there is no longer any such thing as a term
outside a type.

A dot's position is relative to its box
([ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md)), so a box carries its dots
with nothing to maintain — which is worth demonstrating even before boxes can be moved.

Dots still never overlap, but the rule stops being measured in whatever the renderer happened to
draw. The diagram owns a **minimum separation** in [diagram units](../../../CONTEXT.md#diagram-unit)
and refuses a release closer than that; each render backend then draws a dot small enough to honour
it. Ink is the backend's, the constraint is the model's — the same split
[role](../../../CONTEXT.md#role) already has with colour.

This is where the old way goes. The canvas stops being read back for anything, and the tests that
dispatched pointer events and faked a `DOMRect` to reach a purely geometric rule are deleted rather
than ported: the rule is now reachable directly.

**Blocked by:** [03](./03-boxes-on-the-canvas.md).

**Status:** resolved

- [x] Releasing inside a box places a term-dot in that box, at that point
- [x] A dot's position is relative to its box
- [x] A release closer to a placed dot than the minimum separation is refused, and the refusal is
      measured in diagram units
- [x] The backend's dot size honours the model's separation, and the model names no size
- [x] Nothing reads a dot back out of the drawing
- [x] The overlap rule is tested with no DOM and no faked layout, and the tests it replaces are
      deleted rather than retargeted

`addDot` is the transition, `placeOf` and `dotsIn` are the two questions a dot's place asks of the
model, and `canvas.ts` is left with `createCanvas` and the namespace — `enablePlopping`,
`createTermDot` and the DOM read the overlap check ran on are gone, and `canvas.test.ts` with them.
The rule they held is now four assertions in `diagram.test.ts` with no document in sight.

**A release over a mark already on the canvas being refused is retracted**, and the separation is
the only rule left. That criterion was the DOM era's: what turned a release away then was the
*drawing* — anything under the pointer that was not bare canvas — which is the reading back this
ticket exists to end, and it was never a claim about the notation. Retracting it costs nothing that
was wanted: a release onto a dot is still refused, the release point being closer to it than dots
may stand, and still refused when the press started elsewhere and was dragged onto it, the release
point being the only thing measured. One rule now does what two did.

What no longer refuses is a release over a **label** — a box's own, or one of the free-floating ones
the LaTeX bar still places at rest — which puts a dot where the release landed, under the glyphs. No
model could have refused it without an extent it has nowhere to keep: a label's extent is
[glyph geometry](../../../CONTEXT.md#glyph-geometry), which
[ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md) derives and
[ticket 01](./01-diagram-schema.md) refuses to store. If a dot under a type expression ever reads
badly, what fixes it is a room a label keeps, the way a box keeps a
[clearance](../../../CONTEXT.md#box) — a number in the model and a measurement in the backend, never
a stored extent — and [ticket 05](./05-term-dot-labels.md) is where a dot's own label raises it.

Rendered through the real modules and rasterized with `rsvg-convert`, two dots exactly a separation
apart touch at a point and no more, which is the whole of what the backend owes the number.

## Choices

- **A refusal is a reason and no sentence — `Next = Diagram | Refusal`, told apart by `typeof`** —
  [03](./03-boxes-on-the-canvas.md) left the shape to the first transition that could say no. A bare
  string union needs no wrapper and leaves the arm that matters unwrapped, and the wording lives
  beside the region it is written into, where the rest of the wording is. Make it a record the day a
  refusal has to carry a value — which dot was in the way — rather than name a rule.
- **The minimum separation is 10 units, and a dot is drawn at half of it** — 10 is what the editor
  already drew, so the rule moved into the model without the drawing changing; it is a placeholder
  like the clearance, and [the spec](../spec.md) records it as one. Half is the most ink the
  constraint leaves room for, and it is taken from the model's number rather than chosen beside it,
  so a backend cannot draw overlapping what the model calls clear.
- **The press's answer says what the gesture *shows*, not what it makes** — the backend had to learn
  that some gestures draw no chrome, and `Started` is that and nothing more: telling it a dot was
  being placed would have put the model's kinds in the thing that draws them. It hands `lands` both
  the rectangle and the release point, a corner being ambiguous to recover a point from. A third
  gesture wanting a mark of its own goes in `Provisional`.
- **`canvas.test.ts` went whole rather than keeping a suite for `createCanvas`** — every test in it
  was about plopping, so once plopping left there was no suite to keep: the factory is two lines
  with nothing to get wrong, and every other suite builds one. Bring the file back when the canvas
  gains a rule of its own.
