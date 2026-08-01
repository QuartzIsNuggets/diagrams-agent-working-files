# Ticket 03 — the native write, end to end

The jsdom suite (`src/writer.test.ts`) proves the **wiring**: the dialog is asked, its answer
decides, and the bytes handed to `writeTextFile` are the ones the caller gave. What it cannot see is
the one thing this ticket adds — a **GTK save dialog**, outside the webview, and a real file at the
path a person picked in it. [The ticket](../issues/03-native-writer.md) expected that half to be
done by hand, on the grounds that WebDriver drives the webview and the dialog is not in it.

It was driven instead, and the reason is worth keeping: WebDriver is the wrong tool but **X is not**.
Two nested `Xephyr` servers, `xfwm4` in each, and `xdotool` clicking real buttons — the app's Export,
GTK's Name field, GTK's Replace — is a level below the webview and reaches everything WebDriver
cannot. It also made the criterion that looked least checkable, byte-identity with the browser
build, the easiest: give Firefox a **kiosk window on a 1280×800 screen** and its content box is the
app window's client area to the pixel, so the same clicks build the same canvas on both surfaces.

## Re-running

From the **code project root** (`../` from the submodule, i.e. `~/…/diagrams`):

```sh
pnpm build && pnpm tauri build --no-bundle   # the app under test is the release binary

# The app, on its own screen. xfwm4 so the GTK dialog can take focus.
Xephyr :7 -screen 1360x900 -ac -noreset &
DISPLAY=:7 xfwm4 &
DISPLAY=:7 ./src-tauri/target/release/diagrams &

# The browser build, on a screen the size of the app's client area, so a kiosk
# window's content box matches it exactly.
pnpm dev:web &
Xephyr :8 -screen 1280x800 -ac -noreset &
DISPLAY=:8 xfwm4 &
DISPLAY=:8 firefox --profile <fresh> --kiosk --no-remote http://localhost:5173/ &
```

On **each** surface, in this order — the SVG's element order is the DOM's, so the label has to go
first — with coordinates relative to the app window and to the kiosk window respectively:

```sh
W=$(xdotool search --name diagrams | tail -1)          # under the right DISPLAY
xdotool mousemove --window $W 170 768 click 1          # the LaTeX input
xdotool type '\Sigma_{(x:A)} P(x)'; xdotool key Return
for p in "200 200" "500 320" "820 460" "1050 220"; do  # four dots
  xdotool mousemove --window $W ${=p}; xdotool click 1
done
xdotool mousemove --window $W 1215 768 click 1         # Export
```

In the app that opens the dialog; `ctrl+a` and typing an absolute path into **Name**, then `Return`,
chooses it. Firefox downloads to the profile's download directory, and the two files are then
`cmp`'d. The renderer checks are [ticket 04's](../../plop-and-export/verification/README.md),
re-run against the file the **app** wrote:

```sh
rsvg-convert -b white -o diagram-rsvg.png diagram.svg
inkscape --export-type=png --export-filename=diagram-inkscape.png diagram.svg
rsvg-convert -f pdf -o /tmp/diagram.pdf diagram.svg
pdffonts /tmp/diagram.pdf; pdfimages -list /tmp/diagram.pdf   # expect: no rows
```

## What is in here

| File | What it is |
| --- | --- |
| `diagram.svg` | The file the **app** wrote, at the path chosen in the dialog. |
| `app-window.png` | The canvas it was written from, in the Tauri window. |
| `save-dialog.png` | The dialog Export opens: `Name: diagram.svg`, and the `SVG` filter. |
| `diagram-rsvg.png` | `rsvg-convert`'s rendering of the written file (librsvg/cairo). |
| `diagram-inkscape.png` | Inkscape's rendering of it. |

## Result (2026-08-01)

**The dialog.** Export opened the GTK save dialog in `save-dialog.png` — pre-filled with
`diagram.svg` from `defaultPath`, narrowed to `SVG` by the extension filter. Typing
`…/.scratch/tauri-shell/verification/diagram.svg` put the file **there**: not `~/Downloads` (which
does not exist on this machine), not the process's working directory — which is where
[ticket 01](../issues/01-tauri-shell.md) found the same button silently dropping it — and under the
name given, unrenamed.

**Overwriting.** A second export to the same path raised GTK's *"A file named diagram.svg already
exists"*, and Replace rewrote it: same inode `131239`, same 6021 bytes, mtime `11:55:43` → `12:02:56`.
No `diagram (1).svg` was manufactured, in that directory or any other.

**Cancelling.** Export, then Cancel: mtime unchanged at `12:02:56`, no new file anywhere, and the
window came back to the canvas untouched. The `cancelled` the writer reports for it is the suite's
to check, and does.

**Byte-identity.** The app's file and Firefox's download of the same canvas are the same 6021 bytes,
`sha256 f00f5e0e…5a8642`. So `writeTextFile` and a `Blob` download agree exactly: no BOM, no CRLF,
no re-encoding — and the two engines serialized the same DOM identically, glyph paths included.

**Renders.** `rsvg-convert` and Inkscape both drew the four dots at `(200,200)`, `(500,320)`,
`(820,460)`, `(1050,220)` and `\Sigma_{(x:A)} P(x)` in New Computer Modern, matching the app window.
The PDF conversion embedded **zero fonts and zero raster images**.

**After the code review.** The review changed the frontend — comments, one property read, one added
test — so the binary above was no longer the one on disk. The app was rebuilt and the export
repeated: the same four clicks produced the same `sha256`, so everything recorded here holds for the
code as it now stands.

Toolchain: WebKitGTK `2.52.5`, `tauri 2.11.5`, `tauri-plugin-dialog 2.7.2`, `tauri-plugin-fs 2.5.1`,
rustc `1.97.1`, node `24.18.0`, pnpm `10.34.5`, Firefox `153.0`, `rsvg-convert 2.61.4` (cairo
`1.18.4`), Inkscape `1.4.4`, poppler `25.07.0`.

Note: `diagram.svg` has a transparent background — see
[ticket 04's Choices](../../plop-and-export/issues/04-export-svg.md) — so the rsvg render passes
`-b white` to composite it the way a viewer with a white page would.
