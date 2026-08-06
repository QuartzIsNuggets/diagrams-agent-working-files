# What a selection is

Type: grilling
Status: open

## Question

[Ticket 09](../../initial-planning/issues/09-targeting-anchors.md) made many-to-one *ordinary
shift-click accumulation*: click `a`, shift-click `b`, shift-drag `c` → `d` draws an arrow from
`a, b, c` to `d`. Clicking an anchor selects it; clicking or dragging from another drops that
selection unless shift is held. That is the gesture, and it is settled. **What is not settled is
what a selection *is* to this editor.**

It is the first thing that outlives a gesture. `CONTEXT.md`'s [Gesture](../../../CONTEXT.md#gesture)
entry says one runs at a time, that it runs from a press to the naming its release asks for, and
that *nothing else changes a diagram*. A selecting click fits none of that: it makes no
[plop](../../../CONTEXT.md#plop), changes no diagram, leaves a mark that is not
[chrome](../../../CONTEXT.md#chrome) belonging to any running gesture, and has to survive until some
later gesture spends it.

What the answer has to cover:

- **Is a selecting click a gesture at all**, or a second kind of thing the canvas does? Whichever it
  is, `enableGesture` currently has one shape of answer — `Started` is `"rectangle" | "nothing" |
  "no-gesture"` — and a press that only selects is none of them.
- **Telling a click from a drag.** On an anchor a click selects and a drag draws, so the press's
  outcome is genuinely ambiguous until the pointer moves — the prototype needs a `CLICK_SLOP` of 4
  for exactly this. But [Plop](../../../CONTEXT.md#plop) says the opposite today, in as many words:
  *"nothing tells a click from a drag: a click is a drag of no size, and what is being made was
  settled before the pointer moved."* That rule is load-bearing for boxes and dots and should not
  simply go. Either it narrows — holding where location decides *what* is made, with a threshold
  appearing only where a press is ambiguous about its own anchor — or selection stops using a bare
  click, or the threshold becomes universal. **This ticket owns amending
  [Plop](../../../CONTEXT.md#plop) and [Gesture](../../../CONTEXT.md#gesture) in place**, not
  leaving a correcting note beside them.
- **What clears a selection**, beyond the unshifted press ticket 09 names: Escape, a press on empty
  canvas, a gesture that spends it, a refusal, the naming bar opening. And whether a selection
  survives the [naming bar](../../../CONTEXT.md#naming-bar), which already holds the canvas still
  while it asks.
- **What it looks like.** Selection marks are chrome, so [ADR 5](../../../docs/adr/0005-chrome-is-placed-never-translated.md)
  and the [Chrome](../../../CONTEXT.md#chrome) entry bind them, and the ordering matters — the
  inputs of a many-to-one arrow are ordered, and the prototype numbered its badges for that reason.
  Whether *this* effort's selection needs to show its order, or only its membership, is part of the
  answer.
- **Whether it belongs to the diagram.** It must not: a selection is not something a
  [save](../../../CONTEXT.md#save) records. Say so, and say where it lives instead.

What this ticket does **not** decide is what a selection is *for* beyond feeding this one gesture —
that is the initial-planning map's fog, and this map's *Out of scope*. Keep the answer to what
drawing an arrow needs, and leave the door open.

Resolve with `/grilling` and `/domain-modeling`. This is where the vocabulary grows a term, if it
needs one.
