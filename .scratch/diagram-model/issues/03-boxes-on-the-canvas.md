# 03 — Boxes on the canvas

**What to build:** Making a box, end to end. A press on empty canvas asks for a type expression and
puts a [box](../../../CONTEXT.md#box) on screen — drawn from the diagram rather than appended to it,
which is the whole point of the ticket. This is where the model stops being a type and starts being
the document.

Three things arrive together because none is demonstrable without the others: the transitions that
take a diagram to the next one, the SVG [render backend](../../../CONTEXT.md#render-backend) that
draws a diagram into the [canvas](../../../CONTEXT.md#canvas), and the editor shell that holds the
current diagram and drives the two.

The diagram is a **value**, not a store: a transition returns the next diagram or a refusal, never
mutating what it was given. The shell holds *current*, which is what makes undo a stack of past
values whenever [ticket 09](../../initial-planning/issues/09-targeting-anchors.md)'s deferred work
lands.

The seam runs one way. The backend reads the diagram and draws it; nothing reads the drawing back.
Pointer positions cross into [diagram units](../../../CONTEXT.md#diagram-unit) at the backend and
never travel as pixels beyond it, and the y-up flip
([ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md)) happens once at the canvas
root. Because the diagram owns every extent, it also answers the geometric questions — what a press
landed inside, and which boxes a new one has to push aside — so no caller needs a laid-out page to
ask.

Term-dot plopping and the LaTeX bar are left exactly as they are, drawing alongside. They move into
the model in [ticket 04](./04-term-dots-in-the-model.md) and
[ticket 05](./05-term-dot-labels.md).

**Blocked by:** [01](./01-diagram-schema.md), [02](./02-the-box-gesture.md).

**Status:** ready-for-agent

- [ ] A press on empty canvas makes a box, sized by the drag and asking for a source as
      [ticket 02](./02-the-box-gesture.md) settled; a click, being a drag of no size, needs no rule
      or threshold of its own
- [ ] A box too small for its label is grown to fit it, per ticket 02's floor
- [ ] A box needing room another holds pushes it aside — least axis, transitively — so creation is
      never refused for overlap and no two boxes overlap once it settles
- [ ] A source that will not typeset makes no box, and the rectangle and its input go with it
- [ ] What is on screen is drawn from the diagram — a box appears because the diagram holds one,
      never because a gesture appended it
- [ ] A transition returns the next diagram or a refusal, and the diagram handed in is unchanged
- [ ] The refusal reaches the user in the canvas's own region rather than being dropped
- [ ] Pointer positions become diagram units at the backend, and the y-axis points up in the model
- [ ] The diagram answers what a point lands inside, with no reference to layout
- [ ] Term-dots and typeset labels still work as before, and survive a redraw
- [ ] Transitions and geometry are tested purely — no DOM, no pointer events, no faked layout — and
      the conversion, the flip and the gesture rules are tested at the backend

## Choices
