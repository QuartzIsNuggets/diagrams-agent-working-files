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
inhabitants, and that membership is recorded rather than read off the geometry. Boxes never
overlap, never nest, and stand in no relationship to one another — the side-by-side grids in
2.6.5 are incidental. Nothing attaches to a box.
_Avoid_: context, container, node

**Term-dot**:
A term, drawn as a dot inside the box of its type. Its position is relative to that box, so
moving the box carries it.
_Avoid_: point, vertex, node

**Anchor**:
Anything a path or arrow may attach to: a term-dot, a path, or an arrow. The notion is
recursive — a path between two paths is ordinary, not a special case — and Π-types being objects
of the theory, an arrow is as legitimate an endpoint as a dot. A box is never an anchor.
_Avoid_: node, endpoint, vertex

**Kind**:
Whether an element is a path or an arrow. Kind is not [role](#role): asserting an equality and
mapping a term differ in kind, which is why a path needs no role.

**Path**:
An identity proof between two anchors. Drawn like an arrow, but not one — it asserts an equality
rather than mapping anything.
_Avoid_: equality arrow, identity arrow

**Self-path**:
A path whose two ends are the same anchor. Having no baseline to bend relative to, it carries a
direction and size of its own — the single exception to derived curvature.

**Arrow**:
A function carrying anchors to an anchor. Many-to-one: *n* inputs and exactly one output, held
flat rather than curried, because a function has one output. `Σ-intro` and `pair=` take two.
_Avoid_: map, morphism, edge, link

**Junction**:
Where a many-to-one arrow's inputs converge. Derived geometry with no identity of its own —
never placed, never labelled, never attached to.

**Role**:
What an arrow is: an in-theory function or a built-in rule. That set is complete, and it applies
to arrows only. A role is *meaning* and is recorded; the ink expressing it is each render
backend's choice.
_Avoid_: role-colour — the old name fused the meaning with its ink

**In-theory function**:
A function defined within the theory — `f`, `ap_f`, `f*`, `pair=`. Drawn red today.

**Built-in rule**:
A rule of the type theory itself, from the Formal Type Theory appendix — `pr₁`, `pr₂`,
`Σ-intro`. Drawn green today. Being meta-theoretic, it can never be a conclusion.

**refl**:
The self-path at a term-dot. It has no glyph of its own: a black loop labelled `refl`.

**Equivalence**:
`≈`, marking that a back-and-forth pair of arrows are mutually inverse — `qinv` of the arrow it
names. It attaches to exactly two arrows, symmetrically, and is never many-to-one. Those arrows
must be opposed, but that is a [checking layer](#checking-layer) constraint, not a drawing one.
_Avoid_: homotopy — a homotopy relates two arrows sharing **both** domain and codomain, which a
back-and-forth pair by definition does not.

**Level**:
Where a drawing sits in the ∞-groupoid. One theorem can be drawn at level 0, where a 2-path is a
path between two paths, or at level 1, where the identity types become boxes and their proofs
become term-dots — for example 2.6.5 is drawn both ways.

**Conclusion**:
The property marking an element as what the theorem proves. It belongs to a path, an in-theory
function, or an equivalence — never to a built-in rule. The property is recorded; how it is
drawn is a render backend's business and is being redesigned
([ticket 05](./.scratch/initial-planning/issues/05-theorem-highlight-redesign.md)) — purple
today, parallel to the marked path in 2.7.1, underlining it in 2.6.5, the third wave of the `≈`
in 2.7.2.
_Avoid_: theorem-conclusion highlight — that named the ink, not the meaning

## Editor

What the program works on.

**Diagram**:
One proof drawing: its boxes, term-dots, paths, arrows and labels, independent of how it is
rendered. It sits at a single layer, and holds no reference to any other diagram.

**Canvas**:
The drawing surface a diagram appears on. Today it *is* the diagram — nothing is held apart from
what is drawn.
_Avoid_: viewport, scene, stage

**Diagram unit**:
The abstract length a diagram is measured in — never a pixel; each render backend picks its own
scale. The y-axis points up, as in mathematics and in TikZ, so the SVG renderer flips once at
its root and converts pointer positions back on the way in.

**Curvature**:
How a path or arrow bends, derived rather than stored: a lone edge between a pair of anchors is
straight, several fan apart into a lens — the shape `pair=` and its inverse make in 2.7.2. No
element carries a shape of its own, so an anchor can move with nothing to maintain.

**Checking layer**:
Where the mathematics is interpreted — layers, the opposedness of an equivalence's arrows,
whether a label suits its endpoints. It reads a diagram and never draws one, so it can be bolted
on later without disturbing what does. A diagram is drawing, not proof: nothing here may become
something a renderer needs.

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
— pixels, DOM nodes, hex colours — may reach a diagram; a role reaches it, and the backend maps
that role to ink.

**Chrome**:
The on-page controls sitting over the canvas. Chrome is never part of a diagram, so it never
reaches an export — which is why what *is* part of one carries its own presentation instead of
being styled from the page.
