# 02 — Plop term-dots

**What to build:** Clicking anywhere on empty canvas places a **term-dot** — an SVG `<circle>` —
at the click point. Dots accumulate: each click adds another, and every dot placed so far stays
visible on screen. No selection, moving, or removal — just plop-and-persist.

**Blocked by:** 01 — Scaffold build system + blank SVG canvas.

**Status:** ready-for-agent

- [ ] Clicking empty canvas places a `<circle>` centred at the click point
- [ ] Multiple clicks accumulate multiple dots; earlier dots persist
- [ ] Dots survive as real SVG children of the canvas (present in the DOM, not redrawn imperatively each frame)
