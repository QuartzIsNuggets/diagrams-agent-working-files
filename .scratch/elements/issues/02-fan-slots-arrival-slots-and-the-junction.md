# Fan slots, arrival slots, and the junction

Type: grilling
Status: resolved
Blocked by: 01

## Question

[Ticket 01](./01-what-a-shaft-is.md) says what a shaft is. This one says **where each element's
shaft is put**, which is the whole of what `Curvature` means now that no element stores a shape:

- **The [fan](../../../CONTEXT.md#fan) slot.** Every element sharing the same two anchors bows apart
  so no two overlap. Open: how wide a step, whether the step is fixed or divides a fixed span, and
  **which slot each element takes** — id order is the obvious answer and the only one this effort
  needs, fan ordering under an equivalence being fog on the
  [initial-planning map](../../initial-planning/map.md). The constraint
  [ticket 09](../../initial-planning/issues/09-targeting-anchors.md) inherited: grouping *and* the
  slot must ignore direction, because a bend applied along an element's own normal puts a reversed
  element on the mirrored side, and an opposed pair then lands on one line instead of either side of
  it.
- **The arrival slot.** `spread` is settled — one evenly spaced slot per arrival along the target,
  ordered by id, reserved rather than contended for. Open: the arithmetic. Whether the slots span
  the whole shaft or an inset run of it (the prototype clamps `nearest` to `0.18–0.82` and leaves
  `spread` unclamped, so an arrival can land where a head is drawn); what an element *not yet made*
  is previewed at, the drag ghost having no id to sort by; and whether a target's own ends count
  as taken.
- **The [junction](../../../CONTEXT.md#junction).** Derived, unplaceable, nameless. Open: where it
  goes — the prototype puts it a fixed fraction of the way from the inputs' centroid to the output —
  and whether a many-to-one arrow's legs bow at all, given it joins no fan.
- **A new [self-path](../../../CONTEXT.md#self-path)'s loop.** `loopDirection` and `loopSize` are
  stored, and no gesture sets them; a drag that starts and ends on one anchor has to supply both.
  Open: what a `refl` at a term-dot gets by default, and whether the drag's own shape says anything
  (the release point is somewhere, and the gesture knows where the pointer went) or whether the
  defaults are fixed and hand-adjusting them is the later effort this map rules out of scope. Open
  too, and belonging here because it is a number about how a loop looks: the **splay angle** — how
  wide a loop opens. It is a constant of the derivation rather than a stored field, so every loop is
  self-similar and `loopSize`, which [ticket 01](./01-what-a-shaft-is.md) fixed as how far the loop
  reaches from its anchor, scales one whole shape.

Each of these is small; they ride together because they are the same act — turning *which anchors*
into *where the ink goes* — and because splitting them would have three sessions each re-deriving
[ticket 01](./01-what-a-shaft-is.md)'s pass.

Three rules bind every answer. **Every number stated is a visible one** — where the ink lands, never
how the arithmetic reaches it: [ticket 01](./01-what-a-shaft-is.md) fixed a loop by the distance it
reaches rather than by its control points, and a fan bow is fixed the same way, by how far its apex
sits aside, with the control points derived. **The numbers are the model's or the backend's, never
loosely both**:
how far apart a drawing holds two elements between the same anchors is the same claim on screen and
in TikZ, the way `BOX_CLEARANCE` and `DOT_ROOM` are, where a stroke's weight is not — say which each
number is, as [`DOT_ROOM`](../../../CONTEXT.md#term-dot) already does. And **nothing here may be
stored**: a fan slot recomputed when an anchor moves is what
[ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md) bought.

Resolve with `/grilling`. The prototype's `geometry.ts` has a working draft of all four —
`FAN_STEP 26`, `JUNCTION_T 0.45`, `DOT_GAP 10`, and no self-path at all, which is the gap in it.

## Answer

**Every number below is the model's.** The ticket asks each to be declared one or the other, and the
answer does not vary: a fan's width, an arrival's place, where a [junction](../../../CONTEXT.md#junction)
sits and how wide a loop opens are all *where the ink lands*, so both backends must agree or the
same drawing means two things. This ticket adds no backend numbers; the backend's share of an
element — stroke weight, [role](../../../CONTEXT.md#role) hue, head size, junction dot — is settled
in [the map](../map.md)'s Notes and untouched here.

### The fan

**A fan is a fixed step of 26 units aside per slot**, slot `i` of `n` bowing by
`(i − (n−1)/2) × 26`, taken in id order within the group. A pair gets ±13 — a lens 26 across, five
times `DOT_ROOM` and twice `BOX_CLEARANCE`, which reads as deliberate at the scale the reference
drawings work at. The number is the **apex offset**, how far aside the bow's middle sits, with the
control points derived from it, per [ticket 01](./01-what-a-shaft-is.md)'s visible-number rule.

Fixed step rather than a fixed span divided among the members, because the two degrade differently
and only one degrades visibly. A span of ±26 holding five elements puts neighbours 13 apart —
exactly the hit-test reach, so the middle members stop being grabbable while the drawing still looks
fine. A fixed step spans 104 aside for the same five: wide, obviously crowded, every member still
grabbable. Degradation you can see beats degradation you can only discover by clicking.

**The bow runs along the normal of the element's own resolved chord, its sign taken from the group's
anchor order** — negated when the element runs high id to low id. This is the whole of the
direction-blindness [ticket 09](../../initial-planning/issues/09-targeting-anchors.md) demanded, and
it is where the prototype fails: `fanBend` hands `−13` to `pair⁼` and `+13` to `pair⁼⁻¹`, then
`curve` applies each along its *own* normal, and `normal(x′,x) = −normal(x,x′)`, so both land on one
line. What cannot be done instead is give the group a single shared baseline: once an anchor may be
an element, each member lands on a *different* point of it, so the group has no one chord to take a
normal of. The sign is what the members share; the chord is each element's own.

**A fan groups by anchor, not by endpoints that turn out to coincide.** Where one anchor is an
element, `spread` has already separated the members — two paths `x → q` land a third of `q` apart
and never overlapped — so the bow there is a second separation for a collision that is not
happening. It is kept anyway, for three reasons, the last decisive: it is
[the domain's own definition](../../../CONTEXT.md#fan), and that definition is doing work, a fan
being what makes 2.7.2's lens read as a back-and-forth rather than as two unrelated arrows; it is
read off the anchor references, so the forward sweep never looks ahead at an unresolved element;
and grouping on coincidence would be **unstable in a way no user could predict** — whether two
elements bow would depend on how many *other* arrivals `q` carries, since that is what sets their
slots, so adding something across the page would snap a distant pair from bowed to straight. A fan
grouped by anchor also shifts when it grows, ±13 becoming −26/0/+26, but only within the fan, where
the cause is on screen.

### The arrival slot

**Slot `i` of `n` sits at `t = (i+1)/(n+1)` of the whole shaft, unclamped.** That formula *is* the
answer to whether a target's own ends count as taken: it partitions the shaft into `n+1` equal gaps
with both ends occupied, which is why no arrival ever lands on the dots the target attaches to. The
alternative reading, `i/(n−1)`, spans end to end inclusive and puts arrivals exactly there.

So the shaft insets itself, by `1/(n+1)` — 85 units clear of either end for one arrival on a
170-unit shaft, 57 for two, 28 for five, against an 11.2-unit head and
[ticket 01](./01-what-a-shaft-is.md)'s 5-unit `DOT_ROOM` gap. An extra `[0.18, 0.82]` clamp, which
the prototype applies to `nearest`, adds no margin the partition lacks and takes it from where the
collisions actually are: two arrivals go from 57 apart to 36, three from 43 to 27. It protects an
end already protected by crowding the middle.

The failure this accepts is a *short* shaft with several arrivals — 40 units with two of them puts
one under a head. That is a visibly crowded drawing the user fixes by moving something, and buying
it off with a constant would crowd every drawing instead.

**A slot is claimed per point an element needs on the target, not per element and not per
reference**, ordered by element id and then by position within the element, inputs in order and the
output last. Per element is the prototype's rule and it forks both legs of an arrow whose inputs are
`(T, T)` from a single point — a real drawing, `Σ-intro` on `(a, a)` building `(a, a) : A × A`, which
the model admits and [ticket 07](./07-what-the-model-refuses.md) has no grounds to refuse. Per
reference breaks the other way, splitting a [self-path](../../../CONTEXT.md#self-path)'s two ends
across two slots, which is not a loop. Counting points gets both right and neither is a special
case: a self-path needs one point *because `a === b` is what a self-path is*.

Id order rather than an order read off where each arrival comes from. It costs the occasional
crossing, and it buys the thing `nearest` was rejected for lacking: slots that do not swap as
anchors move.

**A drag ghost is previewed by giving it the id it is about to get.** `takeId` returns
`[id, diagram]` and leaves the diagram it was handed alone (`src/diagram.ts`), so the provisional
next diagram — the one the release would produce — costs nothing to build and nothing to discard,
and the real `nextId` is untouched. The ghost then sorts **last** because its id is the largest
there is, which is where it will actually land. There is no ghost rule, no preview arithmetic and no
`scene.next` case: **the preview is the resolution of the provisional diagram.** The prototype's
`previewJoin` shows the opposite — `slots.indexOf(scene.next)` is `−1`, `Math.max(−1, 0)` is `0`, so
the ghost is drawn in the *first* slot, the one place it cannot go.

The target's existing arrivals re-flow to make room — the furthest slides about 28 units on a
170-unit shaft, whether one arrival becomes two or three become four — and the re-flow cascades
where an arrival is itself a target. It is not jitter: a slot depends on *which* target is aimed at
and never on where the pointer sits within it, so it is one snap when the winning candidate changes
and then still. And it is exactly what the release will do, so the release moves nothing.

### The junction

**An arrow's shaft is 55% of its approach**, the approach running from the inputs' centroid to the
output; the junction is where that leaves it. Stated from the drawn end deliberately: the fraction
`JUNCTION_T 0.45` the prototype carries is measured *from the centroid*, and nothing is drawn at the
centroid, so a user cannot see what it is a fraction of. The shaft is the drawn run — it carries the
label and the head — and it is the thing to state.

No floor under it. As the output approaches its inputs' centroid the shaft shrinks: ten units off,
the shaft is 5.5 against an 11.2-unit head, and the legs go collinear, so the whole figure collapses
to a segment. That is the same trade the arrival slot takes — an output sitting among its own inputs
is a crowded drawing, and a second constant would not rescue it anyway, since what is missing at
coincidence is a *direction* and not a length. At exact coincidence the junction flips from one side
to the other as the output crosses; both pictures are equally right, so there is nothing to prefer
and nothing worth building to pick.

**Legs are straight** — cubics with their controls on the chord. A fork reads as a fork when its
legs are straight and as three converging elements when they are not, and legs are the one part of
the figure no `labelT` runs along and no arrival lands on, so nothing needs them curved.

**A many-to-one arrow does join a fan**, which is where this ticket amends
[the domain](../../../CONTEXT.md#fan). Two in-theory functions `f` and `g` both carrying `(a, b)` to
`c` share centroid, junction, shaft endpoints and everything else, so they were drawn exactly on top
of each other, labels included — the one place the fan's promise that *no two overlap* failed
silently. The exemption's stated reason, that such an arrow has no one pair of anchors to share, is
answerable: it has a **shaft**, and a shaft has two ends. So the grouping key generalises to *the
two points a shaft runs between*, read off the model with no geometry — the unordered anchor pair
for a one-input element, and `(input set, output)` for a many-to-one arrow, that pair being what
determines the junction. Their legs stay straight and shared, which is honest, since the approach
really is the same one; their shafts bow ±13 into a lens between junction and output, which reads as
*these inputs give this output in two ways*.

Keying on the shaft's ends rather than on the flat anchor set matters: the flat set would fan
`{x,y} → z` with `{x,z} → y`, three anchors in common, different junctions, nothing overlapping to
fix. A [self-path](../../../CONTEXT.md#self-path) is then the only element outside a fan, held apart
from its neighbours by a stored direction rather than a derived one.

### The self-path

**The splay is 50°, and `loopSize` defaults to 30 units.** Writing `r` for the control reach and `s`
for the splay, [ticket 01](./01-what-a-shaft-is.md)'s definition of `loopSize` as the distance to
the far tip gives `r = loopSize / (0.75 · cos s)`, and the lateral extent, peaking at
`t = (1 ± 1/√3)/2`, gives a width of `0.770 · tan(s) · loopSize`:

| splay | control reach | loop width |
| --- | --- | --- |
| 30° | 1.54 × size | 0.44 × size |
| 45° | 1.89 × | 0.77 × |
| **50°** | **2.07 ×** | **0.92 ×** |
| 54.7356° | 2.31 × | 1.09 × |

The last row is a ceiling and not a preference. The distance from the anchor is
`9u²(1 − 4u·sin²s)` for `u = t(1−t)`, whose interior critical point `u* = 1/(6 sin²s)` enters the
curve's range `u ≤ ¼` exactly when `sin s ≥ √(2/3)` — **54.7356°**. Below it the tip is the farthest
point of the curve; above it a shoulder overtakes it and `loopSize` stops meaning what ticket 01
fixed it to mean. So the splay that would make a loop *round* is the very splay at which its size
stops being its reach, and 50° is chosen as close under that as still leaves the loop looking like a
loop rather than a spike.

At 30 units the loop is 30 long and 27.5 wide: six times `DOT_ROOM`, so plainly a loop and not a
blob; two and a half times `BOX_CLEARANCE`; under a fifth of the dot spacing the reference scene
works at, so it sits beside a term without reaching its neighbours, and inside the smallest box
there with room. That is about the visual weight of a fanned pair's 26-unit lens, which is right —
the two are comparable marks. Ticket 01's trim applies at both ends, both being the same term-dot,
so the ink starts and stops 5 units out and the loop stands open at its base by
`2 × 5 × sin 50°` = 7.7 units, which is what makes it read as attached to the dot rather than
swallowing it.

**`loopDirection` is taken from the last pointer position clear of the anchor**, and defaults to 0
radians — to the right — when there was none. The drag has to say something, because
[the map](../map.md) rules hand-adjusting a loop out of scope, so **the gesture is the only control
a loop will ever have**; and several self-paths at one anchor are ordinary mathematics rather than a
pathology — a non-trivial element of `Ω(A, x)` is a path from `x` to `x` that is not `refl` — so
they cannot be refused, and one fixed direction would draw them on top of each other with no way
out. The release point says nothing, being on the anchor by definition. Reading the *last clear*
position rather than the drag's farthest excursion makes the ghost a control instead of a readout:
the loop follows the pointer and can be steered, where a farthest-excursion rule sticks and cannot
be corrected without releasing. It needs no new number either, reusing the hit radius the gesture
already computes to decide the release landed on the anchor at all.

**The size is never read from the drag.** A click is a drag of no size and needs a default
regardless, so reading size from the drag would mean inventing a floor and a blend between the two
— and a [`refl`](../../../CONTEXT.md#refl) has no glyph of its own but is one, so a mark doing a
glyph's job should be the same size every time. Direction is what avoids collisions; size is not.

The default of 0 radians is not arbitrary: a term-dot's label sits **above** it until moved, and
`goal.jpg` sets a term's name to its **left** almost throughout, which is the lane a path arrives
on. Up is the label's and left is the arrival lane, so right is the free side.

Two costs are named rather than spent a rule on. Two loops made at one anchor by clicking, with no
drag at all, coincide — dragging is the natural way to place a second and the ghost shows exactly
where it lands, where a quarter-turn-per-existing-loop rule would fix it by sending the second loop
up into the label. And a click-made loop on a horizontal target lies along it — the alternative,
defaulting to the target's normal, is a second rule needing its own side tiebreak and saying nothing
about a dot.

**Nothing here is stored that ADR 2 says must not be.** `loopDirection` and `loopSize` are the
model's own fields, and a self-path is the one shape a drawing keeps; the gesture writes them once,
which is what the schema has them for. Every other number above is recomputed from the anchors on
every pass.

### What this hands to other tickets

- [Ticket 03](./03-where-derived-shape-lives.md) sites a **smaller** seam than it was charted
  against: one entry point, `resolve(diagram)`, called on a diagram that may be provisional. There
  is no second preview path to place.
- [Ticket 04](./04-what-a-selection-is.md) inherits the same: a drag in flight is a provisional
  diagram, not a mode the renderer has to be told about.
- [Ticket 06](./06-naming-an-element.md) gets its `at(t)` on a shaft whose extent is now fixed —
  junction to output at 55% of the approach for a many-to-one arrow, and the tip of the loop at
  `t = 0.5` for a self-path.
- [Ticket 07](./07-what-the-model-refuses.md) gains a **not-refused**, per its own closing rule: an
  arrow whose inputs repeat an anchor is meaningful, `Σ-intro` on `(a, a)` being an ordinary pair,
  and the arrival slot is built to give it a point per input.
