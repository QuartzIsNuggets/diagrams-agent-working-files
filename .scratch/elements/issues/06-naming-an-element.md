# Naming an element

Type: grilling
Status: resolved
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
- **One release, several namings.** [Ticket 04](./04-what-a-selection-is.md) made a
  [path](../../../CONTEXT.md#path) in path mode once *per source*, a path being `{ a, b }` and unable
  to merge them as an arrow does — so shift-click `a`, shift-click `b`, shift-drag `c` → `d` draws
  three paths from one release. A path's label is optional, so three bars in a row is one answer and
  plainly a bad one. Say whether the namings are asked in turn, asked once and applied to each, or not
  asked at all, the paths standing unnamed for a later naming gesture to reach — which would be the
  first mark in the editor that can be named after the gesture that made it, and is a door this map
  has not opened.
- **What a press elsewhere does.** Settled in principle by the
  [naming bar](../../../CONTEXT.md#naming-bar) — it gives up on an optional naming and starts the
  next gesture, and is refused for a required one — so this is a matter of the built-in rule
  inheriting the box's refusal wording, not a new rule. Confirm rather than redesign.

Resolve with `/grilling`. The mechanical consequences are spec content and not this ticket's:
`sourcesOf` learning element sources so a label is set and reported like any other, and the export
frame taking element extents.

## Answer

**An element is named the way its label is required or not, and the two answers already in the
editor are the two answers it needs** — no third naming shape. What the ticket found missing was
missing because it asked for a point on a curve; ticket 01 supplies one, and ticket 02 supplies a
curve for the element that does not exist yet, so the gap closes without new machinery.

### Whether the element is in the diagram while the bar is open

| mode | label | answer |
| --- | --- | --- |
| `1` [path](../../../CONTEXT.md#path), `2` [in-theory function](../../../CONTEXT.md#in-theory-function) | optional | **the dot's** — the element enters the diagram at the release, the bar asks after, and a question given up on leaves it standing unnamed |
| `3` [built-in rule](../../../CONTEXT.md#built-in-rule) | required | **the box's** — nothing enters the diagram until the source comes back; the **ghost stays up**, frozen at the release, and the gesture takes it down when the naming settles |

The ticket's reason for doubting the split was that *"an element's provisional mark is a shaft whose
shape depends on a fan the unmade element is not yet in"*. That is answered by machinery built for
the drag: [ticket 02](./02-fan-slots-arrival-slots-and-the-junction.md) previews a ghost by **giving
it the id it is about to get**, so the unmade element sorts last, lands in the fan it will actually
occupy, and the preview is simply *"the resolution of the provisional diagram"*. A provisional
element therefore has a real shaft, resolved by the one pass, and the built-in rule can take the
box's answer at no cost.

**What forces it rather than merely permitting it is deletion.** The other road — place the arrow,
then take it away when the naming is given up on — needs an element removed from a diagram, and
**removing one is out of scope on this map**. An unnamed built-in rule cannot be left standing
either (*"not a `pr₁` that lost its name but no rule at all"*), so placing-first owes a mechanism
this effort has ruled out. Not making it is what costs nothing.

The ghost surviving the release is safe for a reason already written down: *nothing else acts on the
diagram while a naming is open*, so no later mark can join the fan and leave the ghost drawn wrong.

This also settles which assignment [ticket 04](./04-what-a-selection-is.md) spends the
[selection](../../../CONTEXT.md#selection) at — before the naming for `1` and `2`, after it and
behind `displaced()` for `3` — which is the fork that ticket named and correctly declined to care
about, the spend riding with the assignment either way.

### What a new element's `labelT` and `labelSide` are

**`NEW_ELEMENT_T = 0.5` and `NEW_ELEMENT_SIDE = "left"`**, joining `NEW_BOX_SLOT` and
`NEW_DOT_SIDE` in `src/diagram.ts`.

`0.5` was half-decided already: [ticket 01](./01-what-a-shaft-is.md) calls it *"the 0.5 default"*
when measuring parameter against arc length, and picks the curve's own parameter partly because
*"the two readings agree exactly at the 0.5 default"*. The midpoint is also the only point on a
shaft clear of every end's clutter — a head, a [term-dot](../../../CONTEXT.md#term-dot)'s room, a
[junction](../../../CONTEXT.md#junction).

**A many-to-one arrow needs no special case.** Its `labelT` runs junction to output, so `0.5` puts
the name midway along *"the one segment every arrow has exactly one of"*, which is where a function's
name goes anyway. Same number, different place, no branch.

**`left` is a coin-toss for a straight element and is not one for a
[self-path](../../../CONTEXT.md#self-path), which is what decides it.** For a cubic with both ends on
its anchor, `B'(0.5) = 0.75 · (P₂ − P₁)`: the tangent at the label's own default point is
**perpendicular to `loopDirection`**. One side of it is the open air past the loop's tip; the other
runs back down the loop's axis onto the anchor, inside the `DOT_ROOM` ticket 01 keeps every shaft's
ink clear of. So one choice is outside the loop and the other sits on the dot, and `refl` would be
unreadable half the time.

Stating the default as `left` therefore hands [ticket 01](./01-what-a-shaft-is.md)'s derivation one
constraint — **order a loop's controls so that left of travel is outside**, `P₁` at
`loopDirection + splay` and `P₂` at `loopDirection − splay` in the model's counter-clockwise
convention. That is the same species of constraint ticket 02 already carries from ticket 09 (*a fan
slot must ignore direction, or an opposed pair lands on one line*): a derivation detail pinned by
what the drawing must look like, not a new number. Amended into ticket 01 in place.

**Fan crowding is accepted and is not what the side is for.** At 26 aside per slot a label falls in
the gap between neighbouring shafts whichever side it takes, and every element in a fan defaulting
to one side crowds the same gaps. Moving it is the user's, exactly as a box's slot and a dot's side
already are; a per-slot alternating default would buy one clean drawing and desynchronise on the
first drag.

### Where the bar is summoned

**At `at(NEW_ELEMENT_T)` on the shaft, through `toPagePoint` — the point the label will occupy,
with `labelSide` ignored.** The release point loses on ink: it sits at an end, in the target dot's
room, under the head, and for a built-in rule the bar would cover the ghost's own arrowhead — the
one part of a provisional element that says which way it points.

The argument worth keeping is that the two precedents read as contradictory and this reconciles
them. `boxFrom` goes *"at the label slot a new box takes, so a source is typed where the label it
becomes will be"*; `dotNamed` goes *"to the dot itself rather than to where the glyphs will land …
how far off it a label stands is the backend's own."* One goes to the label and one refuses to. The
rule under both:

> **The bar goes to a point on the mark, and never to an offset off it — the offset is a backend's
> own.**

A box's slot *is* a place on the box; a dot's label offset is not on the dot. An element is the
first mark with both kinds, `labelT` picking a point **on** the shaft and `labelSide` displacing off
it, which is what makes it the mark that exposes the rule. Written into
[Naming bar](../../../CONTEXT.md#naming-bar), since it binds whoever adds the next naming.

Two things fall out. The expression is **the same on both sides of the split** — a committed
element's shaft and a ghost's both come out of `resolve` — so there is one call and no case. And for
an arrow the shaft *is* the output segment, so the bar lands midway junction to output with no
arrow-specific arithmetic. The tail then aims at that same point, which the
[naming bar](../../../CONTEXT.md#naming-bar) already requires.

### One release, several namings

**A release that makes more than one mark asks nothing.** No bar; the paths stand bare.

Asking in turn mismatches the gesture — one gesture, three questions — and gives ticket 04's spend
rule three assignments where it names one. Asking once and applying the source to each manufactures a
wrong drawing by construction: `a → d`, `b → d` and `c → d` are three different proofs, and one name
across all three is a claim the user did not make and cannot take back.

What makes *don't ask* safe rather than merely convenient:

> **Only path mode can make more than one mark, so the plural case is always an optional label.**

Modes `2` and `3` merge their sources at a junction and make exactly one arrow however many were
accumulated, so the built-in rule — the one kind whose label is required — is **never plural**. No
required naming is ever skipped. The asymmetry of *one mark asks, several ask nothing* is then not a
special case but ticket 04's *the mode says whether they merge* read to its end.

It costs little: the shift-accumulated form is the bulk one, a user wanting names makes each path
with its own drag, and bare is the common case — the [naming bar](../../naming-bar/spec.md) effort's
own correction to the glossary was that `goal.jpg` *"leaves most of its black paths bare"*.

The door this leaves shut is **naming an element after the fact**, and the ticket was wrong to fear
it as *"the first mark in the editor that can be named after the gesture that made it"*. `labelDot`
supports renaming and has exactly one caller — `dotNamed`, inside the gesture that placed the dot —
and `addBox` likewise. **No mark in this editor can be renamed after the gesture that made it.** An
unnamed path is this map inheriting a boundary, not drawing a new one, so it goes to the map's Out of
scope beside moving and deleting rather than into the fog.

### What a press elsewhere does

Confirmed, and no new wording is owed.

| mode | press elsewhere |
| --- | --- |
| `1`, `2` | gives up; the element stands unnamed and the press starts the next gesture |
| `3` | refused; the bar [balks](../../../CONTEXT.md#balk) and says the one sentence, naming Escape as the exit it *will* take |

The [naming bar](../../../CONTEXT.md#naming-bar)'s *"one sentence to every required naming: what
makes a label required is that the mark is it, which is the same fact whatever the mark"* was written
to generalise past the box, and the built-in rule is the first thing to arrive and test it. It holds.

The part that is not automatic is the clause's tail — *"the mark itself is on the page under the bar
to be looked at."* For a built-in rule there is no mark in the diagram, and what sits under the bar
is a ghost. The sentence survives because the box is in the same position, its provisional rectangle
being chrome too: **both required namings point the user at a provisional mark**, which is why the
refusal inherits whole. Said here so no later reader takes the clause for a claim about diagram marks
and finds it false.

Escape is unchanged: it gives up on any naming, so a built-in rule Escaped is never made and the
ghost comes down — `boxFrom` handing back the diagram it was given, in element form.

### No ADR

Same test [ticket 04](./04-what-a-selection-is.md) applied. These rules bind `editor.ts`, which
exists and is their only caller, and the one that binds a seam — where the bar goes — is now a clause
in the glossary entry for the thing it constrains. The loop's control ordering binds `shape.ts`'s
derivation, whose seam [ADR 6](../../../docs/adr/0006-shape-is-derived-above-the-diagram.md) already
holds.

### Amended in place

- [Label slot](../../../CONTEXT.md#label-slot) — the entry gave a first-label default for a box
  (*centred at the top*) and for a dot (*above*) and none for an element. It now gives the element's,
  with the loop as the reason the side is not arbitrary.
- [Naming bar](../../../CONTEXT.md#naming-bar) — *summoned at the mark* is now *summoned at a point on
  the mark, never at an offset off it*, which is the rule the box and the dot were already both
  obeying.
- [What a shaft is](./01-what-a-shaft-is.md) — the loop's controls are now ordered, that ordering
  being what puts a default label outside the loop.
