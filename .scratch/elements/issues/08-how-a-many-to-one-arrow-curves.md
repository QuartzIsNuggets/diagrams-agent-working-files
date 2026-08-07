# How a many-to-one arrow curves

Type: grilling
Status: open

## Question

[Ticket 02](./02-fan-slots-arrival-slots-and-the-junction.md) runs a many-to-one
[arrow](../../../CONTEXT.md#arrow) along a **straight approach** from its inputs' centroid to its
output, puts the [junction](../../../CONTEXT.md#junction) at 45% of it, and draws straight legs from
each input to that junction. [Ticket 07](./07-what-the-model-refuses.md) found two drawings that
breaks, and committed the model to holding both:

- **`f a b = a`** — the output is among the inputs, at least one input distinct. The leg runs
  `a → junction` and the [shaft](../../../CONTEXT.md#shaft) runs `junction → a`: **one segment
  traversed both ways**, the leg drawn exactly under the shaft. The figure reads as an ordinary
  `b → a` arrow with a junction dot on it, and that `a` is also an input is invisible. This is the
  same silent overlap ticket 02 fixed once, one level down — that ticket generalised the
  [fan](../../../CONTEXT.md#fan)'s key to *the two points a shaft runs between* because two
  many-to-one arrows were "drawn exactly on top of each other — the one place the fan's promise that
  no two overlap failed silently".
- **`h a = a`** — every input is the output. The centroid *is* the output, so the approach is a zero
  vector: no direction, no junction, no shaft, **no ink at all**. The one element on the map with no
  drawing.

**The design to work out is the map owner's**, and the ticket exists to pin its numbers and its
edges rather than to choose it:

> Compute a many-to-one arrow's curvature as though it were a one-to-one element **from the centroid
> of its inputs to its output** — a *virtual curve*. Fan it and, where it needs one, bend it by a
> generalised loop; then spread that curving back onto the input legs. The shaft is the drawn tail
> of the virtual curve.

What that leaves open:

- **The trigger.** The bend is not always wanted — [Shape](../../../CONTEXT.md#shape) says an element
  alone between its two anchors is straight. Ticket 07 reads the trigger as **the output being among
  the inputs**, an identity test the model can state where a geometric one could not. Confirm, and
  say what happens when two *distinct* anchors resolve to the same point, which identity does not
  catch.
- **The generalised loop between two distinct points.** For `f a b = a` the virtual curve runs
  centroid → output with those two points distinct, so "loop" is the wrong word for it: what is
  wanted is a bow that carries the curve clear of the straight line, far enough that the self-input's
  leg reads as a chord across it. How far, in what direction, and against which numbers — ticket 02's
  fan step of 26 and its 50° splay are the two the drawing already has.
- **`h a = a`, where the two points coincide** and the bow becomes a loop proper. Ticket 07 gives it
  a stored `loopDirection` / `loopSize` on `Arrow`, so the mechanism is a self-path's; what is open
  is whether it is *literally* the self-path's derivation with a role hue and nothing else, and
  whether an arrow's loop carries a leg at all — the prototype's one-input branch draws none
  (`inputs.length <= 1` → `junction: null`, no legs).
- **Where the junction goes on a curve.** Ticket 02 fixes the shaft at 55% of the approach *stated
  from the drawn end*. On a bowed virtual curve that becomes 45% along the curve by its own
  parameter, which is [ticket 01](./01-what-a-shaft-is.md)'s reading of `labelT` and should be the
  same reading here — confirm, and say whether arc length ever has to be used instead.
- **How the curving spreads back to the legs.** Straight chords to a moved junction may be enough;
  ticket 02's reason for straight legs was that "a fork reads as a fork when its legs are straight",
  which the bow does not obviously spend.
- **How this composes with the fan.** A bowed virtual curve that is *also* in a fan takes two
  displacements. Say whether they add, whether the fan sees the bowed curve or the straight approach,
  and whether the grouping key of ticket 02 — `(input set, output)` — still keys the right thing.

Nothing here reopens what ticket 02 settled for arrows whose output is **not** among their inputs:
the arrival slot, the fan step, the shared legs of two arrows on one approach, and the accepted
collapse as an output nears its inputs' centroid all stand.

Resolve with `/grilling`; `/prototype` is available and the map's Note now expects it, the question
being how a figure reads.
