# Save & open — how bytes reach the disk, and whether that forces Tauri

**Research note — 2026-07-31.** Primary sources only: MDN prose + MDN `browser-compat-data`
(`mdn/content`, `mdn/browser-compat-data` on GitHub), the WHATWG File System spec (`whatwg/fs`), the
WICG File System Access spec (`WICG/file-system-access`), `mozilla/standards-positions` and
`WebKit/standards-positions`, Chrome for Developers, the Chromium source, and `v2.tauri.app` /
`tauri-apps` sources on GitHub. `caniuse` used **only** as a cross-check, never as a citation.

---

## ⚠️ Headline corrections (read first)

**The ticket's central premise is correct, so the corrections are elsewhere.** "Chromium-led pickers;
Firefox and Safari have OPFS but not the pickers" is exactly right, and still right today. Three
things around it are not.

**1. The pickers are no longer desktop-only.** Chrome shipped `showOpenFilePicker()` /
`showSaveFilePicker()` **on Android and in Android WebView in Chrome 132** (January 2025) — "File
System access shipped on Desktop in Chrome 86, with Chrome 132 it's available on Android and
WebView." The Chrome capability doc now states support "on most Chromium browsers on Windows, macOS,
ChromeOS, Linux, **and Android**", with Brave the notable exception (flag-gated). `caniuse` still
reports `and_chr: "n"` — **`caniuse` is wrong on this row.** Sources:
<https://developer.chrome.com/blog/new-in-chrome-132>,
<https://developer.chrome.com/docs/capabilities/web-apis/file-system-access>.

**2. "A prompt every session" is out of date.** Since **Chrome 122** the permission prompt is
three-way — *Allow this time* / **Allow on every visit** / block — and choosing "every visit" gives
indefinite access until revoked, restored on later visits for handles you rehydrate from IndexedDB.
Stronger still: **an installed app (PWA) persists permissions automatically and is never shown the
three-way prompt.** So the honest UX cost of "reopen the document I had" is *one click on first
grant, then zero* — not one prompt per session. Source:
<https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api>.

**3. `FileSystemFileHandle.move()` is not a tool you can plan on.** It is **not on the standards
track**, is **only exposed on `FileSystemFileHandle`** (no directory moves), and moving files that
live *outside* OPFS "are not yet supported" — that is still an unimplemented WHATWG *proposal* with
"no signals" from Gecko and WebKit. Renaming a user-visible file from the web is not available in any
engine; a "Save As" is a fresh `showSaveFilePicker()`, not a move. Sources:
<https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/FileSystemHandle.json>,
<https://github.com/whatwg/fs/blob/main/proposals/MovingNonOpfsFiles.md>.

**And the answer the ticket actually wants: Tauri is _not_ forced.** A real save-in-place is available
today on the web, on every Chromium browser including Android, with a permission cost that collapses
to zero once the app is installed. What Tauri buys is *engine independence* — it is the only way to
give a Firefox or Safari user a real save. What it costs is not a free wrapper either (see §5).

---

## Answer summary (the five questions, tight)

**1. File System Access support (2026-07-31).** Split the API in two and the picture is clean.

| | pickers + user-visible handles | OPFS (`navigator.storage.getDirectory()`) |
|---|---|---|
| Chrome / Edge desktop | ✅ Chrome 86 (Win/macOS/ChromeOS/Linux) | ✅ Chrome 86 |
| Chrome Android / WebView | ✅ **Chrome 132** | ✅ Chrome 109 |
| Firefox (desktop + Android) | ❌ never shipped — position **negative/harmful** | ✅ Firefox 111 |
| Safari / iOS Safari | ❌ never shipped — position **oppose** | ✅ Safari 15.2 (`createWritable` only from **Safari 26**) |

`queryPermission()` / `requestPermission()` exist **only in Chromium** (Chrome 86+), which is the
tell: they are the picker half of the API, and Firefox/Safari expose neither. Mozilla's position on
the local-filesystem half is *negative* ("harmful"); WebKit's is *oppose* — "we don't see a way to
grant write access to the end user's local file system in a way that safeguards the end user's
interests". **Neither has shipped or is implementing anything since**, and there is no cross-vendor
"save picker" proposal in flight at WHATWG. Mobile *does* now matter for Chromium, and remains a hard
no for iOS (every iOS browser is WebKit).

**2. Handle persistence across reload — yes, and it is spec'd.** `FileSystemHandle` is
`[Serializable]`, so a handle structured-clones into IndexedDB and comes back after a reload; the
spec explicitly anticipates this ("handles stored in IndexedDB"), with deserialization refused
cross-origin (`DataCloneError`). What comes back is a *handle*, not a permission: by default you must
`queryPermission({mode:'readwrite'})` and, if it is not `granted`, `requestPermission()` — which
**requires transient user activation** (a click). With Chrome 122's "Allow on every visit", or with
the app installed, `queryPermission()` returns `granted` straight away and no gesture is needed.
Clearing browsing data clears persisted handles. **Practical cost of "reopen my last diagram":** one
click, once, then nothing.

**3. The degraded fallback is not a save.** `<a download>` + Blob cannot overwrite, cannot know or
choose a path, and the filename is only a *suggestion* — the browser may rewrite it, and a
Content-Disposition filename would outrank it. `<input type="file">` gives you a `File` (name, bytes,
lastModified) and **no way to write back**. The round trip therefore degrades to: save → a new file
in the download directory; the user hand-moves it into the git repo; the next save produces
`2.7.2.hott (1).json`. The one real mitigation is user configuration, not code — browsers may be set
to "always ask where to save", which recovers *choosing* the destination (and an OS-level overwrite
confirmation) but never recovers path memory, so it is one navigation-through-the-file-tree per save,
forever. Firefox is exactly this case: no `showSaveFilePicker` at all. Safari the same, plus
Safari-specific storage rules that matter for OPFS (§4).

**4. OPFS is crash-recovery, not saving.** Supported everywhere (Chrome 86 / Chrome Android 109 /
Firefox 111 / Safari 15.2). It is a *storage endpoint private to the origin*, "not visible to the
user like the regular file system" — therefore invisible to the user's file manager **and to git**.
It is quota-managed and evictable: best-effort by default, LRU-evicted under storage pressure, and
**Safari deletes script-created storage after seven days without user interaction**.
`navigator.storage.persist()` exempts you from eviction — Firefox shows a prompt, Chrome/Edge decide
silently from engagement history — but a persisted origin's data is still one "clear browsing data"
away. Verdict: excellent as an autosave/crash-recovery buffer alongside a real file; **fatal as the
document store**, and useless for a document kept in git.

**5. Tauri v2 gives a real path — and is not free.** `@tauri-apps/plugin-dialog`'s `open()`/`save()`
return a **filesystem path** on Linux/Windows/macOS, and `@tauri-apps/plugin-fs`'s
`writeTextFile(path, text)` writes it. Crucially, the dialog plugin **adds the picked path to the fs
plugin's runtime scope automatically** (`s.allow_file(&path)?`), so no static path allowlist is
needed for user-chosen files — you only declare the *command* permissions in a capability. One
Vite+TS codebase can serve both targets: Tauri injects a `window.isTauri` global and ships
`isTauri()` in `@tauri-apps/api/core`, so a dynamic `import()` behind that check keeps the native code
out of the browser build. Costs, from Tauri's own docs: Rust toolchain via rustup; on **Fedora**
`webkit2gtk4.1-devel openssl-devel curl wget file libappindicator-gtk3-devel librsvg2-devel
libxdo-devel` plus the `c-development` group; bundles of **2–6 MB** for deb/rpm, **70+ MB** for
AppImage; a minimal app "less than 600KB". `webkit2gtk` is a real but ordinary Fedora dependency —
the burden is not installing it, it is that **your Linux users then run your app on WebKitGTK**, a
different engine from the Chromium you develop against.

---

## Details & citations

### 1 — File System Access: who has what

**The two halves are different specs.** The pickers (`showOpenFilePicker`, `showSaveFilePicker`,
`showDirectoryPicker`) and the permission methods live in the **WICG** draft; the handle interfaces,
the writable stream, and OPFS live in the **WHATWG File System** standard. That split is exactly the
support split.

- WICG IDL, verbatim:
  ```idl
  [SecureContext]
  partial interface Window {
    Promise<sequence<FileSystemFileHandle>> showOpenFilePicker(optional OpenFilePickerOptions options = {});
    Promise<FileSystemFileHandle> showSaveFilePicker(optional SaveFilePickerOptions options = {});
    Promise<FileSystemDirectoryHandle> showDirectoryPicker(optional DirectoryPickerOptions options = {});
  };
  partial interface FileSystemHandle {
    Promise<PermissionState> queryPermission(optional FileSystemHandlePermissionDescriptor descriptor = {});
    Promise<PermissionState> requestPermission(optional FileSystemHandlePermissionDescriptor descriptor = {});
  };
  ```
  Source: <https://github.com/WICG/file-system-access/blob/main/index.bs> (rendered:
  <https://wicg.github.io/file-system-access/>).
- WHATWG File System defines `FileSystemHandle`/`FileSystemFileHandle`/`FileSystemDirectoryHandle`,
  `createWritable()`, `createSyncAccessHandle()`, and the **bucket file system** reached via
  `navigator.storage.getDirectory()` — and defines **no pickers**. Source:
  <https://github.com/whatwg/fs/blob/main/index.bs> (rendered: <https://fs.spec.whatwg.org/>).
- `showSaveFilePicker()` is **secure-context only** and requires **transient user activation**;
  it throws `SecurityError` if called without user interaction or cross-origin, `AbortError` if the
  user dismisses. Source:
  <https://github.com/mdn/content/blob/main/files/en-us/web/api/window/showsavefilepicker/index.md>
  (rendered: <https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker>).

**Chromium.** Desktop since Chrome 86; **Android + WebView since Chrome 132** — "From Chrome 132,
the File System Access API is now available on Android and in WebViews." The capability doc's support
line: supported "on most Chromium browsers on Windows, macOS, ChromeOS, Linux, and Android", "a
notable exception is Brave where it is currently only available behind a flag", with the recommended
detection being `if ('showOpenFilePicker' in self)`. Sources:
<https://developer.chrome.com/blog/new-in-chrome-132>,
<https://developer.chrome.com/release-notes/132>,
<https://developer.chrome.com/docs/capabilities/web-apis/file-system-access>.

**Firefox.** Position **negative**. `mozilla/standards-positions#154` ("File System Access API") is
closed with labels `venue: W3C CG`, `position: negative`; the position was moved from *defer* to
*harmful* (PR #545, "Update File System Access (harmful)") on the grounds that "the protections
described in the spec are inadequate" for granting access to arbitrary directories, and that working
out what is safe "likely require[s] significant research". A later Mozilla comment carves out exactly
two acceptable shapes: origin-private directory access (i.e. OPFS, "equivalent to IndexedDB") and a
temporary single-session "save as". A narrower ask —
`mozilla/standards-positions#738`, "Implement subset of File System Access API" (`FileSystemFileHandle`
only) — was closed **`position: defer`**. Nothing has shipped. Sources:
<https://github.com/mozilla/standards-positions/issues/154>,
<https://github.com/mozilla/standards-positions/pull/545>,
<https://github.com/mozilla/standards-positions/issues/738>.

**Safari/WebKit.** Position **oppose**. `WebKit/standards-positions#28`, "File System Access API
(Local Filesystem)", labelled `position: oppose`, `concerns: security`; rationale (2023-02-08):
"Colleagues and I have discussed this and don't see a way to grant write access to the end user's
local file system in a way that safeguards the end user's interests… We do think there might be ways
that `<input type=file>`, drag & drop, and entries-api could be integrated better with
[fs.spec.whatwg.org]. Allowing usage of the new APIs for **read** access makes sense." The issue text
itself draws the line the ticket draws: "I'm not talking about the Origin Private File System part …
that has already been implemented in WebKit, but about the part that allows for direct access to
local files." Closed 2023-03-23. Source:
<https://github.com/WebKit/standards-positions/issues/28>.

**Version table from MDN `browser-compat-data`** (fetched directly, not read off caniuse):

- `FileSystemFileHandle`, `getFile()`, `FileSystemHandle`, `isSameEntry()` — Chrome 86, Chrome
  Android 109, Firefox 111, Safari 15.2 (Edge/Opera/Samsung/WebView mirror).
- `createWritable()` — Chrome 86, Chrome Android 109, Firefox 111, **Safari 26**. (The `mode` option
  is Chrome 121+ only.) Note what this means: before Safari 26, Safari could only write to OPFS
  through `createSyncAccessHandle()` in a dedicated worker.
- `createSyncAccessHandle()` — Chrome 102, Chrome Android 109, Firefox 111, Safari 15.2.
- `queryPermission()` / `requestPermission()` — Chrome 86 / Chrome Android 109; **Firefox no, Safari
  no**; marked experimental.
- `move()` — Chrome 102 *partial* ("Directory moves are not supported. The method is only exposed on
  `FileSystemFileHandle`"), Firefox 111, Safari 15.2; **"not on standards track"**.
- `remove()` — Chrome 110 only; experimental, not on standards track.
- `StorageManager.getDirectory()` (OPFS entry point) — Chrome 86, Chrome Android 109, Firefox 111,
  Safari 15.2. `persist()`/`persisted()` — Chrome 55, Firefox 57, Safari 15.2.

Sources: <https://github.com/mdn/browser-compat-data/blob/main/api/FileSystemFileHandle.json>,
<https://github.com/mdn/browser-compat-data/blob/main/api/FileSystemHandle.json>,
<https://github.com/mdn/browser-compat-data/blob/main/api/StorageManager.json>.

Cross-check (not a citation): `caniuse`'s `native-filesystem-api` reports `firefox: n` for every
version through 155, `safari: n` through 26.5 and TP, `ios_saf: n` throughout — agreeing on
Firefox/Safari — but reports `and_chr: n`, which the Chrome 132 release notes contradict. Source:
<https://github.com/Fyrd/caniuse/blob/main/features-json/native-filesystem-api.json>.

**One Chromium-specific constraint worth knowing for a git-tracked document.** Chromium maintains a
blocked-paths list. Relevant entries: you cannot pick your *entire* home directory, desktop or
documents folder (but anything inside them is fine — `kDontBlockChildren`); `$HOME/.ssh` and
`$HOME/.gnupg` are fully blocked; on Linux `/dev`, `/proc`, `/sys`, `/boot`, `/etc` and
**`$HOME/.config`** are fully blocked; and **`.git/hooks` is block-write**. A `.hott.json` file inside
a working tree is unaffected; a `showDirectoryPicker()` on the repo root is fine too. Source:
<https://github.com/chromium/chromium/blob/main/chrome/browser/file_system_access/chrome_file_system_access_permission_context.cc>.

### 2 — Persisting a handle across reload

- **Handles are serializable objects.** `[Exposed=(Window,Worker), SecureContext, Serializable]
  interface FileSystemHandle`; "`FileSystemFileHandle` objects are serializable objects." Their
  serialization steps store `[[Origin]]` and `[[Locator]]`; deserialization throws `DataCloneError`
  if the origin differs. Structured-clone ⇒ storable in IndexedDB and transferable via
  `postMessage()`. Sources: <https://github.com/whatwg/fs/blob/main/index.bs>;
  MDN: "Objects based on `FileSystemHandle` can also be serialized into an IndexedDB database
  instance, or transferred via `postMessage()`"
  (<https://github.com/mdn/content/blob/main/files/en-us/web/api/file_system_api/index.md>).
- **The permission does not ride along automatically.** The WICG spec notes user agents "are able to
  grant persistent access to files or directories", that handles stored in IndexedDB keep that
  persistent nature, and that "clearing browsing data will clear all handles that a website had
  persisted". Source: <https://github.com/WICG/file-system-access/blob/main/index.bs>.
- **`requestPermission()` requires transient user activation** — "The user has to interact with the
  page or a UI element in order for this feature to work" — and MDN publishes the canonical
  `verifyPermission()` shape (query, then request). Source:
  <https://github.com/mdn/content/blob/main/files/en-us/web/api/filesystemhandle/requestpermission/index.md>.
- **Chrome 122's persistent permissions** replaced "prompt every session" with a three-way prompt:
  *Allow this time* (session only), **Allow on every visit** (indefinite until revoked), or block.
  "Once the app has been granted persistent access, newly opened files and folders will be accessible
  persistently, too." When re-requesting, the prompt lists **all** handles the app previously had
  access to, not just the one being requested. **"Installed apps will automatically persist
  permissions once the user grants access. In this case, the three-way prompt won't be shown."**
  Chrome's own guidance remains: "Since permissions are not always persisted between sessions, you
  should verify … using `queryPermission()`. If they haven't, call `requestPermission()`." Source:
  <https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api>.

**Net UX for "reopen the diagram I was working on":** first ever open = one picker interaction;
subsequent sessions = zero interactions if the user chose *Allow on every visit* or installed the
app, otherwise **one click on a "Reopen <name>" button** (which is the user gesture that lets you call
`requestPermission()`). You cannot silently restore a handle-with-write-permission on page load
without one of those two grants — and you can never call the picker on load, because it needs a
gesture too.

### 3 — What the fallback actually degrades to

- **`download` is a suggestion, not a destination.** "Defining a value suggests it as the filename.
  `/` and `\` characters are converted to underscores (`_`). Filesystems may forbid other characters
  in filenames, so browsers will adjust the suggested name if necessary." Only same-origin URLs plus
  `blob:` and `data:` are downloadable — fine here, since the project already builds a Blob. If a
  `Content-Disposition` filename is present it generally wins over the attribute. Source:
  <https://github.com/mdn/content/blob/main/files/en-us/web/html/reference/elements/a/index.md>.
- **Where it lands, and whether the user is asked, is not yours to decide.** "How browsers treat
  downloads varies by browser, user settings, and other factors. The user may be prompted before a
  download starts, or the file may be saved automatically, or it may open automatically, either in an
  external application or in the browser itself." (Same source.) That sentence is the whole problem:
  a save must be deterministic; a download is a negotiation with the user's browser configuration.
  It also contains the only mitigation available — a user who sets "always ask where to save files"
  gets a native save dialog per download, and can steer it into the repo and confirm an overwrite.
  That is a per-save, per-navigation manual act, and it survives no state between saves.
- **No exceptions, no confirmation.** Google's own ponyfill for this exact situation notes "the
  legacy save method, unfortunately, doesn't support exceptions" — a synthetic `<a download>` click
  cannot report failure, cancellation, or a full disk. Source:
  <https://github.com/GoogleChromeLabs/browser-fs-access>.
- **`<input type="file">` reads and only reads.** It yields `File` objects (name, size, type,
  `lastModified`, bytes). There is no path and no write-back; the browser's own File System Access
  docs recommend `showOpenFilePicker` precisely because "you get a file handle in addition to the
  file". The `download` attribute itself is universally supported (Chrome 15, Firefox 20, Safari
  10.1, Edge 13) — support was never the issue; semantics are. Source:
  <https://github.com/mdn/browser-compat-data/blob/main/api/HTMLAnchorElement.json>.

**Concretely, for a `.hott.json` kept in git, on Firefox:** open the file each session by navigating a
file input; save by producing a download; move it from `~/Downloads` into the working tree with a file
manager or `mv`; if you forget, `git status` shows nothing and the second save silently becomes
`foo (1).json`. That is not a degraded save. It is an export plus a manual filing chore, i.e. exactly
what `src/export-svg.ts` already is, which is why the ticket is right to call it broken **for a
save**.

### 4 — OPFS: what it is and what evicts it

- **Definition.** "A storage endpoint provided as part of the File System API, which is private to
  the origin of the page and **not visible to the user like the regular file system**." Reached with
  `navigator.storage.getDirectory()`. In the WHATWG spec it is the *bucket file system*. Sources:
  <https://github.com/mdn/content/blob/main/files/en-us/web/api/file_system_api/index.md>,
  <https://github.com/whatwg/fs/blob/main/index.bs>.
- **Support** (BCD, above): Chrome 86 / Chrome Android 109 / Firefox 111 / Safari 15.2 — including
  iOS. This is the one part of the story that works everywhere.
- **Quota and eviction.** OPFS counts against the same origin quota as IndexedDB and the Cache API.
  Default mode is **best-effort**: kept "as long as the origin is below its quota, the device has
  enough storage space, and the user doesn't choose to delete the data". Under storage pressure
  browsers evict **least-recently-used origins first, skipping persistent origins**, and when an
  origin is evicted **all of its data across all storage APIs is deleted at once**. Quotas: Firefox
  best-effort = min(10% of disk, 10 GiB), persistent up to 50%; Chromium 60% of disk; Safari ~60% for
  browser apps.
- **`navigator.storage.persist()`** moves the origin to persistent mode — then data "is only evicted
  … if the user chooses to, by using their browser's settings". Cost: **Firefox shows a permission
  prompt**; Chrome/Edge decide automatically from engagement history with no user-visible prompt. So
  on Firefox the price of durable autosave is a permission dialog; on Chrome it is a coin toss you
  don't control.
- **Safari's seven-day rule.** Data "created from script will be deleted" after **seven days without
  user interaction** (clicks/taps) with the site. For a diagram tool opened occasionally, this means
  Safari OPFS state is not merely evictable-in-theory, it is routinely deleted.
- Source for all eviction/quota claims:
  <https://github.com/mdn/content/blob/main/files/en-us/web/api/storage_api/storage_quotas_and_eviction_criteria/index.md>
  (rendered: <https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria>).

**Verdict.** OPFS is invisible to the user's file manager, invisible to git, quota-managed, evictable,
and on Safari time-limited. It cannot be *the* document. It is a genuinely good **crash-recovery
buffer**: write the in-memory document there on a timer, and on startup offer "restore unsaved
changes" — a role orthogonal to saving, and one that works identically in every browser. Note also
that a `FileSystemWritableFileStream`'s `close()` "is expected [to] atomically update the contents of
the file on disk", so real saves are already crash-safe at the file level; OPFS autosave protects the
*unsaved* window, not the write itself.

### 5 — Tauri v2

**Dialogs give a real path.** `@tauri-apps/plugin-dialog` exposes `open()` and `save()`:
```javascript
import { save } from '@tauri-apps/plugin-dialog';
const path = await save({ filters: [{ name: 'My Filter', extensions: ['png', 'jpeg'] }] });
```
Both return filesystem paths on Linux, Windows and macOS (iOS returns `file://` URIs, Android returns
content URIs). Install is `pnpm tauri add dialog`. Source:
<https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/plugin/dialog.mdx>
(rendered: <https://v2.tauri.app/plugin/dialog/>).

**The fs plugin writes it.** `writeTextFile(path, contents)` / `readTextFile(path)` from
`@tauri-apps/plugin-fs`; `pnpm tauri add fs`. The plugin "prevents path traversal, not allowing parent
directory accessors". Source:
<https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/plugin/file-system.mdx>.

**Permissions/capabilities — what you must actually declare.** Capability files live in
`src-tauri/capabilities/*.json|toml` and are all enabled by default; "by default all potentially
dangerous plugin commands and scopes are blocked". `fs:default` grants **read-only** access to the
app-specific directories (AppConfig/AppData/AppLocalData/AppCache/AppLog) plus `mkdir` for them, and
denies critical paths — it grants you nothing for a user document. The command permissions you need
exist as `dialog:allow-open`, `dialog:allow-save`, `fs:allow-read-text-file`,
`fs:allow-write-text-file` (autogenerated one-per-command). Sources:
<https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/security/capabilities.mdx>,
<https://github.com/tauri-apps/plugins-workspace/blob/v2/plugins/fs/permissions/default.toml>,
<https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/fs/permissions/autogenerated/commands>,
<https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/dialog/permissions/autogenerated/commands>.

**You do *not* need a static path allowlist for user-picked files.** The dialog plugin injects the
chosen path into the fs plugin's runtime scope:
```rust
if let Some(s) = window.try_fs_scope() {
    s.allow_file(&path)?;
}
```
and the fs commands consult that runtime scope when resolving a path:
```rust
if fs_scope.scope.is_allowed(&resolved_path) || scope.is_allowed(&resolved_path) {
```
Sources: <https://github.com/tauri-apps/plugins-workspace/blob/v2/plugins/dialog/src/commands.rs>,
<https://github.com/tauri-apps/plugins-workspace/blob/v2/plugins/fs/src/commands.rs>. This is the
Tauri analogue of the web's handle-plus-permission, and it is why "open with the dialog, then write"
is the sanctioned pattern rather than "allow `$HOME/**`".

**One codebase, two targets.** Tauri injects a global; `@tauri-apps/api/core` exports the check:
```typescript
function isTauri(): boolean {
  return !!((globalThis as any) || window).isTauri
}
```
Source: <https://github.com/tauri-apps/tauri/blob/dev/packages/api/src/core.ts> (and the same check is
in the injected bundle, `crates/tauri/scripts/bundle.global.js`). The `@tauri-apps/*` JS packages are
plain JS wrappers over `invoke`, so they bundle harmlessly in a browser build; behind a dynamic
`import()` guarded by `isTauri()` they end up in a chunk the browser build never loads.

**Setup cost, from Tauri's own docs.**
- Rust via rustup (no minimum version is stated on the prerequisites page).
- **Fedora**: `webkit2gtk4.1-devel openssl-devel curl wget file libappindicator-gtk3-devel
  librsvg2-devel libxdo-devel` + the `c-development` group. Source:
  <https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/start/prerequisites.mdx>.
- Size: "A minimal Tauri app can be less than 600KB in size"
  (<https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/start/index.mdx>); packaging
  reality on Linux: deb/rpm land in the **2–6 MB** range, and an **AppImage grows that to 70+ MB**
  because it bundles the dependencies — plus an AppImage built on a newer system silently raises the
  minimum glibc, breaking older targets
  (<https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/distribute/appimage.mdx>).
- **Build time: Tauri's docs state no figure.** The only size/perf guidance is `concept/size.mdx`,
  which recommends a release profile of `codegen-units = 1`, `lto = true`, `opt-level = "s"`,
  `panic = "abort"`, `strip = true`, plus `"removeUnusedCommands": true` (needs Tauri 2.4+,
  tauri-build 2.1+, tauri-plugin 2.1+, tauri-cli 2.4+) — all of which *increase* compile time. Treat
  "first `cargo build` is minutes, incremental Rust rebuilds are seconds-to-tens-of-seconds" as an
  engineering expectation, **not** a documented number. Source:
  <https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/concept/size.mdx>.

**The `webkit2gtk` question, honestly.** Installing it on Fedora/Qubes is a one-line `dnf` — not a
burden. The burden is downstream: on Linux, Tauri renders in **WebKitGTK**, not Chromium. This project
is SVG + MathJax-generated inline `<path>` geometry, which is about as engine-portable as web content
gets, so the exposure is low — but it is a second engine to test in, and it is the *same engine
family* that today refuses the pickers. There is a certain irony in escaping WebKit's position by
shipping WebKit.

---

## Working snippets

### (a) Open → edit → save back to the same file (File System Access)

```ts
// src/persistence/fsa.ts — a real save: same file, same path, no dialog on re-save.

/**
 * `.hott.json` is a legal picker suffix: it starts with ".", contains only ASCII
 * alphanumerics and ".", does not end with ".", and is 10 code points — the spec's
 * "validate a suffix" algorithm caps suffixes at 16.
 */
const HOTT_TYPE = {
  description: "HoTT diagram",
  accept: { "application/json": [".hott.json"] },
} as const;

// TypeScript's lib.dom does not declare the pickers or the permission methods
// (they are WICG, not WHATWG). Narrow local types keep this compiling everywhere
// and double as the feature detection — no global augmentation, nothing to clash.
interface PickerOptions {
  types?: readonly { description?: string; accept: Record<string, readonly string[]> }[];
  excludeAcceptAllOption?: boolean;
  id?: string;
  startIn?: string | FileSystemHandle;
}
interface SavePickerOptions extends PickerOptions {
  suggestedName?: string;
}
interface Pickers {
  showOpenFilePicker?: (o?: PickerOptions & { multiple?: boolean }) => Promise<FileSystemFileHandle[]>;
  showSaveFilePicker?: (o?: SavePickerOptions) => Promise<FileSystemFileHandle>;
}
type PermissionDescriptor = { mode: "read" | "readwrite" };
type PermissionedHandle = FileSystemHandle & {
  queryPermission?: (d: PermissionDescriptor) => Promise<PermissionState>;
  requestPermission?: (d: PermissionDescriptor) => Promise<PermissionState>;
};

const pickers = globalThis as unknown as Pickers;

/** Whether this browser can save in place at all. Chromium (incl. Android 132+): yes. */
export const canSaveInPlace = typeof pickers.showSaveFilePicker === "function";

/** Ask, if we must. MUST be called from inside a click handler: requestPermission
 *  needs transient user activation. */
async function ensureWritable(handle: FileSystemFileHandle): Promise<boolean> {
  const h = handle as PermissionedHandle;
  if (!h.queryPermission || !h.requestPermission) return true; // engine without the shim
  const mode = { mode: "readwrite" } as const;
  if ((await h.queryPermission(mode)) === "granted") return true;
  return (await h.requestPermission(mode)) === "granted";
}

export async function openDocument(): Promise<{ handle: FileSystemFileHandle; text: string }> {
  const [handle] = await pickers.showOpenFilePicker!({ types: [HOTT_TYPE], multiple: false });
  return { handle, text: await (await handle.getFile()).text() };
}

export async function saveAs(text: string, suggestedName = "diagram.hott.json"): Promise<FileSystemFileHandle> {
  const handle = await pickers.showSaveFilePicker!({ types: [HOTT_TYPE], suggestedName, id: "hott-doc" });
  await writeThrough(handle, text);
  return handle;
}

/** The whole point: no picker, no download, no rename. Writes the bytes where they came from. */
export async function save(handle: FileSystemFileHandle, text: string): Promise<void> {
  if (!(await ensureWritable(handle))) throw new Error("write permission refused");
  await writeThrough(handle, text);
}

async function writeThrough(handle: FileSystemFileHandle, text: string): Promise<void> {
  // createWritable() truncates by default; close() is expected to swap the file
  // contents atomically, so a crash mid-write cannot leave a half-file on disk.
  const stream = await handle.createWritable();
  await stream.write(text);
  await stream.close();
}
```

Remembering the handle across reloads — a handle is a structured-cloneable object, so IndexedDB
stores it as-is:

```ts
// src/persistence/recent.ts — "reopen last document" that survives F5.

const DB = "hott", STORE = "handles", KEY = "current";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => { resolve(req.result); };
    req.onerror = () => { reject(req.error); };
  });
}

function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(db => new Promise<T>((resolve, reject) => {
    const req = run(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => { resolve(req.result); };
    req.onerror = () => { reject(req.error); };
  }));
}

export const remember = (h: FileSystemFileHandle): Promise<IDBValidKey> =>
  tx("readwrite", s => s.put(h, KEY));

export const recall = (): Promise<FileSystemFileHandle | undefined> =>
  tx("readonly", s => s.get(KEY) as IDBRequest<FileSystemFileHandle | undefined>);
```

On startup: `recall()`, then show `Reopen “${handle.name}”`. Clicking it supplies the user gesture
that `ensureWritable()` may need — and needs nothing at all if the user chose *Allow on every visit*
or installed the app.

### (b) The feature-detected fallback

```ts
// src/persistence/index.ts — one door, two implementations, honest about which one you got.

import { canSaveInPlace, openDocument, save, saveAs } from "./fsa.js";

export type Opened = { text: string; handle: FileSystemFileHandle | null; name: string };

/** True when a save can go back where it came from. False = every save is a download. */
export const savesInPlace = canSaveInPlace;

export async function open(): Promise<Opened | null> {
  if (canSaveInPlace) {
    const { handle, text } = await openDocument();
    return { text, handle, name: handle.name };
  }
  return openViaInput();
}

/** `handle` is null on the fallback path — the caller must degrade the UI, not just the write. */
export async function write(text: string, handle: FileSystemFileHandle | null, name: string): Promise<FileSystemFileHandle | null> {
  if (canSaveInPlace) return handle ? (await save(handle, text), handle) : await saveAs(text, name);
  downloadBlob(text, name);   // cannot overwrite, cannot fail loudly, lands wherever the browser puts it
  return null;
}

function openViaInput(): Promise<Opened | null> {
  return new Promise(resolve => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".hott.json,application/json";
    // 'cancel' fires in current browsers when the dialog is dismissed; without it
    // the promise would simply never settle.
    input.addEventListener("cancel", () => { resolve(null); });
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      // A File. A name, some bytes, and no path — there is nothing here to write back through.
      void file.text().then(text => { resolve({ text, handle: null, name: file.name }); });
    });
    input.click();
  });
}

function downloadBlob(text: string, name: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;   // a suggestion only; the browser may rename or re-home it
  link.click();
  setTimeout(() => { URL.revokeObjectURL(url); }, 0);
}
```

### (c) The Tauri equivalent

```ts
// src/persistence/native.ts — loaded only when running inside Tauri.

import { open as openDialog, save as saveDialog } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

const FILTERS = [{ name: "HoTT diagram", extensions: ["json"] }];

export async function open(): Promise<{ path: string; text: string } | null> {
  const path = await openDialog({ multiple: false, directory: false, filters: FILTERS });
  if (typeof path !== "string") return null;          // dismissed
  // The dialog plugin has already added `path` to the fs plugin's runtime scope.
  return { path, text: await readTextFile(path) };
}

export async function saveAs(text: string): Promise<string | null> {
  const path = await saveDialog({ defaultPath: "diagram.hott.json", filters: FILTERS });
  if (!path) return null;
  await writeTextFile(path, text);
  return path;
}

/** The real save. A path is a path: it does not expire, and needs no permission dance. */
export async function save(path: string, text: string): Promise<void> {
  await writeTextFile(path, text);
}
```

```ts
// src/persistence/index.ts — the same door, now with three implementations behind it.
import { isTauri } from "@tauri-apps/api/core";

const backend = isTauri()
  ? await import("./native.js")     // Vite splits this into a chunk the browser build never loads
  : await import("./web.js");
```

```jsonc
// src-tauri/capabilities/persistence.json — nothing here names a path:
// the user's choice in the dialog is what authorises the write, at runtime.
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "diagram-persistence",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "dialog:allow-open",
    "dialog:allow-save",
    "fs:allow-read-text-file",
    "fs:allow-write-text-file"
  ]
}
```

---

## Decision inputs

The document is a `.hott.json` the user owns and keeps **in git**. That single fact is the ruler:
a mechanism is adequate iff `git diff` shows the edit after a save, with no manual filing.

| Option | Save in place? | Reopen cost | Reach | What it costs to build | What it means for a git-tracked doc |
|---|---|---|---|---|---|
| **FSA only** | Yes | 1 click first grant, then 0 (Allow-on-every-visit / installed PWA) | Chromium desktop + Chrome Android 132+. **Firefox and Safari: the app cannot save at all** | Smallest. ~150 lines, no toolchain, no build change, no packaging | Perfect. File stays in the tree; `git diff` is immediate |
| **FSA + `<a download>` fallback** | Chromium yes; elsewhere no | Fallback: a file-picker navigation *every* open and *every* save | Everything | Small, but you now own **two document lifecycles** — one with a handle, one without — and every "Save" affordance must lie differently in each | On Firefox/Safari it is an export, not a save: `~/Downloads/foo (1).json`, manual `mv`, silent divergence from the tree. The fallback exists to avoid a blank page, not to be used |
| **Tauri only** | Yes, natively | 0 — you keep a path string, forever, no permission model at all | Linux/macOS/Windows desktop. **No browser at all** unless you also ship a web build | Rust toolchain; Fedora `webkit2gtk4.1-devel` + 6 more packages; a capabilities file; a bundling story (deb/rpm 2–6 MB, AppImage 70+ MB); Rust compile times in the loop; a second engine (WebKitGTK) to test in | Perfect, and permanently so — plus you can add real niceties (recent-files list with paths, watch-the-file-on-disk, CLI `hott open foo.hott.json`) |
| **Tauri + web build** | Desktop yes; browser per row 1/2 | Best of both | Everything | All of Tauri's cost **plus** the FSA cost plus a seam: one `persistence` module, three backends, and a test matrix that includes "does the web build still work with the Tauri packages installed" | Perfect on desktop; the browser build is either Chromium-only-real (FSA) or a viewer/export toy |

**Sharpening questions the facts now let you answer:**

- **Who is the user?** If it is you, on Linux, in a Chromium-class browser, then FSA-only is a
  *complete* solution with no fallback needed, and Tauri is a want, not a need. Firefox-as-daily-driver
  is the single fact that flips this — and it is a fact about the human, not the platform.
- **Is a browser that cannot save allowed to open?** The most defensible fallback is not
  `<a download>`; it is **refusing to pretend**: on a browser without pickers, open read-only and
  offer only "Export" (which the project already has, honestly labelled). That costs one feature
  check and no second lifecycle. The `<a download>` "save" is the option that quietly manufactures
  `foo (1).json`.
- **Does install-as-PWA count as packaging?** It is the cheapest thing on this table that removes
  the permission prompt entirely (installed apps persist permissions automatically), needs a manifest
  and nothing else, and gives a desktop launcher. It is not Tauri, but it competes with Tauri on the
  two axes the ticket cares about — a real save and a real app.
- **What does Tauri buy that FSA cannot?** Engine independence, a durable *path* (not a permissioned
  handle), a file-open-from-the-OS association, and a CLI entry point. If any of those is wanted for
  its own sake, Tauri is justified independently of persistence — and if none is, persistence alone
  does not justify it.
- **OPFS is not on this table on purpose.** It is not an option for saving; it is an orthogonal
  crash-recovery layer that costs ~40 lines and works in every browser. It can be adopted under any
  row above, or deferred, without changing the decision.

---

## Uncertainties / caveats

- **Fetch reachability.** In this environment only GitHub hosts (`github.com`, `raw.githubusercontent.com`,
  `api.github.com`) were directly fetchable; `developer.mozilla.org`, `developer.chrome.com`,
  `webkit.org`, `chromestatus.com`, `fs.spec.whatwg.org`, `wicg.github.io` and `v2.tauri.app` were
  not. Every spec, MDN and Tauri claim above was therefore verified **from the source repository of
  that same document** (`mdn/content`, `mdn/browser-compat-data`, `whatwg/fs`,
  `WICG/file-system-access`, `tauri-apps/tauri-docs`, `tauri-apps/plugins-workspace`,
  `tauri-apps/tauri`, `chromium/chromium`), and the rendered URL is cited alongside. The **three
  Chrome for Developers claims** (Chrome 132 on Android, the Chrome 122 three-way prompt, the
  installed-app persistence) could only be read through the search index of those exact
  `developer.chrome.com` pages, not fetched directly. They are corroborated across two distinct Chrome
  pages each, but if any single fact deserves a re-check before it drives the decision, it is
  "**Chrome 132 shipped the pickers on Android**" — it contradicts `caniuse`, and it is load-bearing
  for the "mobile matters" answer.
- **`Window.showSaveFilePicker` per-browser BCD rows were not read verbatim**: `api/Window.json` in
  `browser-compat-data` is too large to fetch whole. The per-browser verdict above rests on the
  vendor positions (Mozilla negative, WebKit oppose), on BCD's `FileSystemHandle.json` showing
  `queryPermission`/`requestPermission` as Chromium-only, on Chrome's own docs, and on a `caniuse`
  cross-check. All four agree for Firefox and Safari.
- **Safari 26 `createWritable`** comes from BCD only; no WebKit release-note confirmation was
  obtainable. It affects OPFS ergonomics on Safari, not any conclusion here.
- The three snippets are **assembled from verified API shapes and not executed in this environment**.
  Every individual element is source-verified (picker options and suffix rules from the WICG spec;
  `queryPermission`/`requestPermission` shape from MDN; handle serializability from WHATWG fs;
  `isTauri`, `writeTextFile`, `save`/`open` and the permission identifiers from Tauri sources). Smoke-test
  the exact assembly once — in particular the `.hott.json` suffix in `accept` (legal per spec, worth
  one live check in Chrome) and the Tauri dialog `extensions` field, which takes bare extensions and
  handles multi-dot suffixes inconsistently across platforms.
- **Tauri build times** are not published by Tauri; no number is asserted here.
