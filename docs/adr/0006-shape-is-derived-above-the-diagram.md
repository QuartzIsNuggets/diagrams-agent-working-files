# 6. Shape is derived above the diagram, below every backend

Date: 2026-08-06

## Status

Accepted. Extends [ADR 2](./0002-geometry-is-abstract-and-derived.md), which left this open.
Resolves
[ticket 03, where derived shape lives](../../.scratch/elements/issues/03-where-derived-shape-lives.md),
and takes what it sites from
[ticket 01](../../.scratch/elements/issues/01-what-a-shaft-is.md) and
[ticket 02](../../.scratch/elements/issues/02-fan-slots-arrival-slots-and-the-junction.md) of the
same map.

## Context

[ADR 2](./0002-geometry-is-abstract-and-derived.md) decided that shape is derived rather than stored,
and said nothing about *who* derives it, because at that date nothing did: the editor drew boxes and
term-dots, whose positions it records.

[Elements](../../CONTEXT.md#element) are what make the question bite, because five things want the
same derivation and they do not sit on one side of any existing seam — which
[anchor](../../CONTEXT.md#anchor) is under the pointer, the [shaft](../../CONTEXT.md#shaft) the SVG
backend strokes, the extents an [export](../../CONTEXT.md#export)'s frame unions, the point and
tangent a [label](../../CONTEXT.md#label) at `labelT` sits on, and the TikZ emitter, which does not
exist and must not inherit an SVG-shaped answer. The prototype on branch
`prototype/targeting-anchors` showed what it costs to let two of them answer separately: its drawn
curve and its landed-on curve disagreed by 45px the moment one approximated the other.

## Decision

**One derivation, in a module above the model: `shape.ts`.** Both backends and the hit-test consume
it, and nothing derives its own.

**What decides the side is whether a model rule depends on it.** Box extents are the
[diagram](../../CONTEXT.md#diagram)'s because `addDot` and `addBox` cannot run without them — a term
outside a type is nothing a diagram can hold, and room-making measures by them. No transition needs a
shaft: `addPath` and `addArrow` take anchor ids and refuse on anchor grounds alone, so a diagram can
be built, saved and reopened without a Bézier ever being evaluated.

**The hit-test splits along that same line.** `boxAt` stays in the model; *what is under the pointer*
moves up, an element's shaft being derived rather than recorded.

**`resolve(diagram)` is a pure function returning plain data**, held by its caller for one act and
dropped — no memo, nothing kept between calls.

**A backend takes a diagram and resolves it**, rather than being handed a resolution. What it gets
back is **shape and never marks**: trim, head size, dot radius, hues and label offsets stay below the
seam.

**A number about the pointer belongs to neither side.** The hit reach is `shape.ts`'s own — the model
owns what both backends must agree on, and the TikZ emitter has no pointer to agree with; a backend
owns ink, and a reach is not drawn.

## Consequences

The TikZ emitter joins at the door the SVG backend already uses — a diagram in, a drawing out — and
inherits the derivation it must not repeat, which is the whole of what this record carries forward to
an author who never reads the map it came from.

A resolution is never handed across a seam, so handing a backend the resolution *of a different
diagram* is not a mistake anyone can make. The price is paid per act: a drag resolves twice per
pointermove — once against the committed diagram to find the target, once against the provisional one
that holds the ghost — which are two questions rather than one done twice. A module-level memo keyed
on the diagram was rejected for a reason beyond the arithmetic: a diagram is a value and undo will be
a stack of past ones, so such a memo becomes the one thing in the editor holding every past diagram,
with no owner to say when it stops.

[Diagram](../../CONTEXT.md#diagram) no longer claims to answer where a point falls, only which box
one falls in — the promise that sentence was making, that no laid-out page is needed to ask, is
untouched, the layer reading no page either. `Curvature` became [Shape](../../CONTEXT.md#shape) in the
same act, the entry having outgrown a name that covered only how far an element bends.

The rejected placements were the model growing shape, which would put derived geometry in the module
whose stated shape is the saved file's, field for field; and each backend deriving its own, which the
prototype had already disproved.
