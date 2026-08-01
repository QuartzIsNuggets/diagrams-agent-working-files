# 02 — The writer seam

**What to build:** One door for putting bytes on disk, with today's download behind it. The seam's
whole promise is *put these bytes where the user chose*; it reports a **discriminated result** so
callers can tell a completed write from a cancelled one, and a known path from no path at all.
Export is rewired to call it. Behaviour on the web surface is unchanged, byte for byte.

**Blocked by:** None — this ticket needs no Tauri and runs entirely in the browser build.

**Status:** resolved

## Why a writer and not a `persistence` module

[Ticket 10](../../initial-planning/issues/10-save-open-mechanism.md) sketched
`src/persistence/{index,web,native}.ts`. The name is wrong for what this is, and
[ADR 4](../../../docs/adr/0004-export-and-save-share-a-writer.md) records why: persistence is a
promise about **reopening**, which [ADR 3](../../../docs/adr/0003-a-save-records-the-diagram.md)
makes and an [export](../../../CONTEXT.md#export) never does. Filing export under that word would
put a one-way emission and a round-trippable document behind one door and oblige each to lie about
itself. The seam here promises less and is therefore true for both: **Export** and, later,
**Save** are distinct *callers* composed over it, differing in what bytes they hand over and
whether the resulting path is remembered.

## The contract

The two [surfaces](../../../CONTEXT.md#surface) differ in what they can *know*, and the return type
should say so rather than flatten to the weakest:

- **written** — the bytes are at a path, and the path is known. Only the app can report this.
- **handed-off** — the bytes have left, and where they went is not knowable. The web surface's only
  honest answer: a synthetic `<a download>` click "doesn't support exceptions", cannot report a
  destination, and cannot report failure.
- **cancelled** — nothing was written. Only the app can report this; a download has no cancel to
  observe.

That the web arm can never produce `written` is the point: the type makes it structurally
impossible for the browser build to claim a path it never had, and stops any future confirmation UI
from announcing an export the user dismissed.

Surface selection is `isTauri()` behind a dynamic `import()`, so the `@tauri-apps/*` code lands in a
chunk the web build never loads. In this ticket the native arm does not exist yet; the seam picks
the web implementation and [ticket 03](./03-native-writer.md) fills the other side.

## Acceptance criteria

- [x] A single module exposes the writer; `export-svg.ts` no longer constructs a Blob, an anchor or
      an object URL itself, and `serializeCanvas` is untouched
- [x] The result type has the three arms above, and the web implementation can only return
      `handed-off`
- [x] Exporting from the browser build produces the same bytes, the same filename and the same
      download behaviour as before this ticket
- [x] jsdom tests cover surface selection and the mapping to each result arm, and every assertion is
      mutation-checked — each one fails when the production line it pins is removed
- [x] `pnpm build`, `pnpm lint`, `pnpm format:check` and `reuse lint` clean

`src/writer.ts` is the door, `src/web-writer.ts` the one arm behind it; `serializeCanvas` and
`createExportButton` are untouched but for a comment. Bytes, filename and media type are pinned by
test, and the download itself is the same lines moved: in the built bundle the click handler still
reaches `URL.createObjectURL` and `link.click()` without yielding, in the entry chunk. No browser was
driven — there is no Firefox WebDriver here, and nothing in the download path changed for one to
observe.

Mutation-checked by machine: thirteen mutations, each killing exactly the assertions that pin it.
Removing `link.download`, the contents, the media type, the revoke, or `link.click()` kills its own
test; deferring the web arm behind an `await import()` kills only "hands over before yielding".

What that leaves uncovered is worth saying plainly, since the criterion above reads wider than this
slice can be: with one arm there is no branch, so what the tests pin is the door's delegation to it
(removing the call kills all six) and that arm's mapping to `handed-off`. Selection proper, and the
`written` and `cancelled` arms, arrive with [ticket 03](./03-native-writer.md)'s second arm and are
its to check.

## What the seam leaves for [ticket 03](./03-native-writer.md)

Export drops the writer's promise on the floor — `void writeFile({…})` — which is right while the
only arm cannot fail: nothing in `document.createElement` or `URL.createObjectURL` throws for a file
the type admits, so today there is no rejection to catch. The native arm has to await the dialog,
which makes the door `async`, and `writeTextFile` throws on a real failure — so the moment 03 lands,
that `void` swallows a failed write and the user is told nothing. Export has no error surface today;
the label form's `.label-error` is the nearest precedent.

Two words this slice made load-bearing in code — **writer** and **hand-off** — are in no glossary
entry, and `CONTEXT.md`'s [surface](../../../CONTEXT.md#surface) says *"only the app **writes**"*
while `writeFile` is what both surfaces now call.
[ADR 4](../../../docs/adr/0004-export-and-save-share-a-writer.md) settled the naming deliberately,
so this is a gap to close with `/domain-modeling`, not a rename.

## Choices

- **Only the native arm goes behind the dynamic `import()`; `web-writer.ts` is imported
  statically** — a download the browser honours is one the user's gesture is still live for, and an
  `await import()` between the click and `link.click()` spends that activation. Keeping
  `@tauri-apps/*` out of the web chunk needs the import on that arm only. Half of that is pinnable
  today and pinned: `writer.test.ts`'s "hands over before yielding" fails if this arm ever waits. It
  costs [ticket 03](./03-native-writer.md) a **synchronous** surface check — `isTauri()` is
  `!!globalThis.isTauri`, so read the global rather than awaiting the module that exports it.
- **What a caller hands over is text, a filename and a media type** — the app arm writes with
  `writeTextFile`, and the dialog's `defaultPath` and extension filter both come off the name, so
  nothing else is needed twice. A binary export would add an arm to the bytes, not a field beside
  them.

## Notes for the implementer

The existing export tests already pin the download hand-off (*"the bytes in the `Blob` the browser
is handed are exactly `serializeCanvas`'s output"*) and the deferred `URL.revokeObjectURL`. Those
assertions describe the **web writer** now, not the exporter — move them with the code rather than
re-deriving them, and keep them as loosely pinned as they are today (filename asserted to end in
`.svg`, the revoke asserted to be deferred rather than deferred by a particular number).
</content>
