# Theorem-conclusion highlight redesign

Type: prototype
Status: resolved
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

## Prototype

Throwaway page in the code project: `../prototype-conclusion-mark.html` +
`../src/prototype-conclusion-mark/`. Run `pnpm dev` and open
`/prototype-conclusion-mark.html?variant=<key>`; `←`/`→` cycle, and a greyscale toggle stands in
for the print / TikZ side.

Five marks — `purple` (today), `halo`, `weight`, `qed`, `spotlight` — each applied to **four
carriers at once**: 2.7.3's path, 2.6.5's path-between-paths, an in-theory function already
carrying red, and 2.7.2's `≈` glyph.

Captured on the throwaway branch `prototype/conclusion-mark` in the code project. Nothing was
folded into the working code, because nothing there draws a path or an arrow yet — the decision
below is the whole deliverable.

## Answer

**The conclusion mark is a halo: the element's own geometry redrawn wide and pale *behind* it —
a highlighter swept along it.** Chosen as prototyped, `variant=halo`.

Why it beats the three purple usages:

- **It is one rule, not three.** The parallel line, the underline and the third wave are three
  different tricks because purple is *a stroke of its own* — and a stroke is precisely what a
  diagram of paths and arrows already means, so the mark competes with the notation it annotates.
  A halo re-uses the element's own geometry, so a path, a path between two paths, a red
  in-theory function and the `≈` glyph all take the identical treatment with no special case.
  The `≈` was the discriminator: it is the one carrier with no ends to bracket and no midpoint
  that reads as "along" anything.
- **It adds no line to mistake for an edge.** A wash sits behind the ink in a channel the
  notation does not otherwise use, so it cannot be misread as another path — which is exactly how
  2.7.1's parallel purple line fails.
- **Colour stays free.** The element keeps its own ink, so the mark does not collide with the
  hue channel that [role](../../../CONTEXT.md#role) already occupies. Conclusion and role are
  orthogonal properties and now sit in orthogonal channels.

Form, as prototyped and to be reproduced by any backend: the same geometry, stroke roughly **7×**
the element's own width, round caps, a warm low-saturation wash (`#f2b705` at 0.6 stroke-opacity
in the SVG prototype), painted **beneath all other ink** so crossing edges stay legible. The
casing is *derived* from the element's geometry, exactly as
[ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md) requires — it stores nothing
and needs no maintenance when an anchor moves.

Both backends carry it: SVG duplicates the path with a wider, translucent stroke placed first in
paint order; TikZ gets it from `preaction={draw, line width=…, <colour>, opacity=…}` on the same
path, so no SVG-only trick is involved. Per
[ADR 1](../../../docs/adr/0001-diagram-draws-checking-layer-interprets.md) the exact wash colour
stays each backend's own choice — what is settled here is the **form**, not the hex.

**Known caveat.** In greyscale the halo survives as a light grey casing, but much weaker than in
colour. That was checked in the prototype's greyscale toggle and accepted. If a monochrome print
target ever appears, the TikZ backend's wash may need to darken rather than the form change.
