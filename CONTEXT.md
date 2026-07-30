# HoTT Diagram Editor

A bespoke editor for the user's HoTT proof-diagram notation, exporting clean vector graphics.
This file is where its vocabulary is **defined**; the [map](./.scratch/initial-planning/map.md),
the [spec](./.scratch/initial-planning/spec.md) and the tickets *use* these terms and carry the
reasoning behind them.

## Notation

What the diagrams mean. Reference drawings: `goal.jpg` — the HoTT book's §2.6 / §2.7 path and
transport lemmas.

**Box**:
A type, drawn as a rectangle labelled with its type expression. The term-dots inside it are its
inhabitants.
_Avoid_: context, container, node

**Term-dot**:
A term, drawn as a dot inside the box of its type.
_Avoid_: point, vertex, node

**Path**:
An identity proof between two term-dots. Drawn like an arrow, but not one — it asserts an
equality rather than mapping anything.
_Avoid_: equality arrow, identity arrow

**Arrow**:
A function carrying one term-dot to another.
_Avoid_: map, morphism, edge, link

**Role-colour**:
The colour a path or arrow is drawn in, and what it means: black = path, red = in-theory
function, green = built-in rule.

**In-theory function**:
A function defined within the theory — `f`, `ap_f`, `f*`, `pair=`. Drawn red.

**Built-in rule**:
A rule of the type theory itself, from the Formal Type Theory appendix — `pr₁`, `pr₂`,
`Σ-intro`. Drawn green.

**refl**:
The self-path at a term-dot. It has no glyph of its own: a black loop labelled `refl`.

**Homotopy**:
`≈`, holding between two *functions* — never between two paths. It therefore joins two arrows,
not two term-dots.

**Theorem-conclusion highlight**:
The mark distinguishing what a theorem proves from the working around it. Purple today, and
provisional — the convention is being redesigned
([ticket 05](./.scratch/initial-planning/issues/05-theorem-highlight-redesign.md)).

The full arrow taxonomy — whether these role-colours are the complete set, how a homotopy is
anchored, and whether equalities *between paths* are drawn at all — is still open
([ticket 04](./.scratch/initial-planning/issues/04-notation-domain-model.md)).

## Editor

What the program works on.

**Diagram**:
One proof drawing: its boxes, term-dots, paths, arrows and labels, independent of how it is
rendered.

**Canvas**:
The drawing surface a diagram appears on. Today it *is* the diagram — nothing is held apart from
what is drawn.
_Avoid_: viewport, scene, stage

**Plop**:
To place a term-dot on empty canvas by releasing the pointer there. The dot lands where the
button comes up, not where it went down, so a press is only provisional.

**Source**:
The LaTeX a label is typeset from. It is the label's origin, not the label.

**Label**:
A typeset glyph run placed on a diagram. The source is LaTeX; the label is geometry — and the
two are not interchangeable. A placed label keeps no source today, which is why the TikZ backend
has nothing to emit from.

**Typesetting**:
Turning a source into glyph geometry: outlines that travel inside an exported file, never a
reference to a font the viewer must already have. The distinction is the whole point of the
capability. Which engine does it is behind a seam.

**Glyph geometry**:
What typesetting returns — measured in thousandths of an em, origin at the left baseline point,
carrying a transform of its own. Placing it means wrapping it, not transforming it.

**Export**:
Emitting a diagram as a file that leaves the editor behind.

**Standalone**:
The property an export must have: everything needed to render it travels with it — no page
styling, no font reference, nothing pointing back at the document that produced it.

**Render backend**:
One way of drawing a diagram out. Two are planned over the one diagram: an SVG renderer for
screen and web, a TikZ emitter for papers
([ticket 07](./.scratch/initial-planning/issues/07-output-formats.md)). Hence no backend's terms
— pixels, DOM nodes — may reach a diagram.

**Chrome**:
The on-page controls sitting over the canvas. Chrome is never part of a diagram, so it never
reaches an export — which is why what *is* part of one carries its own presentation instead of
being styled from the page.
