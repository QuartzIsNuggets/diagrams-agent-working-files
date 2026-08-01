# 4. Export and save share a writer, not a persistence layer

Date: 2026-07-31

## Status

Accepted; amended 2026-08-01 with two paragraphs under Consequences, both asked for by
[ticket 03](../../.scratch/tauri-shell/issues/03-native-writer.md). Nothing below is reversed.
Arises from
[the "app writes" spec](../../.scratch/tauri-shell/spec.md) and refines the naming in
[ticket 10, save & open](../../.scratch/initial-planning/issues/10-save-open-mechanism.md).
Constrained by [ADR 3](./0003-a-save-records-the-diagram.md).

## Context

[Ticket 10](../../.scratch/initial-planning/issues/10-save-open-mechanism.md) settled that the
desktop app is the only surface that writes to a path the user chose, and sketched the code as
`src/persistence/{index,web,native}.ts` — one door, backends behind `isTauri()`.

Then the first caller turned out to be **export**, not save. The MVP has no in-memory model, so
there is nothing yet to persist; what it does have is an Export button that emits a file, and inside
a Tauri window a synthetic `<a download>` click has no browser chrome behind it — no download shelf,
no destination prompt. Export needs the native path first, and it needs it years before Save does.

## Decision

**The seam promises only: put these bytes where the user chose.** It is a *writer*, not a
persistence layer, and it is not named for one. **Export** and, later, **Save** are distinct callers
composed over it, differing in what bytes they hand over and whether the resulting path is
remembered.

**Its result is discriminated** — *written* with a path, *handed-off*, or *cancelled* — so the type
states what each [surface](../../CONTEXT.md#surface) can and cannot know, rather than flattening to
what both can promise.

## Consequences

Export stays one-way by construction. Filing it under "persistence" would put a one-way emission and
a round-trippable document behind one door, and every affordance on that door would have to mean
something different depending on which caller reached it — the same objection ticket 10 raised
against feature-detecting a browser save, one level down.

The web arm can never return *written*. The browser build is therefore structurally incapable of
claiming a path it never had, and no future confirmation UI can announce an export the user
cancelled. That is the honesty ticket 10 asked for — *"what it cannot do it says plainly"* — moved
from prose into a type.

Save inherits a seam it did not shape, and should not need to reshape: it will add a *reader* and a
remembered path above the writer, not beneath it. If that turns out to be wrong, the cost is a
module boundary, not a format.

The rejected alternative was ticket 10's own `persistence` naming, which has the advantage of being
already written down; it was declined for the reason above. Branching inside `export-svg.ts` and
extracting later was also weighed, and declined because the extraction would then land inside the
Save slice, which already carries the model.

### Amended 2026-08-01

**The destination is an input, not something the writer obtains.** Every write asks today, because
the only caller is export and export has no path to hand over — but the asking is how the app arm
comes by a destination, not what the door promises. So "a remembered path above the writer" above
means above *and passed down through it*: Save hands its path to the writer, which then has nothing
to ask. The alternative was a second door for writing in place, declined because it splits one
promise in two and leaves a caller to know which half it wants.

**A refused write is not a fourth arm.** The filesystem can refuse a write the user chose — and that
arrives as a promise rejection, outside the discriminated result. The three arms say what became of
the file; a refusal says the writer did not do what it promised, and folding a broken promise in
among the kept ones would oblige every caller to handle a case the web surface cannot produce, which
is the flattening this decision exists to avoid. The cost is that a rejection is easy to drop —
ticket 02's `void writeFile(…)` dropped one — so a caller that must not drop it has to catch:
[ticket 03](../../.scratch/tauri-shell/issues/03-native-writer.md) has export log it, and says
plainly that Save cannot ship on a log.
</content>
