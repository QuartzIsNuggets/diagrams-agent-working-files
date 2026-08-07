# What the model refuses an element

Type: grilling
Status: resolved
Blocked by: 01

## Question

`addDot` refuses three ways and `addBox` refuses none — it makes room instead. **What do `addPath`
and `addArrow` do?** The split the model already keeps is the one to answer within: it **refuses the
meaningless and makes room where it can**, and leaves what a drawing can get *wrong* representable
for the [checking layer](../../../CONTEXT.md#checking-layer)
([ADR 1](../../../docs/adr/0001-diagram-draws-checking-layer-interprets.md)). Some of what follows
may not be a refusal at all but something the *types* already make unwritable, which is the better
answer wherever a single writable place can hold the rule.

The cases:

- **A drag released on nothing.** The gesture found no anchor under the release. Is that a
  [refusal](../../../CONTEXT.md#refusal) with wording of its own, or does the gesture simply not
  land — nothing having been attempted, so nothing to answer for? A box drawn on empty canvas is
  what the same release means in a different place, which is the awkward part.
- **An arrow whose output is among its inputs**, and a path whose two anchors are the same. The
  second is a [self-path](../../../CONTEXT.md#self-path) and is legal — `refl` is one. The first is
  **not** the same shape, which this ticket first assumed and
  [ticket 04](./04-what-a-selection-is.md) disproved twice over. It is reachable by an
  ordinary-looking drag: shift-click `a`, shift-click `b`, then drag `c` → `a` commits inputs
  `(a, b, c)` onto output `a`, three distinct anchors and nothing in the gesture to mark it out, the
  collision being with a [selection](../../../CONTEXT.md#selection) built three clicks earlier. And
  the drawing it makes is ordinary mathematics: `f a b = a`, a function one of whose arguments is
  its result. Not the first projection — `pr₁ : A×B → A` takes **one** input, and
  [Arrow](../../../CONTEXT.md#arrow) names `Σ-intro` and `pair=` as the rules that take two.
  So say what it is knowing that — under
  [ADR 1](../../../docs/adr/0001-diagram-draws-checking-layer-interprets.md)'s split it looks like
  neither the meaningless nor the wrong, and *not refused* has a reason better than nobody having
  thought of one.
- **A second element between the same two anchors.** Legal and expected: that is what a
  [fan](../../../CONTEXT.md#fan) is for, and `p` and `p⁻¹` are two different proofs. Confirm there
  is no duplicate rule, so no later reader invents one.
- **A cycle.** Two elements each landing on the other — `p` attaching to `q` while `q` attaches to
  `p`. Neither refused nor made unmakeable, being unreachable: an element only ever anchors onto
  anchors that already exist and nothing re-anchors one afterwards, so its anchor ids are strictly
  smaller than its own and the relation points backwards in time.
  [What a shaft is](./01-what-a-shaft-is.md) rests its resolution pass on exactly that and carries no
  guard. Name it here as not refused, and say why, so no later reader invents a rule for it.
- **An element onto an anchor it cannot reach**, if such a thing exists — an element inside a box it
  is not in, an arrow across [levels](../../../CONTEXT.md#level). Most of this smells like the
  checking layer's; the ticket's job is to say which of it is and to stop there.

Whatever is refused joins `Refusal` in the model as a reason and not a sentence, the wording living
in the shell beside the three that are there. Whatever is not refused is named here anyway, so that
the spec records the decision rather than the silence.

Resolve with `/grilling` and `/domain-modeling`.

## Answer

**Nothing.** `addPath` and `addArrow` refuse an element nothing at all, and `Refusal` keeps the three
arms it has. That is not a rule nobody thought of: it is what
[ADR 6](../../../docs/adr/0006-shape-is-derived-above-the-diagram.md) and
[ADR 1](../../../docs/adr/0001-diagram-draws-checking-layer-interprets.md) already decided, read
together for the first time.

### Why an element has nothing to refuse

`addDot` refuses three ways because **a dot has a place, and the model owns places**. Every one of
its arms is geometric — outside every box, too near a wall, too close to a dot — and each is a
question about a `Point` the model holds and can measure.

An element has no place. [Ticket 03](./03-where-derived-shape-lives.md) put
[shape](../../../CONTEXT.md#shape) in a module *above* the diagram, so what `addPath` and `addArrow`
are handed is anchor ids, a [source](../../../CONTEXT.md#source), and fields creation writes itself.
There is no geometry down there to weigh.

Nor is there a type. A [box](../../../CONTEXT.md#box)'s type is a `Source` — LaTeX the editor never
parses (`src/diagram.ts:71`) — so two boxes holding `A` and `A`, or `A` and `\Sigma_{x:A} B(x)`, are
indistinguishable to the model. Any rule about what an element may join would be a rule the model has
no way to evaluate.

So the split the ticket set out to answer within resolves one way throughout: **for an element, the
model is on the far side of both seams.** Everything below is that fact applied case by case.

### A drag released on nothing

**Not a refusal. The gesture does not land** — the region is left alone and the
[selection](../../../CONTEXT.md#selection) stands, which is
[ticket 04](./04-what-a-selection-is.md)'s *came to nothing → stands* with nothing added.

It could not be a `Refusal` arm in any case: no transition is reached, there being no `AnchorId` to
hand one. What was open was whether the shell should grow a refusal of its own, and two things say
no. The vocabulary already tells them apart — [Gesture](../../../CONTEXT.md#gesture) lists "released
on nothing, [refused](../../../CONTEXT.md#refusal), or a required naming given up on" as **three**
ways a gesture comes to nothing, and collapsing the first into the second would spend a distinction
already drawn. And `addDot`'s three all report something **invisible**: room, walls and a
neighbour's room are constraints a user cannot see. A release on nothing is the one fully visible
case — targeting snaps to the nearest candidate, so the ghost has been saying *not snapped* for the
whole drag. Live feedback is better than an announcement after the fact.

The ticket's awkward part — that the same release on empty canvas makes a box — is the rule rather
than a wrinkle in it. [Plop](../../../CONTEXT.md#plop) has the **press** decide what is made. A press
on an anchor is element work and element work has no answer for empty space; a press on empty canvas
is box work. The release never changes which question is being asked.

### An arrow whose output is among its inputs

**Not refused, in any of its three shapes** — and the ticket's stated reason for it was wrong.
`(a, b) → a` is not the first projection: `pr₁ : A×B → A` takes one input, informally
`pr₁ ∘ Σ-intro` being what a two-input drawing composes to. The case stands on `f a b = a` being
ordinary mathematics, which needs no example from the glossary.

What the three shapes divide on is whether the element has a **baseline**, which is
[Self-path](../../../CONTEXT.md#self-path)'s own test and the thing that decides the model change:

| | baseline | bend |
| --- | --- | --- |
| `f a b = a` — output among the inputs, at least one input distinct | centroid ≠ output, so the approach gives a direction | **derived** |
| `g a a = a`, `h a = a` — every input is the output | centroid **is** the output; no direction anywhere in the diagram | **stored** |

So **`Arrow` gains the `Loop` pair**, present exactly when every input is the output — the same "no
baseline to bend relative to" invariant `Path` carries at `src/diagram.ts:168`. This contradicts
[the map](../map.md)'s Note that the model already types all of this, which is amended in place: it
types all of it but this.

Refusing instead was declined on
[ADR 1](../../../docs/adr/0001-diagram-draws-checking-layer-interprets.md). A function carrying a
term to itself is meaningful — `transport` along `refl` is one — so a refusal would be the model
declining a *meaning* because the drawing layer had no shape for it, which is the one thing that
split exists to prevent. And the model could only ever refuse **identity**, never **coincidence**:
`{a, b} → c` with `c` sitting exactly at the midpoint of `a` and `b` collapses to the same nothing,
and [ticket 02](./02-fan-slots-arrival-slots-and-the-junction.md) already accepted that ("both
pictures are equally right, so there is nothing to prefer"). What separates them is that coincidence
is a position the user can drag out of and identity is baked into the row.

**The drawing is a separate ticket.** Today `f a b = a` draws its self-input's leg exactly underneath
its own shaft — the leg runs `a → junction` and the shaft runs `junction → a`, one segment traversed
both ways — so the figure reads as an ordinary `b → a` arrow with a junction dot, and that the output
is also an input is invisible. `h a = a` draws nothing at all, its approach being a zero vector.
Both go to [How a many-to-one arrow curves](./08-how-a-many-to-one-arrow-curves.md). That the model
does not fix them **is** the spine working: a drawing problem is not the model's to answer.

### Duplicate inputs, and why the gesture dedupes

`[a, a]` is meaningful and `addArrow` accepts it. **The gesture never produces one**: sources are the
[selection](../../../CONTEXT.md#selection) plus the drag's start, deduped at the release, **keeping
the first occurrence** so the anchor stays at the position its numbered badge shows.

The reason is a ceiling, not a rule. Undeduped, shift-clicking `a` and then shift-dragging *from* `a`
reaches multiplicity 2 and stops there — `_ a a a = a` has no gesture at all. A limit nobody chose
reads as a bug, so the feature is left out whole rather than half in. `g a a = a` is thereby
unmakeable, which is an **absent gesture and not a refusal**, the same standing the map already
inherits for renaming a mark.

Deduping in the model was declined twice over: it would silently alter a caller's meaning, which is
worse than refusing, and it would block the multiplicity gesture when one is drawn. **Dedupe is the
gesture's; the model goes on accepting what the gesture cannot say.**

This also retires the mismatch [ticket 04](./04-what-a-selection-is.md) named and deferred here.
That ticket declined to join the drag's start into the selection at press time because a shift-drag
from an already-selected anchor would toggle its badge off and commit it anyway — "the mark saying
one thing and the plop doing another". Deduping at the release makes them agree: one badge on `a`,
one leg from `a`, one input `a`.

### What the types hold instead: creation owns the loop pair

Widening `Loop` to arrows widens a hole `BothOrNeither` does not cover. It keeps the pair coherent
with *itself*, but nothing keeps it coherent with the element: a `Path` with `a !== b` carrying a
`loopDirection`, or an arrow with a distinct input carrying one, is representable — a stored bend on
an element whose shape is derived, which is a mark with nothing to mean. No type can say `a === b`,
which is why `src/diagram.ts:166` settles for holding the pair together.

**So creation writes it, and the caller cannot.** `addPath` and `addArrow` take an **aim** — ticket
02's "last pointer position clear of the anchor" — and record the pair **iff** the element has no
baseline, dropping it otherwise. An aim handed in for an element that has one is ignored rather than
refused: the gesture always has an aim, and creation is the thing that knows whether it is wanted.

That is the ticket's preferred answer rather than a refusal, and it is the pattern every creation in
the file already follows: `addBox` writes `NEW_BOX_SLOT` rather than taking one
(`src/diagram.ts:354`), `addDot` takes only a `Point`, `labelDot` writes `NEW_DOT_SIDE`, and
[ticket 06](./06-naming-an-element.md) adds `NEW_ELEMENT_T` and `NEW_ELEMENT_SIDE` on the same
footing. `loopSize` joins them as a constant at ticket 02's 30 units, and `conclusion` is written
`false`, no gesture on this map setting one.

### Named as not refused

The ticket asks that what is not refused be named anyway, so no later reader invents a rule for it.

- **A second element between the same two anchors.** No duplicate rule, and none to invent —
  [Fan](../../../CONTEXT.md#fan) exists for it. Not only the `p` / `p⁻¹` pair the ticket names: two
  **co-directed** proofs of one equality are ordinary, and a 2-path between them is the notation's
  own next move.
- **A cycle.** Unreachable, and the argument survives everything decided since. `takeId` never reuses
  an id (`src/diagram.ts:273`), an element's anchors exist before it does, and nothing re-anchors one
  — moving and deleting are both out of scope on this map. So an element's id strictly exceeds its
  anchors' and the relation points backwards in time, which is what
  [What a shaft is](./01-what-a-shaft-is.md) rests its guardless sweep on. The drag ghost changes
  nothing: a provisional element's anchors pre-exist it too.
- **An element across [levels](../../../CONTEXT.md#level).** Not refused because it cannot be
  written: [Diagram](../../../CONTEXT.md#diagram) commits that a diagram sits at a single level, and
  no row carries a level at all. That the [checking layer](../../../CONTEXT.md#checking-layer) lists
  levels among what it interprets is consistent with this and fixes the reading — a level is
  *inferred from* a drawing, never declared by one.
- **An element into a box it is not in.** No referent: only a [term-dot](../../../CONTEXT.md#term-dot)
  carries membership (`src/diagram.ts:149`), and an element attaches to anchors. The real case
  underneath is **a path between dots in two different boxes** — `p : x = y` with `x : A` and
  `y : B`. That is the checking layer's, on the ground above: the model cannot read a type. (An
  *arrow* between different boxes is just `f : A → B`, and right.)
- **An anchor id that names nothing.** An unchecked **precondition**, stated in the doc comment and
  kept by the one door that makes anchor ids — the gesture obtains them from what is under the
  pointer. It is the only model-*readable* candidate left, and it still fails the test: every
  `Refusal` arm is wording shown to a user (`src/editor.ts:73`) and
  [Refusal](../../../CONTEXT.md#refusal) turns on somebody having just acted, so an arm no user can
  reach would be a sentence written for nobody. Its failure is not benign — a row pointing at nothing
  would break ticket 01's sweep on every redraw — which is why it is *named* as a precondition rather
  than left silent, on the same footing as `addBox`'s extent already arriving floored
  (`src/diagram.ts:341-350`).

### No ADR

[Ticket 04](./04-what-a-selection-is.md)'s test: an ADR binds a seam a later author could cross
without knowing. This crosses none — it *reads* two that exist, and the answer is their conjunction.
Writing it down again would be the same claim in a third place.

### Amended in place

- [Self-path](../../../CONTEXT.md#self-path) — "the single exception to derived shape" is no longer
  single. The stored direction-and-size belongs to any element whose shaft's two ends are one point:
  the self-path, and the arrow whose every input is its output.
- [Fan](../../../CONTEXT.md#fan) — "a self-path is the one exception" widens the same way, both
  carriers being held apart from their neighbours by a stored direction rather than a derived one.
- [ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md) — its exception clause, on the
  same widening. The decision it records is untouched: a stored bend still belongs only where no
  baseline exists, and there turn out to be two places rather than one.
- [The map](../map.md) — the Note that the model already types all of this; and `/prototype`, which
  the Note said had no remaining consumer and ticket 08 now gives one.
- This ticket's own question — `pr₁` misread as the two-input drawing.

### What this hands to other tickets

- [How a many-to-one arrow curves](./08-how-a-many-to-one-arrow-curves.md) is created by this, and
  inherits two drawings the model has now committed to holding: `f a b = a` with its hidden leg, and
  `h a = a` with no ink at all.
- [Fan slots, arrival slots, and the junction](./02-fan-slots-arrival-slots-and-the-junction.md) is
  amended in place — its straight approach becomes a curve ticket 08 shapes, and its junction moves
  from 45% of a segment to 45% along that curve.
- The **spec** owes `Arrow & Loop`, an `aim` parameter on both creations, `NEW_LOOP_SIZE`, the dedupe
  at the release, and a doc comment saying the anchors must be the diagram's. It owes `Refusal`
  nothing.
