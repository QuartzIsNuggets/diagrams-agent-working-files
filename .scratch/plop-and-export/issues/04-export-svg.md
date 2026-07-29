# 04 — Export standalone SVG

**What to build:** A button serializes the canvas `<svg>` — term-dots **and** the typeset MathJax
paths — into a valid, standalone `.svg` file and triggers a browser download. The point of the
slice is fidelity: the downloaded file, opened on its own (browser, Inkscape, or a PDF
converter), renders the dots and the typeset label as vector graphics, identical to what's on
screen. This is the capstone that retires the clean-vector-export risk — meaningful only once
there's real content (dots + math paths) to export.

**Blocked by:** 02 — Plop term-dots · 03 — MathJax LaTeX label → canvas.

**Status:** resolved — implemented on branch `session-00` (2026-07-29).

- [x] A visible Export button serializes the live canvas `<svg>` and downloads it as a `.svg` file
- [x] The serialized output is a valid, self-contained SVG document (correct `xmlns`, no external references)
- [x] The serialized output carries its own `width`, `height` **and `viewBox`** — the live canvas has none, so a bare `outerHTML` is a document with no dimensions at all
- [x] Opened standalone, the file renders the **dots and** the typeset label as vector graphics
- [x] The exported math matches on-screen (glyph paths carried over intact; no missing `<defs>`/glyphs from font caching)

`src/export-svg.ts` (`serializeCanvas` / `createExportButton` / `enableExporting`), wired in
`main.ts` and placed from `style.css`.

## How each criterion was checked

**Criteria 1–3, in jsdom.** `src/export-svg.test.ts` (21 tests) builds the canvas through the
production modules — dots plopped as `pointerdown`/`pointerup` pairs through `enablePlopping`,
labels typeset through the real MathJax pipeline via `enableLabelPlacing` — and then reparses
`serializeCanvas`'s output with `DOMParser`, the way a viewer would open the file. The
download hand-off is covered separately: one test asserts the bytes in the `Blob` the browser is
handed are exactly `serializeCanvas`'s output, and the fidelity tests work from the serializer
directly rather than repeating the trip through the blob for each one.

Every production line was mutation-checked — dropping `width`, `height`, `viewBox`, the clone,
the `export-button` class, the `download` attribute, the `link.click()`, or `button.type`,
swapping `XMLSerializer` for `outerHTML`, changing the blob's MIME type, and revoking the object
URL synchronously each turn the suite red. Two values are deliberately pinned only as loosely as
the criteria are: the filename is asserted to end in `.svg`, not to be `diagram.svg`, and the
revoke is asserted to be *deferred*, not to be deferred by any particular number of milliseconds.

**Criteria 4–5, against real renderers.** These are the ones jsdom cannot speak to, so they are
checked outside it and the check is committed and re-runnable —
[`verification/`](../verification/README.md) holds the harness, the exported file, and both
renderings. A canvas of five dots and three labels (`\Sigma_{(x:A)} P(x)`,
`\int_0^\infty e^{-x^2}\,dx = \frac{\sqrt{\pi}}{2}`, `f : \mathbb{N} \to \mathbb{R}`) is exported
through the production path, and the resulting file is opened by two independent renderers that
share nothing with the app: `rsvg-convert` (librsvg/cairo) and Inkscape both drew the dots and
the typeset maths as they appear on screen, with no page CSS anywhere in sight. Converted to PDF,
the file yields **zero embedded fonts and zero raster images** (`pdffonts`, `pdfimages -list`) —
everything in it is vector path geometry, which is the claim this slice existed to prove.

`pnpm build`/`typecheck`/`lint`/`format:check`/`reuse lint` clean, 63 tests green. The
verification harness is a `.check.ts` under its own config, so it stays out of the suite and no
production config knows it exists.

**Not checked:** there is still no headless browser here, so where the Export button actually
lands on screen is `style.css`'s word against nobody's, and the browser's own download machinery
(`URL.createObjectURL`, a synthetic click on a detached `<a download>`) is stood in for rather
than observed. The bytes those stand-ins receive are the real ones, and the file they carry is
what the two renderers above opened.

## Choices

- **The export is framed by the canvas's rendered box, not cropped to its content** — dots are
  already placed in coordinates relative to that box (`enablePlopping` subtracts
  `getBoundingClientRect()`), so `viewBox="0 0 width height"` is the exact frame the diagram is
  drawn in and the file is 1:1 with the screen, which is what the ticket asks for. The numbers go
  in unrounded, so a fractional CSS pixel reaches the file as one; that is faithful rather than
  tidy, and rounding would move the marks relative to the frame. Crop-to-content is the better
  export for a figure going into a paper and is where this should go next: switch to
  `canvas.getBBox()` plus a margin. That needs real SVG layout, which jsdom has none of, so the
  tests would move to Vitest browser mode with it.
- **The exported background is transparent — no white `<rect>` is synthesized** — confirmed by the
  maintainer (2026-07-29) as the wanted behaviour, so it stands against the ticket's "identical to
  what's on screen", which it reads narrowly as being about the *marks*. The on-screen white comes
  from `.canvas` in `style.css`, and page CSS deliberately does not travel with the file (ticket
  02 settled that); transparency is what lets the diagram drop onto a page of any colour, and
  every standalone viewer tried renders it on white anyway. The cost, accepted: near-black ink is
  hard to see in a dark-background viewer. Reversing this means a `PAPER` constant and a
  full-`viewBox` `<rect>`, and it should be a deliberate reversal, not a drive-by.
- **`XMLSerializer`, not `outerHTML`** — `outerHTML` serializes by HTML rules, which leave the SVG
  namespace to be inferred from the surrounding document; a file opened on its own has none, so it
  would not parse as SVG. The serializer declares the namespace on the root because the element
  genuinely is in it, which is more robust than a hand-set attribute. Nothing to revisit.
- **A deep clone is framed and serialized; the live canvas is never touched** — `width`/`height`/
  `viewBox` are export concerns, and setting them on the live element would give the canvas a
  fixed user-coordinate system that fights the CSS sizing. Costs one tree copy per press, which is
  nothing next to the serialization itself.
- **The file opens with an XML declaration naming UTF-8** — a bare root element parses fine
  everywhere tried, but the declaration is what stops a tool reading the bytes from having to
  guess the encoding, and the maths carries non-ASCII. Drop it only if some consumer chokes on it.
- **Class attributes ride along into the file** (`canvas`, `term-dot`, `math-label`) — they name
  nothing outside the document, so they are not external references, and they leave anyone editing
  the exported file the same handles the app uses. Strip them in `serializeCanvas` only if export
  size starts to matter.
- **A `Blob` object URL, not a `data:` URL** — a diagram of typeset labels is a lot of path data
  and data URLs are length-capped by the browser. The anchor is never added to the document, since
  a synthetic click on a detached one downloads just the same and leaves nothing to clean up. The
  URL is revoked one turn of the event loop after the click rather than in the same task, because
  revoking synchronously has raced the download in Firefox.
- **Every export is called `diagram.svg`** — the ticket asks for a download, not a filing system,
  and browsers already de-duplicate repeat downloads (`diagram (1).svg`). A timestamp would make
  each export unique but never *named*; the real answer is naming the diagram itself, which wants
  a document model this slice does not have. Revisit when diagrams get identities.
- **The Export button is its own element with `type="button"`, fixed in the opposite bottom corner
  from the LaTeX bar** — inside the form it would submit it, and it is a separate action on the
  whole canvas rather than on the input's contents. Both controls float over the canvas rather
  than taking room from it, which is ticket 03's arrangement continued: the canvas is the whole
  viewport and the chrome sits on top of it. Fold the two into a real toolbar when a third control
  arrives, or when overlaying the drawing surface starts to cost more than the room would.
- **`serializeCanvas` is exported alongside `enableExporting`** — the serialization is the whole
  risk this slice retires and is pure, so it is testable without going anywhere near object URLs
  or anchor clicks; it is also what any later "copy SVG to clipboard" or "export to PDF" would
  build on. Keep it public.
