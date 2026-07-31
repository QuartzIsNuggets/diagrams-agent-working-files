# Spec — "The app writes"

The second executable for the **HoTT Diagram Editor**: the working MVP, moved into a Tauri window
and given the one power a browser tab cannot have. It exists to stand up the desktop **surface**
and to prove the write path — dialog to a real filesystem path, bytes written there — that
[Save](../../CONTEXT.md#save) will later be built on.

Parent effort: [../initial-planning/map.md](../initial-planning/map.md) · Preceded by
[the MVP spec](../initial-planning/spec.md), built as
[plop-and-export](../plop-and-export/issues/) · Decisions:
[ticket 10 — save & open](../initial-planning/issues/10-save-open-mechanism.md) ·
[ADR 4](../../docs/adr/0004-export-and-save-share-a-writer.md).

## Why this slice, and why now

[Ticket 10](../initial-planning/issues/10-save-open-mechanism.md) put Tauri on the route and named
persistence as what makes it load-bearing. Persistence, though, needs the in-memory model that
[ADR 3](../../docs/adr/0003-a-save-records-the-diagram.md) forces into existence, and that model is
the larger piece of work. This slice takes the half that does not depend on it.

It is not a wrapper exercise. The MVP has exactly one feature that emits a file — **Export SVG**,
written today with a Blob and a synthetic `<a download>` click — and that mechanism is the one thing
in the MVP that a Tauri window changes underneath. `wry` permits downloads by default
(`download_started_handler: Some(Box::new(|_, _| true))`, *"a handler that allows all downloads is
set to match browser behavior"*), but a Tauri window has no browser chrome: no download shelf, no
"always ask where to save", no visible destination. Left alone, the app's only file-emitting feature
becomes a silent write to a directory nobody chose. Rewiring Export through the native path is
therefore what keeps the app from being **worse** than the tab it replaces — and it builds the seam
Save plugs into, needing no model at all.

## Stack additions

- **Rust** — pinned in `mise.toml` (`rust = "1.97.1"`) beside `node` and `pnpm`. mise delegates to
  the installed rustup and sets `RUSTUP_TOOLCHAIN`, so one file states the whole toolchain and no
  second Rust installation exists.
- **Tauri v2** — `@tauri-apps/cli`, `@tauri-apps/api`, `@tauri-apps/plugin-dialog`,
  `@tauri-apps/plugin-fs` as pnpm dependencies, versions pinned like everything else.
- **Config format** — `src-tauri/tauri.conf.json5` and `src-tauri/capabilities/default.toml`, both
  comment-bearing so their SPDX headers sit **inline**, leaving `AGENTS.md`'s sidecar rule as
  written. Requires the `config-json5` feature on both `tauri` and `tauri-build`, which are the two
  crates that parse the config (`tauri-build` in `build.rs` at compile time, `tauri` at runtime).
- **Engine** — WebKitGTK 2.52 (`webkit2gtk4.1`), the same engine under `tauri dev` and in the built
  app. No Gecko is involved anywhere in Tauri.

## Functionality

1. **The app window.** `pnpm dev` opens the MVP in a Tauri window — canvas, plopping, the LaTeX
   label form, the Export button — rendered by WebKitGTK, with Vite and HMR behind it. The browser
   loop survives as `pnpm dev:web`.
2. **A writer.** One seam whose whole promise is *put these bytes where the user chose*. It reports
   a discriminated result — written to a path, handed off, or cancelled — so the type states what
   each [surface](../../CONTEXT.md#surface) can and cannot know.
3. **The app writes.** On the desktop surface, Export opens a native save dialog and writes the
   file to the chosen path with `writeTextFile`. On the web surface it downloads, exactly as today,
   byte for byte.

## Acceptance

- `pnpm dev` opens a Tauri window running the MVP; dots plop, a LaTeX label typesets, and the
  Export button is present and working.
- `pnpm dev:web` still opens the browser build, unchanged.
- `pnpm build` (type-check + bundle) and `pnpm lint` stay clean; `reuse lint` in `../` stays
  compliant; `tauri build --no-bundle` produces a binary.
- In the app, Export opens a save dialog, and the file appears **at the chosen path** — not in
  `~/Downloads`, not renamed.
- That file is byte-identical to what the web build downloads for the same canvas, and renders
  identically under `rsvg-convert` and Inkscape.
- Cancelling the dialog writes nothing and reports cancellation.

## Explicit non-goals

The in-memory model · `.hott.json` · **Save** and Open · packaging (deb/rpm/AppImage) · icons ·
a recent-documents list · file associations · a CLI entry point · any change to what the web
surface can do.

## Deferred by decision, not oversight

- **Packaging** — `tauri build --no-bundle` only. A bundle format is a decision about other
  people's machines, and there are none yet; the map's deb/rpm-versus-AppImage question stays fog.
- **Icons** — none committed. `tauri init`'s placeholders are Tauri's own logo, and stamping this
  project's copyright on them would be a false claim; nothing needs them until something is bundled.
- **CSP** — left at Tauri's default (`null`). MathJax injects styles, so locking it down is its own
  question with its own verification cost.
- **App identity** — `productName: "diagrams"`, `identifier: "local.diagrams"`, deliberately
  placeholders. Nothing is stored in app-data directories, so changing them later costs nothing.
</content>
