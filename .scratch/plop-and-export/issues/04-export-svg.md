# 04 — Export standalone SVG

**What to build:** A button serializes the canvas `<svg>` — term-dots **and** the typeset MathJax
paths — into a valid, standalone `.svg` file and triggers a browser download. The point of the
slice is fidelity: the downloaded file, opened on its own (browser, Inkscape, or a PDF
converter), renders the dots and the typeset label as vector graphics, identical to what's on
screen. This is the capstone that retires the clean-vector-export risk — meaningful only once
there's real content (dots + math paths) to export.

**Blocked by:** 02 — Plop term-dots · 03 — MathJax LaTeX label → canvas.

**Status:** ready-for-agent

- [ ] A visible Export button serializes the live canvas `<svg>` and downloads it as a `.svg` file
- [ ] The serialized output is a valid, self-contained SVG document (correct `xmlns`, no external references)
- [ ] Opened standalone, the file renders the **dots and** the typeset label as vector graphics
- [ ] The exported math matches on-screen (glyph paths carried over intact; no missing `<defs>`/glyphs from font caching)

## Choices
