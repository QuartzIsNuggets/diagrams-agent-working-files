# Ticket 04 — real-renderer export check

The jsdom suite (`src/export-svg.test.ts`) can prove the exported file's *structure*: correct
namespace, own `viewBox`, glyph paths carried over, nothing referencing anything outside it. What
it cannot prove is that a real SVG renderer — one that has never heard of this page, its
stylesheet or its fonts — draws the file the way the screen does. That was the risk ticket 04
existed to retire, and it was checked against actual renderers here.

## Superseded

The harness that produced this is gone: it built its canvas through `enablePlopping` and
`enableLabelPlacing`, and an export was `serializeCanvas`, none of which the diagram-model effort
left standing. The check is re-made — against a file the screen never drew, which is
[ticket 06](../../diagram-model/issues/06-export-renders-from-the-model.md)'s whole point — by
[`diagram-model/verification/export-fidelity.md`](../../diagram-model/verification/export-fidelity.md),
which is the recipe to run. What is kept here is the dated result below and the three artifacts it
is about.

## What is in here

| File | What it is |
| --- | --- |
| `diagram.svg` | The exported file — the thing that was under test. |
| `diagram-rsvg.png` | `rsvg-convert`'s rendering of it (librsvg/cairo). |
| `diagram-inkscape.png` | Inkscape's rendering of it. |

## Result (2026-07-29)

Both renderers drew the five dots and all three labels — `\Sigma_{(x:A)} P(x)`,
`\int_0^\infty e^{-x^2}\,dx = \frac{\sqrt{\pi}}{2}`, `f : \mathbb{N} \to \mathbb{R}` — in New
Computer Modern, correctly typeset, on the right baselines and at the right positions, matching
the screen. The PDF conversion embedded **zero fonts and zero raster images**: the file is vector
path geometry throughout, which is the claim ticket 04 turns on.

Toolchain: `rsvg-convert` 2.61.4 (cairo 1.18.4), Inkscape, poppler `pdffonts`/`pdfimages`.

Note: `diagram.svg` has a transparent background — see the ticket's Choices entry — so the rsvg
render passes `-b white` to composite it the way a viewer with a white page would.
