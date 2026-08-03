# 02 — An export sets its own labels

**What to build:** An [export](../../../CONTEXT.md#export) that cannot come out unlabelled because
somebody upstream forgot.

Drawing a diagram as a document of its own carries a precondition today, and carries it in prose:
*every label is expected already set, and a caller that did not put the diagram there by gesture owes
it a settling first*. Nothing enforces that. It holds in the app only by an argument spanning three
modules — every source was vetted at the [naming bar](../../../CONTEXT.md#naming-bar) before it
entered the diagram, so by the time the button is pressed there is nothing left to set. Both suites
pay it by hand, settling a diagram in a helper before serializing it. The day a diagram arrives by
some other road — [ticket 10](../../initial-planning/issues/10-save-open-mechanism.md)'s open, which
[ADR 3](../../../docs/adr/0003-a-save-records-the-diagram.md) says is the one thing that can receive
a file it did not construct — the file comes out with silent gaps where names should be.

So the document sets its own labels. It becomes asynchronous and does the settling itself, and the
precondition does not become a type: it stops existing. The screen's drawing is untouched and stays
synchronous, because there the two contracts genuinely differ — what is already set is on screen at
once and the rest arrives when it does, which is a feature and not an oversight.

Sources this backend will not set are **not** reported by the export. That is settled by
[Typesetting](../../../CONTEXT.md#typesetting): such a source is drawn unlabelled and reported, and
the reporting already happens where a diagram settles. A file matching what is on screen is the
honest outcome, and inventing a partial-success state for a road nobody can currently drive down
would ship untestable. Give the export something to say the day open exists.

One documented invariant is traded, and traded knowingly. The
[writer](../../../CONTEXT.md#writer)'s web arm is *"called without awaiting anything first so the
download still rides the click that asked for it"* — and this puts a wait in front of it. The wait
is a settling that finds everything already set, so it comes back within a microtask, and a
browser's user activation is bounded by time rather than by tasks. The
[hand-off](../../../CONTEXT.md#hand-off) still rides the click. That comment is **rewritten** to say
so rather than left standing contradicted.

**Blocked by:** [01](./01-the-set-label-store-becomes-a-module.md) — for the file rather than for the
feature. This needs nothing 01 builds and would work against the settling that exists today; it is
sequenced after it because both rewrite the same door.

**Status:** ready-for-agent

- [ ] A diagram exports fully labelled whether or not anything settled it first
- [ ] The precondition is gone from the prose, not restated in it
- [ ] Drawing to the screen stays synchronous and still draws whatever is set, the rest arriving as
      it does
- [ ] The export says nothing new about sources that will not set — the file matches the screen
- [ ] The [hand-off](../../../CONTEXT.md#hand-off) still rides the click that asked for it, and the
      writer's account of why is rewritten to match what now happens
- [ ] Both suites stop settling a diagram by hand before serializing one

## Choices
