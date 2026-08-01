# 02 — The box gesture

Type: grilling

**Blocked by:** None — can start immediately, and runs alongside
[ticket 01](./01-diagram-schema.md).

**Status:** ready-for-agent

## Question

A [box](../../../CONTEXT.md#box) is made in two ways, and both ask for its type expression:

- **Drag** on empty canvas — the drag sets the extent, and the box is resized upward if the drag
  made it too small for its label.
- **Click** on empty canvas — outside a box a release cannot mean *place a term*, so it means
  *make a box*, auto-sized.

That much is settled. What is not:

**What the prompt is, and what a cancelled one leaves behind.** A modal, an input on the box
itself, or the existing LaTeX bar retargeted? And on cancel: a box with no source, or no box?
`CONTEXT.md` says a box *is* a type drawn labelled with its type expression — which suggests an
unlabelled box is the meaningless state
[ticket 01](./01-diagram-schema.md) keeps out of the model rather than a state the
[checking layer](../../../CONTEXT.md#checking-layer) warns about.

**Who measures the floor.** Auto-sizing needs the label's extent, and only the render backend can
[typeset](../../../CONTEXT.md#typesetting) — asynchronously, and with two ways to fail. So making a
box becomes an asynchronous gesture, and a source that will not typeset has no extent to be floored
against. What is the box then?

**Whether the floor survives the label.** [Ticket 08](../../initial-planning/issues/08-persistence-format.md)
says a box auto-sizes on creation as *"an initial value, not an invariant"*, the extent being the
user's from then on. If editing a source later can force the box to grow, it is an invariant after
all. If it cannot, a box can end up too small for its own label.

**What refuses.** Boxes never overlap, so creation needs a refusal of its own — and a drag that
starts on empty canvas and ends inside an existing box needs an answer.

**Which [label slot](../../../CONTEXT.md#label-slot) a new box's label takes**, of the six.

Whatever this settles about *asking for a source* is expected to carry to term-dot labels in
[ticket 05](./05-term-dot-labels.md). If it cannot, say so — that ticket then needs its own
session.

## Answer
