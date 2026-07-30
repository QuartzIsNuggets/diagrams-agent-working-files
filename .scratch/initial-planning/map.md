# Wayfinder map — HoTT Diagram Editor

<!-- wayfinder:map — the canonical map for this effort. Child tickets live in ./issues/. -->

## Destination

A working, bespoke GUI editor for the user's **HoTT proof-diagram notation** — where the
first-class objects are *typed* (boxes, term-dots, paths and arrows, each arrow carrying a
**role** the renderer turns into ink — see [CONTEXT.md](../../CONTEXT.md)) — that exports clean
**vector graphics**. This map charts the way
from nothing to that editor. The first slice (MVP tech stack + minimal executable) is resolved
below; the rest is fog for future sessions.

## Notes

- **Domain:** Homotopy Type Theory (HoTT). The reference diagrams (`goal.jpg` in the repo
  root) are the §2.6 / §2.7 path & transport lemmas for ×- and Σ-types. The visual vocabulary —
  box, term-dot, anchor, kind, path, arrow, role, `refl`, equivalence, layer, conclusion — is
  **settled** and defined in [CONTEXT.md](../../CONTEXT.md#notation)
  ([ticket 04](./issues/04-notation-domain-model.md)). Read it before touching the model.
- **Standing architectural decisions:** [ADR 1](../../docs/adr/0001-diagram-draws-checking-layer-interprets.md)
  (the diagram draws, a checking layer interprets) and
  [ADR 2](../../docs/adr/0002-geometry-is-abstract-and-derived.md) (geometry abstract, shape
  derived). Both bind every later ticket.
- **Standing tech decision (locked):** TypeScript + SVG (DOM) + Vite + **MathJax** (SVG output
  → glyph `<path>`s). The web/SVG world gives the interactive editor + on-screen math cheaply;
  MathJax renders LaTeX labels to real paths, so they embed in the canvas and in exports with
  no `<foreignObject>`. Rust was preferred but set aside for simplicity (see ticket 01).
- **Skills to consult each session:** `/grilling` + `/domain-modeling` (default);
  `/prototype` for "how should it look / behave" questions; `/research` for external facts.
- **Delivery:** browser tab now; Tauri-wrappable to a native desktop window later, ≈free.
- **Where things live:** code project is one dir up (`../`, the `diagrams` repo); all agent
  artifacts (this map, spec, tickets) stay here in `agents-working-files` (see `AGENTS.md`).

## Decisions so far

<!-- index — one line per resolved ticket; zoom the link for detail -->

- [Rendering layer & language → TS + SVG (web)](./issues/01-rendering-layer.md) — chose
  TypeScript + SVG over Rust-native / Rust-WASM for the richest *interactive-editing* ecosystem
  and free on-screen MathJax math; Rust set aside for simplicity. (Vector *export* is no longer a
  reason — paper output is TikZ, ticket 07, and language-neutral.)
- [MVP stack → Vite + MathJax, no framework yet](./issues/02-mvp-stack.md) — Vite for
  build + dev-server, MathJax (SVG output → paths) for math labels, plain TS with no UI
  framework until toolbars/undo demand one.
- [MVP scope → "Plop & Export"](./issues/03-mvp-scope.md) — click to plop term-dots · a
  MathJax-typeset label · an Export-SVG button: the smallest executable that proves the two
  risky libraries. Full build spec: [./spec.md](./spec.md).
- [Build system & tooling](./issues/06-build-tooling.md) — pnpm + mise · Vite · pure-ESM
  bundler-resolution TS with max-strict tsconfig · oxlint + Prettier · Vitest · Lefthook.
  `tsc` type-checks only; Vite transpiles. Turnkey configs in the ticket.
- [Output formats → SVG + TikZ, no PDF-direct](./issues/07-output-formats.md) — SVG for
  screen/web, raw TikZ for papers (labels re-typeset by the including document → exact math
  fidelity); PDF-direct ruled out. SVG & TikZ are two backends over one render-agnostic model;
  the LaTeX label string feeds both.
- [Notation domain model → settled](./issues/04-notation-domain-model.md) — the diagram records
  *kinds*, not mathematics, with a **checking layer** outside rendering
  ([ADR 1](../../docs/adr/0001-diagram-draws-checking-layer-interprets.md)); arrows are
  many-to-one; an **anchor** is a term-dot, path *or* arrow, and nothing attaches to a box;
  **kind** and **role** split apart, colour becoming each backend's mapping; geometry abstract
  and **shape derived** ([ADR 2](../../docs/adr/0002-geometry-is-abstract-and-derived.md));
  **conclusion** a property on paths, in-theory functions and equivalences. Glossary in
  [CONTEXT.md](../../CONTEXT.md). Corrected along the way: `≈` is an **equivalence** (`qinv`),
  never a homotopy.

## Not yet specified

<!-- fog toward the destination — in scope, not yet sharp enough to fully ticket -->

- **The checking layer** — [ADR 1](../../docs/adr/0001-diagram-draws-checking-layer-interprets.md)
  establishes the seam and defers the build. What it enforces, when it earns its place, and
  whether it belongs to *this* destination at all are open.
- **Interaction / UX beyond creating an edge** — selection, move, undo/redo, canvas navigation.
  The *creating* slice has graduated to
  [Drawing onto an anchor](./issues/09-targeting-anchors.md); the rest is not yet designed.
- **Manual curvature & obstacle avoidance** — shape is derived for now, straight or fanned
  ([ADR 2](../../docs/adr/0002-geometry-is-abstract-and-derived.md)), so 2.6.5's hand-drawn
  curves render straight. Whether a hand override arrives, and whether edges should ever route
  around boxes, is deferred.
- **TikZ emitter (implementation)** — direction decided (SVG + TikZ, ticket 07); building the
  model→TikZ backend (roles → styles, derived curvature → Bézier control points) is future
  execution work, deferred past the MVP.
- **Framework adoption** — the trigger point where plain TS stops paying its way (toolbars,
  panels, undo) and a lean reactive framework (Solid / Svelte) earns its place.
- **Native desktop packaging** — wrapping the web app in Tauri.

## Out of scope

- **Rust / pure-native rewrite** — considered and set aside
  ([ticket 01](./issues/01-rendering-layer.md)); returns only if the destination is redrawn.
- **A generic commutative-diagram / non-HoTT editor** — this tool is bespoke to the user's
  typed notation; general-purpose diagramming is not a goal.
- **Relating drawings across ∞-groupoid layers** — 2.6.5 is one theorem drawn twice, at layer 0
  and layer 1. Both drawings are legal, but one canvas holds **one** diagram at one layer, and
  the editor does not link the two or derive one from the other
  ([ticket 04](./issues/04-notation-domain-model.md)). Multiple diagrams per document goes with
  it.
- **A semantic model / HoTT elaborator** — parsing type expressions so the editor could reject an
  ill-typed drawing was weighed against the drawing-only model and set aside
  ([ticket 04](./issues/04-notation-domain-model.md),
  [ADR 1](../../docs/adr/0001-diagram-draws-checking-layer-interprets.md)); type expressions stay
  opaque LaTeX. Distinct from the lightweight **checking layer** under *Not yet specified*, which
  reads the recorded structure without understanding the mathematics.
