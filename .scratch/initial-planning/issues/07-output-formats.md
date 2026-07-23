# Output formats

Type: grilling
Status: resolved

## Question

Beyond the MVP's SVG export, what output formats does the editor produce? Is TikZ the best way
to get diagrams into paper-style PDFs, and does PDF-direct earn a place?

## Answer

**Two output backends: SVG and TikZ. No PDF-direct.**

- **SVG** — screen / web / slides / quick shares. Already the MVP export.
- **TikZ** (raw `tikzpicture` / PGF — *not* `tikz-cd`, which is too grid-bound for this
  notation) — the paper path, and the **best** target for LaTeX papers because the diagram's
  **math labels are re-typeset by the including document's own LaTeX engine** → exact
  font/spacing consistency with the body math. Vector, editable, diff-able, toolchain-native;
  proven shape (prior art: TikZiT, quiver).
- **PDF-direct — ruled out.** A vector PDF with KaTeX-baked labels is only *close* to the
  paper's typography (KaTeX ≈ Computer Modern, not exact); for a serious math paper "close"
  isn't good enough, and TikZ already serves that need better. Non-paper uses are covered by
  SVG. So PDF-direct earns no place.

### Consequence (architecture)

SVG and TikZ are **two render backends over one diagram model**:

```
   diagram model  ──▶  SVG renderer   (screen / web)
                  └─▶  TikZ emitter   (papers)
```

- The **label language is LaTeX in both directions**: the LaTeX string you type is rendered by
  KaTeX on screen and passed straight through to TikZ for the paper — one label format, no
  translation. (Confirms the MVP's "type LaTeX, KaTeX renders it" choice.)
- Therefore the **model must stay render-backend-agnostic** — no SVG-isms (pixel coords, DOM
  nodes) leak in — so the TikZ emitter is purely additive later. Recorded as a constraint on
  the [notation domain model](./04-notation-domain-model.md).

Both are post-MVP (the MVP ships SVG export only). Building the TikZ emitter (model → nodes at
coordinates + styled/curved edges; hand-drawn curves → Bézier control points) is future
execution work.
