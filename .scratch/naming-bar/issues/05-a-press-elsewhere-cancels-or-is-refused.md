# 05 — A press elsewhere cancels, or is refused

**What to build:** The second way of giving up, and the one case that refuses it. Escape is *asked
for* and gives up on any naming. A press elsewhere on the canvas is *incidental*, and is honoured
only where nothing is lost by honouring it: where the mark can stand unnamed, the press gives up on
the name and starts the gesture it began, so putting down the next mark takes one press rather than
Escape and a press. Where the mark **is** its label, the press is refused and the bar says so by
moving — an incidental click is no way to destroy a mark that cannot exist unnamed.

Which of the two happens is **read from the mark**, never from a list of kinds. A
[label](../../../CONTEXT.md#label) is required exactly where the mark is its label — a
[box](../../../CONTEXT.md#box) is its type expression, a
[built-in rule](../../../CONTEXT.md#built-in-rule) is the rule it names — and optional everywhere
else: a term can stand unnamed, a [path](../../../CONTEXT.md#path) asserts its equality without
being named, and an [in-theory function](../../../CONTEXT.md#in-theory-function) may go unnamed too.
Only two of those are drawable today; the rule is written so that the ones that follow need nothing
added to it.

Today a press during a naming does nothing at all, silently. That was unremarkable while the bar sat
in a far corner and is not now: the bar is small, unscrimmed, and under the cursor, and a canvas
that looks exactly as live as ever while absorbing presses says nothing about why.

**Blocked by:** [03](./03-the-bar-is-summoned-at-the-mark.md).

**Status:** ready-for-agent

- [ ] Pressing elsewhere while naming a term-dot gives up on the name and begins the next gesture in
      the same press
- [ ] The dot given up on stays where it was, unnamed
- [ ] Pressing elsewhere while naming a box is refused: the bar moves to say so, keeps the source,
      keeps the question open, and no gesture begins
- [ ] Which happens is derived from whether the mark can stand unnamed, so a kind that becomes
      drawable later is covered without the rule being extended
- [ ] Escape gives up on either, and a box given up on is never made
- [ ] No press during a naming is absorbed in silence

## Choices
