# 02 — A source that will not typeset keeps the bar open

**What to build:** Correcting a bad source where it was typed. Today a source the backend will not
set *ends* the gesture — the bar returns to its corner still holding the text, the reason appears at
the top of the canvas, and making the mark over again is the only way to retry. After this the bar
does not close: it stays at its mark, holding what was typed, with the reason on a line below the
input, and Enter tries again.

What that costs is *where* a source is vetted. The bar cannot close before the source is known to
set, so trying it belongs to the asking rather than to what the caller does with the answer. The bar
then closes on exactly two things — a source that set, and a question given up on — and that is what
makes the source it currently remembers between gestures redundant. **That memory goes with this
ticket**: every naming opens empty, because the only reason a source ever had to survive one was
that the bar used to close on a refusal.

The reason is put plainly and repeats no source back, the source being on the line above it. That is
the difference from the [canvas](../../../CONTEXT.md#canvas)'s own region, which keeps the questions
the bar cannot answer: a gesture that placed nothing, and the labels a diagram read from a file
could not set. Two regions because there are two questions — *why did nothing appear?* and *why is
this still asking me?* — and neither can answer the other's.

**Blocked by:** [01](./01-rename-the-naming-bar.md).

**Status:** ready-for-agent

- [ ] A source that will not typeset leaves the bar open at its mark, holding that source, with the
      reason below the input
- [ ] A box's provisional rectangle stays up while its source is being corrected — the mark the
      question is about does not go while the question is open
- [ ] Enter retries; a source that sets closes the bar and makes the mark
- [ ] Escape gives up on a refused source as readily as on a fresh one
- [ ] The bar closes on a source that set or on a give-up and on nothing else, so it always opens
      empty
- [ ] The reason names no source
- [ ] A gesture that placed nothing, and the labels a loaded diagram could not set, still report on
      the canvas's own region

## Choices
