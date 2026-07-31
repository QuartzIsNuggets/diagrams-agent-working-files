# Drawing onto an anchor that is itself an edge

Type: prototype
Status: resolved

## Question

[Ticket 04](./04-notation-domain-model.md) settled that an **anchor** is a term-dot, a path
*or* an arrow — a path may run between two paths (2.6.5's `A'×B'`), and `ap_g` targets a path.
That makes the drawing gesture non-obvious in a way it never was for dots alone:

- **Targeting.** How do you aim at a path when a term-dot sits at each of its ends and other
  edges cross it? A dot is a point and easy to hit; an edge is a thin curve in a crowded
  drawing.
- **Where it lands.** An edge-to-edge path attaches to the *element*, not to a point on it — the
  2-path in `A'×B'` runs between two paths, and the model stores no position on them. So where
  does the renderer put the join, and does the user get any say?
- **Many-to-one.** `Σ-intro` and `pair=` take two inputs and one output
  ([ADR 1](../../../docs/adr/0001-diagram-draws-checking-layer-interprets.md)). What is the
  gesture — pick inputs then output, or draw a leg at a time and merge? The junction is derived
  and has no identity, so it cannot be placed.
- **Equivalence.** `≈` attaches to two opposed arrows symmetrically. Is it drawn, or asserted by
  selecting the pair?

Resolve with `/prototype` — make a rough interactive stub and react to it, rather than deciding
gestures in the abstract. Selection, move, undo/redo and canvas navigation stay out of this
ticket; it is only about *creating* an edge onto an anchor.

## Prototype

Branch `prototype/targeting-anchors` in the code project (`../`), commit `c7f08bc`. Run
`pnpm dev` there and open
[`/prototype-targeting-anchors.html`](http://localhost:5173/prototype-targeting-anchors.html).

One seeded drawing — 2.6.5/2.7.2-shaped, deliberately crowded: an opposed `pair⁼` pair fanned
into a lens, a 2-path `α` already running between the two paths `p` and `q`, a many-to-one
`Σ-intro`, and edges crossing each other. Three gesture schemes over it, `?variant=`:

| key | scheme | how it answers the four sub-questions |
| --- | --- | --- |
| `drag` | **A — Drag & snap** | targeting: nearest candidate wins silently · many-to-one: shift-drop onto an arrow joins it as another input · ≈: a third mode, dragged arrow→arrow |
| `select` | **B — Select, then verb** | targeting: click-cycling through everything stacked under one spot · many-to-one and ≈: no gesture at all, just a selection of a different size |
| `picklist` | **C — Pick-list & junction ghost** | targeting: a crowded press opens a list naming what is under it · many-to-one: a visible junction ghost inputs are dropped into · ≈: a stroke drawn across the two arrows |

### Settled while prototyping (already folded into `CONTEXT.md`)

- **A path is directional and is drawn with an arrowhead.** `p : x = y` runs from `x` to `y` and
  `p⁻¹` is a different path back; equality being symmetric is a fact about the *type*, not about
  the proof, and a diagram draws proofs. Hue, not the head, is what separates the two kinds on the
  page — an arrow always carries a role and so is coloured, a path has none and stays black. The
  first prototype drew paths headless and was wrong.
- **A fan spans kinds and ignores direction.** Every element sharing the same two anchors bows
  apart in one fan: an opposed pair makes a lens, and a path and an arrow between the same anchors
  bend around each other rather than either claiming the straight line. A many-to-one arrow has no
  one pair of anchors, so it joins no fan. `Fan` is now a term; `Element` was pinned as the name
  for "a path or an arrow", which the glossary was already using undefined while `edge` leaked in
  as an informal synonym.
- **`level`, not `layer`.** The glossary defined `Level` but three entries said "layer", which
  also names the checking layer. Drift fixed.
- Deferred out of this ticket: **fan ordering under an equivalence**, now fog on the
  [map](../map.md#not-yet-specified).

`?join=` is a **second, orthogonal** control for *where* an arrival lands on a target edge — the
question the model cannot answer, since it stores no position on the target. `nearest` (foot of
the perpendicular), `midpoint`, `spread` (even slots ordered by id). All three are derived, per
[ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md).

## Answer

**Scheme A — drag, with no disambiguation UI at all.**

**Targeting.** The nearest candidate under the pointer wins, silently. The question assumed a thin
curve in a crowd would need help being hit; generalising the **fan** removed the crowd instead.
Every element sharing two anchors bows into its own slot, so the pathological case — several
elements along one line, indistinguishable to the pointer — cannot arise. B's click-cycling and
C's pick-list were both answers to a problem the model no longer has, and both cost a click on
every ordinary gesture to pay for it. A box is never offered as a candidate, per
[ticket 04](./04-notation-domain-model.md).

**Kind and role are number keys**, not modifiers: `1` path · `2` in-theory function · `3` built-in
rule · `4` equivalence. Role is not a modifier on "arrow" — an arrow's role is part of what it is,
so choosing it is choosing what to draw.

**Many-to-one is shift-click accumulation**, the ordinary desktop pattern rather than anything
bespoke. Clicking an anchor selects it; clicking or dragging from another drops that selection
unless **shift** is held; the drag onto the output commits every selected anchor plus the drag's
own start as inputs. Click `a`, shift-click `b`, shift-drag `c` → `d` draws an arrow from `a, b, c`
to `d`. The junction stays derived and unplaceable — nothing in the gesture refers to it.

This also retires the collision the first draft had, where shift-dropping onto an arrow *merged*
into it while a plain drop *targeted* it. Dropping onto an arrow now unambiguously targets it,
which it must, an arrow being an anchor.

**An equivalence is drawn, not asserted from a selection** — mode `4`, dragged arrow to arrow, so
it reads like every other element rather than being a property applied to a pair. At most one
stands between any two arrows (now in [CONTEXT.md](../../../CONTEXT.md#notation)).

**Where it lands: `spread`.** One evenly spaced slot per arrival along the target, ordered by id.
The user gets no say, and wants none: it is the same argument the fan won on — reserve a slot
rather than let arrivals contend for one spot. `nearest` reads well but slides as anchors move and
collides when two arrivals come from the same side; `midpoint` stacks every arrival on one point.
Wholly derived, per [ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md).

### Two constraints the renderer inherits

Both were prototype bugs, and both are the kind that will recur in the real renderer:

- **The attach surface must be the drawn geometry.** Resolving an arrival against an approximation
  of its target rather than the target's real shaft leaves the arrival floating where the target
  *would* be — 45px off under `nearest`, and unmissable under `spread`, where adding an arrival to
  a target re-slots and swings it. Shafts must resolve recursively, in one memoised pass, with a
  cycle guard for two elements each landing on the other.
- **Direction leaks into a fan twice.** Grouping ignores direction, which the glossary says. The
  *slot* must too: a bend applied along an element's own normal puts a reversed element on the
  mirrored side, so an opposed pair lands on one line instead of either side of it.
