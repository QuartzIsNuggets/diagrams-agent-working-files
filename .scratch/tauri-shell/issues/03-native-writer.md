# 03 — The native writer, and Export through it

**What to build:** The app's side of the seam. On the desktop [surface](../../../CONTEXT.md#surface),
Export opens a **native save dialog**, and the chosen path is written with `writeTextFile`. The file
lands where the user said, is byte-identical to what the browser build downloads, and a dismissed
dialog writes nothing. This is the ticket that makes the app worth having.

**Blocked by:** 01 — The Tauri shell · 02 — The writer seam.

**Status:** resolved

## What to build against

- `@tauri-apps/plugin-dialog`'s `save()` returns a filesystem path on Linux, or `null` when the
  dialog is dismissed — which is the seam's `cancelled` arm, and the reason the arm exists.
- `@tauri-apps/plugin-fs`'s `writeTextFile(path, contents)` writes it, and throws on real failure.
- **No static path allowlist is needed.** The dialog plugin injects the chosen path into the fs
  plugin's runtime scope (`s.allow_file(&path)`), and the fs commands consult that scope when
  resolving a path. This is Tauri's analogue of the web's handle-plus-permission, and the reason
  "open with the dialog, then write" is the sanctioned pattern rather than granting `$HOME/**`.
- Capability grants are therefore exactly `dialog:allow-save` and `fs:allow-write-text-file`, added
  to `src-tauri/capabilities/default.toml`. Nothing reads a file yet, so nothing grants
  `dialog:allow-open` or `fs:allow-read-text-file` — Save and Open will add them when they exist.
- `defaultPath` keeps today's `diagram.svg`. Tauri's dialog `filters` take **bare** extensions and
  handle multi-dot suffixes inconsistently across platforms; only `svg` is needed here.

## Verification

The bytes are already proven: `serializeCanvas` is untouched by this effort, and
[the MVP's ticket 04](../../plop-and-export/issues/04-export-svg.md) verified its output against
`rsvg-convert` and Inkscape, with `pdffonts`/`pdfimages` confirming zero embedded fonts and zero
raster images. What is new and unproven is the **delivery**.

That part is not automatable here, and the reason is worth recording rather than apologising for:
`WebKitWebDriver` is installed and `tauri-driver` is one `cargo install` away, but WebDriver drives
the *webview*, and the save dialog is a GTK window outside it. The one thing this ticket adds is the
one thing an automated end-to-end run cannot see.

So verification splits:

- **jsdom, in the suite** — the native arm's logic with the plugin modules stubbed: a dismissed
  dialog yields `cancelled` and writes nothing; a chosen path yields `written` carrying that path;
  the bytes handed to `writeTextFile` are exactly `serializeCanvas`'s output. Mutation-checked as
  usual. This proves the wiring and nothing about WebKitGTK, which is stated plainly rather than
  implied.
- **A human, recorded** — a `verification/` directory in this feature, in the format
  [the MVP's verification note](../../plop-and-export/verification/README.md) established:
  reproducible steps, the resulting file, its renders, toolchain versions, a dated result.

## Acceptance criteria

- [x] In the app, Export opens a native save dialog; the file appears **at the chosen path** — not
      in `~/Downloads`, not renamed, no `foo (1).svg`
- [x] Saving over an existing file replaces it, and a second export to the same path does not
      manufacture a variant name
- [x] Dismissing the dialog writes nothing and yields `cancelled`
- [x] The app's exported file is **byte-identical** to the browser build's download for the same
      canvas
- [x] That file renders identically under `rsvg-convert` and Inkscape, and converts to a PDF with no
      embedded fonts and no raster images
- [x] The browser build's Export is unchanged
- [x] `capabilities/default.toml` grants only `dialog:allow-save` and `fs:allow-write-text-file`,
      and no path allowlist is configured
- [x] A dated `verification/README.md` records the run, the toolchain versions and the result
- [x] `pnpm build`, `pnpm lint`, `pnpm format:check` and `reuse lint` clean

**The delivery half was driven, not done by hand.** WebDriver is indeed the wrong tool — but X is
not. Two nested `Xephyr` servers with `xfwm4`, and `xdotool` clicking the app's Export, GTK's Name
field and GTK's Replace, sits a level below the webview and reaches everything the ticket wrote off.
It also turned the criterion that looked least checkable into the easiest one: a Firefox **kiosk
window on a 1280×800 screen** has the app window's client area to the pixel, so the same clicks
build the same canvas on both surfaces and the two files can simply be `cmp`'d. They matched — same
6021 bytes, same `sha256`. [`verification/README.md`](../verification/README.md) records the run.

## What this leaves for Save

[ADR 4](../../../docs/adr/0004-export-and-save-share-a-writer.md) says the writer's result "is
discriminated — *written*, *handed-off*, or *cancelled*". A refused write is now a **fourth
outcome** the ADR does not name, arriving as a rejection rather than an arm. That is the right shape
— an arm would oblige every caller to handle a case the web surface cannot produce — but the ADR
should say so before Save is built on it. One more item for the `/domain-modeling` pass
[02](./02-writer-seam.md) already asked for, alongside *writer* and *hand-off*.

## Choices

- **A failed write rejects through the door and is caught by Export, which logs it** —
  [ticket 02](./02-writer-seam.md) handed over a `void` that would have swallowed one. The catch
  sits in the caller and not behind the seam because a door that swallows failures cannot be built
  on: **Save** has to hear that a write was refused. What the caller then *does* is where this stops
  short — the export affordance is a single fixed-position button, so telling the user would mean a
  container element, a stylesheet rule and a changed return type, none of which this ticket's
  criteria ask for. Save cannot ship on a log: build the error region there and route this through it.
- **The app arm's return type is narrowed to `Written | Cancelled`** — the mirror of what
  [02](./02-writer-seam.md) did to the web arm: this surface always knows where the bytes went, so
  `handed-off` should be unsayable here too. Widen only if a write ever lands somewhere unnameable.
- **The dialog's extension filter is derived from the filename, not the constant `svg`** — what
  [02](./02-writer-seam.md) asked for ("`defaultPath` and extension filter both come off the name"),
  and what keeps the writer ignorant of its one current caller. It costs a regex and a no-suffix
  fallback that only `Save` will reach. Collapse it to a constant if the writer ever gains a
  `kind` field worth passing instead.
- **`isTauri` is read through `Reflect.get`, not declared ambient** — a `declare var` would make the
  bare identifier typecheck everywhere, and bare `isTauri` is a `ReferenceError` in exactly the tab
  the check exists to detect. Confining the lookup to the one function that needs it keeps the
  footgun out of the repo. Revisit if a second module ever needs the same fact.
</content>
