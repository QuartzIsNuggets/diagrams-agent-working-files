# 04 — The export error region

**What to build:** The app's answer when the filesystem says no. A refused write is reported **on
screen**, beside the button that asked for it, rather than to a console a Tauri window gives the user
no way to open. The export affordance gains the container it needs to hold one — which is the whole
of what [ticket 03](./03-native-writer.md) declined to build, and the whole of what this is.

**Blocked by:** None — 01, 02 and 03 are resolved, and
[ADR 4](../../../docs/adr/0004-export-and-save-share-a-writer.md)'s 2026-08-01 amendment already
settles the shape this reads from: a refusal arrives as a rejection, outside the discriminated
result, and a caller that must not drop it has to catch.

**Status:** ready-for-agent

## Why this belongs to *this* effort

[Ticket 03](./03-native-writer.md)'s first Choice and ADR 4's amendment both point at **Save** —
*"Save cannot ship on a log: build the error region there and route this through it."* But Save
waits on the in-memory model [ADR 3](../../../docs/adr/0003-a-save-records-the-diagram.md) forces
into existence, and this waits on nothing: it is [chrome](../../../CONTEXT.md#chrome) over a seam
that already exists, needing no model at all — the same shape of ticket as
[02](./02-writer-seam.md), which needed no Tauri.

It is also this effort's own argument coming back around. [The spec](../spec.md) justifies rewiring
Export at all by observing that a Tauri window has no download shelf, so leaving `<a download>` alone
would make the app's only file-emitting feature *"a silent write to a directory nobody chose"* —
worse than the tab it replaces. A silent **failure** is that same sin one step along, and 03 shipped
one. The spec's Acceptance is satisfied and stays untouched: what this completes is the spec's
premise, not a criterion it lists.

## What the region is

`createLabelForm` is the precedent, and [ticket 02](./02-writer-seam.md) named it as such: a
`<p class="label-error" role="alert">` inside the element the factory returns, written through a
private setter, empty the rest of the time so it takes no room. Export gets the same thing. The only
obstacle is that it has nowhere to put it — `createExportButton` returns a bare `HTMLButtonElement`
that `main.ts` appends directly, and the fixed positioning that floats it over the canvas is on the
button itself, so there is no parent to hang a sibling off.

So the factory returns the **affordance** rather than its one control, as `createLabelForm` already
does, and the fixed positioning moves to the container. Both doc comments already promise exactly
this — *"where it goes on the page is still theirs to decide"* — and that sentence stays true of a
container in a way it would not of a button with a `<p>` bolted on beside it.

Three things about the region are decided:

- **Both [surfaces](../../../CONTEXT.md#surface) build it, unconditionally.** The web arm
  [hands off](../../../CONTEXT.md#hand-off) and structurally cannot fail, so this is a region one
  surface can never fill. That asymmetry is accepted rather than fixed with a surface check:
  `writer.ts` deliberately confines the `isTauri` read to one function, and a second reader living in
  chrome-building code is precisely the footgun 03's fourth Choice argued against — bought here for
  an empty `<p>` that costs the web build nothing.
- **The button does not move when a message appears.** The affordance is anchored to the bottom of
  the viewport, so it grows upward; a message placed below the button would shove it out from under
  the cursor that just clicked it.
- **Anything that is not a failure clears it.** *Written*, *handed-off* and *cancelled* all empty the
  region, because the message describes the last attempt and the last attempt did not fail — the
  same rule `.label-error` follows, for the reason its comment gives.

## The message it shows

`.label-error` shows the failure's `message` bare, and is right to: LaTeX errors describe themselves,
and *"Undefined control sequence"* names both what happened and where to look. A filesystem refusal
does not. *"Permission denied (os error 13)"* omits what was denied and to what, and it arrives from
a plugin boundary rather than from anything in this codebase. So the region says what failed and then
what the filesystem said. Diverging from the precedent is the part worth recording; the wording is
not.

## Verification

jsdom in the suite, mutation-checked as 02 and 03 both were: a rejected `writeFile` puts a message in
the region, each non-failure outcome clears it, and the region is in the tree before it has anything
to say.

One human run on top — and not to prove a `<p>` renders, since the MVP proves WebKitGTK draws chrome.
To prove the message is **legible**: nobody has yet seen what `writeTextFile`'s rejection reads like
coming out of the fs plugin, and a region showing a Rust debug string would satisfy every test above
while failing the ticket's whole point. A refusal is cheap to stage — export into a directory the
user cannot write to — and the [verification recipe](../verification/README.md) 03 left already
reaches the app window. Record the run there.

## Acceptance criteria

- [ ] In the app, a write the filesystem refuses puts a visible message beside the Export button;
      nothing is left to `console.error` alone
- [ ] The message names what failed and carries what the filesystem said, and a human has read a real
      one and found it legible
- [ ] The Export button does not move when a message appears or clears
- [ ] A completed write, a hand-off and a cancelled dialog each leave the region empty
- [ ] The region is in the tree before it has text, and carries `role="alert"`
- [ ] The browser build's Export is unchanged — same bytes, same filename, same download behaviour
- [ ] `writer.ts` remains the only module that reads `isTauri`
- [ ] jsdom tests cover the message and every clearing path, and each assertion is mutation-checked —
      it fails when the production line it pins is removed
- [ ] The verification note records the staged refusal, the message it produced and the result
- [ ] `pnpm build`, `pnpm lint`, `pnpm format:check` and `reuse lint` clean

## Choices
