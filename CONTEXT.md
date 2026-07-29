# CONTEXT.md

Domain language for the code project in `../`.

Terms defined elsewhere are **linked, not repeated**. The notation vocabulary — type-box,
term-dot, arrow, role-colour, homotopy — is in
[map.md](./.scratch/initial-planning/map.md#notes). The canvas, the plop gesture and the
export are in [spec.md](./.scratch/initial-planning/spec.md#functionality). What follows is
only what the code introduced and no other document names.

## Typesetting

Turning a **LaTeX source** string into **glyph geometry**: `<path>` outlines, never `<text>`
falling back on a system font, never `<foreignObject>` wrapping HTML. The distinction is the
whole point of the capability — geometry travels into an exported file and renders identically
anywhere, a font reference does not.

Geometry comes out measured in **thousandths of an em**, origin at the left baseline point,
carrying a transform of its own. Placing it means wrapping it, not transforming it.

Which engine does the typesetting is behind the seam. MathJax is today's answer and is named
nowhere outside `src/typesetting.ts` and `src/font-ranges.ts`.

## Label

A typeset glyph run placed on the canvas. The **source** is LaTeX; the **label** is geometry.

They are not interchangeable, and the difference has teeth: today a label is placed and its
source discarded, which is why the TikZ backend of
[ticket 07](./.scratch/initial-planning/issues/07-output-formats.md) — which re-typesets from
the source in the including document — has nothing to emit from.
