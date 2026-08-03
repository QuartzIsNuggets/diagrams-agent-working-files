# Ticket 06 — real-renderer export check

The jsdom suite (`src/export-svg.test.ts`) can prove the exported file's *structure*: correct
namespace, a frame taken from the diagram's own ink, glyph paths carried over, nothing referencing
anything outside it. What it cannot prove is that a real SVG renderer — one that has never heard of
this page, its stylesheet or its fonts — draws the file the way the screen does. That claim was
first made by [ticket 04's check](../../plop-and-export/verification/README.md) against a file
copied off a rendered canvas; ticket 06 has to re-make it, the file now being drawn from the model
into a document of its own that the screen never touched.

So it is made twice, because the change split one path into two claims:

- **From the app**, which is the fidelity claim proper: draw a diagram by hand, screenshot the
  window, press Export, and open the file the app wrote with two independent renderers.
- **Headless**, which is the claim the app cannot make: build a diagram in Node, export it with no
  canvas, no stylesheet and nothing laid out, and open that.

The second is worth stating exactly, because it is short of what the ticket's motivation asked for.
It runs under jsdom, and it has to: the backend builds SVG elements and `XMLSerializer` writes them
out, so an export still needs *a DOM* — what it no longer needs is a *rendered* one. A caller with
no DOM implementation at all is a further step, recorded as a choice on the ticket.

Everything here bar the three ticket screenshots (`boxes-on-the-canvas.png`, `pushed-aside.png`,
`term-dot-labels.png`) is reproducible from the sources in it.

## Re-running

From the **code project root** (`../` from the submodule, i.e. `~/…/diagrams`):

```sh
# 1. The app. Draw two boxes and four named term-dots, screenshot the window,
#    then press Export SVG and save to from-the-app.svg.
pnpm dev

# 2. Headless. Build the same sort of diagram through the production modules and
#    export it straight into diagram.svg. No canvas is made; nothing is laid
#    out. jsdom supplies the bare DOM the serializer needs, and nothing else.
pnpm vitest run --config agents-working-files/.scratch/diagram-model/verification/vitest.config.ts

# 3. Open both files with two independent renderers that share nothing with the app.
cd agents-working-files/.scratch/diagram-model/verification
for f in diagram from-the-app; do
  rsvg-convert -b white -o "$f-rsvg.png" "$f.svg"
  inkscape --export-type=png --export-filename="$f-inkscape.png" "$f.svg"
done

# 4. Confirm it is vector all the way down: no font is embedded and no bitmap
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
| `export-fidelity.check.ts` | Builds a `Diagram` through `addBox` / `addDot` / `labelDot`, sets its labels, and writes `serializeDiagram`'s output. The only hand-written input. Three of the four `labelSide`s are patched in after `labelDot`, no gesture reaching them yet — the same thing `render-svg.test.ts` does, and the only place it departs from the transitions. |
| `vitest.config.ts` | Runs the above, and nothing else. |
| `diagram.svg` | The headless export — a file no screen ever drew. |
| `diagram-rsvg.png`, `diagram-inkscape.png` | Two renderings of it (librsvg/cairo, Inkscape). |
| `from-the-app-screen.png` | The app window, with the diagram drawn by hand in it. |
| `from-the-app.svg` | What pressing Export SVG in that window wrote. |
| `from-the-app-rsvg.png`, `from-the-app-inkscape.png` | Two renderings of that. |

## Result (2026-08-03)

**From the app.** Four gestures put two boxes on the canvas — `\Sigma_{(x:A)} P(x)` and
`f : \mathbb{N} \to \mathbb{R}` — and four term-dots in them, named `a`, `\frac{\sqrt{\pi}}{2}`,
`x_0` and `\int_0^\infty e^{-x^2}\,dx`. Export SVG wrote `from-the-app.svg`, and both renderers drew
it as the same picture the window showed: the same walls in the same blue, the same type
expressions in the same slots, the same dots with their labels the same distance above them, in New
Computer Modern throughout. The one difference is the one the ticket is about — the file is the
diagram and its margin, `viewBox="43 145 744 222"`, where the old export was a 1280×800 copy of the
window. Nothing shifted or cropped in getting there.

The web surface was exercised the same way, in Firefox against `pnpm dev:web`: a box and a named
dot, Export SVG, and the browser's hand-off dialog wrote a file framed the same way
(`viewBox="38 48 354 254"` — a 320×220 box, its walls and the margin). Nothing is committed for it,
the bytes being the app's own past the writer's door.

**Headless.** `diagram.svg` was written by a Node process with no canvas, no stylesheet and no
layout; both renderers drew it whole. `x_0` is placed hard against its box's left wall on purpose,
so its label reaches past the wall: both renderers drew it entire, inside the margin, which is the
frame being derived from what was drawn rather than from the extents the model holds
(`viewBox="10 33 777 334"` — the union of the marks and a margin, rounded outward to whole units,
and nothing like a window's size).

Exporting the same diagram twice gives byte-identical files, at any window size or none.

The PDF conversion embedded **zero fonts and zero raster images**: both files are vector path
geometry throughout.

Toolchain: `rsvg-convert` 2.61.4 (cairo 1.18.4, harfbuzz 11.5.1), Inkscape, poppler
`pdffonts`/`pdfimages`, WebKitGTK via `tauri dev`.

Note: both `.svg`s have a transparent background — see ticket 04's Choices entry — so the rsvg
renders pass `-b white` to composite them the way a viewer with a white page would.
