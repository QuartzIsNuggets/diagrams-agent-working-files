# How the mode is shown

Type: prototype
Status: resolved
Blocked by: 04

## Question

The mode is settled functionally: **location decides, mode qualifies, and the mode persists.** A
press on empty canvas is a box and a press inside one a [term-dot](../../../CONTEXT.md#term-dot),
whatever the mode; the mode says only which element a press on an
[anchor](../../../CONTEXT.md#anchor) draws; `1` is a path, `2` an in-theory function, `3` a built-in
rule; and it survives the gesture that spends it. **What it looks like is not settled.**

It is a hard piece of chrome to place, and the difficulty is exactly the persistence.
`CONTEXT.md`'s [Chrome](../../../CONTEXT.md#chrome) entry says where a piece of it sits follows from
what it acts on — chrome naming a *mark* goes to that mark and is there only while the question is
open, and chrome acting on the *diagram* keeps its corner, so an empty corner says nothing is being
named. A mode acts on **neither**: it acts on the *next* gesture, which has no mark yet and may
never come. It is also the editor's first piece of standing state that a user can be wrong about —
draw with mode `3` armed from ten minutes ago and you get a built-in rule you did not ask for.

What the prototype gives is the *content* and not the chrome: `context.status([...])` is a debug
readout listing the mode, the mode keys, the selection, everything under the pointer, and what the
drag is from. It answered whether the scheme works, not what the editor should show.

Questions to put to a prototype rather than to prose:

- **Where it sits, and whether it is ever silent.** A corner badge, a strip, something at the
  pointer, something that shows itself only after a key is pressed and then fades. The
  [Chrome](../../../CONTEXT.md#chrome) rule may have to grow a third case, or the mode may have to
  be argued into one of the two it has.
- **What it says.** The current mode alone, or the current mode against the keys that change it —
  the keys being undiscoverable otherwise, there being no toolbar.
- **Whether it shows the mode or the mark.** Naming the mode (*built-in rule*) versus showing the
  ink the next element would take are different promises, and the second is the one that is
  checkable at a glance while drawing.
- **What the mode is at boot**, and whether the answer is visible enough that nobody has to be told.
- **How it and the selection sit together.** They are two pieces of standing state read at the same
  moment, by the same person, mid-gesture. [Ticket 04](./04-what-a-selection-is.md) settles what a
  selection shows; this decides whether the two share a place or deliberately do not, which is why
  it waits on that ticket rather than on any geometry.

Resolve with `/prototype`: a rough interactive stub over the real editor's vocabulary, reacted to
rather than argued about. Link the prototype from this ticket as an asset.
[ADR 5](../../../docs/adr/0005-chrome-is-placed-never-translated.md) binds however it is drawn.

## Assets

**Branch `prototype/mode-chrome`** in the code project, commits `25aae4f` and `5aed911` —
`prototype-mode-chrome.html` and `src/prototype-mode-chrome/`. Run `pnpm dev:web`, then
`/prototype-mode-chrome.html`.

Four candidates on `?variant=`, each a different claim about the gap in the
[Chrome](../../../CONTEXT.md#chrome) rule, which places chrome by what it acts on and has a case for
a mark and a case for the diagram but none for the *next gesture*:

| | | |
| --- | --- | --- |
| `corner` | a corner of its own | the next gesture is nowhere yet, so take a corner as the export control does — case two |
| `pointer` | riding the pointer | the next gesture starts at the pointer, so go there — a third case, the rule read once more |
| `anchor` | worn by the anchor | the mode qualifies a press on an **anchor**, and an anchor is a mark — case one, unchanged |
| `announce` | announced, then silent | the mode is an event, not a state: say what it became, then trust the user |

A second control `?says=` is orthogonal and judged separately — `ink` (a stub of the mark the next
gesture would draw), `name` (the mode in words against its key), or `both`.

There is deliberately **no status readout and no log**: a debug panel does the chrome's job, which
is how issue 09's prototype answered whether the scheme works without answering what to show. The
help card names the keys `1`/`2`/`3` but not which is which, and never says what the mode is at
boot — those are two of the questions above, and prose answering them would answer them for the
chrome. The scene and the gestures are settled decisions, not new ones: tickets 01 and 02's numbers
and ticket 04's press/release rules, so the chrome is read at real density and mid-gesture, beside a
selection's badges. `n` opens a stand-in naming bar, so the deaf-canvas rule can be seen.

## Answer

**A chip in a corner of its own, never silent, saying the keys and then the ink and then the name:**

```
┌─────────────────────────┐
│ [1] 2  3   ──▶   path   │
└─────────────────────────┘
```

### No third case is owed — the rule already said it, in a clause nobody was reading

The ticket's difficulty was that a mode acts on neither of [Chrome](../../../CONTEXT.md#chrome)'s two
subjects. That framing is what has to give, because the entry does not actually place chrome by its
subject. Read the corner clause again: the export control *"has no mark to go to and keeps its
corner"*. **Having no mark is the criterion; acting on the diagram is only why the export has
none.** A mode has no mark either — its mark is the one the next gesture has not made yet — and
arrives at the same corner by the other road.

So the rule stands as one sentence with two outcomes: **chrome goes to its mark where it has one,
and takes a corner where it has none.** That is an amendment to the entry, not an addition to it,
and it is where the answer is written down; the ticket's *"may have to grow a third case"* is
answered *no*.

The corner is **bottom left**, the export control keeping bottom right — two standing things, two
corners, and the sentence about an empty corner meaning *nothing is being named* is untouched, that
being the [naming bar](../../../CONTEXT.md#naming-bar)'s absence and not this chip's.

### The selection and the mode deliberately do not share a place

This is the same rule applied twice, arriving at opposite answers, which is why the two can never be
misread for one another: a [selection](../../../CONTEXT.md#selection) *has* marks, so its numbered
badges go to them ([ticket 04](./04-what-a-selection-is.md)); a mode has none, so it takes a corner.
They are told apart by **where they are**, which is the strongest distinction available and costs no
ink. It also settles the medium with no further argument — badges are SVG in the canvas's chrome
layer because they are placed in diagram units at a mark, and the chip is **HTML in the editor's
region**, beside the export control and the refusal line, because it is placed in page units at a
corner. Different anchors, different coordinates, different door.

### Never silent, and the three keys always shown

Silence was refused on the hazard the ticket named: a mode armed ten minutes ago is standing state a
user can be wrong about, and every silent candidate answers only at the moment it is already too
late to have been warned. So the chip is always there, and **all three keys are on it**, the armed
one filled — there being no toolbar, the keys are undiscoverable otherwise, and a chip showing only
the armed key would teach nobody that a second and third exist.

**What the mode is at boot is `1`, a path**, and the chip is how that is answered without anyone
being told — which was the test the ticket set for it.

### The order is the reading order

**Keys, then ink, then name** — *which key am I on*, *what will it draw*, *what is that called*. The
keys lead because they are the only part that never changes, so the eye lands on something fixed and
reads the varying part beside it.

### The name is short *because* the ink is beside it

The modes are called **path**, **function** and **rule**, and not the glossary's
[in-theory function](../../../CONTEXT.md#in-theory-function) and
[built-in rule](../../../CONTEXT.md#built-in-rule). Chrome wording is the shell's, the way `REFUSALS`
in `editor.ts` is the shell's sentence for a reason the model hands over wordless — the glossary
terms are not renamed and this does not touch them.

The reason it can be short is the reason both halves earn their place: what the short name drops —
*in-theory*, *built-in* — is exactly what the hue beside it is already carrying, `#c0392b` against
`#2e7d32`. So the two pieces **divide the message rather than repeat it**, which is what makes
saying both something other than saying one thing twice. The ticket asked *mode or mark*; the answer
is that the mark is the checkable-at-a-glance part and the name is what makes it nameable, and
neither is complete alone.

### Deafness costs nothing new

While a [naming bar](../../../CONTEXT.md#naming-bar) asks, the mode keys are digits in a source and
the chip **dims rather than goes** — `opacity: 0.45`, the disabled export button's own treatment, on
the export button's own stated grounds: the corner is the mode's whether or not its keys may be
pressed, and *a control that vanished would read as one that was never there*. Reused, not decided.

### ADR 5, and no sixth

The chip is placed by a literal inset, the export control's idiom, its anchor being the corner
itself; [ADR 5](../../../docs/adr/0005-chrome-is-placed-never-translated.md) is satisfied with
nothing added to it. No new ADR is earned either, for
[ticket 04](./04-what-a-selection-is.md)'s reason: the statement this makes is the one the
[Chrome](../../../CONTEXT.md#chrome) entry now makes, and an ADR would be the same claim in a second
place.

### What is left for the spec

Where the mode *value* lives — a field on `Shell` beside `current` and the selection, not a module,
there being no body of rules to hold: what a mode does belongs to the gesture that spends it, and
what it is is one of three. That is a line of spec, not a decision.

### Amended in place

- [Chrome](../../../CONTEXT.md#chrome) — the corner clause is restated on **having no mark** rather
  than on acting on the diagram, so it covers the export control and the mode chip both, and the
  entry gains the chip in its list of what chrome is.
