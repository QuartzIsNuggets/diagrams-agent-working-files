# Notation domain model

Type: grilling
Status: open

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
- **Homotopies (`≈`):** a homotopy holds *between two functions* (HoTT: `∏(x) f(x) = g(x)`) —
  **not** between paths — so `≈` connects two function-arrows. How is it drawn / anchored? And
  how, if at all, are higher equalities *between paths* (2-paths) represented?

**Constraint — keep the model render-backend-agnostic.** No SVG-isms (pixel coordinates, DOM
nodes) may leak into the model: positions and curves must be expressed abstractly, because SVG
*and* TikZ both render from it ([output formats, ticket 07](./07-output-formats.md)). The
model is the single source of truth; renderers are additive.

Resolve with `/grilling` + `/domain-modeling`; write the resulting glossary to `CONTEXT.md`.
This is the natural next wayfinding session after the MVP proves the stack; several fog items
(theorem-highlight, persistence, arrow routing) hang off it.
