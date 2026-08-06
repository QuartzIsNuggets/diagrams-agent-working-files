# Where derived shape lives

Type: grilling
Status: resolved
Blocked by: 01, 02

## Question

[Ticket 01](./01-what-a-shaft-is.md) says what a shaft is and
[ticket 02](./02-fan-slots-arrival-slots-and-the-junction.md) says where it goes. **Whose code is
it?** The seam is sited last on purpose: what crosses it is known by then.

Five things want the same derivation, and they are not all on the same side of any existing seam:

| Consumer | Where it lives today |
| --- | --- |
| *Which anchor is under the pointer* | `diagram.ts` — `boxAt`, because the diagram owns every extent |
| Drawing the shaft | `render-svg.ts` |
| The export frame's extents | `render-svg.ts` |
| A label at `labelT` on the curve | `render-svg.ts`, needing a point and a tangent |
| The TikZ emitter | does not exist, and must not inherit an SVG-shaped answer |

So the candidates are roughly: **`diagram.ts` grows shape**, which keeps
[Diagram](../../../CONTEXT.md#diagram)'s claim to answer where a point falls intact and puts derived
geometry in the module that is also the saved file's shape, field for field; or **a module sits
above `diagram.ts`** that both backends and the hit-test consume, which keeps the model to what is
*recorded* and gives the two backends one derivation; or **each backend derives its own**, which is
the answer that is already wrong — the prototype proved the two derivations drift the moment one
approximates, 45px in its case.

What the answer has to settle beyond the file it lands in:

- **Whether the diagram still hit-tests.** `CONTEXT.md`'s
  [Diagram](../../../CONTEXT.md#diagram) entry says it is *"the thing that answers where a point
  falls"*. If the answer moves, that sentence is amended in place rather than annotated — and the
  gesture that asks *what is under the pointer* has a new thing to ask.
- **Where the sweep's result lives, given a diagram is a value.**
  [Ticket 01](./01-what-a-shaft-is.md)'s pass is one forward walk filling a map, so there is no memo
  to place — but the map it fills has nowhere to hang on a value either. Per redraw, per module, or
  per caller, and whether that makes the derivation a function or an object.
- **What the backend is handed.** A shaft per element, or a whole drawn diagram; whether the
  backend asks for one element's geometry or is given the lot. The trim is no longer part of this:
  [ticket 01](./01-what-a-shaft-is.md) made the shared shaft untrimmed and left keeping a head clear
  of a dot's room wholly to the backend.
- **Whether the answer earns an ADR.** [ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md)
  established that shape is derived and said nothing about who derives it; this is the same class of
  decision as [ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md) and
  [ADR 4](../../../docs/adr/0004-export-and-save-share-a-writer.md), and it binds the TikZ emitter
  that does not exist yet. Decide whether it is written down as one.

Resolve with `/grilling`, `/domain-modeling` for whatever term the answer needs, and
`/codebase-design` for the seam itself.

## Answer

**A module above `diagram.ts`, called `shape.ts`**, which both backends and the hit-test consume.
The rule that puts it there is one the model already follows rather than a new preference:

> **A derivation lives in the model exactly when a model rule depends on it.**

Box extents pass that test — `addDot` calls `boxAt` *itself*, a term outside a type being nothing a
diagram can hold, and `addBox` makes room by them — which is why they are in `diagram.ts` and stay.
Shafts fail it: **no transition needs one.** `addPath` and `addArrow` take anchor ids and refuse on
anchor grounds alone ([ticket 07](./07-what-the-model-refuses.md)), a release on nothing having been
resolved by the gesture before the transition is called, so a diagram can be built, saved and
reopened without a Bézier ever being evaluated. Every one of the five consumers is above the model.

Two facts support it without being the argument. `diagram.ts` says of itself that *the shape here is
the shape of the saved file, field for field*, and a shaft has no row in that file — being derived is
exactly what [ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md) decided. And the
derivation is a deep module in its own right — de Casteljau, a private 16-sample flattening, fan
grouping, the `(i+1)/(n+1)` partition, the junction fraction, the loop splay — which would take
`diagram.ts` past 1100 lines holding two jobs that share no state.

`geometry.ts`, the prototype's name, is declined:
[glyph geometry](../../../CONTEXT.md#glyph-geometry) already owns that word here for something else.

### The hit-test splits along the same line

**`boxAt` stays in the model; `anchorAt` — what is under the pointer — is `shape.ts`'s.** So
[Diagram](../../../CONTEXT.md#diagram)'s claim narrows, amended in place: it answers **which box** a
point falls in, where what is under the pointer is the wider question and is answered a layer up. The
promise that sentence was making is untouched — the layer reads no laid-out page either.

**No single `whatIsAt` door**, tempting as one ask is. There are two asks and they genuinely differ:
a **press** wants anchor-else-box-else-empty, where a **drag in flight** wants the anchor under the
pointer with no box fallback, a box being never an anchor. One door would need a flag for the
difference; two named asks need none. The precedence a press composes — an anchor beats the box it
sits inside — is [ticket 04](./04-what-a-selection-is.md)'s press to design.

### The value, and where it lives

**`resolve(diagram)` is a pure function returning plain data**, held by its caller for one act — one
redraw, one press, one export — and dropped. Nothing is kept between calls. The alternative, a
module-level `WeakMap` keyed on the diagram, is refused for more than tidiness: a diagram is a value
and undo will be a stack of past ones, so a module quietly keyed on diagram identity becomes the one
thing in the editor holding every past diagram with no owner to say when it stops. `renderDiagram`
already takes this stance — *a redraw rebuilds* — and [the map](../map.md) has retired the question
of whether one can afford to.

It hands back **one map, `ReadonlyMap<ElementId, …>`, filled in ascending id** by
[ticket 01](./01-what-a-shaft-is.md)'s forward sweep, holding per element what that ticket fixed: the
shaft, its legs, and its [junction](../../../CONTEXT.md#junction). Insertion order is id order, so
the one value is both the lookup an arrival needs and the ordered list a backend draws from.
`ElementId = PathId | ArrowId` joins `AnchorId` in `diagram.ts`,
[element](../../../CONTEXT.md#element) being already the model's word for a path or an arrow.

**Data rather than an object with methods**: a shaft *is* its four points, and `at`, `nearest` and
`bounds` are free functions beside it. That keeps ticket 01's *one shaft* exactly as stated — the
flattening is a local inside `nearest` and there is nothing else to take — while matching the house
style, `src/` having no classes at all and `label-store.ts` being the one module that closes over
state, which it does because it *is* a store.

### What the backend is handed

**A diagram, which it resolves itself.** `renderDiagram(canvas, diagram)` and `drawDocument(diagram)`
keep their signatures and the TikZ emitter joins at that same door, which is the seam
[ADR 4](../../../docs/adr/0004-export-and-save-share-a-writer.md) already leans on. Threading a
resolution in as a second argument buys nothing and costs a bug class that otherwise cannot exist —
a caller handing a backend the resolution *of a different diagram*. The pairing is never forgeable
because it is never handed across a seam.

The drag needs no arrangement either: `resolve(current)` and `resolve(provisional)` have **different
inputs**, the hit-test having to find the target before the diagram containing the ghost can be
built. Two resolves per pointermove, two questions, and no shared result to contrive.

**The whole map, and shape rather than marks.** The ticket's *"a whole drawn diagram"* admits a
larger reading — a layer handing down finished primitives for a backend to ink — and it is declined:
that would pull trim, head size, dot radius and label offsets up across the seam ticket 01 drew,
where the shaft is untrimmed and shared and a backend may keep its head clear of a
[term-dot](../../../CONTEXT.md#term-dot)'s room however it likes. The layer derives shape; ink stays
wholly below it.

The **export frame** therefore does not move. `render-svg.ts` collects extents as the marks are made
because a label's origin needs its own metrics anyway, and `bounds(shaft)` is one more contribution
pushed in as a shaft is drawn. A frame is ink extents — walls stroked astride, glyph metrics, an
arrowhead's overhang — none of which the layer knows.

### One number is neither the model's nor a backend's

**The hit reach is `shape.ts`'s own** — how close a pointer must be to grab an element, the ~13 units
[ticket 01](./01-what-a-shaft-is.md) measured its flattening error against and the radius
[ticket 02](./02-fan-slots-arrival-slots-and-the-junction.md) reuses to decide a loop's release
landed on its anchor. It is not the model's: `DOT_ROOM` and `BOX_CLEARANCE` are, because both
backends must agree, and the TikZ emitter **has no pointer** to agree with. It is not the SVG
backend's: a backend owns ink, and a reach is not drawn. Passing it down into `anchorAt` would make
one caller answer for a constant it has no opinion about, and leave TikZ the only backend that never
supplies it.

So [ticket 02](./02-fan-slots-arrival-slots-and-the-junction.md)'s *the numbers are the model's or
the backend's, never loosely both* is stated over the numbers it had — every **shape** number is one
or the other. A number about **the pointer** is a third thing, owned by the layer that answers one,
and this is the first of them.

### Recorded as an ADR

**[ADR 6](../../../docs/adr/0006-shape-is-derived-above-the-diagram.md), "Shape is derived above the
diagram, below every backend."** It earns one on the test the existing five pass: it binds a module
that does not exist yet — the TikZ emitter's author must find, without reading this map, that they
consume `resolve` and derive nothing of their own — and it narrows a promise
[Diagram](../../../CONTEXT.md#diagram) was making.

Not an amendment to [ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md), though the
precedent exists. ADR 4's amendment clarified the same seam it had already drawn; ADR 2 is not
unclear here but **silent** — it settled that shape is derived, on the question of what a backend may
put in a model, and said nothing about who derives it because at that date nothing did.

[Curvature](../../../CONTEXT.md#shape) becomes **Shape** in the same act, amended in place rather
than joined by a second entry: [ticket 02](./02-fan-slots-arrival-slots-and-the-junction.md) had
already found the entry outgrowing its name.

### What this hands to other tickets

- [Ticket 04](./04-what-a-selection-is.md) gets `anchorAt` to compose with `boxAt`, and owns the
  precedence between them — an anchor beats the box it sits inside — along with the second ask, the
  target under a drag, which takes no box fallback.
- [Ticket 06](./06-naming-an-element.md) takes `at(shaft, t)` from `shape.ts`; where the
  [naming bar](../../../CONTEXT.md#naming-bar) is summoned is a call to it, converted by
  `toPagePoint` as a dot's already is.
- [Ticket 07](./07-what-the-model-refuses.md) is confirmed in its premise: `addPath` and `addArrow`
  need no geometry, which is *why* the seam sits where it does. A release on nothing is `anchorAt`
  answering nothing, before any transition is reached.
- The spec inherits the door: `resolve`, `at`, `nearest`, `bounds`, `anchorAt`, and the reach.
