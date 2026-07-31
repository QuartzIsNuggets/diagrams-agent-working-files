# 03 — The native writer, and Export through it

**What to build:** The app's side of the seam. On the desktop [surface](../../../CONTEXT.md#surface),
Export opens a **native save dialog**, and the chosen path is written with `writeTextFile`. The file
lands where the user said, is byte-identical to what the browser build downloads, and a dismissed
dialog writes nothing. This is the ticket that makes the app worth having.

**Blocked by:** 01 — The Tauri shell · 02 — The writer seam.

**Status:** ready-for-agent

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

- [ ] In the app, Export opens a native save dialog; the file appears **at the chosen path** — not
      in `~/Downloads`, not renamed, no `foo (1).svg`
- [ ] Saving over an existing file replaces it, and a second export to the same path does not
      manufacture a variant name
- [ ] Dismissing the dialog writes nothing and yields `cancelled`
- [ ] The app's exported file is **byte-identical** to the browser build's download for the same
      canvas
- [ ] That file renders identically under `rsvg-convert` and Inkscape, and converts to a PDF with no
      embedded fonts and no raster images
- [ ] The browser build's Export is unchanged
- [ ] `capabilities/default.toml` grants only `dialog:allow-save` and `fs:allow-write-text-file`,
      and no path allowlist is configured
- [ ] A dated `verification/README.md` records the run, the toolchain versions and the result
- [ ] `pnpm build`, `pnpm lint`, `pnpm format:check` and `reuse lint` clean
</content>
