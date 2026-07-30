# Notation domain model

Type: grilling
Status: resolved

## Question

Pin down the **complete domain model** of the user's HoTT proof-diagram notation — the shared
vocabulary the editor's data model will be built on:

- **Boxes** (types / contexts) and **dots** (terms): what exactly can a box contain? Can boxes
  stand in relationships (the side-by-side grids in 2.6.5 were confirmed *incidental* — is
  there ever a meaningful spatial relation between boxes)?
- **Arrows — the full taxonomy:** the role-colors (black = path, red = in-theory function,
  green = built-in rule) — is that the complete set? Labels seen: `pr₁`, `pr₂`, `f*`, `ap_f`,
  `ap_g`, `pair=`, `Σ-intro`. **`refl`** has no special glyph — it's a black self-path (loop)
  labelled "refl" (the user notes this may change).
- **Equivalences (`≈`):** *not* a homotopy — an earlier reading of the diagrams got this wrong.
  A homotopy relates two arrows sharing both domain and codomain; the `≈` in 2.7.2 sits inside
  the lens formed by a **back-and-forth pair** of red arrows, and asserts they are mutually
  inverse — `qinv(pair=)`. So `≈` attaches to two arrows. How is it drawn / anchored? And how,
  if at all, are higher equalities *between paths* (2-paths) represented?

**Constraint — keep the model render-backend-agnostic.** No SVG-isms (pixel coordinates, DOM
nodes) may leak into the model: positions and curves must be expressed abstractly, because SVG
*and* TikZ both render from it ([output formats, ticket 07](./07-output-formats.md)). The
model is the single source of truth; renderers are additive.

Resolve with `/grilling` + `/domain-modeling`; write the resulting glossary to `CONTEXT.md`.
This is the natural next wayfinding session after the MVP proves the stack; several fog items
(theorem-highlight, persistence, arrow routing) hang off it.

## Answer

The glossary is in [CONTEXT.md](../../../CONTEXT.md); the two load-bearing decisions are
[ADR 1](../../../docs/adr/0001-diagram-draws-checking-layer-interprets.md) and
[ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md). What was settled:

**The diagram draws; a checking layer interprets.** The model records kinds, not mathematics —
type expressions stay opaque LaTeX. Typing-level facts (an equivalence's arrows are opposed;
∞-groupoid layers) live in a separate checking layer that reads a diagram and never draws one,
so a checker can be bolted on later. ADR 1.

**Arrows are many-to-one.** *n* inputs, exactly one output, flat rather than curried — a
function has one output. `Σ-intro` and `pair=` take two. The junction where inputs converge is
derived geometry with no identity: never placed, never labelled, never attached to.

**Anchors are {term-dot, path, arrow}**, recursively. A 2-path is an ordinary path between two
paths; `ap_g` targets a path. Π-types are objects of the theory and funext gives equalities
between them, so an arrow is as legitimate an endpoint as a dot. **Nothing attaches to a box** —
boxes are outside the anchor set entirely.

**Boxes** own their term-dots by recorded membership, not geometric inference. They never
overlap, never nest, and stand in no relationship to one another; the 2.6.5 grids are
incidental.

**Kind and role split apart.** Kind ∈ {path, arrow} — the difference between asserting an
equality and mapping a term, which is why a path needs no role. Role ∈ {in-theory function,
built-in rule}, on arrows only, and that set is complete. Role is recorded; **colour is each
backend's mapping**, since a hex triple in the model is the same class of leak as a pixel.

**Layers.** 2.6.5 is one theorem drawn twice: at layer 0 the 2-path is a path between two paths;
at layer 1 the identity types become boxes and their proofs become term-dots. Both are legal
drawings. One canvas holds one diagram at one layer — relating two drawings of the same theorem
is out of scope.

**Geometry** is abstract diagram units, y-up (SVG flips at its root), box positions absolute,
term-dot positions relative to their box. **Shape is derived, not stored**: a lone edge between
an anchor pair is straight, several fan into a lens. The self-path is the sole exception,
carrying its own direction and size. ADR 2.

**Conclusion is a property on the element** — a path, an in-theory function, or an equivalence,
never a built-in rule, which is meta-theoretic and cannot be derived within the theory. How it
is drawn is a backend's business, which unblocks
[ticket 05](./05-theorem-highlight-redesign.md) as pure visual design over a property that
already exists.

### Correction carried out during this session

The `≈` was recorded across the map, this ticket and `CONTEXT.md` as a **homotopy**. It is not:
a homotopy relates two arrows sharing both domain *and* codomain. `≈` marks that a back-and-forth
pair of arrows are mutually inverse — `qinv`. Corrected in all five places.

Two readings were also corrected against the drawings: 2.7.1's loop is labelled `p`, not `f`,
and the boxes in 2.7.1 and 2.7.2 do **not** overlap — green `Σ-intro` legs were misread as
turquoise box edges.
