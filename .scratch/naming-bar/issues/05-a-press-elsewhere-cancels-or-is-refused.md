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

**Status:** resolved

- [x] Pressing elsewhere while naming a term-dot gives up on the name and begins the next gesture in
      the same press
- [x] The dot given up on stays where it was, unnamed
- [x] Pressing elsewhere while naming a box is refused: the bar moves to say so, keeps the source,
      keeps the question open, and no gesture begins
- [x] Which happens is derived from whether the mark can stand unnamed, so a kind that becomes
      drawable later is covered without the rule being extended
- [x] Escape gives up on either, and a box given up on is never made
- [x] No press during a naming is absorbed in silence

## Choices

- **The naming is written on the question, not read off the mark's kind** — `askForSource` takes a
  `Naming` beside the point it hangs at, `required` or `optional`, and the bar reads that and nothing
  else about what is being named. The word is the model's, the glossary already telling required
  labels from optional ones, so a gesture that becomes drawable states which its mark is in one
  argument and every rule turning on the answer covers it untouched. Move it onto a mark itself if
  one ever exists before its name does — a box does not, which is the whole reason the fact travels
  with the asking.
- **The shell stopped keeping its own "a bar is asking"** — there is one bar and it is the bar that
  knows, and a press now ends a naming *and* begins a gesture in the same breath, so a flag beside it
  would have been stale for exactly as long as it took the displaced naming to come back. The shell
  asks the bar instead, and a press it may not go on with is the bar's `no` rather than the shell's.
  What that admits is that a question outlives the editor that asked it, the bar being the page's:
  two editors would share one, and the tests give up on whatever the last one left open before the
  next begins. Scope the question to an editor when a page ever holds two.
- **A gesture count, so a naming a press displaced ends nothing** — the press that gives up on one
  starts a gesture, and the naming comes back afterwards to an editor already drawing that gesture:
  ending it would take down the rectangle the bar is now asking about and empty a region the new
  gesture just wrote. `named` reads the count it began on, which is the identity check the bar makes
  on its own form. It goes if a gesture is ever a value the shell holds — that value would be the
  identity.
- **The refusal is a class the stylesheet swings, taken off as the swing ends** — an animation is
  something that happened rather than a state the bar is in, so nothing has to remember to clear it
  and the look stays in the stylesheet with the rest of the bar's. A press landing mid-swing adds a
  class already there and changes nothing, the bar being mid-refusal at that moment anyway. Restart
  it on every press if the swing is ever slowed enough for that to read as absorbing one.
- **A reader who wants no motion is answered by another animation, never by none** — the same class,
  running the refusal's colour over the input's edge instead of swinging the bar, because the class
  comes off when an animation under it ends: switching the animation off would leave it on for good
  and every press after would be swallowed in the silence this ticket is against. That the bar hears
  an animation ending on its input is what the arrangement rests on, so it is pinned by a test.
- **A press elsewhere hands back what became of it, not permission** — `pressElsewhere` answers
  `goes-on` or `refused`, where a boolean read at the call site as a question about the press rather
  than as the act it is: asking gives up on a naming or sets the bar swinging, and a caller that
  ignored the answer would have ended one either way.
