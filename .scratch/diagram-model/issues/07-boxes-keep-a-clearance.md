# 07 — Boxes keep a clearance

**What to build:** Air between boxes. Two boxes never come to rest with their walls flush: each
carries a **clearance** it keeps clear of every other, so a box pushed aside stops that much short
of the one that pushed it and a box that near a neighbour is already in the way.

The whole of it is what *"in the way"* means. [Ticket 02](./02-the-box-gesture.md) settled that a
box needing space another holds pushes it aside rather than being refused, and
[ticket 03](./03-boxes-on-the-canvas.md) built that rule around a single measurement of how deeply
two boxes overlap. Widening that measurement is the feature: every rule reading it — whether a
diagram has settled, which boxes a grower displaces, how far each goes — takes the clearance with
it and none of them has to name it.

**Blocked by:** [03](./03-boxes-on-the-canvas.md).

**Status:** resolved

- [x] Two boxes never come to rest touching: a box pushed aside stops a clearance short of the box
      that pushed it
- [x] A box merely near a neighbour is in the way, so the clearance is kept as room is made rather
      than only checked at the end
- [x] The clearance is the model's, in [diagram units](../../../CONTEXT.md#diagram-unit), and no
      [render backend](../../../CONTEXT.md#render-backend) names it or draws it
- [x] Which axis a box gives way along is what it was, the clearance falling on both axes alike
- [x] Nothing else the rule promises changes: the grower still never moves, creation is still never
      refused, and a cascade still settles
- [x] Tested purely — no DOM, no faked layout — with the rule asserted against the clearance rather
      than against the number it currently holds

`BOX_CLEARANCE` enters `diagram.ts` at the one function measuring a pair of boxes, which is
therefore renamed: `overlapOf` became `shortfallOf`, since what it returns is no longer an overlap —
two boxes 5 units apart overlap by nothing and still fall short. `crowded`, `sweepFrom` and
`displace` were not otherwise touched, which is the claim the ticket was worth making.

**A cycle came out of it.** The tight grid in `diagram.test.ts` stopped settling: a box pushed
*exactly* onto another leaves the pair no direction to come apart in, and the fallback sent both the
same way — `+x` — which drove the second back into the grower, which pushed it out again, forever.
The bound in `SETTLING_SWEEPS` then returned a diagram with one box sitting on another. This was
always reachable; a clearance made coincidence common enough to hit it on the first tight drawing.
The tie now breaks outward from the grower, which is what
[ticket 03](./03-boxes-on-the-canvas.md)'s *"every displacement is outward"* claimed all along and
did not have. 500 randomly drawn diagrams and the grid both settle, and the cycle has a test of its
own rather than being left to whichever fixture happened to catch it.

## Choices

- **One number between a pair, rather than a margin each box carries** — a box's extent stays
  exactly what the user dragged and what a backend draws, and nothing has to explain why a box
  reports one size and occupies another. The alternative — inflating each box by half a clearance —
  is the same arithmetic with a second, invisible extent in the model to keep in step with the
  first, and it would have put a fictitious number in front of the hit test, the export frame and
  the saved file.
- **The clearance is the model's, not the SVG backend's** — it joins a term-dot's minimum separation
  under one claim in [the spec](../spec.md): how far apart marks stand is meaning, and how they are
  inked is not. A drawing whose boxes crowd on screen and breathe in TikZ would be two drawings. It
  is what makes the number safe to *pin* in a test, too, which is where the cycle surfaced.
- **12 diagram units, and a placeholder** — it is the room between two boxes at the scale a
  gesture makes them, about half the height of a label. Nothing yet argues for a value; the spec's
  list of unset numbers is where it waits.
- **The direction still comes from the pusher, and only the tie comes from the grower** — taking
  every direction from the grower would drive a box lying between the grower and the box shoving it
  further into that box. The pusher is what makes each single displacement resolve, and outward from
  the grower is what makes the sequence of them terminate; the fallback needs both, in that order.
- **The sweep bound stays** — the cycle this ticket removed was one a rule could have been proved
  free of, and finding it does not make the next packing safe. `SETTLING_SWEEPS` is still what keeps
  a rule the model runs from failing to come back.

## What this amends

- **[Ticket 02](./02-the-box-gesture.md)** — *"by exactly that overlap"* is now by exactly the
  shortfall, which leaves a clearance rather than a shared edge. Its *"whichever axis needs least"*
  and its *"nothing about making a box is refused for overlap"* stand unchanged.
- **[Ticket 03](./03-boxes-on-the-canvas.md)** — its *"every displacement is outward"* was the
  reason given for the cascade terminating and was not true of two boxes on one centre. It is true
  now.
- **[`CONTEXT.md`](../../../CONTEXT.md#box)** — Box: the space a box needs is its extent and a
  clearance around it.
- **[The spec](../spec.md)** — the clearance joins the numbers still unset, and the claim that the
  model owns how far marks stand apart now carries this ticket beside
  [04](./04-term-dots-in-the-model.md).
