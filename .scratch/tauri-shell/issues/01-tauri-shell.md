# 01 — The Tauri shell

**What to build:** `pnpm dev` opens the working MVP in a **Tauri window** — canvas, plopping, the
LaTeX label form, the Export button — rendered by WebKitGTK, with Vite and HMR behind it. The
browser loop survives as `pnpm dev:web`. Nothing about the app's behaviour changes in this ticket;
it is the shell, and the proof that the MVP renders in the engine the app actually ships.

**Blocked by:** None.

**Status:** resolved

## Why `pnpm dev` changes meaning

The map names the residual cost of adopting Tauri as a habit hazard: *"the maintainer's habitual
`pnpm dev` loop is Firefox on the web build, so nothing about the app is exercised until the Tauri
window is opened."* [Ticket 03](./03-native-writer.md) then adds code that **Firefox cannot run at
all**, so the old default loop would exercise everything except what this effort adds. Making the
app the default kills that at the root rather than mitigating it: Vite still serves the frontend, so
UI iteration is unchanged, and Rust recompiles only when Rust changes — which, for a shell this
thin, is almost never.

There is no recursion: `pnpm dev` → `tauri dev` → `beforeDevCommand: pnpm dev:web` → `vite`.

## What to set up

- **Toolchain.** `rust = "1.97.1"` added to `mise.toml`. mise installs nothing of its own here — it
  delegates to the rustup already present and sets `RUSTUP_TOOLCHAIN`, so one file continues to
  state the whole toolchain, as its comment promises.
- **Dependencies.** `@tauri-apps/cli` and `@tauri-apps/api` via pnpm, pinned in `package.json`.
- **Scripts.** `dev` → `tauri dev`; `dev:web` → `vite`; `tauri` → `tauri`. `build` is unchanged
  (`tsc --noEmit && vite build`) and becomes `beforeBuildCommand`.
- **Config.** `src-tauri/tauri.conf.json5` with `frontendDist: "../dist"`,
  `devUrl: "http://localhost:5173"`, `productName: "diagrams"`, `identifier: "local.diagrams"`, one
  window. `src-tauri/capabilities/default.toml` with `core:default` only — [ticket
  03](./03-native-writer.md) adds the dialog and fs grants when it needs them.
- **Licensing.** JSON5 and TOML both take comments, so every file in `src-tauri/` carries its SPDX
  header **inline** and `AGENTS.md`'s sidecar rule stays exactly as written. This needs the
  `config-json5` feature on **both** `tauri` and `tauri-build` — they are the two crates that parse
  the config, `tauri-build` from `build.rs` at compile time. Keeping the `$schema` key gives editor
  validation, and JSON being a subset of JSON5 means documentation snippets still paste verbatim.
- **Ignored.** `src-tauri/target/` in `.gitignore`. `Cargo.lock` **is** committed — this is an
  application, not a library.
- **No icons.** Delete what `tauri init` generates and leave `bundle.icon` out: the placeholders are
  Tauri's own logo, and nothing needs them while [the spec](../spec.md) leaves packaging deferred.

## Acceptance criteria

- [x] `pnpm dev` opens a Tauri window showing the MVP: the canvas fills the window, clicking plops
      dots, a submitted LaTeX string typesets onto the canvas, and the Export button is present
- [x] `pnpm dev:web` opens the browser build, behaving exactly as before this ticket
- [x] `pnpm build` and `pnpm lint` are clean, and `tauri build --no-bundle` produces a binary
- [x] `reuse lint` in `../` reports compliance, with no new `.license` sidecar
- [x] `mise install` on a clean checkout reproduces the toolchain including Rust 1.97.1
- [x] No icons and no bundle targets are committed — six files under `src-tauri/`, none of them an
      asset, and no `bundle.targets`. `bundle.icon` names the generated pixel, per Choices

## Known risks to close here

- **`build.target: "es2022"` versus WebKitGTK 2.52.** Expected fine — 2.52 is current, and the app
  is SVG plus MathJax-generated `<path>` geometry, about as engine-portable as web content gets —
  but this is the first time any of it has run outside Gecko. Confirm the typeset label and the
  plopped dots render, and record anything that had to change.
- **MathJax's module graph.** `vite.config.ts` excludes `@mathjax/src` and
  `@mathjax/mathjax-newcm-font` from dep pre-bundling so the font's glyph ranges and the output jax
  stay in one graph. That reasoning is about Vite, not the browser, so it should carry over intact —
  worth confirming the first typeset in the app window, since a broken graph fails by rendering
  nothing rather than by erroring.

**Both closed, and nothing had to change.** In the app window four clicks plopped four dots where
the pointer came up, and `\Sigma_{(x:A)} P(x)` typeset onto the canvas in New Computer Modern — so
the es2022 bundle runs in WebKitGTK 2.52.5 and the font's glyph ranges still meet the output jax in
one graph. The export the window produced carries all four dots and the label.

## What the shell exposed, for [ticket 03](./03-native-writer.md)

Export in the app window writes `diagram.svg` into the **process's working directory** — under
`tauri dev` that is `src-tauri/`, where `reuse lint` promptly found it. No dialog, no shelf, no
notice. This is the spec's premise confirmed from the inside, and it is worse than a stray
`~/Downloads` file: the destination follows however the binary was launched.

## Choices

- **`build.rs` generates the window icon, one transparent pixel, into the ignored `gen/`** — the
  ticket's "leave `bundle.icon` out" is not available: `tauri::generate_context!` resolves a window
  icon at compile time and on Unix errors when the file is absent, with no config to decline it.
  Generating a blank one keeps the tree free of a placeholder asset this repo cannot claim, and
  keeps REUSE free of a sidecar for a binary. It is written through the `png` crate, already in the
  graph, rather than as an opaque byte literal. `bundle.icon` is also what a bundle would ship, so
  **replace it before the first one**.
- **Prettier owns the config's style, so its keys are unquoted** — the ticket wanted JSON-subset
  syntax to keep pasted snippets verbatim, but Prettier's JSON5 parser unquotes keys and adds
  trailing commas, and exempting one file from the formatter costs more than it buys. A pasted
  snippet still parses; it is just renormalized. Add the file to `.prettierignore` to keep it
  literal.
- **`server.strictPort` in `vite.config.ts`** — the window is pointed at a fixed `devUrl`, so Vite
  silently moving to 5174 would show a blank window rather than an error. Drop it only if `devUrl`
  ever stops being a constant.
- **`lefthook.yml` gained `json5` and a `rustfmt` command** — this ticket brought two file types into
  a repo whose pre-commit gates every other one, and an ungated formatter drifts. Clippy is
  deliberately not there: it would compile the whole crate graph on a cold cache. Add it if the
  wait is acceptable.
- **`Cargo.lock` carries its SPDX header inline, not in a sidecar** — unlike `pnpm-lock.yaml`, Cargo
  preserves a leading comment across regeneration, re-seating it under its own preamble and never
  duplicating it. Verified against repeated `cargo generate-lockfile` and against a `cargo update`
  that genuinely rewrote the file. Add a sidecar if a future Cargo drops it.
