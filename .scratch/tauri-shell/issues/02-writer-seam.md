# 02 — The writer seam

**What to build:** One door for putting bytes on disk, with today's download behind it. The seam's
whole promise is *put these bytes where the user chose*; it reports a **discriminated result** so
callers can tell a completed write from a cancelled one, and a known path from no path at all.
Export is rewired to call it. Behaviour on the web surface is unchanged, byte for byte.

**Blocked by:** None — this ticket needs no Tauri and runs entirely in the browser build.

**Status:** ready-for-agent

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

- [ ] A single module exposes the writer; `export-svg.ts` no longer constructs a Blob, an anchor or
      an object URL itself, and `serializeCanvas` is untouched
- [ ] The result type has the three arms above, and the web implementation can only return
      `handed-off`
- [ ] Exporting from the browser build produces the same bytes, the same filename and the same
      download behaviour as before this ticket
- [ ] jsdom tests cover surface selection and the mapping to each result arm, and every assertion is
      mutation-checked — each one fails when the production line it pins is removed
- [ ] `pnpm build`, `pnpm lint`, `pnpm format:check` and `reuse lint` clean

## Notes for the implementer

The existing export tests already pin the download hand-off (*"the bytes in the `Blob` the browser
is handed are exactly `serializeCanvas`'s output"*) and the deferred `URL.revokeObjectURL`. Those
assertions describe the **web writer** now, not the exporter — move them with the code rather than
re-deriving them, and keep them as loosely pinned as they are today (filename asserted to end in
`.svg`, the revoke asserted to be deferred rather than deferred by a particular number).
</content>
