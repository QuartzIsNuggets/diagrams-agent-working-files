# 2. Geometry is abstract, and shape is derived

Date: 2026-07-30

## Status

Accepted. Resolves the render-agnosticism constraint of
[ticket 04, notation domain model](../../.scratch/initial-planning/issues/04-notation-domain-model.md).
Builds on [ADR 1](./0001-diagram-draws-checking-layer-interprets.md).

## Context

Two render backends draw one diagram: SVG for screen, TikZ for papers
([ticket 07](../../.scratch/initial-planning/issues/07-output-formats.md)). So no backend's
terms may reach the diagram — pixels and hex colours are leaks in the same way DOM nodes are.

Positions are unavoidable: the editor is a drawing tool and dots are placed by hand. Curves are
less obvious. The reference drawings bend freely, and the naive answer — store Bézier control
points per edge — is backend-neutral in itself, since TikZ has `..controls..`. It fails for a
different reason: anchors move constantly, and absolute control points do not move with them.

## Decision

**Units are abstract.** A diagram is measured in diagram units; each backend picks its own
scale.

**The y-axis points up**, as in mathematics and in TikZ. The SVG renderer flips once at its root
and converts pointer positions back on the way in.

**Positions are relative where a relationship already exists.** Boxes carry absolute positions;
a term-dot's position is relative to the box that owns it, so moving a box carries its dots with
no bookkeeping.

**Shape is derived, not stored.** No path or arrow carries a shape field. Curvature is a
function of the anchor pair, the edge's index among the parallel edges sharing that pair, and how
many there are: a lone edge is straight, several fan apart into a lens. A many-to-one arrow's
junction is likewise derived and has no identity.

The exception is an element whose **shaft has one end rather than two**, and which therefore has
no baseline to bend relative to. It carries a direction and size of its own. Two elements are in
that position: the **self-path**, whose ends coincide, and the **arrow whose every input is its
output**, whose junction coincides with that output for the same reason.

## Consequences

Dragging an anchor cannot wreck a drawing, because there is nothing stored to go stale. A field
that nothing writes is not carried.

The cost is that curvature cannot yet be adjusted by hand — the hand-drawn curves in 2.6.5's
layer-0 diagram render straight. If manual control is wanted later, it arrives as an optional
override on top of the derived value, which is additive and breaks nothing.

The SVG backend pays for the model's neutrality with one pointer-to-diagram conversion, which is
written once. TikZ, the batch backend, pays nothing.
