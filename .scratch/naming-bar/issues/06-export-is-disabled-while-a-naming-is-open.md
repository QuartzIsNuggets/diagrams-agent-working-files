# 06 — Export is disabled while a naming is open

**What to build:** No diagram leaves the editor half-made. While a naming bar is open the
[export](../../../CONTEXT.md#export) control is inert, and live again the moment the bar closes.

The bar is already modal in effect — the canvas begins no gesture while one is open — but the export
control is not on the canvas and nothing has stopped it. Pressing it mid-naming emits the diagram
*as it stands*, which is precisely the diagram missing the thing being made: a term-dot placed but
not yet named, or a box not yet added at all, since a box is only made once its source has set. The
file that comes out is not wrong so much as quietly not the drawing on screen.

This is the one place the editor and the export control have to know of each other. That coupling is
the ticket.

**Blocked by:** [01](./01-rename-the-naming-bar.md).

**Status:** resolved

- [x] The export control is inert for as long as a naming bar is open
- [x] It is live again as soon as the bar closes, however it closed — a source that set, a give-up,
      or a press that cancelled it
- [x] Being inert is visible, so a press that does nothing is explained before it is made
- [x] The export control's own refusal region is untouched: this stops an export being started, and
      says nothing about one that failed

## Choices

- **Wired to the bar, not through the editor** — the shell stopped keeping its own *a bar is asking*
  in [05](./05-a-press-elsewhere-cancels-or-is-refused.md), so routing this through `Editor` would
  put back the second copy that ticket removed. `main.ts` hands `whileNaming` to
  `createExportControls`, and the two modules still know nothing of each other. Move the wire into
  `Editor` if chrome ever has to stand down for a reason the bar cannot know.
- **`whileNaming` pushes, and every open and close funnels through one setter** — whether a question
  is open is a fact acted on outside the module now, so `open` is written by `nowAsking` and nowhere
  else; an assignment slipping past it would leave the control holding the state from before. Pushed
  rather than left to be asked because being inert has to be *visible*: a control that consulted a
  predicate on being pressed would explain itself one press too late.
- **A registration lasts the page's life** — `whileNaming` has no way back out, because what stands
  down is chrome built once with the page and never taken away; an unregister would be machinery for
  a lifecycle nothing has. Add one the day something that comes and goes has to stand down — the
  suite's `watched()`, which registers afresh per test and never tears down, is the first thing that
  would want it.
- **`disabled` on the button, dimmed by one rule** — the one attribute that stops a press *and* a
  keystroke *and* carries `:disabled` for the stylesheet, so being inert and looking inert are the
  same change and cannot drift apart. Nothing is written to the export's refusal region: going inert
  stops an attempt rather than being one, and the region stands for the last attempt.
- **The wire is a required argument, not an optional one** — *no diagram leaves the editor half-made*
  is the control's own promise, so a caller free to omit it would get a control that breaks it. What
  it costs is a stand-in in the export suite, which is also what drives a naming open and shut there
  with no bar on the page: a boolean is the whole of what crosses the seam, and how a naming actually
  ends is `naming-bar.test.ts`'s.
- **`CONTEXT.md` untouched** — the naming bar's glossary entry already says the drawing cannot be
  exported half-made. This is the wiring that makes a sentence already written true, so there was
  nothing new for the domain doc to hold.
- **Checked in the shell, not only in jsdom** — a box drawn out dims Export for as long as the bar
  asks and leaves it live the moment the source sets; a dot's naming dims it too, a press elsewhere
  that cancels that one and opens another leaves it dim across the handover rather than flickering
  live between them, and Escape brings it back with the dot standing unnamed.
