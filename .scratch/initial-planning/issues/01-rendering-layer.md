# Rendering layer & language

Type: grilling
Status: resolved

## Question

What renders the diagram on screen — and therefore what language do we build in? The choice
turns on where the **interactive editor and its dense math labels** are cheapest: on-screen
rendering, hit-testing / editing, and LaTeX-quality typesetting free out of the box, versus
hand-built.

## Answer

**TypeScript rendering to SVG (in the DOM).**

The decisive win is the **editor experience plus on-screen math**. The web/SVG world has by far
the richest ecosystem for *interactive* vector editing (drag, hit-test, marquee-select), and
**KaTeX** gives LaTeX-quality on-screen labels for free. SVG doubles as the immediate screen /
web vector output. In a pure-native toolkit all of that is hand-built.

Options weighed:

- **TS + SVG (web)** ✅ — simplest; interactive-editing ecosystem + on-screen math free; SVG is
  the native screen / web vector output. **Chosen.**
- **Rust → WASM + SVG** (Dioxus / Leptos) — keeps Rust, still SVG-native, but heavier
  toolchain, smaller ecosystem, ~1.5–2× the effort on the interactive parts.
- **Pure-native Rust GUI** (egui / a 2D vector crate) — one self-contained binary, but
  on-screen math (ReX / Typst) and interactive editing are both DIY. Slowest path.

The user is fluent in C++, Rust, TypeScript, Agda, and *prefers Rust* for maintainability, but
explicitly set the tiebreaker as "whatever is simplest" — and TS is clearly simplest here. Rust
is recorded as consciously set aside (map → Out of scope), not forgotten; a future Tauri
wrapper can reintroduce a Rust shell without disturbing this decision.

> **Superseded rationale — see [output formats, ticket 07](./07-output-formats.md).** This
> ticket originally rested on "vector *export* is free, because SVG = serialize the DOM." Ticket
> 07 retired that leg: paper-grade vector output is a dedicated **TikZ** backend (serialized
> DOM-SVG + KaTeX is only *close* to paper typography), and emitting TikZ is plain code-gen —
> equally easy from any language, so it does **not** favor TS over Rust. The decision therefore
> stands on the *editor + on-screen-math* ecosystem alone, and the model stays
> render-backend-agnostic so SVG (screen) and TikZ (paper) both emit from it.
