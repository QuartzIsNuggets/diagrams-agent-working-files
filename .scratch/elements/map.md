# Wayfinder map — Elements

<!-- wayfinder:map — the canonical map for this effort. Child tickets live in ./issues/. -->

## Destination

An [element](../../CONTEXT.md#element) can be drawn. A [path](../../CONTEXT.md#path) or an
[arrow](../../CONTEXT.md#arrow) is made by a gesture, held in the
[diagram](../../CONTEXT.md#diagram), and drawn by the SVG
[render backend](../../CONTEXT.md#render-backend) on screen and into an
[export](../../CONTEXT.md#export) — many-to-one arrows, elements standing as anchors,
[fans](../../CONTEXT.md#fan), [self-paths](../../CONTEXT.md#self-path) and element labels included.

The map ends at a **spec**: `./spec.md` and its implementation tickets, handed to `/implement` the
way [the diagram model](../diagram-model/spec.md) and [the naming bar](../naming-bar/spec.md) were. What
it resolves is what that spec would otherwise have to invent.

## Notes

- **The gestures are already decided**, by
  [Drawing onto an anchor](../initial-planning/issues/09-targeting-anchors.md): drag from anchor to
  anchor, the nearest candidate winning silently; number keys `1`–`3` choosing kind and role;
  many-to-one by shift-click accumulation; an arrival landing in an evenly spaced `spread` slot.
  Nothing here re-opens that. Two constraints it handed the renderer survive it: an arrival resolves
  against the shaft its target is actually drawn along and never an approximation of one, which
  [What a shaft is](./issues/01-what-a-shaft-is.md) holds with a single untrimmed value and a
  forward sweep, needing neither the memo nor the cycle guard that ticket foresaw; and a fan slot
  must ignore direction, or an opposed pair lands on one line, which binds
  [ticket 02](./issues/02-fan-slots-arrival-slots-and-the-junction.md).
- **Location decides, mode qualifies, and the mode persists.** A press on empty canvas is still a
  box and a press inside one still a [term-dot](../../CONTEXT.md#term-dot), whatever the mode —
  [Plop](../../CONTEXT.md#plop)'s rule is untouched. The mode says only *which* element a press on
  an [anchor](../../CONTEXT.md#anchor) draws, it survives the gesture that spends it, and a piece of
  chrome shows it ([ticket 05](./issues/05-how-the-mode-is-shown.md)).
- **The model already types all of it.** `Path`, `Arrow`, `Equivalence`, `AnchorId`, `labelT` /
  `labelSide` and the self-path `Loop` pair are in `../../../src/diagram.ts` and have been since
  [the schema](../diagram-model/issues/01-diagram-schema.md) — typed on paper, constructed by
  nothing. This effort does not design the model; it builds what makes those rows.
- **The prototype is the working answer to much of [ticket 02](./issues/02-fan-slots-arrival-slots-and-the-junction.md).**
  Branch `prototype/targeting-anchors`, commit `c7f08bc`, in the code project:
  `src/prototype-targeting-anchors/geometry.ts` derives fan, spread and junction; `render.ts` carries
  the ink. Read it before grilling that ticket — it is a draft to be argued with, not a decision. Its
  sampled polylines and its recursive pass are superseded by
  [What a shaft is](./issues/01-what-a-shaft-is.md).
- **The ink is settled and is not map material.** The spec adopts the prototype's element ink
  as-is — role hues `#c0392b` (in-theory) and `#2e7d32` (built-in), the `M0 0 L10 5 L0 10 z` head at
  `markerWidth 7`, shaft weight `1.6`, junction dot `r 2.5` — measured against the `DOT_RADIUS 5`
  both drawings share. That the [role](../../CONTEXT.md#role)'s ink is the backend's and the
  meaning the model's is unchanged.
- **Skills to consult each session:** `/grilling` + `/domain-modeling` by default; `/prototype` for
  [ticket 05](./issues/05-how-the-mode-is-shown.md), which is the one question about how something
  looks.
- **Where things live:** read and change code three directories up (`../../../`, the `diagrams`
  repo); every agent artifact stays here.

## Decisions so far

<!-- index — one line per resolved ticket; zoom the link for detail -->

- [What a shaft is, and how one is resolved](./issues/01-what-a-shaft-is.md) — a cubic Bézier,
  untrimmed and shared by every consumer, answering point-and-tangent at `labelT` read as the
  curve's own parameter, nearest point, and its own extent; resolved by one forward sweep in id
  order, an element's anchors always being older than it.

## Not yet specified

<!-- fog toward the destination — in scope, not yet sharp enough to fully ticket -->

- **What the [checking layer](../../CONTEXT.md#checking-layer) would say about an element.** A label
  unsuited to its endpoints, an arrow whose inputs make no sense at its
  [level](../../CONTEXT.md#level) — the wrong drawings, as against the meaningless ones
  [ticket 07](./issues/07-what-the-model-refuses.md) makes unrepresentable. Whether any of it
  belongs to this destination at all is open; the seam is
  [ADR 1](../../docs/adr/0001-diagram-draws-checking-layer-interprets.md)'s and is not in question.

## Out of scope

- **The [equivalence](../../CONTEXT.md#equivalence) and its mode `4`.** An `≈` is not an element —
  no label, no direction, no anchors of its own — and its gesture presupposes two arrows already on
  the page. It is cheap to add once the derived geometry exists, which is what this effort builds,
  so it returns as a following effort rather than doubling this map's surface.
- **The [conclusion](../../CONTEXT.md#conclusion) and its [halo](../../CONTEXT.md#halo).** A
  property no gesture yet sets, whose drawing was designed in
  [ticket 05](../initial-planning/issues/05-theorem-highlight-redesign.md) and would drag that
  design in behind it. Same argument, same following effort.
- **Moving, deleting or undoing an element**, and anything a selection could be told to *do*. This
  effort needs a selection only to feed a gesture ([ticket 04](./issues/04-what-a-selection-is.md));
  the rest is the initial-planning map's own fog, *Interaction / UX beyond creating an edge*.
- **Hand-adjusting a self-path's loop.** The model stores `loopDirection` and `loopSize` and
  [ticket 02](./issues/02-fan-slots-arrival-slots-and-the-junction.md) gives a new one its defaults.
  What lets a user change them afterwards is a move interaction, and goes with the bullet above.
- **The TikZ emitter.** Deferred past the MVP on the initial-planning map. It is the second consumer
  every ticket here is designed against, and it builds nothing.
- **Whether a redraw can still afford to rebuild.** Charted as fog on the premise that recursive
  shaft resolution would be the first thing making a redraw cost more than the marks on screen.
  [What a shaft is](./issues/01-what-a-shaft-is.md) removed the premise — the resolution is one
  linear sweep — leaving only the keyed diff itself, which
  [the diagram model](../diagram-model/spec.md) records as waiting on dragging, a move interaction
  already out of scope above.
- **[Fan](../../CONTEXT.md#fan) ordering under an equivalence** — which slot an element takes when
  an `≈` marks two of a wide fan. Fog on the [initial-planning map](../initial-planning/map.md),
  and out of reach here for the same reason the equivalence is.
