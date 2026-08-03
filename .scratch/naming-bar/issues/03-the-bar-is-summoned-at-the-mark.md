# 03 — The bar is summoned at the mark, and nowhere else

**What to build:** The corner retired. There is no bar on the page until a gesture asks what
something is called, and none once it has been answered — the bar exists at a mark or it does not
exist. A bar idling in a corner is a standing invitation to type LaTeX at nothing, where every
[source](../../../CONTEXT.md#source) belongs to some mark.

What goes with the corner is the whole idea of the bar having two places to be. There is no home to
fly back to and no *asking* state told apart from a resting one, because there is no resting state:
being on the page and being at a mark are the same fact. Where each gesture puts it does not change
— a box's is at the middle of its top wall, a term-dot's is at the dot.

The empty corner is then information rather than an absence: nothing is being named. The
[export](../../../CONTEXT.md#export) control keeps its own corner, which is the rule
[Chrome](../../../CONTEXT.md#chrome) states — chrome that names a **mark** goes to that mark and
lives only as long as the question, where chrome acting on the **diagram** has no mark to go to.

**Blocked by:** [02](./02-a-refused-source-keeps-the-bar-open.md).

**Status:** resolved

- [x] Nothing of the bar is on the page until a gesture asks
- [x] It arrives at the mark it is naming, ready to be typed into
- [x] It is gone the moment the question is answered or given up on, and gone again after a refusal
      it was corrected through
- [x] There is still one bar and at most one outstanding question
- [x] There is no resting position and no state distinguishing one from being at a mark
- [x] The export control keeps its corner and is otherwise untouched

## Choices

- **The bar is built by the question and appends itself** — `createNamingBar` went rather than
  becoming private, and with it the `form` parameter every caller threaded through: `askForSource`
  now takes only the mark and the vetting, raises a bar at that mark, and takes it off the page where
  the question ends. Nobody holds a bar between questions because there is none to hold, so `main.ts`
  appends only the editor and the export, and `createEditor` no longer takes one. The bar appending
  itself to `document.body` is the whole of what a page used to decide: where it goes is the mark it
  was given, and there is nothing left to place.
- **The one bar became one open question** — the `WeakMap` from form to record went with the several
  bars it could have held; a module-level `open`, naming the form on the page and what it does with a
  source, is what says there is exactly one. It absorbed the `over` flag
  [02](./02-a-refused-source-keeps-the-bar-open.md) added: *this bar is still the open one* and *this
  question is not over* are the same fact, so a vetting that lands late is turned away by the
  identity check rather than by a boolean kept beside it, and the listeners on a bar can read `open`
  outright — a bar reading an event is by construction the bar being asked.
- **A question asked while one is open gives up on that one** — nothing physical enforces "one bar"
  once the element is per-question, so the rule needed a place to live and this is the honest one:
  the displaced caller resolves with nothing, where before a second `askForSource` quietly overwrote
  the first's answering and left its promise to hang for good. The editor still starts no gesture
  while a naming is open, so nothing exercises it — it keeps the rule true rather than assumed.
- **Emptying the input went the way the corner did** —
  [02](./02-a-refused-source-keeps-the-bar-open.md) had the bar clear its own input on the one road
  out of a question, because the input outlived the question. It does not: the element is removed, so
  every question opens from nothing typed by construction and `shut` had nothing left to do beyond
  the removal. `.asking` went for the same reason, its one declaration having gone in that ticket and
  its remaining job being to mark a state that no longer exists.
- **Measured after appending, not before** — the bar is centred on its mark by its own width, so it
  has to be in the tree to have one. Appended, hung and focused inside a single task, so it never
  paints where it is not wanted; the stylesheet is applied by the time the rect is read, and nothing
  the bar wears is a web font whose arrival could change that width.
- **The tests ask the page, not the bar** — there is no bar to hold in a fixture, so both suites look
  one up through `.naming-bar` and a criterion like *gone once it is answered* is `barOn()` coming
  back null. The width jsdom cannot compute is stubbed on `HTMLFormElement.prototype`, there being no
  instance to stub before a question raises one. The editor's dot test gained the placement it never
  asserted, that being what is left to check once the class it watched is gone.
- **Checked in the shell, not only in jsdom** — a box drawn out summons the bar with its bottom edge
  on the middle of the rectangle's top wall and the cursor already in it; a refusal grows it upward;
  the source that sets takes it off the page; a dot gets one at the dot and Escape leaves the dot
  unnamed with nothing on the page but the drawing and the export in its corner.
