# 5. Chrome is placed, never translated

Date: 2026-08-05

## Status

Accepted. Constrains every piece of [chrome](../../CONTEXT.md#chrome) on the page. First applied by
hand in `12f0b97`, to the [naming bar](../../CONTEXT.md#naming-bar), before it was written down;
brought into force by
[ticket 01, the refusal line is placed](../../.scratch/chrome-placement-00/issues/01-the-refusal-line-is-placed.md).

## Context

The app ships in **WebKitGTK** — `tauri dev` opens the app's own webview, never a browser
([the map](../../.scratch/initial-planning/map.md)) — and `dev:web` opens Firefox. So there is an
engine the code is written in and a different engine it is read in, and a defect in the second one
alone is invisible for as long as nobody runs the app.

A `transform` makes a fixed element a **composited layer**: the element is rasterized once, on its
own, and the layer is then placed. Placed on a fraction of a device pixel, WebKit resamples it, and
the glyphs fur. Centring is exactly how that fraction arises — half of a width the content decides
is a whole number only by luck, so *which* wording a message happens to carry decides whether it
reads crisp. Two pieces of chrome were written this way and both blurred: the naming bar, hung by
`translate(-50%, -100%)`, and the region a refused gesture is reported in, centred by
`translateX(-50%)`.

The fraction is not the fault. `hangAt` centres the bar on its mark by halving a `ch`-derived width
and rounds nothing, so the bar stands on a fractional `left` every time it opens — and it is crisp,
because a thing laid out where it stands is rasterized where it stands, at whatever fraction. What
cannot survive the fraction is a layer that was rasterized somewhere else first.

## Decision

**Placement is an inset.** A piece of chrome is put where it goes by `top`/`right`/`bottom`/`left` —
a literal one where the corner is fixed, a measured one written in pixels where the anchor is a mark
only the module can know, or a pin on both edges whose leftover room auto margins halve where the
anchor is the window.

**A transform is for motion that ends.** It may displace a thing while something is happening to it,
and what it may not do is decide where the thing rests.

## Consequences

The three placements in the editor are the three cases: the export control takes a literal corner,
the naming bar measures itself because its anchor is a mark, and the refusal line pins both edges
because its anchor is the window and CSS can halve that unaided. The balk keeps its transform, being
a fifth of a second of motion that ends at none.

**This is the only statement of the mechanism.** It was previously re-derived at three sites, and a
fourth rule was written wrong beneath two correct explanations of why it would be — so the sites that
obey the rule now carry a pointer here and nothing more.

A test over the stylesheet refuses a placement property outside `@keyframes`, which makes the rule
something the repo enforces rather than something an author must recall. Its limits are worth
knowing: it runs with the suite rather than at commit, it reads the stylesheet only — a transform
arriving from JS as an inline style is past it — and an animation that rests where it ends, via
`animation-fill-mode: forwards`, is placement wearing motion's clothes and would not be caught.
