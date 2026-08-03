# 04 — The bar points at its mark

**What to build:** The bar's final form. Once there is no corner it visibly travelled from, position
alone stops saying which mark is being named — term-dots stand as little as a minimum separation
apart, and a box's wall is a thin dashed line the bar currently rests flush against. So the bar
carries a **tail** aimed at its mark, and stands clear of it, so the dot or the wall is still
visible while it is being named.

Room is found by moving the body, never the tail: **the tail owns the mark**. Where there is no room
above, the bar flips below and the tail moves to its top edge; where there is no room to one side it
shifts along, the tail sliding to keep pointing. The tail keeps a minimum inset from the bar's
corners, so it never lands on one — a mark extreme enough to reach that clamp is within a few units
of the edge, and a tail pointing a hair off is a better failure than a tail hanging off a corner.
Which side the bar takes is chosen when it is summoned and kept until it closes, so a refusal
arriving and growing the bar never teleports the thing being read.

The bar is fitted inside the **window**, not the canvas. The two are the same rectangle today; the
bar is page chrome, and if the canvas ever stops filling the window it is the window it has to stay
inside.

The **Typeset button goes**, and nothing replaces it. Enter commits and Escape gives up; the bar
cannot be reached without typing into it, so the hands are already where both exits are, and a
control saying one of them while saying nothing of the other was only ever advertising half the
contract. The bar becomes an input and a tail, with the line below it empty until something is
refused.

It may sit over the export control, and it does not dodge it. The bar is transient and is the thing
being answered; teaching it to avoid other chrome is a rule that grows a term every time chrome is
added.

**Blocked by:** [03](./03-the-bar-is-summoned-at-the-mark.md).

**Status:** resolved

- [x] The bar carries a tail aimed at the mark it is naming, from whichever edge faces it
- [x] The mark stays visible: the bar stands clear rather than resting on the dot or the wall
- [x] With no room above, the bar takes the other side, tail with it
- [x] Near a side, the body shifts to stay inside the window and the tail slides to keep pointing
- [x] The tail never lands on a corner
- [x] The side is chosen at summon and never changes while the bar is open, including when a refusal
      grows it
- [x] The button is gone and nothing stands in its place; Enter and Escape are unchanged
- [x] The bar may overlap the export control and makes no attempt to avoid it
- [x] Neither the bar nor its tail is blurred: it is placed, never translated onto its place —
      a composited layer landing on a fractional offset is resampled in the shell's WebKit

## Choices

- **The side is carried by a class, and the class is the whole flip** — `hangAt` decides once and
  writes `.under-mark`, and the three things that follow from a side are then read off it rather than
  computed again: the stylesheet puts the tail on the top edge instead of the bottom and reverses the
  column, and the module anchors by `top` instead of `bottom`. Anchoring by the edge the tail is on
  is what makes "the side never changes" cost nothing to keep — the bar grows from its far edge, so
  neither the tail nor the input moves and there is no recomputation to suppress. The alternative,
  re-measuring on each refusal and choosing again, is the one that would have needed a flag saying
  *don't*.
- **The refusal line lands on the input's far side from the mark** — [02](./02-a-refused-source-keeps-the-bar-open.md)
  put it above the input because the bar hung by its bottom, and a bar that also hangs by its top
  needs the general rule those two are cases of. So the tree is the same either way — reason, then
  input — and `column-reverse` under the mark reverses what is drawn. It is not only that a refusal
  must grow the bar away from what it is about: the tail is drawn on the *input's* border, so the
  input has to be the thing flush against the edge the tail is on, and a reason line between the tail
  and the mark would have pointed the bar at its own paragraph.
- **The tail is the input's border carried to a point** — a bordered triangle would need two stacked
  shapes to keep a white fill inside a grey outline, and at eight pixels the fill is not what is
  read; the outline is. So the tail is solid in the input's own border colour, sitting flush on the
  border it continues, which is one pseudo-element and no seam to hide. The bar is one column as wide
  as its input for the same reason — an edge the tail stands on that the input did not span would put
  the tail on nothing.
- **The three numbers live in the module, and the stylesheet is told one of them** — how far the body
  stands off, the tail's size and its inset from a corner are the bar's own look numbers, the way
  `DOT_LABEL_GAP` is the drawing's. Two of them are only ever arithmetic, so they stay in TypeScript;
  the size is also a triangle to draw, so it travels to CSS as `--tail-size` beside the `--tail-at`
  the module has to send anyway. Told rather than written twice: the room the body stands off by and
  the triangle that spans it are the one number, and a stylesheet holding its own copy could drift
  into a tail that overshoots its mark.
- **Fitted by clamping, not by dodging** — the body's `left` is the centred position pushed inside
  `[0, innerWidth - width]` and the tail's offset is the mark's own, pushed inside the inset; that is
  the whole of "finding room". Nothing consults the export control or any other chrome, which is what
  the ticket asks for and also what keeps this a rule rather than a list: the test that says so puts
  an `.export-controls` on the page and asserts the bar lands where it would have anyway, so a later
  attempt to dodge fails loudly.
- **The button's going is what makes Enter work** — nothing listens for the key. A form whose only
  field blocks implicit submission is submitted implicitly, and with the button gone the input is
  that one field, so the submit listener that was already there is reached by Enter alone. What it
  cost is the tests: jsdom has no implicit submission and no button left to click, so both suites
  press through `requestSubmit`, which is the closest thing to Enter a document without layout has.
- **Checked in the shell, not only in jsdom** — a box drawn out gets the tail on the middle of its
  dashed top wall, standing clear enough to leave the wall whole; a refusal grows the bar upward with
  the tail unmoved; a box drawn against the head of the window flips under its wall, tail on top, and
  its refusal grows downward; a box against the left edge puts the bar flush there with the tail slid
  along to the wall's middle; a dot gets one aimed at the dot with the dot still visible; and a box
  drawn into the bottom-right corner puts the bar squarely over the Export button.
