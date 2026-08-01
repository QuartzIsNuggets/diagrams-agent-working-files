# 04 — Term-dots in the model

**What to build:** A [term-dot](../../../CONTEXT.md#term-dot) becomes something the diagram holds
rather than something the canvas remembers. Releasing inside a [box](../../../CONTEXT.md#box) puts a
dot in it; releasing on empty canvas makes a box, as
[ticket 03](./03-boxes-on-the-canvas.md) established, so there is no longer any such thing as a term
outside a type.

A dot's position is relative to its box
([ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md)), so a box carries its dots
with nothing to maintain — which is worth demonstrating even before boxes can be moved.

Dots still never overlap, but the rule stops being measured in whatever the renderer happened to
draw. The diagram owns a **minimum separation** in [diagram units](../../../CONTEXT.md#diagram-unit)
and refuses a release closer than that; each render backend then draws a dot small enough to honour
it. Ink is the backend's, the constraint is the model's — the same split
[role](../../../CONTEXT.md#role) already has with colour.

This is where the old way goes. The canvas stops being read back for anything, and the tests that
dispatched pointer events and faked a `DOMRect` to reach a purely geometric rule are deleted rather
than ported: the rule is now reachable directly.

**Blocked by:** [03](./03-boxes-on-the-canvas.md).

**Status:** ready-for-agent

- [ ] Releasing inside a box places a term-dot in that box, at that point
- [ ] A dot's position is relative to its box
- [ ] A release closer to a placed dot than the minimum separation is refused, and the refusal is
      measured in diagram units
- [ ] A release over a mark already on the canvas is refused, and a press dragged onto one before
      release is refused too — the release point decides, as it does today
- [ ] The backend's dot size honours the model's separation, and the model names no size
- [ ] Nothing reads a dot back out of the drawing
- [ ] The overlap rule is tested with no DOM and no faked layout, and the tests it replaces are
      deleted rather than retargeted

## Choices
