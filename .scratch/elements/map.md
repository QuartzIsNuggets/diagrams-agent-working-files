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
  Nothing here re-opens that — though one press it left doubly claimed had to be settled, the bare
  click on an anchor that [ticket 02](./issues/02-fan-slots-arrival-slots-and-the-junction.md) had
  also spent on a `refl`: it is the [selection](./issues/04-what-a-selection-is.md)'s, and a loop
  needs a drag clear of its anchor and back, so two click-made loops can no longer coincide and
  `loopDirection`'s default of 0 survives only for a `Loop` no gesture made. Two constraints it
  handed the renderer survive it: an arrival resolves
  against the shaft its target is actually drawn along and never an approximation of one, which
  [What a shaft is](./issues/01-what-a-shaft-is.md) holds with a single untrimmed value and a
  forward sweep, needing neither the memo nor the cycle guard that ticket foresaw; and a fan slot
  must ignore direction, or an opposed pair lands on one line, which binds
  [ticket 02](./issues/02-fan-slots-arrival-slots-and-the-junction.md).
- **Location decides, mode qualifies, and the mode persists.** A press on empty canvas is still a
  box and a press inside one still a [term-dot](../../CONTEXT.md#term-dot), whatever the mode —
  [Plop](../../CONTEXT.md#plop)'s rule is untouched. The mode says only *which* element a press on
  an [anchor](../../CONTEXT.md#anchor) draws, it survives the gesture that spends it, and a piece of
  chrome shows it ([ticket 05](./issues/05-how-the-mode-is-shown.md)). Its keys go deaf while a
  [naming bar](../../CONTEXT.md#naming-bar) asks, along with Escape and everything else the canvas
  listens for — the bar is as deaf as it is still
  ([ticket 04](./issues/04-what-a-selection-is.md)).
- **The model already types all of it.** `Path`, `Arrow`, `Equivalence`, `AnchorId`, `labelT` /
  `labelSide` and the self-path `Loop` pair are in `../../../src/diagram.ts` and have been since
  [the schema](../diagram-model/issues/01-diagram-schema.md) — typed on paper, constructed by
  nothing. This effort does not design the model; it builds what makes those rows.
- **The prototype's geometry is spent; only its ink survives.** Branch `prototype/targeting-anchors`,
  commit `c7f08bc`, in the code project: `src/prototype-targeting-anchors/geometry.ts` fell to
  [ticket 01](./issues/01-what-a-shaft-is.md), which replaced its sampled polylines and recursive
  pass, and to [ticket 02](./issues/02-fan-slots-arrival-slots-and-the-junction.md), which replaced
  its fan, spread and junction. `render.ts` is what is still worth reading.
- **The ink is settled and is not map material.** The spec adopts the prototype's element ink with
  one correction — role hues `#c0392b` (in-theory) and `#2e7d32` (built-in), the
  `M0 0 L10 5 L0 10 z` head at `markerWidth 7`, shaft weight `1.6`, junction dot `r 2.5`, measured
  against the `DOT_RADIUS 5` both drawings share, but a [path](../../CONTEXT.md#path) carries that
  same head rather than the prototype's headless shaft and end ticks, its direction being the whole
  of what separates `p` from `p⁻¹` on the page. A departing end that lands mid-shaft therefore reads
  no differently from a crossing, which is accepted. That the [role](../../CONTEXT.md#role)'s ink is
  the backend's and the meaning the model's is unchanged.
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
- [Fan slots, arrival slots, and the junction](./issues/02-fan-slots-arrival-slots-and-the-junction.md)
  — a fan steps a fixed 26 aside per slot, signed by the group's anchor order and grouped by the two
  points a shaft runs between, which puts many-to-one arrows in one too; arrivals take the
  `(i+1)/(n+1)` partition of the whole shaft, one slot per point an element needs on it, a drag ghost
  previewed by giving it the id it is about to get; a shaft is 55% of its approach with straight
  legs; and a loop splays 50° at a default reach of 30, pointing wherever the drag last did.
- [What a selection is](./issues/04-what-a-selection-is.md) — the ordered anchors a later gesture
  draws from, a [Selection](../../CONTEXT.md#selection) in the glossary and a value in `selection.ts`
  held on `Shell`; **only a gesture that comes to something changes one**, so a failed gesture costs
  nothing and the spend rides with the assignment that puts the mark in the diagram, never with
  `lands`. A bare click on an anchor selects and a loop needs a drag clear of that anchor's own
  reach and back, which is the canvas's only threshold and no new number; sources are the selection
  plus the drag's start, the target is the release, and the mode says whether they merge; Escape
  clears it and the canvas is as deaf as it is still while a bar asks.
- [Where derived shape lives](./issues/03-where-derived-shape-lives.md) — a module above the model,
  `shape.ts`, on the rule that a derivation lives in the model exactly when a model rule depends on
  it; `resolve(diagram)` is pure and holds nothing, a backend takes a diagram and resolves it
  itself, `boxAt` stays behind while the anchor hit-test moves up, and the pointer's own reach is
  the layer's number rather than the model's or a backend's. Written down as
  [ADR 6](../../docs/adr/0006-shape-is-derived-above-the-diagram.md).

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
