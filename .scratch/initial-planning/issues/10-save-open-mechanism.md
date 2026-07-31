# Save & open mechanism — and whether it pulls Tauri forward

Type: research
Status: resolved

## Question

[Ticket 08](./08-persistence-format.md) settled *what a save file is* — legible `.hott.json`,
shaped like a normalized schema. It deliberately left *how the bytes reach the disk*, because that
turns on external facts and may re-order the map.

The problem: `src/export-svg.ts` writes files with a Blob and a synthetic `<a download>` click.
That is correct for a one-way export, and **broken for a save** — it cannot overwrite the file that
was opened, so the second save yields `2.7.2.hott (1).json` in `~/Downloads`. A document the user
owns and keeps in git needs to be written back where it came from.

- **What the web platform actually offers.** The File System Access API
  (`showSaveFilePicker` / `showOpenFilePicker`, and a retained handle to write back through) is the
  mechanism that makes a real save possible. Its cross-browser support must be **verified against
  primary sources**, not recalled: the belief in hand is that it is Chromium-led, with Firefox and
  Safari supporting the origin-private filesystem but not the pickers. Confirm current state,
  including whether a retained handle survives a reload and what permission prompt it costs.
- **What the fallback degrades to.** If a browser lacks the pickers: download-per-save plus
  `<input type="file">` to reopen. Is that acceptable as a degraded path, or does it fail the
  destination outright?
- **Whether this pulls Tauri forward.** The map lists *native desktop packaging* under
  **Not yet specified**, on the assumption it is a free wrapper to add whenever. If a real save
  needs a real file dialog, Tauri stops being a nicety and becomes the thing that makes persistence
  work — which promotes it from fog onto the route. Establish whether that is so.
- **Origin-private filesystem as a third option.** OPFS is widely supported but invisible to the
  user and to git — a sandbox, not a document they own. Weigh it as a session-recovery mechanism
  (crash safety) distinct from saving, or rule it out.

Resolve the factual half with `/research`; the delivery decision that follows is a `/grilling`
question, and may warrant splitting into its own ticket once the facts are in.

## Research

[Save & open — how bytes reach the disk](../research/save-open-file-access.md), verified against
the specs' own source repositories (`whatwg/fs`, `WICG/file-system-access`, `mdn/content`,
`mozilla/standards-positions`, `WebKit/standards-positions`, `tauri-apps/*`). Three working
snippets — File System Access, the feature-detected fallback, and the Tauri equivalent — plus a
four-option decision table.

## Answer

**Two builds with different powers: the web build can open, edit and export; only the desktop app
can save. Tauri is promoted out of the fog and onto the route.**

### Why Tauri is forced — a fact about the human, not the platform

The research's own headline was that Tauri is *not* forced: `showSaveFilePicker` plus a
`FileSystemHandle` round-tripped through IndexedDB (the handle is `[Serializable]` per the WHATWG
spec) gives a genuine save-back-to-the-same-path on Chromium, and an installed PWA drops the
permission prompt to nothing. It also named the single fact that would flip that conclusion —
Firefox as the daily driver — and on this machine **Firefox is the only browser installed and the
default**.

For that user both web routes are closed, and neither is closed by a schedule:

- **No File System Access.** Mozilla's standards position is *negative* — "harmful"
  (`standards-positions#154`); WebKit's is *oppose*, "we don't see a way to grant write access…
  that safeguards the end user's interests" (`standards-positions#28`). Nothing has moved since
  2023 and no cross-vendor save-picker proposal is in flight. This is a settled no, not a wait.
- **No PWA install**, so the cheap Tauri competitor is unavailable too — Firefox desktop dropped
  site-specific browsers in 2021. It died on a fact about the machine, not on its merits.

That leaves "run a Chromium browser to use your own editor" or "ship a native app". The second is
the smaller standing cost, so persistence is what makes Tauri load-bearing rather than a later
nicety — the promotion this ticket existed to establish. The map's `≈free` framing is retired
with it: Rust toolchain, seven Fedora packages including `webkit2gtk4.1-devel`, a capabilities
file, deb/rpm at 2–6 MB against an AppImage at 70+ MB, and **a second engine** — WebKitGTK, which
`tauri dev` and the shipped app both render in. The bite is habit, not architecture: the maintainer's
`pnpm dev` loop runs in Firefox against the *web* build, so "works in my browser" stops meaning
"works in the app" until the Tauri window is opened. Tauri's cost falls on the shell alone; `pnpm dev`
still drives the UI at Vite speed.

### What each build is

The two are not tiers of the same product but **different surfaces for different work**, and the
boundary is the document's lifetime:

- **Web** — the no-install surface, for diagrams simple enough that nobody versions them or comes
  back to them across sessions. It **opens** a `.hott.json` (`<input type="file">` is universal,
  and a rare legitimate convenience is not worth refusing on principle), edits, and **exports**.
  It does not write. What it cannot do it says plainly: no Save affordance, only the honest
  Export the project already has — the fallback's real failure was never the missing capability
  but pretending, since `<a download>` is not a degraded save at all. It is an export plus a
  manual filing chore that manufactures `foo (1).json` and diverges silently from the tree.
- **App** — opens, edits, **saves in place**, exports. The `.hott.json` is a document the user
  owns and keeps in git, and `git diff` showing the edit is the whole test.

**Tauri is the only writer.** Feature-detecting File System Access so a Chromium visitor gets a
real save in the browser was weighed and declined: it makes the capability depend on the reader's
browser rather than on what the surface is *for*, and it buys two document lifecycles — one
holding a handle, one not — with every Save affordance obliged to lie differently in each. A
permanent seam, paid on the surface that matters least, in code its author's own browser cannot
run.

### Consequences for later tickets

- The format's **reader** — parser and load-time validator over the
  [`.hott.json` schema](./08-persistence-format.md) — is **shared** code; only the writer is
  app-side. The web build therefore still needs the real in-memory model, so
  [ADR 3](../../../docs/adr/0003-a-save-records-the-diagram.md) forces it into existence on both
  surfaces.
- One codebase, two targets, via Tauri's own `isTauri()` behind a dynamic `import()` — the
  `@tauri-apps/*` packages are plain wrappers over `invoke` and land in a chunk the web build
  never loads.
- Writing goes through `@tauri-apps/plugin-dialog`'s `save()`/`open()` for a real path and
  `plugin-fs`'s `writeTextFile`. **No static path allowlist is needed**: the dialog plugin injects
  the chosen path into the fs plugin's runtime scope (`s.allow_file(&path)`), which is Tauri's
  analogue of the web's handle-plus-permission and the reason "open with the dialog, then write"
  is the sanctioned pattern rather than granting `$HOME/**`.
- **OPFS is ruled out**, as a document store and as crash recovery. It is invisible to both the
  user and git, LRU-evictable under storage pressure, and Safari deletes script-created storage
  after seven days without interaction — and once the desktop app owns every document worth
  keeping, the web build has no session worth recovering.

## Comments

**Correction — Tauri involves no Gecko.** This answer originally counted "**a third engine** —
development in Gecko, the shipped Linux app in WebKitGTK, the web build everywhere". That was wrong,
and the sentence above is corrected. Tauri has no Gecko backend at all: WRY binds the *system*
webview — WebKitGTK on Linux, WKWebView on macOS, WebView2 on Windows, Android WebView on Android —
and Gecko/Firefox appear nowhere in Tauri's architecture or webview-versions docs. `wry`'s only nod
to an alternative is `os-webview (default): … added in preparation of other ports like cef and
servo` — Servo, not Gecko, and unimplemented. Nor does `tauri dev` open a browser: *"Once Rust has
finished building, the webview opens, displaying your web app"*, and *"Tauri's APIs only work in your
app window, so once you start using them you won't be able to open your frontend in your system's
browser anymore"*. Dev and shipped app are therefore the **same** engine.

The error came from the research doc's "a different engine from *the Chromium you develop against*"
(Tauri's own docs assuming a Chromium dev browser); this answer swapped Gecko in for Chromium and
then counted it as a third engine Tauri imposes. But Gecko arrives through the **web build**, which
this decision ships regardless — so it was double-counted, not added. What survives is a habit
hazard, now recorded above and in the map's Tauri-shell fog: the `pnpm dev` loop in Firefox exercises
the web surface only. Sources: `v2.tauri.app/concept/architecture/`, `/develop/`,
`/reference/webview-versions/`, `tauri-apps/wry` README.
