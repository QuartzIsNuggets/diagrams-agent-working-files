# Drawing onto an anchor that is itself an edge

Type: prototype
Status: open

## Question

[Ticket 04](./04-notation-domain-model.md) settled that an **anchor** is a term-dot, a path
*or* an arrow — a path may run between two paths (2.6.5's `A'×B'`), and `ap_g` targets a path.
That makes the drawing gesture non-obvious in a way it never was for dots alone:

- **Targeting.** How do you aim at a path when a term-dot sits at each of its ends and other
  edges cross it? A dot is a point and easy to hit; an edge is a thin curve in a crowded
  drawing.
- **Where it lands.** An edge-to-edge path attaches to the *element*, not to a point on it — the
  2-path in `A'×B'` runs between two paths, and the model stores no position on them. So where
  does the renderer put the join, and does the user get any say?
- **Many-to-one.** `Σ-intro` and `pair=` take two inputs and one output
  ([ADR 1](../../../docs/adr/0001-diagram-draws-checking-layer-interprets.md)). What is the
  gesture — pick inputs then output, or draw a leg at a time and merge? The junction is derived
  and has no identity, so it cannot be placed.
- **Equivalence.** `≈` attaches to two opposed arrows symmetrically. Is it drawn, or asserted by
  selecting the pair?

Resolve with `/prototype` — make a rough interactive stub and react to it, rather than deciding
gestures in the abstract. Selection, move, undo/redo and canvas navigation stay out of this
ticket; it is only about *creating* an edge onto an anchor.
