# 02 — A source that will not typeset keeps the bar open

**What to build:** Correcting a bad source where it was typed. Today a source the backend will not
set *ends* the gesture — the bar returns to its corner still holding the text, the reason appears at
the top of the canvas, and making the mark over again is the only way to retry. After this the bar
does not close: it stays at its mark, holding what was typed, with the reason on a line above the
input, and Enter tries again.

What that costs is *where* a source is vetted. The bar cannot close before the source is known to
set, so trying it belongs to the asking rather than to what the caller does with the answer. The bar
then closes on exactly two things — a source that set, and a question given up on — and that is what
makes the source it currently remembers between gestures redundant. **That memory goes with this
ticket**: every naming opens empty, because the only reason a source ever had to survive one was
that the bar used to close on a refusal.

The reason is put plainly and repeats no source back, the source being on the line below it. That is
the difference from the [canvas](../../../CONTEXT.md#canvas)'s own region, which keeps the questions
the bar cannot answer: a gesture that placed nothing, and the labels a diagram read from a file
could not set. Two regions because there are two questions — *why did nothing appear?* and *why is
this still asking me?* — and neither can answer the other's.

**Blocked by:** [01](./01-rename-the-naming-bar.md).

**Status:** resolved

- [x] A source that will not typeset leaves the bar open at its mark, holding that source, with the
      reason above the input
- [x] A box's provisional rectangle stays up while its source is being corrected — the mark the
      question is about does not go while the question is open
- [x] Enter retries; a source that sets closes the bar and makes the mark
- [x] Escape gives up on a refused source as readily as on a fresh one
- [x] The bar closes on a source that set or on a give-up and on nothing else, so it always opens
      empty
- [x] The reason names no source
- [x] A gesture that placed nothing, and the labels a loaded diagram could not set, still report on
      the canvas's own region

## Choices

- **The vetting is handed to the bar rather than named by it** — `askForSource` takes a function the
  source has to survive and answers with whatever that hands back, so the bar knows when it may close
  without knowing what a source is for. It is what let the two gestures keep their different
  vettings: a box's is `measureBox`, since a floor is what a drag needs anyway and a source with no
  floor is a source this backend will not set, and a dot's is the bare `vetSource`, a dot having no
  extent to floor. A vetting that only rejected would have made the box measure twice, and the second
  measurement's *not* rejecting would have rested on the backend's cache — the shell reasoning about
  a seam it is on the wrong side of.
- **`clearSource` went rather than moving** — the bar empties its own input where it shuts, that
  being the one road out of a question now. The export existed only because the caller was the one
  who knew a source had landed; with the bar closing on nothing else, a second party emptying it had
  nothing left to say. Every question therefore opens empty, and no test has to arrange that.
- **The refusal the shell catches went with it** — a naming can no longer reject, so `named` lost its
  `try`/`catch` and the shell's region lost its only asynchronous writer. What still reaches it is
  what it is for: a release the model refuses, and the labels a loaded diagram could not set. Keeping
  the catch would have left a second wording for a refusal that can never arrive there.
- **The reason is the backend's sentence, unwrapped** — where the canvas region's `unsetWording`
  quotes each source it names, because those marks are scattered through a diagram and nothing points
  at them, the bar's says only why. The source is the line below it and the cursor is in it.
- **The bar is hung by its bottom edge, so a refusal grows it upward** — the reason going *above* the
  input decides how the bar is anchored, and the two are one decision. Anchored by its top, the new
  line would have taken the input's place and pushed the input down over the very mark it is asking
  about; anchored by its bottom, which is the edge that sits on the mark anyway, the line appears in
  space the bar was not using and the input does not move at all. So the inline placement is a
  `bottom` measured from the foot of the window rather than a `top` measured from its head, and the
  height the bar happens to have stopped being something the placement has to know. That also
  retired `.naming-bar.asking`, whose one declaration existed to undo the corner's `bottom`.
- **The empty reason line is told to take no room** — an empty flex item still claims a wrapped line
  and the gap below it, which would hold the input a line clear of its mark for as long as nothing
  was wrong, so `.naming-error:empty` is `display: none`. The canvas's and the export's regions are
  not laid out that way and need no such rule.
