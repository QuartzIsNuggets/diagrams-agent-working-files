# MVP scope: the minimal executable

Type: grilling
Status: resolved

## Question

What does the first executable actually do? (As little as "plop dots" is acceptable, as long
as there is a build system, a window, and the bet-on libraries are exercised.)

## Answer

**"Plop & Export"** — the smallest executable that *proves the two risky libraries*:

1. **Plop dots** — click on the SVG canvas to place a term-dot (`<circle>`).
2. **Math label** — a text input; its contents are typeset by **MathJax** to SVG `<path>`s and
   placed on the canvas (proves math-into-SVG, as real geometry — no `<foreignObject>`).
3. **Export SVG** — a button serializes the canvas `<svg>` to a standalone, valid `.svg` file
   and downloads it (proves the vector-output pipeline).

Explicitly **not** in the MVP: arrows, role-colors, selection / move, undo, the
theorem-highlight, PDF/TikZ, persistence. Full build spec: [../spec.md](../spec.md).
