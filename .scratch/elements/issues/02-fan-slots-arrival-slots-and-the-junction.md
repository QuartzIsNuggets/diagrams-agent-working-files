# Fan slots, arrival slots, and the junction

Type: grilling
Status: open
Blocked by: 01

## Question

[Ticket 01](./01-what-a-shaft-is.md) says what a shaft is. This one says **where each element's
shaft is put**, which is the whole of what `Curvature` means now that no element stores a shape:

- **The [fan](../../../CONTEXT.md#fan) slot.** Every element sharing the same two anchors bows apart
  so no two overlap. Open: how wide a step, whether the step is fixed or divides a fixed span, and
  **which slot each element takes** — id order is the obvious answer and the only one this effort
  needs, fan ordering under an equivalence being fog on the
  [initial-planning map](../../initial-planning/map.md). The constraint
  [ticket 09](../../initial-planning/issues/09-targeting-anchors.md) inherited: grouping *and* the
  slot must ignore direction, because a bend applied along an element's own normal puts a reversed
  element on the mirrored side, and an opposed pair then lands on one line instead of either side of
  it.
- **The arrival slot.** `spread` is settled — one evenly spaced slot per arrival along the target,
  ordered by id, reserved rather than contended for. Open: the arithmetic. Whether the slots span
  the whole shaft or an inset run of it (the prototype clamps `nearest` to `0.18–0.82` and leaves
  `spread` unclamped, so an arrival can land where a head is drawn); what an element *not yet made*
  is previewed at, the drag ghost having no id to sort by; and whether a target's own ends count
  as taken.
- **The [junction](../../../CONTEXT.md#junction).** Derived, unplaceable, nameless. Open: where it
  goes — the prototype puts it a fixed fraction of the way from the inputs' centroid to the output —
  and whether a many-to-one arrow's legs bow at all, given it joins no fan.
- **A new [self-path](../../../CONTEXT.md#self-path)'s loop.** `loopDirection` and `loopSize` are
  stored, and no gesture sets them; a drag that starts and ends on one anchor has to supply both.
  Open: what a `refl` at a term-dot gets by default, and whether the drag's own shape says anything
  (the release point is somewhere, and the gesture knows where the pointer went) or whether the
  defaults are fixed and hand-adjusting them is the later effort this map rules out of scope.

Each of these is small; they ride together because they are the same act — turning *which anchors*
into *where the ink goes* — and because splitting them would have three sessions each re-deriving
[ticket 01](./01-what-a-shaft-is.md)'s pass.

Two rules bind every answer. **The numbers are the model's or the backend's, never loosely both**:
how far apart a drawing holds two elements between the same anchors is the same claim on screen and
in TikZ, the way `BOX_CLEARANCE` and `DOT_ROOM` are, where a stroke's weight is not — say which each
number is, as [`DOT_ROOM`](../../../CONTEXT.md#term-dot) already does. And **nothing here may be
stored**: a fan slot recomputed when an anchor moves is what
[ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md) bought.

Resolve with `/grilling`. The prototype's `geometry.ts` has a working draft of all four —
`FAN_STEP 26`, `JUNCTION_T 0.45`, `DOT_GAP 10`, and no self-path at all, which is the gap in it.
