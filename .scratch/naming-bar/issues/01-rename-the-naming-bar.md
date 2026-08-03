# 01 — Rename: the naming bar

**What to build:** The editor's one input takes the name the project already uses for what it does.
The module, its factory, its class and its own comments stop calling it the LaTeX bar and become the
**[naming bar](../../../CONTEXT.md#naming-bar)** — the word the shell already uses for the
interaction it drives, so the state that gates a second question and the thing that asks it stop
being two vocabularies for one idea.

The two names it gives up are given up for reasons: the first names what is typed rather than what
is being done, and the second claims [typesetting](../../../CONTEXT.md#typesetting), which happens
behind a seam the bar never crosses.

Nothing changes on screen. This lands alone so that every ticket after it is a diff about behaviour.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] The module, its factory, its class and its comments name the naming bar
- [x] No caller, test or stylesheet still says label form, label input or LaTeX bar
- [x] The drawing behaves exactly as it did: same gestures, same corner, same refusals, same tests
      passing

## Choices

- **The input's class was dropped rather than renamed** — `.label-input` became `.naming-bar input`,
  which is how the stylesheet already reached the button beside it. The bar has one input, so a
  class of its own named nothing the bar's own did not already say; a second class would have been
  the second vocabulary this ticket exists to remove.
- **The shell's `form` became `bar`, though it never said label form** — the ticket's reason is
  `editor.ts`: `naming` gates the second question and the thing that asks it sat next to it under
  the name of its HTML element. They now read as one idea. Inside the module `form` stays, since it
  is there distinguished from the `Bar` record held beside it.
- **What the bar shows is untouched** — the placeholder, the `latex` field name, the `LaTeX label`
  accessible name and the `Typeset` button all stand. Nothing changes on screen is the criterion,
  the accessible name is on screen for whoever reads it that way, and the button goes for its own
  reasons in [04](./04-the-bar-points-at-its-mark.md).
