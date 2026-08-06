# Where derived shape lives

Type: grilling
Status: open
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
- **Where a memo lives, given a diagram is a value.** [Ticket 01](./01-what-a-shaft-is.md)'s pass
  memoises, and a value has nowhere to hang a memo. Per redraw, per module, or per caller — and
  whether that makes the derivation a function or an object.
- **What the backend is handed.** A shaft per element, or a whole drawn diagram; whether the
  backend asks for one element's geometry or is given the lot; and how much of the
  *trimmed-versus-untrimmed* split from [ticket 01](./01-what-a-shaft-is.md) is the backend's.
- **Whether the answer earns an ADR.** [ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md)
  established that shape is derived and said nothing about who derives it; this is the same class of
  decision as [ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md) and
  [ADR 4](../../../docs/adr/0004-export-and-save-share-a-writer.md), and it binds the TikZ emitter
  that does not exist yet. Decide whether it is written down as one.

Resolve with `/grilling`, `/domain-modeling` for whatever term the answer needs, and
`/codebase-design` for the seam itself.
