# Naming an element

Type: grilling
Status: open
Blocked by: 01

## Question

An element's [label](../../../CONTEXT.md#label) is where two settled rules meet and leave a gap.
The [Label](../../../CONTEXT.md#label) entry says a [built-in rule](../../../CONTEXT.md#built-in-rule)
is a **required** naming — an unnamed one *"is not a `pr₁` that lost its name but no rule at all"* —
while a [path](../../../CONTEXT.md#path) and an
[in-theory function](../../../CONTEXT.md#in-theory-function) are **optional**. The
[naming bar](../../../CONTEXT.md#naming-bar) already implements both halves, for boxes and dots
respectively. And the [label slot](../../../CONTEXT.md#label-slot) entry says an element's label
takes a fraction `labelT` along it and an [`ElementSide`](../../../CONTEXT.md#label-slot), both
relative to the element.

What is missing is the **gesture's** side of it, and it is missing because an element's mark is a
curve rather than a point:

- **Where the bar is summoned.** It is summoned *at the mark it is naming* and carries a tail aimed
  at it. A box gets its label slot, a dot gets itself. An element has a whole shaft — its midpoint,
  the point at the `labelT` a new element takes, the release point the user is already looking at.
  Needs [ticket 01](./01-what-a-shaft-is.md), which is what can put a point on a curve.
- **Whether the element is in the diagram while the bar is open.** The two existing answers differ,
  and for a reason: a dot is placed first and named after, because it stands either way; a box is
  never made at all until its source comes back, because it *is* its type expression. A path and an
  in-theory function take the dot's answer and a built-in rule takes the box's — but a box's
  provisional mark is a rectangle the gesture draws, and an element's provisional mark is a shaft
  whose shape depends on a fan the unmade element is not yet in. Say what stands on the canvas while
  a built-in rule is being named.
- **What a new element's `labelT` and `labelSide` are**, as
  [`NEW_BOX_SLOT`](../../../CONTEXT.md#label-slot) and `NEW_DOT_SIDE` already are for the marks that
  have them — and whether a many-to-one arrow's `labelT`, which the model says runs along the output
  segment from the junction, changes the answer.
- **What a press elsewhere does.** Settled in principle by the
  [naming bar](../../../CONTEXT.md#naming-bar) — it gives up on an optional naming and starts the
  next gesture, and is refused for a required one — so this is a matter of the built-in rule
  inheriting the box's refusal wording, not a new rule. Confirm rather than redesign.

Resolve with `/grilling`. The mechanical consequences are spec content and not this ticket's:
`sourcesOf` learning element sources so a label is set and reported like any other, and the export
frame taking element extents.
