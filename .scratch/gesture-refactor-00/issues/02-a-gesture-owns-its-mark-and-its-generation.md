# 02 — A gesture owns its provisional mark, and its own generation

**What to build:** A gesture that takes down what it put up.

Today the gesture draws the rectangle a box is being made in and the shell takes it away, because
the rectangle outlives the gesture: it is the mark the [naming bar](../../../CONTEXT.md#naming-bar)
is asking about, so it stands as long as the question does. That is a true fact about the drawing
and a bad split of the work — one module puts a mark on the canvas and another is trusted to
remember it. Make the release hand back a promise instead, and the gesture takes its own mark down
when the naming it began settles, whichever way it settles. A naming that rejects still clears.

That alone would be wrong, and the way it is wrong is the whole of this ticket. A naming a press
gave up on comes back **late** — the press that gave up on it has already started the next gesture,
which may already have a rectangle on the canvas — so a gesture clearing on the way out would wipe
the mark the gesture running now is asking about. The rectangle would return on the next pointer
move and be gone for a press held still, which is a flicker rather than a dead mark, and no less a
bug for it.

So the gesture counts its own presses and hands the release the identity check. It is the module
that receives presses, so it is the module that can say whether the one landing now is still the one
on the canvas — and the shell, which today keeps that count by hand and increments it from inside
the press callback, stops keeping one. [Ticket 05 of
naming-bar](../../naming-bar/issues/05-a-press-elsewhere-cancels-or-is-refused.md) wrote the count
down as owed:

> A gesture count, so a naming a press displaced ends nothing … It goes if a gesture is ever a value
> the shell holds — that value would be the identity.

This is that. The identity is not a value the shell holds but one the gesture hands it, which is
better: there is one count, in the module the presses arrive at, and no second copy to keep in step.

`clearChrome` leaves the backend's interface — the provisional rectangle is now taken down by the
same callback that puts it up, given nothing to show.

What must not change is what a user sees. The press-elsewhere groups in the shell's suite —
giving up on a term-dot's name and starting the next mark in the same press, and the box that
refuses to be given up on that way — are the proof, and they pass untouched. What is newly cheap to
test is the case they only ever reached by accident: a gesture that lands late clears nothing,
which is three lines against the gesture's own interface where today it wants pointer events and a
bar.

[`CONTEXT.md`](../../../CONTEXT.md)'s **Gesture** entry is amended in place — rewritten, not annotated
— to say that a gesture's arc includes the naming its release asks for, and that one runs at a time.

**Blocked by:** [01](./01-the-gesture-becomes-a-module.md).

**Status:** resolved

- [x] The provisional rectangle stands for exactly as long as the naming it is the mark for, and the
      gesture that drew it is what takes it down
- [x] A naming that rejects takes the mark down too
- [x] A gesture that lands late clears nothing — the mark on the canvas belongs to the gesture
      running now
- [x] The shell keeps no count of its own, and no longer increments one from inside a press
- [x] Taking down a provisional mark is no longer part of the render backend's interface
- [x] The press-elsewhere groups in the shell's suite pass unchanged
- [x] `CONTEXT.md`'s **Gesture** entry covers the naming, amended in place

## Choices

- **`show(undefined)` now means *take down what is showing*** — the meaning [ticket
  01](./01-the-gesture-becomes-a-module.md) left it, *nothing to show*, and the meaning it left open;
  a gesture that is over has nothing to show and nothing left standing, which is one fact rather than
  two, and is why `clearChrome` had nothing left to be. Give the retraction a word of its own the day
  a gesture wants to show nothing while keeping a mark up.
- **A press takes down what is showing, whoever put it there** — a gesture showing nothing says so
  from the press onward, so it retracts a mark an earlier gesture left standing. Sound only because
  the mark that outlives a release is the one a required naming is asking about, and such a naming
  refuses the press: an invariant now spanning `naming-bar.ts`, `editor.ts` and `gesture.ts`, and
  stated in `enableGesture`'s contract as what a caller wanting a mark to outlive its gesture owes.
  Key the retraction to the gesture that drew the mark the day two gestures may show at once.
- **The identity is a predicate, not the count** — `lands` is handed `displaced: () => boolean`, so
  the number never leaves the module and no caller can invent a second comparison over it. Hand out
  the count itself the day something has to order two landings rather than tell the last from the
  rest.
- **A naming that fails is let through, and has no kept test** — a failure is a caller's bug, not an
  answer, so the gesture clears the mark and lets it reach the platform where it is visible. The ask
  runs inside a promise so a naming that throws where it should have rejected clears too. Asserting
  either would mean handling the failure, which is what makes it invisible, so both paths were
  verified once and the tests dropped rather than kept at that price. Keep them the day a naming
  fails by design.
- **`max-lines-per-function` counts code, not comments** — the rule fired on `enableGesture` the
  moment anything was added to it, `.oxlintrc.json` having already made that budget for whole files
  and for the same reason. Splitting the closure to fit a budget that was measuring prose would have
  been the lint writing the design. It also quiets two standing warnings on `naming-bar.test.ts`,
  which is the same judgement applied to code this ticket never touched — revert the rule and take
  the warning on `enableGesture` if that is a budget worth keeping strict.
- **`CONTEXT.md`'s Chrome entry moved with Gesture's** — "the marks a gesture makes *before it
  lands*" became "*while it runs*", the arc now running past the release; leaving it would have had
  two adjacent entries contradicting each other on when a mark may stand.
