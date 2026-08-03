# 08 — A term-dot keeps inside its box

**What to build:** A [term-dot](../../../CONTEXT.md#term-dot) whose ink stays inside the box holding
it. Plop one against a wall today and it lands: the release point is inside the box, so the model
takes it, and the dot is then drawn straddling the wall — a term half outside its type, which is the
one thing [02](./02-the-box-gesture.md) made unrepresentable and this draws anyway.

What is wrong is that the release is tested as a *point*. [04](./04-term-dots-in-the-model.md)
already knows a dot is not one — it refuses a release too near another dot — but that room is owned
as a **separation between two dots**, which has nothing to say about a wall. So the fix is to own it
as the room *one* dot keeps about its place: two dots' rooms not overlapping is the separation rule
unchanged, and a dot's room lying inside its box is the rule that is missing. One primitive, two
rules — disjointness and containment — and the `/ 2` the SVG backend writes to get a dot's radius
stops being a correction it makes for the model naming the wrong quantity.

The rule refuses rather than making room, as every rule about a dot does: a dot lands where the
button came up ([the plop](../../../CONTEXT.md#plop)) or does not land, where it is boxes that push
each other aside ([07](./07-boxes-keep-a-clearance.md)). Nothing about the numbers changes — the room
is half today's separation, so no drawing that was legal becomes illegal except in the band inside a
wall — and no dot already placed can be made illegal later, dots being held relative to their box's
centre and a box only ever growing.

**Not in scope:** a dot's *label* may still overhang the wall, and a dot may still be plopped under
the box's own label. Both need a glyph run measured, which only a backend can do, so a rule about
them would have to cross that seam the way a box's floor does. Left until a drawing argues for it.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] A dot released too near a wall to fit inside the box is refused, and the refusal says so
- [ ] The refusal is its own reason beside the one for a dot too close to another dot: containment
      and disjointness are two rules, and the shell words each
- [ ] The model owns the room a dot keeps about its place, in
      [diagram units](../../../CONTEXT.md#diagram-unit), and both rules read off that one number —
      neither a separation nor a wall distance is carried beside it
- [ ] A release exactly a room inside a wall lands, as a release exactly two rooms from another dot
      does: touching is clear, on both rules alike
- [ ] The [render backend](../../../CONTEXT.md#render-backend) draws a dot no larger than its room,
      taken from the model's number and not halved on the way
- [ ] What [04](./04-term-dots-in-the-model.md) promised is unchanged: the same releases refused for
      the same dots, and the model still names no size
- [ ] Tested purely — no DOM, no faked layout — with each rule asserted against the room rather than
      against the number it currently holds, and the wall band tested at a corner as well as a side

## What this amends

- **[Ticket 04](./04-term-dots-in-the-model.md)** — its *minimum separation* is the room a dot keeps,
  and *"a dot is drawn at half of it"* is a dot drawn at it. Its refusal is now one of two.
- **[`CONTEXT.md`](../../../CONTEXT.md#term-dot)** and **[the spec](../spec.md)** already read this
  way — Term-dot on room and containment, Box's cross-reference, Plop's refusals, and the room in the
  numbers still unset. Nothing further is owed them.

## Choices
