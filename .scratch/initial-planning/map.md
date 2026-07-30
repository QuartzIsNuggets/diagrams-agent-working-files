# Wayfinder map — HoTT Diagram Editor

<!-- wayfinder:map — the canonical map for this effort. Child tickets live in ./issues/. -->

## Destination

A working, bespoke GUI editor for the user's **HoTT proof-diagram notation** — where the
first-class objects are *typed* (boxes, term-dots, paths and arrows, with a role-encoding
colour — see [CONTEXT.md](../../CONTEXT.md)) — that exports clean **vector graphics**. This map charts the way
from nothing to that editor. The first slice (MVP tech stack + minimal executable) is resolved
below; the rest is fog for future sessions.

## Notes

- **Domain:** Homotopy Type Theory (HoTT). The reference diagrams (`goal.jpg` in the repo
  root) are the §2.6 / §2.7 path & transport lemmas for ×- and Σ-types. The visual vocabulary —
  box, term-dot, path, arrow, role-colour, `refl`, homotopy, the theorem-conclusion highlight —
  is defined in [CONTEXT.md](../../CONTEXT.md#notation); what remains open there is
  [ticket 04](./issues/04-notation-domain-model.md).
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

## Not yet specified

<!-- fog toward the destination — in scope, not yet sharp enough to fully ticket -->

- **Complete notation domain model** — being charted next in
  [Notation domain model](./issues/04-notation-domain-model.md). The vocabulary is settled and
  written down ([CONTEXT.md](../../CONTEXT.md#notation)); what is still open is whether the
  role-colours are the complete taxonomy, how a homotopy is anchored, and whether equalities
  between paths are drawn at all.
- **Theorem-conclusion highlight** — replacing the weak purple convention; ticketed
  ([Theorem-highlight redesign](./issues/05-theorem-highlight-redesign.md)), blocked on the
  domain model.
- **Interaction / UX** — drawing arrows between dots, selection / move, undo/redo, canvas
  navigation. Not yet designed.
- **Arrow routing** — how arrows bend / curve / avoid boxes (the diagrams use hand-drawn
  curves and self-loops).
- **TikZ emitter (implementation)** — direction decided (SVG + TikZ, ticket 07); building the
  model→TikZ backend (role-colors → styles, curves → Bézier control points) is future
  execution work, deferred past the MVP.
- **Persistence / file format** — how a diagram is saved & reopened (a serialization of the
  domain model; blocked on it).
- **Framework adoption** — the trigger point where plain TS stops paying its way (toolbars,
  panels, undo) and a lean reactive framework (Solid / Svelte) earns its place.
- **Native desktop packaging** — wrapping the web app in Tauri.

## Out of scope

- **Rust / pure-native rewrite** — considered and set aside
  ([ticket 01](./issues/01-rendering-layer.md)); returns only if the destination is redrawn.
- **A generic commutative-diagram / non-HoTT editor** — this tool is bespoke to the user's
  typed notation; general-purpose diagramming is not a goal.
