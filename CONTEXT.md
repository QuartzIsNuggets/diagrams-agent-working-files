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

**Element**:
A path or an arrow — what a diagram draws *between* anchors, and what a [kind](#kind) tells apart.
A box or a term-dot is not one.
_Avoid_: edge, connector, link

**Kind**:
Whether an element is a path or an arrow. Kind is not [role](#role): asserting an equality and
mapping a term differ in kind, which is why a path needs no role.

**Path**:
An identity proof between two anchors, and **directional**: `p : x = y` runs from `x` to `y`, and
`p⁻¹` is a different path running back. So a path is drawn with an arrowhead, exactly as an
[arrow](#arrow) is — that equality is symmetric is a fact about the *type*, not about the proof,
and a diagram draws proofs. What separates the two on the page is hue rather than the head: an
arrow always carries a [role](#role) and so is always coloured, where a path has none and stays
black.
_Avoid_: equality arrow, identity arrow, undirected path

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
names. It attaches to exactly two arrows, symmetrically, and is never many-to-one. At most one
stands between any two arrows: a second would assert the very same `qinv`, so there is nothing for
it to record. That much is a *drawing* constraint — there is no second equivalence to make — where
the arrows having to be opposed is a [checking layer](#checking-layer) one.
_Avoid_: homotopy — a homotopy relates two arrows sharing **both** domain and codomain, which a
back-and-forth pair by definition does not.

**Level**:
Where a drawing sits in the ∞-groupoid. One theorem can be drawn at level 0, where a 2-path is a
path between two paths, or at level 1, where the identity types become boxes and their proofs
become term-dots — for example 2.6.5 is drawn both ways.
_Avoid_: layer — that is the [checking layer](#checking-layer), a part of the program

**Conclusion**:
The property marking an element as what the theorem proves. It belongs to a path, an in-theory
function, or an equivalence — never to a built-in rule. The property is recorded; how it is drawn
is a render backend's business, and every backend draws it as a [halo](#halo)
([ticket 05](./.scratch/initial-planning/issues/05-theorem-highlight-redesign.md)).
_Avoid_: theorem-conclusion highlight — that named the ink, not the meaning

**Halo**:
How a [conclusion](#conclusion) is drawn: the element's own geometry redrawn wide and pale
*behind* it, as though a highlighter had been swept along it. One rule for every carrier — a
path, a path between two paths, an arrow and the `≈` glyph all take it unchanged — where the
purple it replaces needed a parallel line, an underline and a third wave. It leaves the element's
own ink alone, so the mark never competes with the hue channel [role](#role) owns, and it is
derived from the geometry rather than stored. The wash colour is each backend's own choice; the
form is not.
_Avoid_: highlight, glow — the first named the old ink, the second suggests an SVG filter

## Editor

What the program works on.

**Diagram**:
One proof drawing: its boxes, term-dots, elements and labels, independent of how it is rendered.
It sits at a single [level](#level), and holds no reference to any other diagram. It is a
**value**: what acts on one returns the next diagram and leaves the one it was handed alone, so
holding a drawing is holding a variable rather than a store. And it owns every extent in it, which
makes it the thing that answers where a point falls and which boxes a new one has to push aside —
questions no laid-out page is needed to ask.

**Canvas**:
Where a diagram is drawn. It holds nothing of its own: a [render backend](#render-backend) draws
the diagram into it and never reads it back, so a mark is on screen because the diagram holds it
and not because a gesture put it there.
_Avoid_: viewport, scene, stage, drawing surface — [surface](#surface) is how the editor is
delivered, not where a diagram sits

**Diagram unit**:
The abstract length a diagram is measured in — never a pixel; each render backend picks its own
scale. The y-axis points up, as in mathematics and in TikZ, so the SVG renderer flips once at
its root and converts pointer positions back on the way in.

**Fan**:
Every element sharing the same two anchors, bowing apart so no two of them overlap. Neither
direction nor [kind](#kind) splits a fan: a back-and-forth pair belongs to one — the lens `pair=`
and its inverse make in 2.7.2 — and a path and an arrow between the same two anchors bend around
each other rather than both claiming the straight line. A many-to-one arrow joins no fan, having
no one pair of anchors to share, and neither does a [self-path](#self-path).

**Curvature**:
How an element bends, derived rather than stored: alone between its two anchors it is straight,
and in a [fan](#fan) it bows aside by its place in that fan. No element carries a shape of its
own, so an anchor can move with nothing to maintain.

**Checking layer**:
Where the mathematics is interpreted — levels, the opposedness of an equivalence's arrows,
whether a label suits its endpoints. It reads a diagram and never draws one, so it can be bolted
on later without disturbing what does. It warns about what is **wrong** and never sees what would
be **meaningless**: a mark with nothing to mean — a [conclusion](#conclusion) on a
[built-in rule](#built-in-rule) — is not something a diagram can hold in the first place. A
diagram is drawing, not proof: nothing here may become something a renderer needs.

**Gesture**:
The arc a pointer makes on the [canvas](#canvas): a press, the drag it may become, the release that
ends it, and the naming that release asks for. The arc runs to the end of that question, not to the
button coming up — the mark it left standing is what the question is about, so the gesture that put
that mark up is what takes it down, once the naming settles either way. **One runs at a time**, the
[naming bar](#naming-bar) being what keeps a press from starting a second — so a naming a press
displaced comes back late, to a canvas the gesture that displaced it is drawing into, and ends
nothing there. Nothing else
changes a [diagram](#diagram) — what one makes is a [plop](#plop), and what it leaves on screen
meanwhile is [chrome](#chrome). It is no
[render backend](#render-backend)'s: it is told where the pointer is in [diagram units](#diagram-unit)
and handed a way to show how far the drag has got, knowing nothing of the flip, the scale or the ink
those are drawn with — which is why the backend that emits a file, having no pointer to follow, has
none of this either. While one runs the pointer is followed wherever it goes, a drag having to be
let go of anywhere.

**Plop**:
To make a mark by releasing the pointer where it goes — what a [gesture](#gesture) comes to. What is
made is decided by where the press lands: inside a [box](#box) it is a [term-dot](#term-dot), on
empty [canvas](#canvas) it is a box.
The release decides only placement — a dot lands where the button comes up, not where it went down,
and a box takes its extent from the drag. So nothing tells a click from a drag: a click is a drag of
no size, and what is being made was settled before the pointer moved. A dot released where no room
is left for one is [refused](#refusal) — outside every box, a term outside a type being nothing a
diagram can hold, or too near a wall or a dot already placed.

**Source**:
The LaTeX a label is typeset from. It is the label's origin, not the label.

**Label**:
A typeset glyph run placed on a diagram. The source is LaTeX; the label is geometry — and the
two are not interchangeable. A label belongs to the box, [term-dot](#term-dot) or
[element](#element) it names and **keeps its source**, so the TikZ backend has something to emit
from; the glyph geometry is derived and never saved. The **required** labels are the ones whose mark
*is* its label: a [box](#box) is its type expression, and a [built-in rule](#built-in-rule) is the
rule it names — an unnamed one is not a `pr₁` that lost its name but no rule at all. Every other
label is **optional**. A term can stand unnamed, and the gesture that plops one asks for a name it
may be given up on; a [path](#path), [self-path](#self-path) included, asserts its equality without
being named, which is why most of the black in `goal.jpg` is bare; and an
[in-theory function](#in-theory-function) may go unnamed too, though no drawing yet does. An
[equivalence](#equivalence) is not named at all, having a glyph of its own and nothing else to say.

**Label slot**:
Where a box's label sits: one of six positions inside the box — top or bottom, left-aligned,
centred or right-aligned, centred at the top until the user drags it elsewhere. A discrete choice
rather than a free offset, so labels cannot drift out of alignment, and the box's floored extent
means its label always fits inside. A path's
or arrow's label is placed differently: a **fraction** of the way along the element — 0 at its
start, 1 at its end — and a side of it, both taken relative to the element rather than to the page,
so they survive the ends moving. A term-dot's label takes a side and nothing else, and that side is
**absolute** — a dot is a point, with no direction to take a side relative to. Four of them, and
above the dot until the user moves it: `goal.jpg` sets a term's name to its left almost throughout,
which is the lane a path arrives on. How far a label sits off the element or the dot is fixed, and each backend's own choice
— measured from the dot's *edge*, so it does not move when a backend draws more ink.
_Avoid_: anchor — that is a term-dot, path or arrow, and nothing else

**Typesetting**:
Turning a source into glyph geometry: outlines that travel inside an exported file, never a
reference to a font the viewer must already have. The distinction is the whole point of the
capability. Which engine does it is behind a seam — so a source one engine will not set is not a
*wrong* source, and a diagram read from a file keeps it, drawn unlabelled and reported. What no
gesture will do is put one there: nothing the editor cannot draw enters a diagram by being typed.
Typesetting is the act; what a source has come to once it is done is [set](#set).

**Glyph geometry**:
What typesetting returns — outlines measured in thousandths of an em, with their origin at the
left baseline point and a transform of their own, and the extent they take about that origin.
Placing it means wrapping it, not transforming it. The extent travels with the outlines because
it is what a caller needs to put a run anywhere but its origin — to centre it, or to floor a
[box](#box) to hold it — and it cannot be read back off the outlines without a laid-out page to
measure in.

**Set**:
What a [source](#source) has come to: the [glyph geometry](#glyph-geometry) it was
[typeset](#typesetting) into, or the refusal there was instead, remembered for as long as the editor
runs. The refusal is kept as the refusal, so whoever asks next is told exactly what the first caller
was. Two acts read it and they differ — **asking retries, drawing replays**. Someone re-submitting a
source at the [naming bar](#naming-bar) is asking for exactly that, and a boot the engine got wrong
once must not leave that source unsettable for the session; drawing asks nothing and takes what is
remembered, or every frame would retry every source that will not set and report it again. Each
[render backend](#render-backend) owns what it has set, and knows it by source alone — never by the
mark the source came off.
_Avoid_: cache, store — as a word for what a source has come to. Both name the mechanism that
remembers it, which the module keeping one may fairly be called after; what no name may leave vague
is which of the two acts a caller is making

**Box**:
(extending the notation entry above) A box carries its own extent, rather than being sized to fit
its label — the TikZ backend re-typesets labels in the including document, so a label's size is
not knowable to the editor and a derived extent would differ between backends. The extent is the
user's, floored: auto-fitted when the box is first placed, raised whenever a later
[source](#source) no longer fits, and never lowered — so room given to a box is never taken back and
a box never ends up too small for its own label. Boxes never overlapping is then kept by **making
room** rather than by refusing: a box needing space another holds pushes it aside, along whichever
axis needs least, and a box so pushed pushes its own neighbours in turn. The space a box needs is
its extent and a **clearance** around it, so boxes stand apart rather than merely not overlapping —
two walls flush against each other read as one figure with a line through it, and the notation has
nothing to mean by a shared edge. That clearance is a length in [diagram units](#diagram-unit) and
the model's own, exactly as the room a [term-dot](#term-dot) keeps is: how much air a drawing
keeps between its types is the same claim on every backend, where a wall's thickness is each
backend's to choose.

**Term-dot**:
(extending the notation entry above) A dot keeps **room** about its place, a length in
[diagram units](#diagram-unit), and a placement putting anything inside that room is refused —
another dot's room, or the outside of the box, so two dots never coincide and no dot straddles a
wall. Each [render backend](#render-backend) then draws a dot no larger than that room. The
constraint is the model's and the size is the backend's — the same split [role](#role) already has
with colour.

**Save**:
Recording a diagram so it can be reopened exactly. A save carries the diagram — never the drawing —
so it stores what was recorded and not what was rendered. The counterpart to [export](#export),
and deliberately not the same file: an export is one-way and is never reopened
([ADR 3](./docs/adr/0003-a-save-records-the-diagram.md)).
_Avoid_: serialize — that names the mechanism, not the promise

**Export**:
Emitting a diagram as a file that leaves the editor behind. One-way: an export is never reopened,
because the ink it emits has lost what the model holds — a role's colour cannot be read back as a
role, a halo cannot be told from a wide pale path, and glyph outlines are not the LaTeX they were
typeset from. One-way on every [surface](#surface); how the bytes leave — [handed off](#hand-off)
or [written](#write) — is the surface's business and not the export's.

**Standalone**:
The property an export must have: everything needed to render it travels with it — no page
styling, no font reference, nothing pointing back at the document that produced it.

**Surface**:
One way the editor is delivered — the web build or the desktop app — told apart by what it may do
with a file. Both open, edit and [export](#export); only the app [writes](#write), and the web
[hands off](#hand-off) in its place. The two are not tiers of one product but surfaces for work of
different lifetimes: the web for drawings nobody versions, the app for documents kept in git
([ticket 10](./.scratch/initial-planning/issues/10-save-open-mechanism.md)).
_Avoid_: build, target, platform — each names how the program is compiled, not what it may do

**Write**:
Putting bytes at a path the user chose, and being able to put them there again — the capability only
the desktop [surface](#surface) has. It is not the [writer](#writer) named for it: both surfaces
reach the writer, and only one of them writes.

**Hand-off**:
Giving the bytes to the browser, which saves them where it saves things. The web
[surface](#surface)'s counterpart to a [write](#write) — not a weaker one but a different outcome:
there is no path to report and no failure to observe, so a hand-off can be made but never confirmed.
_Avoid_: browser save — nothing is saved that the editor could point at

**Writer**:
The one door bytes leave the editor by. It promises only *put these bytes where the user chose* —
chosen in a dialog now, or chosen once and remembered by the caller — and nothing about finding them
again, which is [save](#save)'s promise. What became of a file it reports as far as the surface can
honestly say — [written](#write) to a known path, [handed off](#hand-off), or cancelled — rather
than flattening to what both surfaces could promise. [Export](#export) and, later, save are callers
composed over it, not variants of it ([ADR 4](./docs/adr/0004-export-and-save-share-a-writer.md)).
_Avoid_: persistence layer — that names a promise about reopening, which an export never makes

**Render backend**:
One way of drawing a diagram out. Two are planned over the one diagram: an SVG renderer for
screen and web, a TikZ emitter for papers
([ticket 07](./.scratch/initial-planning/issues/07-output-formats.md)). Hence no backend's terms
— pixels, DOM nodes, hex colours — may reach a diagram; a role reaches it, and the backend maps
that role to ink.

**Chrome**:
The on-page controls sitting over the canvas, and the marks a gesture makes while it runs — the
provisional rectangle a box is drawn in, the [naming bar](#naming-bar) that asks what it is called,
the region a refusal is reported in. Chrome is never part of a diagram, so it never reaches an
export — which is why what *is* part of one carries its own presentation instead of being styled
from the page. Where a piece of it sits follows from what it acts on: chrome that names a **mark**
goes to that mark and is there only while the question is open, where chrome acting on the
**diagram** — the export control — has no mark to go to and keeps its corner. So an empty corner
says nothing is being named, rather than saying the editor has no controls.

**Naming bar**:
The one place a [source](#source) is typed: chrome summoned at the mark a gesture is naming, and
nowhere at all the rest of the time — a bar idling in a corner is a standing invitation to type
LaTeX at nothing, where every source belongs to some mark. One is open at a time, so a second
question can never throw away a typed source, and while one is open nothing else acts on the
diagram behind it: the canvas begins no gesture but the one a press gave the naming up for, and the
drawing cannot be [exported](#export) half-made. It
carries a tail aimed at its own mark, position alone having stopped telling two close marks apart
once there is no corner it visibly travelled from.

It closes on the source it was given, or on the question being given up on, and on nothing else —
in particular a source the backend will not set closes nothing. The bar [balks](#balk) and stays at
the mark, holding that source and saying why it will not set, so a refusal is corrected in place
rather than by making the mark over again. That and the press it will not take are the whole of what
it reports, and it says one of them at a time — the last one it was asked. A gesture that placed
nothing, and a [save](#save) whose labels this backend cannot draw, are different questions and are
answered away from the mark.

Giving up has two forms, and only one of them works everywhere. **Escape** is asked for, and gives
up on any naming. A **press elsewhere** is incidental, and gives up only where the label is an
optional one — the press then starting the next gesture, since nothing was lost. Where the mark *is*
its label ([box](#box), [built-in rule](#built-in-rule)) the press is refused: an incidental click is
no way to destroy a mark that cannot exist unnamed, so the bar [balks](#balk) and says why, naming
the exit it *will* take — the user having just tried the one it will not, and a refusal that is a
dead end being no answer at all. It says the one sentence to every required naming: what makes a
label required is that the mark is it, which is the same fact whatever the mark, and the mark itself
is on the page under the bar to be looked at.
_Avoid_: LaTeX bar, typeset bar — the first names what is typed rather than what is being done, and
the second claims [typesetting](#typesetting), which happens behind a seam the bar never crosses

**Refusal**:
The editor's answer to something attempted — a [plop](#plop) the diagram will not take, a
[source](#source) the backend will not set, a press that would destroy a mark which cannot stand
unnamed, a [write](#write) the filesystem would not make. What tells it from a **report** is that
somebody just acted: a diagram opened carrying sources this backend cannot set is reported, nothing
having been attempted for the editor to answer. So a refusal is *announced* — it happened, now, and
whoever caused it is about to act again — where a report is only stated. Neither is the
[checking layer](#checking-layer)'s warning, which is about the mathematics being wrong rather than
about the editor declining to do something.
_Avoid_: error, rejection — the first names any bad news, a report nobody asked for included

**Balk**:
How chrome that stays asking announces a [refusal](#refusal): it does not go, and says so by acting
rather than only by writing. It belongs to chrome that survives its own refusal — the
[naming bar](#naming-bar) is the only such today, both its refusals leaving the question open —
because acting is what tells a second refusal from a first when the words are the same both times.
The region a refused [plop](#plop) is reported in has no such repeat to tell apart, its gesture being
over, so it stays still. Balking is what the editor does; how it is drawn is the page's own — a
swing, or a coloured edge for a reader who wants no motion, one balk drawn two ways, the same split
[role](#role) keeps with colour.
_Avoid_: shake, swing, flash — each names one drawing of it
