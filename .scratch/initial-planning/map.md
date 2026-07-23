# Wayfinder map — HoTT Diagram Editor

<!-- wayfinder:map — the canonical map for this effort. Child tickets live in ./issues/. -->

## Destination

A working, bespoke GUI editor for the user's **HoTT proof-diagram notation** — where the
first-class objects are *typed* (**box = type**, **dot = term**, **arrow = morphism/path**
with a role-encoding color) — that exports clean **vector graphics**. This map charts the way
from nothing to that editor. The first slice (MVP tech stack + minimal executable) is resolved
below; the rest is fog for future sessions.

## Notes

- **Domain:** Homotopy Type Theory (HoTT). The reference diagrams (`goal.jpg` in the repo
  root) are the §2.6 / §2.7 path & transport lemmas for ×- and Σ-types. Visual vocabulary:
  - **box = type / context**, **dot = term** inside it, **arrow = map**;
  - arrow **color = role**: **black = paths**, **red = in-theory functions**,
    **green = built-in rules** (Formal Type Theory appendix);
  - `refl` has **no special glyph** — it's a black self-path (loop) labelled "refl" (may change);
  - **≈** = a **homotopy**;
  - **purple** currently marks *what a theorem proves* — a weak convention, to be redesigned.
- **Standing tech decision (locked):** TypeScript + SVG (DOM) + Vite + KaTeX. Rendering in
  SVG makes the two hard requirements — *vector export* and *dense math labels* — **free**.
  Rust was preferred by the user but consciously set aside for simplicity (see ticket 01).
- **Skills to consult each session:** `/grilling` + `/domain-modeling` (default);
  `/prototype` for "how should it look / behave" questions; `/research` for external facts.
- **Delivery:** browser tab now; Tauri-wrappable to a native desktop window later, ≈free.
- **Where things live:** code project is one dir up (`../`, the `diagrams` repo); all agent
  artifacts (this map, spec, tickets) stay here in `agents-working-files` (see `AGENTS.md`).

## Decisions so far

<!-- index — one line per resolved ticket; zoom the link for detail -->

- [Rendering layer & language → TS + SVG (web)](./issues/01-rendering-layer.md) — chose
  TypeScript + SVG over Rust-native / Rust-WASM for the richest *interactive-editing* ecosystem
  and free on-screen KaTeX math; Rust set aside for simplicity. (Vector *export* is no longer a
  reason — paper output is TikZ, ticket 07, and language-neutral.)
- [MVP stack → Vite + KaTeX, no framework yet](./issues/02-mvp-stack.md) — Vite for
  build + dev-server, KaTeX for math labels, plain TS with no UI framework until
  toolbars/undo demand one.
- [MVP scope → "Plop & Export"](./issues/03-mvp-scope.md) — click to plop term-dots · a
  KaTeX-typeset label · an Export-SVG button: the smallest executable that proves the two
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
  [Notation domain model](./issues/04-notation-domain-model.md): the full arrow taxonomy &
  role-colors, box/term semantics, `refl` self-paths, and the `≈` homotopy (between functions).
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
