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

**Status:** ready-for-agent

- [ ] The export control is inert for as long as a naming bar is open
- [ ] It is live again as soon as the bar closes, however it closed — a source that set, a give-up,
      or a press that cancelled it
- [ ] Being inert is visible, so a press that does nothing is explained before it is made
- [ ] The export control's own refusal region is untouched: this stops an export being started, and
      says nothing about one that failed

## Choices
