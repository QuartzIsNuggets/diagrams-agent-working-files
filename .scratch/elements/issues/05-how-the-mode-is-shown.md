# How the mode is shown

Type: prototype
Status: open
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
