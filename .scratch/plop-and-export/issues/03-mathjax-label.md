# 03 — MathJax LaTeX label → canvas

**What to build:** A text input takes LaTeX source (e.g. `\Sigma_{(x:A)} P(x)`). On submit,
MathJax typesets it and the result is dropped onto the canvas as a `<g>` of glyph `<path>`s —
**real geometry, never `<foreignObject>`**. Typing a LaTeX string and submitting makes it appear
typeset on the canvas.

This is the risk-proving slice for the math pipeline: it proves LaTeX renders *into* the same SVG
we will later export, as vector paths. Settled technical constraints (see planning ticket
[06](../../initial-planning/issues/06-build-tooling.md) and
[research/mathjax-v4-svg-font.md](../../initial-planning/research/mathjax-v4-svg-font.md)):

- **MathJax v4** (`@mathjax/src`) with **SVG output** and **`fontCache: 'none'`** so every glyph
  is an inline `<path>` (no shared `<defs>`/`<use>` cache that would break a standalone export).
- Default font is New Computer Modern (modern-LaTeX look), pulled in automatically.
- MathJax v4 loads its font/output jax **asynchronously** — the typeset call must await readiness
  before extracting the `<svg>`.

**Blocked by:** 01 — Scaffold build system + blank SVG canvas.

**Status:** ready-for-agent

- [ ] A visible text input accepts a LaTeX string and has a submit affordance
- [ ] On submit, MathJax typesets the input to SVG and its `<path>` output is appended to the canvas as a `<g>`
- [ ] The rendered label is glyph `<path>`s — no `<foreignObject>`, no HTML/MathML leaked into the canvas
- [ ] `fontCache: 'none'` is set, so glyph geometry is self-contained (verified in the DOM output)
- [ ] Async MathJax initialisation is awaited so the first submit renders reliably
