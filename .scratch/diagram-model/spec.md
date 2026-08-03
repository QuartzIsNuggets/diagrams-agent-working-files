# Diagram model

The [canvas](../../CONTEXT.md#canvas) stops being the document. A **diagram** module holds the
drawing in [diagram units](../../CONTEXT.md#diagram-unit), and the SVG
[render backend](../../CONTEXT.md#render-backend) draws it and is never read back — which is what
[ADR 3](../../docs/adr/0003-a-save-records-the-diagram.md) meant by *"a real in-memory model must
now exist"* and what [ticket 07](../initial-planning/issues/07-output-formats.md) meant by *"two
render backends over one diagram model"*. The [export](../../CONTEXT.md#export) is drawn from that
model rather than copied off the screen.

Arrived at by grilling the first two candidates of an architecture review, 2026-08-01. The
decisions are carried by the tickets that act on them:

| Decision | Where it lives |
| --- | --- |
| The diagram owns truth; the backend draws it; the seam runs one way | [03](./issues/03-boxes-on-the-canvas.md) |
| The whole schema is typed from day one, including undrawable kinds | [01](./issues/01-diagram-schema.md) |
| Types hold every invariant types can hold | [01](./issues/01-diagram-schema.md) |
| A term-dot carries a label — the gap `goal.jpg` proves | [01](./issues/01-diagram-schema.md), [05](./issues/05-term-dot-labels.md) |
| Boxes join the effort; a term outside a type is not representable | [02](./issues/02-the-box-gesture.md), [03](./issues/03-boxes-on-the-canvas.md) |
| The press decides what a gesture makes; the release decides where | [02](./issues/02-the-box-gesture.md) |
| A box's floor is permanent, and boxes make room rather than refuse | [02](./issues/02-the-box-gesture.md) |
| The diagram is a value; transitions return the next one | [03](./issues/03-boxes-on-the-canvas.md) |
| The diagram hit-tests, owning every extent | [03](./issues/03-boxes-on-the-canvas.md) |
| The backend owns typesetting and its cache; no injected port | [02](./issues/02-the-box-gesture.md), [05](./issues/05-term-dot-labels.md) |
| A source the editor cannot draw is kept when read, never made by a gesture | [02](./issues/02-the-box-gesture.md), [05](./issues/05-term-dot-labels.md) |
| The model owns how far marks stand apart; backends own ink | [04](./issues/04-term-dots-in-the-model.md), [07](./issues/07-boxes-keep-a-clearance.md) |
| Tests are replaced at the new interfaces, not layered over the old | [03](./issues/03-boxes-on-the-canvas.md), [04](./issues/04-term-dots-in-the-model.md) |
| The export renders from the model | [06](./issues/06-export-renders-from-the-model.md) |

## What no ticket carries

**The model refuses the meaningless; the checking layer warns about the wrong.** A concluding
[built-in rule](../../CONTEXT.md#built-in-rule) is not a wrong drawing but a meaningless one — the
mark has nothing to mean — so it stays unrepresentable, where an equivalence's arrows not being
opposed stays representable and is warned about. The distinction now reads as though it had always
been there, in [ADR 1](../../docs/adr/0001-diagram-draws-checking-layer-interprets.md) and
[ADR 3](../../docs/adr/0003-a-save-records-the-diagram.md) rather than in an ADR of its own; the
[checking layer](../../CONTEXT.md#checking-layer) entry carries the vocabulary. The consequence
lands on a **loader**, which nothing here builds: a file carrying such a field **loads with the
field dropped and a warning**, never refused. Save is the ticket that implements it.

**Assumed, never decided:** the backend redraws by rebuilding, a keyed diff waiting for
[ticket 09](../initial-planning/issues/09-targeting-anchors.md)'s dragging; one diagram unit is one
SVG user unit for now; a label's fraction along an element is the derived curve's own parameter
rather than its arc length — symmetric fan bows leave the two indistinguishable today, and both
render backends must read it the same way once they are not.

**Numbers still unset:** the export margin and the frame of an empty diagram. Two more are
placeholders no drawing has argued with rather than unset: the minimum separation between two dots,
10 units and what the editor already drew ([04](./issues/04-term-dots-in-the-model.md)), and the
clearance boxes keep, 12 ([07](./issues/07-boxes-keep-a-clearance.md)). The sides a term-dot's label
may take are settled — four, and above it by default
([05](./issues/05-term-dot-labels.md)) — and so is the room it keeps off the dot, which is the
SVG backend's constant rather than a number the model carries. A box's own
slot is settled — centred at the top ([02](./issues/02-the-box-gesture.md)) — and so is the room it
gives its label inside its walls, which [03](./issues/03-boxes-on-the-canvas.md) made a constant of
the SVG backend rather than a number the model carries.
