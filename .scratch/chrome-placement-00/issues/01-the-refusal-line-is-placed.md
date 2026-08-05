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

**Status:** ready-for-agent

- [ ] The refusal line is centred by placement rather than by a transform, and its wording no longer
      decides whether it reads crisp
- [ ] It stays as wide as what it says, covering no more of the canvas than the message does
- [ ] The suite fails when a rule outside `@keyframes` declares a placement property — `transform`,
      or the `translate`/`rotate`/`scale` longhands that do the same thing
- [ ] That check proves it fires, catching a declaration put to it rather than only passing over a
      stylesheet that happens to be clean
- [ ] There is no way past the check but editing it: a transform that genuinely belongs is argued for
      in the diff, not waved through by a marker in the CSS
- [ ] The balk is untouched — a fifth of a second of motion ending at `none` is not placement
- [ ] The mechanism is stated in ADR 5 and nowhere else: the three sites that re-derived it — the
      tail's rule, the balk's exemption, and the bar's own hanging — carry a bare pointer to it where
      the placement is done, and no summary alongside

The shell was not driven while this was settled, so the crispness is confirmed by eye on the next
`pnpm dev` rather than by a screenshot in here. The reasoning it rests on instead: `12f0b97` fixed
this same class once, by hand, on the naming bar; and the bar centres itself on a fractional `left`
it never rounds, and is crisp — so it is the layer that cannot survive the fraction, not the
fraction.

## Choices
