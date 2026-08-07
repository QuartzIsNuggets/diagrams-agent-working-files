# What a selection is

Type: grilling
Status: resolved

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

## Answer

**A selection is the ordered list of [anchors](../../../CONTEXT.md#anchor) a later gesture will draw
from**, and the vocabulary grows a term for it: [Selection](../../../CONTEXT.md#selection), placed
after [Plop](../../../CONTEXT.md#plop), being what a gesture comes to instead of one. It holds
anchors alone — a box is never one — and it is no part of a diagram.

Everything below follows from a single rule, which is the answer's real content:

> **Only a gesture that comes to something changes a selection.**

### The collision the ticket did not know it had

The ticket opens on ticket 09's *"clicking an anchor selects it"* as settled. It is not, because
[ticket 02](./02-fan-slots-arrival-slots-and-the-junction.md) had already spent argument on the same
press: *"A click is a drag of no size and needs a default regardless"*, and *"Two loops made at one
anchor by clicking, with no drag at all, coincide"*. A bare click on an anchor was claimed twice over
— once as a selection, once as a `refl` loop.

**Selection keeps the bare click; a loop needs a drag.** The test costs no new number:

```
press on an anchor, then release
  never clear of that anchor's reach   → select
  clear of it, then back onto it       → self-path
  onto another anchor                  → element
  onto nothing                         → ticket 07's
```

The reach is the ~13 units [ticket 03](./03-where-derived-shape-lives.md) put in `shape.ts` as the
layer's own number. Using it here is not thrift but the same fact twice: **the rule that makes a loop
steerable is the rule that tells it from a click.** Ticket 02 takes `loopDirection` from *"the last
pointer position clear of the anchor"*, so a drag that never went clear is a drag that could not have
aimed a loop anyway.

A slop measured in px was refused for a second reason. `gesture.ts` is *"told where the pointer is in
diagram units, knowing nothing of the flip, the scale or the ink"* — a click slop is a hand-scale
quantity and would be the first number in the editor wanting the scale that module exists not to
know. A reach is a drawing-scale quantity, so no unit puzzle arises.

### Is a selecting click a gesture?

**Yes — one anchor gesture with several landings, not a second kind of thing the canvas does.** The
press cannot know which it will be, so it must start a gesture regardless; retracting one at the
release, after it has counted itself and put a ghost up, would be a mechanism to keep in step with
the one already there.

The useful consequence is what `Started` does *not* need. A press that only selects does not exist at
press time, so there is no selection case to add; the case that is missing is the **ghost**, which the
drag preview needs whatever the release turns out to mean. Ticket 02 fixed what that ghost is — *"the
preview is the resolution of the provisional diagram"* — which is a whole diagram and not an `Extent`,
so `Provisional` grows an element arm and `show` grows with it. That is spec work, and it is owed to
the drag rather than to the selection.

### What a landing is, exactly

Not the release, and not `lands()`. [Gesture](../../../CONTEXT.md#gesture) already says *"the arc runs
to the end of that question, not to the button coming up"*, and the selection cares about the later
moment:

| | |
| --- | --- |
| press | `starts()` returns the ghost — selection untouched |
| drag | ghost follows — untouched |
| release | `lands()` fires (`src/gesture.ts:143`) — **not here**, except for a click |
| naming | the bar may ask — untouched, badges still standing |
| the result | the mark enters the diagram — **here** |

In `editor.ts` that moment is the assignment putting the mark in the diagram: `shell.current =
placed.diagram` (`editor.ts:184`) for a dot, before its naming, or `shell.current = next`
(`editor.ts:164`) for a box, after it and behind `if (displaced()) return`. Which of the two an
element takes is [ticket 06](./06-naming-an-element.md)'s; this rule does not care, because the spend
rides with the assignment either way.

The failure list is then not a list but the absence of that assignment — released on nothing
(`anchorAt` answered nothing, no transition reached), refused by the model (`nameDot`'s early
return), a required naming given up on (`boxFrom` hands back the diagram it was given), or displaced
by a later press (`named` returns first). **The spec must not spend the selection inside `lands`.**
The obvious implementation does, and gets the built-in rule wrong: the badges go at the release, the
naming is then given up on, and the picks are gone with no mark to show for them.

### The press and release rules

| | |
| --- | --- |
| press on an anchor | gesture starts; selection untouched and still shown |
| press where there is no anchor | selection cancelled **and** gesture started, as one act — shift or not |
| release → click on `a`, unshifted | `:= [a]` |
| release → click on `a`, shifted | `a` toggles |
| release → plop lands, unshifted | dropped |
| release → plop lands, shifted | **spent** |
| release → came to nothing | **stands** |

Ticket 09's *"clicking or dragging from another drops that selection unless shift is held"* is thereby
read as a statement about the **landing** and not the press, which is what makes a failed gesture free.
The no-anchor press is the one thing that acts at press time: pressing where nothing could be selected
is an unambiguous departure from anchor work, and it stays so with shift held, which keeps *click the
background to deselect* working without thinking about modifiers.

**The drag's start is not in the selection.** Ticket 09 commits *"every selected anchor plus the drag's
own start"*, and joining at press instead would break the one case that matters: a shift-drag beginning
on an already-selected anchor would toggle that anchor off and then commit it as an input anyway, the
mark saying one thing and the plop doing another. It needs no badge either — the ghost already draws
its leg.

### Sources, target, and what merges them

One statement covers every mode:

> The **sources** are the selection plus the drag's start; the **target** is the anchor released on;
> and the **mode says whether they merge.**

An arrow merges its sources at a [junction](../../../CONTEXT.md#junction) and is made once. A
[path](../../../CONTEXT.md#path) is `{ a, b }` and cannot (`src/diagram.ts:178`), so it is made **once
per source** — shift-click `a`, shift-click `b`, shift-drag `c` → `d` in mode `1` draws `a → d`,
`b → d` and `c → d`. Refusing the gesture instead was declined: it would be a shell refusal with
wording of its own, new surface in a ticket that owns none, where [ticket 07](./07-what-the-model-refuses.md)
holds sole title to what is refused.

The [self-path](../../../CONTEXT.md#self-path) is not a case in this rule but an instance of it —
`source === target`. So a shift-drag out and back onto `c` with `[a, b]` picked draws `a → c`, `b → c`
and the loop `c → c`, which is what the general statement says and needs no special reading.

### Escape, and the bar

**Escape always clears the selection and never lets go of a drag** — one meaning at all times; a drag
is let go of by releasing, and *released on nothing* is already a clean no-op.

That would collide with the bar, whose Escape gives up on any naming, and the collision is mechanical
rather than theoretical: the bar's Escape is a `keydown` on the **form** (`src/naming-bar.ts:392`) with
no `stopPropagation`, and keydown bubbles, so a window-level Escape would fire as well. The same fault
hits ticket 09's mode keys — `x^2` typed at the bar would arm arrow mode.

**One rule settles both: the canvas is as deaf as it is still.** The bar already holds the canvas still
for the pointer; it owns the keyboard on the same grounds, being a question in front of the canvas
rather than part of it. Escape gives up on the naming, `1`–`3` are digits in a source, and the
selection survives untouched — neither destroyed nor reachable until the bar shuts.

### What it looks like, and which door draws it

**Numbered badges, at each selected anchor.** Membership alone was declined on a fact worth stating
plainly: **an arrow's input order is invisible in the finished drawing.** Ticket 02 puts the junction
on the approach *"from the inputs' centroid to the output"* — a centroid is order-blind — and the legs
run straight to it, so reordering the inputs moves no mark. The model stores the order and means it
(`src/diagram.ts:205`). The badge is therefore the only moment in an ordered arrow's life when its
order is legible to anyone; unnumbered, a user commits an order they can neither read then nor recover
after.

Placement needs no decision: chrome naming a **mark** goes to that mark
([Chrome](../../../CONTEXT.md#chrome)), and how far off is ink and the SVG backend's own, exactly as a
label's offset is. TikZ has no chrome, so no second backend has an opinion — the badge is the first
piece of the drawing that is wholly one backend's.

**Its own door, `showSelection`, beside `show`.** `renderDiagram(canvas, diagram)` and
`drawDocument(diagram)` keep the signatures ticket 03 gave them, and the badges go through a second
door into the canvas's chrome layer as the provisional rectangle already does. Passing the selection to
`renderDiagram` instead would put chrome through the door the export shares, leaving `drawDocument` to
refuse it — *chrome never reaches an export* would become something an author must remember rather than
something the doors enforce. SVG rather than HTML: `cx`/`cy` is placement, so
[ADR 5](../../../docs/adr/0005-chrome-is-placed-never-translated.md) is satisfied without a measured
inset per badge.

### Where it lives

**`selection.ts` — a value and pure functions over it, with the value on `Shell` beside `current`.**
Three homes rule themselves out on rules already written: the **diagram** cannot hold it (a
[save](../../../CONTEXT.md#save) records the diagram), **`shape.ts`** cannot (ticket 03: `resolve` is
pure and holds nothing between calls), and **`gesture.ts`** cannot — it deals in `Point` and `Extent`
and has refused every anchor word, so handing it `AnchorId` would give it the vocabulary it exists to
avoid.

A module rather than a bare field, because there is a body of rules to hold — what a press does, what a
landing does, what a commit spends — and that is real depth. A **value** rather than a closure, because
`label-store.ts` earns its closure by *being* a store, keeping a promise (*asking retries, drawing
replays*) that a value could not; a selection keeps no such promise. `render-svg.ts:388` holds its store
as a module-level singleton, which is defensible only because a store *"knows it by source alone"* and
is genuinely backend-global — a selection is per-editor, so that shape was never available. What is
left is `diagram.ts`'s shape, which is the repo's dominant one and the one `src/` having no classes
points at.

```ts
// selection.ts
export type Selection = readonly AnchorId[];
export const NO_SELECTION: Selection = [];
```

### No ADR

The five that exist bind a seam a later author could cross without knowing, and ticket 03 earned a
sixth on exactly that test. This earns none: the rule binds `editor.ts`, which exists and is the only
caller there will ever be, and the statement it would make is the one
[Selection](../../../CONTEXT.md#selection) now makes in the glossary. An ADR here would be the same
claim in a second place, which is what the entry is for.

### Amended in place

- [Plop](../../../CONTEXT.md#plop) — the no-threshold rule **narrows** rather than goes. Where there is
  no anchor it holds unchanged. On an anchor the release decides one thing more, *whether* anything is
  made, and that is the only threshold on the canvas.
- [Gesture](../../../CONTEXT.md#gesture) — what a gesture *comes to* is wider than what it makes: a
  press on an anchor may come to a selection, and one that comes to nothing leaves the selection as it
  found it.
- [Chrome](../../../CONTEXT.md#chrome) — *"the marks a gesture makes while it runs"* was too narrow to
  hold a badge, which stands between gestures. Chrome at a mark now stands for as long as what it is
  about does.
- [Naming bar](../../../CONTEXT.md#naming-bar) — *held still* covers the keyboard as well as the
  pointer.

### What this hands to other tickets

- [Ticket 02](./02-fan-slots-arrival-slots-and-the-junction.md) loses the cost it named but did not
  pay: two click-made loops can no longer coincide, because a loop cannot be made without moving. Its
  `loopDirection` default of 0 stops being reachable from a gesture and survives as the model's default
  for a `Loop` no gesture made — the argument for *right* being the free side is untouched.
- [Ticket 05](./05-how-the-mode-is-shown.md) is unblocked, and gets its answer to *what a selection
  shows*: numbered badges at the anchors, through `showSelection`. The mode still fits neither of
  [Chrome](../../../CONTEXT.md#chrome)'s two cases — the badge widened the *timing* clause, not the
  *what it acts on* one — so the third case that entry may need is still that ticket's to argue.
- [Ticket 06](./06-naming-an-element.md) gains a case: one release, *n* namings.
- [Ticket 07](./07-what-the-model-refuses.md) gains an ordinary-looking route to *output among its
  inputs*, and a finding about what that drawing is.
