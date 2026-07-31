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
  box, term-dot, anchor, element, kind, path, arrow, role, `refl`, equivalence, fan, level,
  conclusion — is
  **settled** and defined in [CONTEXT.md](../../CONTEXT.md#notation)
  ([ticket 04](./issues/04-notation-domain-model.md)). Read it before touching the model.
- **Standing architectural decisions:** [ADR 1](../../docs/adr/0001-diagram-draws-checking-layer-interprets.md)
  (the diagram draws, a checking layer interprets),
  [ADR 2](../../docs/adr/0002-geometry-is-abstract-and-derived.md) (geometry abstract, shape
  derived) and [ADR 3](../../docs/adr/0003-a-save-records-the-diagram.md) (a save records the
  diagram; the format stores, a validator checks). All three bind every later ticket.
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
- [Theorem-conclusion highlight redesign → a halo](./issues/05-theorem-highlight-redesign.md) —
  the conclusion is marked by the element's **own geometry redrawn wide and pale behind it**, a
  highlighter swept along it. Replaces purple's three tricks (parallel line, underline, third
  wave) with **one rule** that fits a path, a path-between-paths, a red in-theory function and the
  `≈` glyph alike; the element keeps its own ink, so the mark stops competing with the hue channel
  that **role** owns. Derived, not stored ([ADR 2](../../docs/adr/0002-geometry-is-abstract-and-derived.md));
  the wash colour stays each backend's choice.
- [Notation domain model → settled](./issues/04-notation-domain-model.md) — the diagram records
  *kinds*, not mathematics, with a **checking layer** outside rendering
  ([ADR 1](../../docs/adr/0001-diagram-draws-checking-layer-interprets.md)); arrows are
  many-to-one; an **anchor** is a term-dot, path *or* arrow, and nothing attaches to a box;
  **kind** and **role** split apart, colour becoming each backend's mapping; geometry abstract
  and **shape derived** ([ADR 2](../../docs/adr/0002-geometry-is-abstract-and-derived.md));
  **conclusion** a property on paths, in-theory functions and equivalences. Glossary in
  [CONTEXT.md](../../CONTEXT.md). Corrected along the way: `≈` is an **equivalence** (`qinv`),
  never a homotopy.
- [Drawing onto an anchor → drag, with nothing to disambiguate](./issues/09-targeting-anchors.md) —
  the nearest candidate under the pointer wins **silently**, because generalising the **fan** across
  kinds and directions removed the crowd rather than helping the user aim into it; the pick-list and
  click-cycling schemes answered a problem the model no longer has. Kind and role are number keys
  (path · in-theory function · built-in rule · ≈), not modifiers. Many-to-one is ordinary
  **shift-click accumulation**, which retires the merge-versus-target collision, so dropping onto an
  arrow always *targets* it. An ≈ is drawn like anything else, and at most one stands between two
  arrows. A join lands in an evenly spaced **slot** on its target (`spread`), reserved rather than
  contended for — the fan's argument again, one dimension down. Corrected along the way: a path is
  **directional** and takes an arrowhead, hue being what separates it from an arrow.
- [Persistence & file format → `.hott.json`, shaped like a schema](./issues/08-persistence-format.md) —
  a save records the **diagram**, SVG export stays one-way, so persistence forces the real model
  into existence ([ADR 3](../../docs/adr/0003-a-save-records-the-diagram.md)). Legible
  deterministic JSON, flat and id-keyed with one integer id space; **SQL fits but was declined**
  because its constraints weld a checker into the file format, against ADR 1. Box extent is
  **stored** (TikZ re-typesets, so a derived extent would differ per backend), auto-fitted on plop;
  labels take **discrete slots** — six inside a box, or a distance-along-edge plus a
  direction-relative side. A monotonic integer `version` with additive-changes-don't-bump, which
  makes every change the map anticipates free.

## Not yet specified

<!-- fog toward the destination — in scope, not yet sharp enough to fully ticket -->

- **The checking layer** — [ADR 1](../../docs/adr/0001-diagram-draws-checking-layer-interprets.md)
  establishes the seam and defers the build. What it enforces, when it earns its place, and
  whether it belongs to *this* destination at all are open.
- **Interaction / UX beyond creating an edge** — move, undo/redo, canvas navigation. The *creating*
  slice is resolved ([Drawing onto an anchor](./issues/09-targeting-anchors.md)), and it already
  fixes the start of a **selection** model the rest must inherit: a click selects, shift holds the
  selection open, and pressing anywhere without shift drops it. What selection is *for* beyond
  feeding a gesture — what a selected element can then be told to do — is not yet designed.
- **Fan ordering under an equivalence** — *which slot* an element takes in a fan, as against the
  bullet below, which is about the *shape* a slot is drawn as. An `≈` marking the outer two of a
  three-wide fan crosses the middle one; it would read better if the marked pair were brought
  together and the odd one out pushed aside, making fan order derived from the equivalences over
  the fan rather than from id order. What keeps this a question is that equivalences need not
  admit such an order at all — `f ≈ g`, `g ≈ h` and `f ≈ h` at once leave no arrangement in which
  every marked pair is adjacent, and wider fans multiply the conflicts. Surfaced while
  prototyping [Drawing onto an anchor](./issues/09-targeting-anchors.md).
- **Manual curvature & obstacle avoidance** — shape is derived for now, straight or fanned
  ([ADR 2](../../docs/adr/0002-geometry-is-abstract-and-derived.md)), so 2.6.5's hand-drawn
  curves render straight. Whether a hand override arrives, and whether edges should ever route
  around boxes, is deferred. Now the *only* hand-override question left: label placement was
  settled as discrete slots ([ticket 08](./issues/08-persistence-format.md)), and any override
  would be purely additive under the versioning policy.
- **TikZ emitter (implementation)** — direction decided (SVG + TikZ, ticket 07); building the
  model→TikZ backend (roles → styles, derived curvature → Bézier control points, the conclusion
  halo as a `preaction={draw, line width=…, opacity=…}` casing on the same path) is future
  execution work, deferred past the MVP.
- **Framework adoption** — the trigger point where plain TS stops paying its way (toolbars,
  panels, undo) and a lean reactive framework (Solid / Svelte) earns its place.
- **Native desktop packaging** — wrapping the web app in Tauri. **May be pulled forward onto the
  route**: a browser tab cannot overwrite the file it opened, so if the File System Access API
  proves too thin, Tauri becomes what makes saving work rather than a later nicety.
  [Ticket 10](./issues/10-save-open-mechanism.md) settles it.
- **The in-memory model (implementation)** — [ADR 3](../../docs/adr/0003-a-save-records-the-diagram.md)
  forces a real model into existence, since the MVP has none (the DOM is the document). Its shape
  is decided — the schema in [ticket 08](./issues/08-persistence-format.md) — but building it, the
  load-time validator, and the round-trip test is execution work not yet sliced.

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
- **A hand-authorable textual diagram format** — weighed while choosing how legible the save file
  should be ([ticket 08](./issues/08-persistence-format.md)) and set aside. It is a committed public
  syntax owing a parser and real error messages, and it competes with the destination: this map
  charts a **GUI editor** whose premise is that the drawing gesture is the interface. A legitimate
  future product over the same model, but a fresh effort. The save file is merely *readable*, not
  authorable.
- **Reopening an exported file** — SVG and TikZ export is one-way
  ([ADR 3](../../docs/adr/0003-a-save-records-the-diagram.md)); import of any foreign format goes
  with it.
- **A semantic model / HoTT elaborator** — parsing type expressions so the editor could reject an
  ill-typed drawing was weighed against the drawing-only model and set aside
  ([ticket 04](./issues/04-notation-domain-model.md),
  [ADR 1](../../docs/adr/0001-diagram-draws-checking-layer-interprets.md)); type expressions stay
  opaque LaTeX. Distinct from the lightweight **checking layer** under *Not yet specified*, which
  reads the recorded structure without understanding the mathematics.
