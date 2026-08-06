# What a shaft is, and how one is resolved

Type: grilling
Status: open

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
