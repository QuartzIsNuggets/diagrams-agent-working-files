# 01 — What a source has been set to becomes a module of its own

**What to build:** The record of which [sources](../../../CONTEXT.md#source) have been
[set](../../../CONTEXT.md#typesetting), what each came to, and which of them refused — in a module
of its own, with no way past its doors.

It lives today as a map at the foot of the SVG render backend, with three exported doors onto it and
a fourth road nobody declared: the drawing reads the map directly. So the module's own rule — that a
refusal is remembered as a refusal, and that asking for a source again is a different act from
redrawing one — is enforced in three places and bypassed in a fourth. The distinction is subtle
enough to be worth naming: **asking retries, drawing replays**. Someone re-submitting a source at
the [naming bar](../../../CONTEXT.md#naming-bar) is asking for exactly that, and a boot the engine
got wrong once must not leave that source unsettable for the session; a redraw asks nothing and takes
the remembered answer, or every frame would retry every bad source and report it again.

Three doors, each naming a different question:

```ts
createLabelStore(): {
  set(source): Promise<GlyphRun>;         // asks; retries a refusal; throws
  setAll(sources): Promise<Unset[]>;      // fills; replays a refusal; names it
  runOf(source): GlyphRun | undefined;    // sync; what the drawing may draw
};
```

The backend **composes over it**, exactly as it will over the gesture: vetting a source is an ask
discarded, measuring a box is an ask plus the room this backend gives a label inside its walls, and
settling a diagram is a fill over the sources it holds. Which labels this backend draws stays the
backend's knowledge — the store is handed sources and knows nothing of boxes or dots.

The backend keeps holding **one** store, made where the map is today. Nothing is injected into the
shell: that the backend owns [typesetting](../../../CONTEXT.md#typesetting) and what it remembers is
a stance worth keeping, and whether a page-lifetime thing should be a module-lifetime thing is a
question for its own effort. The store reaches the engine by importing it, there being one seam
already and no reason for a second.

The store's own bookkeeping becomes testable for the first time without a canvas or a diagram: its
suite replaces the engine wholesale with a fake, so *a refusal is remembered*, *asking again retries
it* and *drawing from it does not* are three deterministic assertions rather than three inferences
drawn through a rendered document and a real MathJax boot. The backend's suite keeps every claim
about ink and about its own compositions — and loses its counted engine along with them, both of its
users having moved out.

[`CONTEXT.md`](../../../CONTEXT.md) gains **Set** in its Editor section, beside
[Typesetting](../../../CONTEXT.md#typesetting) and
[Glyph geometry](../../../CONTEXT.md#glyph-geometry): what a source has been set to, whether it was
set at all, and the ask/draw split. Not *cache* and not *store* — both name the mechanism where the
glossary names the promise.

Nothing a user can see changes.

**Blocked by:**
[gesture-refactor-00 / 02](../../gesture-refactor-00/issues/02-a-gesture-owns-its-mark-and-its-generation.md)
— not in substance, which is untouched by it, but because both restructure the same backend and
sequencing them is cheaper than merging them.

**Status:** resolved

- [x] What a source has been set to lives in one module, behind three doors that each name a
      different question
- [x] Nothing reaches past those doors — the drawing asks for what it may draw rather than reading
      what is remembered
- [x] Asking for a source retries one that refused; filling in a diagram's sources replays it and
      names it. Neither rule is left for a caller to remember
- [x] The backend still owns the one store, and the shell learns nothing of it
- [x] The store's bookkeeping is tested through its own doors against a faked engine, with no canvas
      and no diagram
- [x] The backend's suite keeps every claim about ink and about its own compositions, and no longer
      counts engine calls
- [x] `CONTEXT.md` defines **Set**, and [Typesetting](../../../CONTEXT.md#typesetting) points at it
- [x] No visible change: the same marks, the same refusals, the same file out — the marks, the
      refusals and the serialized document each being a claim the suite already made, and all 251
      still standing

## Choices

- **The code is named for the mechanism, the glossary for the promise** — `createLabelStore` is this
  ticket's own door name, and a store is fairly what keeps what **Set** promises; so the `_Avoid_`
  line scopes itself to naming *what a source has come to* rather than banning the word the module is
  built on, and the module header declares its word. Rename both together, or not at all.
- **`Unset` moves to the store and the backend re-exports it** — it is what the filling door hands
  back, so it is the store's word; passing it through leaves the shell importing the one name from
  the one place it already did. Import it from the store directly the day the shell is told there is
  a store.
