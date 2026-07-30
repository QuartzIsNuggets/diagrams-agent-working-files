# Theorem-conclusion highlight redesign

Type: prototype
Status: open
Blocked by: 04

## Question

The current convention — marking the proven statement **purple** — is (per the user) weak for
visual clarity. Design a better way to show *what a theorem proves* — e.g. the distinguished
path in 2.7.3 from `z` to the pair of its projections — so it reads clearly against arrows and
paths already carrying black, red and green.

**This is now pure visual design; no model change is needed.** The
[notation domain model](./04-notation-domain-model.md) settled **conclusion** as a *property* on
the element, with how it is drawn left entirely to the render backend
([ADR 1](../../../docs/adr/0001-diagram-draws-checking-layer-interprets.md)). Whatever this
ticket lands on, the model already carries it.

Two constraints the domain model fixes:

- The property belongs to a **path**, an **in-theory function**, or an **equivalence** — never a
  built-in rule, which is meta-theoretic. So the mark must work on all three shapes.
- It must survive both backends. A purple stroke is ink, and ink is per-backend — SVG picks a
  stroke, TikZ a style name. Anything relying on an SVG-only trick is out.

Three existing usages to beat, all purple: a line drawn **parallel** to the marked path (2.7.1),
an **underline** beneath it (2.6.5's `A'×B'`), and a **third wave** added under the `≈` glyph
(2.7.2). That the same convention has to stretch across a path, a line and a glyph is much of why
it reads weakly.

Resolve with `/prototype` — make a few concrete visual options to react to, rather than deciding
in the abstract.
