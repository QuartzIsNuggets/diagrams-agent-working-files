# What a shaft is, and how one is resolved

Type: grilling
Status: resolved

## Question

[ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md) says an element carries no shape
of its own, so every consumer that needs one derives it. What none of them can do is derive a
*different* one: the shaft a pointer hits, the shaft an arrival lands on, the shaft the SVG backend
strokes, the shaft a `labelT` is measured along and the shaft TikZ will emit have to be one shaft.

So: **what is a shaft, as a value, and by what pass is one worked out?**

The representation and the resolution are one question rather than two, because each fixes the
other. A sampled polyline makes projection and *walk to `t`* trivial and makes a Bézier control point
something TikZ has to recover; a curve stated analytically emits straight to TikZ and makes every
hit-test a root-find. And the pass is what makes the choice bite: an arrival lands on the line its
target is *actually drawn* along, so resolving one shaft means resolving the shafts it stands on
first, and under `spread` a target's own shape shifts as arrivals are added to it.

What the answer has to cover:

- **The value.** Sampled polyline, quadratic Bézier, something parameterised. How `labelT` is read
  off it — the [diagram model](../../diagram-model/spec.md) recorded *the derived curve's own
  parameter rather than its arc length* as assumed, never decided, and noted that both backends must
  read it the same way once symmetric fan bows stop making the two indistinguishable.
- **How a point is found on it**, since [ticket 06](./06-naming-an-element.md) needs a point and a
  tangent at `labelT`, and the hit-test needs the nearest point and its distance.
- **The pass.** [Ticket 09](../../initial-planning/issues/09-targeting-anchors.md) already fixes its
  shape — one memoised pass, resolving recursively, with a cycle guard for two elements each landing
  on the other. What is open is what the guard *does* when it fires: the prototype falls back to a
  rough approximation, which is a drawing that disagrees with itself. [Ticket 07](./07-what-the-model-refuses.md)
  may instead make the cycle unmakeable, and then the guard is a bug detector rather than a
  fallback.
- **Trimmed or untrimmed — and whether one shaft is really two.** The prototype pulls each end back
  by a gap before drawing, so a head stops short of the dot it points at; arrivals attach to the
  *untrimmed* curve; the hit-test runs against the trimmed one. That gap is measured off
  `DOT_RADIUS`, which is the backend's own number and not the model's, so if the derived shaft is
  shared then the trim cannot be part of it — and hit-testing and attaching then disagree by
  construction. Either the shared value is untrimmed and each backend trims, or the trim is
  expressed in something the model does own (`DOT_ROOM`), or the two really are different curves and
  the answer says which question each one answers.

A [self-path](../../../CONTEXT.md#self-path) is the one shape a drawing stores, and the only element
whose shaft is not derived from two anchor positions. Whatever the answer is has to hold one.

Resolve with `/grilling` and `/domain-modeling`. The prototype's
`src/prototype-targeting-anchors/geometry.ts` (branch `prototype/targeting-anchors`, commit
`c7f08bc`) is a working draft of all of this — sampled polylines at 24 samples, `pointAlong`,
`projectOnto`, a memoised `Pass` with a `resolving` set — to be argued with rather than adopted.

This ticket does **not** settle where the code lives; that is
[ticket 03](./03-where-derived-shape-lives.md), and it is deliberately downstream, since a seam is
sited knowing what crosses it.

## Answer

**A shaft is a cubic Bézier: four points in diagram units.** One form covers every element, so no
consumer carries a case analysis: a straight element puts its controls on the chord, an element in a
[fan](../../../CONTEXT.md#fan) offsets them, a [self-path](../../../CONTEXT.md#self-path) splays
them about its `loopDirection`. Both backends emit it natively — SVG `C`, TikZ `..controls..` — and it is
closed under subdivision, so a piece of a shaft is a shaft.

**A shaft answers three questions, and the flattening it uses is never handed out.**

| | | |
| --- | --- | --- |
| `at(t)` | point and tangent | de Casteljau, exact |
| `nearest(p)` | point and distance | flatten to 16, project, discard the samples |
| `bounds()` | extent | exact, from where the derivative vanishes |

Sixteen samples put the flattened polyline within 0.56 units of the true curve at worst — a size-80
loop, the most curved thing drawn — against a hit-test reach of ~13 units, so it moves where a grab
begins by about 2%. No adaptive subdivision is needed for the shapes made here. The polyline stays
private to `nearest`: the ticket's *one shaft* is enforced by there being nothing else to take.

**`labelT` is the curve's own parameter** — a fraction of the journey, not of the ink. This settles
what [the diagram model](../../diagram-model/spec.md) recorded as assumed and never decided, and
corrects the prototype, whose `pointAlong` walks the polyline by length. The two readings agree
exactly at the 0.5 default and on every straight element, and diverge only for an off-centre label
on a bend: 1.6 units on a 26-aside bow, 5.8 on a 52-aside one, 12.3 a quarter of the way round a
size-40 loop. The parameter is closed-form in both backends, where arc length has none for a cubic
and would oblige SVG and TikZ to share a tolerance to place a label in the same spot. (Likely a
third argument, unverified: PGF's own `pos=` along a curve places by the curve's time parameter, so
the emitter may get this for free. Confirm against the PGF manual before the spec leans on it.)

**A shaft is the main run only.** Junction to output for an [arrow](../../../CONTEXT.md#arrow), `a`
to `b` for a [path](../../../CONTEXT.md#path) — exactly the run the model's `labelT` already names.
The legs of a many-to-one arrow sit beside it as cubics of the same type, so the resolved value is a
shaft, its legs, and its [junction](../../../CONTEXT.md#junction). An arrival lands on the shaft and
never a leg, which keeps *never attached to* true of the junction's whole approach; hit-testing
covers legs too, since grabbing an arrow by a leg is grabbing the arrow.

**The shaft is untrimmed, and the trim is not a shaft concept.** It runs anchor point to anchor
point and every consumer reads that one value — arrivals, hit-test, `labelT`, extents. The gap
exists for one reason only, that a head landing on a [term-dot](../../../CONTEXT.md#term-dot) would
otherwise be drawn over it, and a backend may reach it however it likes: pull the curve back, inset
the marker, paint dots last. What the spec fixes is the distance, and it costs no new number —
**a shaft's ink stops clear of `DOT_ROOM`, at every end that is a term-dot, head and tail alike, and
nowhere else.** A head landing on an element touches the line it points at, there being no disc to
clear. Both ends are gapped so that one invariant holds: *nothing but a dot is ever drawn inside a
dot's room*, and neither backend then depends on draw order to look right. Because trimming a cubic
is exact subdivision, what a backend strokes lies on the shared shaft — truncation, never a second
derivation.

**The pass is a forward sweep in ascending id.** One id space is shared across all five sorts
(`src/diagram.ts:44`), spent in creation order and never reused, and an element can only anchor onto
anchors that already exist — so **an element's anchor ids are strictly smaller than its own**.
Nothing re-anchors an element afterwards, retargeting being out of this map's scope. The elements
therefore resolve in one linear walk over the merge of the two already-sorted arrays: when an
element's turn comes, everything it stands on is already resolved.

This replaces what [ticket 09](../../initial-planning/issues/09-targeting-anchors.md) handed down.
There is no recursion, so no memo bookkeeping — the map is simply filled in order — and no cycle to
guard against: the anchor relation points backwards in time by construction, so a cycle is not
something to detect but something that cannot be built. The prototype's `roughPoint` and
`roughShaft` delete outright, along with the `nearest` hint they also fed. The invariant is the model's and is
stated as such; if a loader ever admits a diagram from outside, upholding it is the loader's job and
not the pass's.

**A self-path is a cubic with both ends on its anchor**, its controls splayed either side of
`loopDirection` — the first at `loopDirection + splay` and the second at `loopDirection − splay`, an
ordering [ticket 06](./06-naming-an-element.md) makes load-bearing: it is what puts the curve's left
at its midpoint outside the loop rather than back on the anchor, which is the side a new element's
label defaults to. `loopSize` is **how far the loop reaches from that anchor** — the distance to the
far tip, which is genuinely the farthest point of the curve for any splay under about 50°. The splay
is a fixed constant of the derivation rather than a stored field, so loops are self-similar and
`loopSize` scales one whole; the control reach is derived from it. The two readings are exactly
interchangeable — `tip = 0.75 · cos(splay) · reach`, one multiply apart — so what decides it is
meaning rather than arithmetic: a control reach is a term of *this* representation, which is this
ticket's choice and not the model's, where a reach means the same under any representation and reads
plainly in a saved file. It also ages better: retuning the splay leaves every saved loop's tip where
it is and changes only its width.

That generalises into the rule the spec carries: **every shape number stated is a visible one —
where the ink lands — and control points are always derived from it.** A fan bow's apex obeys it as
much as a loop's reach.

### What this hands to other tickets

- [Ticket 02](./02-fan-slots-arrival-slots-and-the-junction.md) gains the self-path's **splay
  angle**, a number about how a loop looks and so at home with the loop defaults, and inherits the
  visible-number rule above for the fan bow's apex.
- [Ticket 07](./07-what-the-model-refuses.md)'s **cycle** case dissolves: it is neither a refusal
  nor a thing to make unmakeable, being unreachable by construction. It stays named there as
  not-refused, per that ticket's own closing rule.
- [Ticket 06](./06-naming-an-element.md) takes its point and tangent from `at(t)`.
- [Ticket 03](./03-where-derived-shape-lives.md) sites all of it, with no memo to place and the
  untrimmed/trimmed split already settled.
