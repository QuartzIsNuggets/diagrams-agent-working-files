# Ticket 04 — real-renderer export check

The jsdom suite (`src/export-svg.test.ts`) can prove the exported file's *structure*: correct
namespace, own `viewBox`, glyph paths carried over, nothing referencing anything outside it. What
it cannot prove is that a real SVG renderer — one that has never heard of this page, its
stylesheet or its fonts — draws the file the way the screen does. That is the risk ticket 04
exists to retire, so it is checked against actual renderers here.

Everything in this directory is reproducible from the two sources in it.

## Re-running

From the **code project root** (`../` from the submodule, i.e. `~/…/diagrams`):

```sh
# 1. Export a canvas of five dots and three typeset labels through the
#    production modules, straight into diagram.svg.
pnpm vitest run --config agents-working-files/.scratch/plop-and-export/verification/vitest.config.ts

# 2. Open that file with two independent renderers that share nothing with the app.
cd agents-working-files/.scratch/plop-and-export/verification
rsvg-convert -b white -o diagram-rsvg.png diagram.svg
inkscape --export-type=png --export-filename=diagram-inkscape.png diagram.svg

# 3. Confirm it is vector all the way down: no font is embedded and no bitmap
#    appears, so every mark in it is path geometry.
rsvg-convert -f pdf -o /tmp/diagram.pdf diagram.svg
pdffonts /tmp/diagram.pdf        # expect: no rows
pdfimages -list /tmp/diagram.pdf # expect: no rows
```

`export-fidelity.check.ts` is a `.check.ts`, not a `.test.ts`: it writes an artifact rather than
asserting anything, so it is deliberately outside the project's suite and needs the config beside
it. No production config knows it exists.

## What is in here

| File | What it is |
| --- | --- |
| `export-fidelity.check.ts` | Builds the canvas through `enablePlopping` / `enableLabelPlacing` and writes `serializeCanvas`'s output. The only hand-written input. |
| `vitest.config.ts` | Runs the above, and nothing else. |
| `diagram.svg` | The exported file — the thing under test. |
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
