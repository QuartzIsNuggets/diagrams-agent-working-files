# 01 — The refusal line is placed, not translated

**What to build:** the line reporting a refused gesture, at the top of the window, reads the same
whatever it says. Today it is centred by a transform, so it is a composited layer standing on
whatever fraction half its own width comes to, and the shell's WebKit resamples that into a blur —
"that release is too close to a dot already placed" happens to land crisp and "a term outside a type
is nothing a diagram can hold" happens to land furred, for no reason a reader can see. It is centred
by placement instead, per
[ADR 5](../../../docs/adr/0005-chrome-is-placed-never-translated.md), and the stylesheet gains a
test that refuses the next transform written for placement — the rule was already stated twice in
the file that broke it, so stating it a fourth time is the one intervention known not to work.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] The refusal line is centred by placement rather than by a transform, and its wording no longer
      decides whether it reads crisp — confirmed by eye in the shell
- [x] It stays as wide as what it says, covering no more of the canvas than the message does —
      confirmed by eye, and again in WebKitGTK against the stylesheet itself
- [x] The suite fails when a rule outside `@keyframes` declares a placement property — `transform`,
      or the `translate`/`rotate`/`scale` longhands that do the same thing
- [x] That check proves it fires, catching a declaration put to it rather than only passing over a
      stylesheet that happens to be clean
- [x] There is no way past the check but editing it: a transform that genuinely belongs is argued for
      in the diff, not waved through by a marker in the CSS
- [x] The balk is untouched — a fifth of a second of motion ending at `none` is not placement
- [x] The mechanism is stated in ADR 5 and nowhere else: the three sites that re-derived it — the
      tail's rule, the balk's exemption, and the bar's own hanging — carry a bare pointer to it where
      the placement is done, and no summary alongside

The crispness was confirmed by eye in the shell once this was built, and the width along with it. The
reasoning it was settled on beforehand, the shell not having been driven then: `12f0b97` fixed this
same class once, by hand, on the naming bar; and the bar centres itself on a fractional `left` it
never rounds, and is crisp — so it is the layer that cannot survive the fraction, not the fraction.

What the look confirmed and the reasoning had not reached: being fixed clips the layer to its border
box as well, so ink outside it — a descender at `line-height: normal` — is cut off flat, whether the
thing is placed or translated. That is the same defect the export control and the naming bar's own
error line are exposed to; the bar was looked at in WebKitGTK against this stylesheet and nothing was
clearly cut, so neither was touched.

## Choices

- **The check reads the stylesheet off the disk, from the suite** — importing it is what cannot work,
  Vite handing a test run an empty string for a CSS module, and there is no stage over CSS to hang a
  lint rule on. Move it to one if stylelint ever arrives.
- **Every pointer carries the ADR's path, written from the project root** — nothing else under `src/`
  names an ADR, so a bare "ADR 5" is a reference a reader has to go looking for the shape of; and one
  spelling reads the same from wherever a pointer is next put, where the file-relative links the docs
  use would not. Shorten once pointers there are ordinary.
- **The line carries a line-height rather than a padding** — being fixed, it is clipped to its border
  box, and at `normal` the descenders hung outside it and came out cut off flat; a ratio grows with
  the type where a padding would have to be re-chosen after it. Raise the ratio, not the box, if ink
  is ever cut again.
- **The line is inset 16px from both edges rather than pinned to 0** — the same inset it already
  stands at from the top, so a message at its widest keeps off the window's edges instead of running
  to them. It is the pinning and not the number that centres it; widen freely.
