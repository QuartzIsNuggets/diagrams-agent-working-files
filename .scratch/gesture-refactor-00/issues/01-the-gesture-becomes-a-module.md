# 01 — The gesture becomes a module of its own

**What to build:** The press, the drag it may become and the release that ends it, in a module of
their own.

They sit today in the SVG render backend, whose own header says the seam runs one way and this is
where pixels stop — and it is where they start. Nothing about following a pointer is a backend's:
the TikZ emitter [ticket 07](../../initial-planning/issues/07-output-formats.md) plans will never
have one, and a reader after *what does a press do?* walks past five hundred lines of ink to find
out.

The module is **told, not shown**. It is handed the element to listen on, a converter saying where a
pointer is in [diagram units](../../../CONTEXT.md#diagram-unit), and a callback showing how far the
drag has got. So the y-up flip, the scale and every mark's ink stay behind the backend's interface,
where [ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md) puts them, and the module
imports nothing from it. It knows a rectangle by name — that is what the shell means when it says a
box is coming — and nothing of how one is drawn.

The shape settled in grilling, which says the dependency more exactly than prose does:

```ts
enableGesture(
  on: Element,
  at: (event: PointerEvent) => Point,
  show: (drag: Extent | undefined) => void,
  starts: (at: Point) => Started,
  lands: (drag: Extent, at: Point) => void,
): void;

type Started = "rectangle" | "nothing" | "no-gesture";
```

The backend **composes over it**: `enableDragging` becomes a few lines handing in its own conversion
and its own provisional rectangle, so the shell's call sites do not move and nothing new leaves the
backend's interface. `toDiagramPoint` stays private, which is the point of composing rather than
exporting the parts.

One thing changes while the code is in hand: the window is watched only while a drag is in flight.
Both listeners already do nothing at rest — the move draws nothing without a gesture, the release
returns early — so attaching them on the press and dropping them on the release is behaviour for
behaviour, and it says why they are on the window at all. A drag has to be followed off the canvas,
which is true only while one is running.

The suite splits where the interface now does. What a press means is tested through the new module
against a plain element, a stub converter and a spy for what it shows — no canvas, no SVG, no
`getBoundingClientRect` stub, because none of that is the gesture's. The backend's suite keeps the
crossing and the ink: where a pointer is in diagram units, and what a provisional rectangle is drawn
as.

[`CONTEXT.md`](../../../CONTEXT.md) gains **Gesture**. The word already runs through its prose — in
[Plop](../../../CONTEXT.md#plop), in [Naming bar](../../../CONTEXT.md#naming-bar), in
[Chrome](../../../CONTEXT.md#chrome) — with no entry of its own, and a module named for it is what
makes that a gap worth closing. A gesture is the arc; what one *makes* is a plop.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] Press–drag–release lives in a module of its own, and that module imports nothing from the
      render backend
- [x] It is told where a pointer is and what to show — the flip, the scale and the ink stay behind
      the backend's interface
- [x] The window is watched only while a drag is in flight, and nothing about which press draws, or
      whose release a gesture is, changes
- [x] The backend composes over it, and the shell's call sites are untouched
- [x] The gesture is tested through its own interface, with no canvas and no layout stub
- [x] The backend's suite keeps the crossing and the provisional rectangle's ink
- [x] `CONTEXT.md` defines **Gesture**, and [Plop](../../../CONTEXT.md#plop) points at it

## Choices

- **`show` is called at every step whatever the gesture shows, `undefined` meaning *nothing to
  show*** — the shape left the `undefined` arm open, and calling only for a rectangle would leave it
  unreachable. So the press's answer is the module's to keep and the caller is told either way. The
  other reading, *take down what is showing*, would have the gesture retracting a mark it never made:
  one showing no rectangle has never drawn one, and what a landed gesture leaves standing is
  `clearChrome`'s. Give it that meaning the day a gesture has a mark to take back mid-flight.
- **`preventDefault` on the press moved with the press** — suppressing the UA's text selection is a
  fact about a press being a drag rather than about ink, and leaving it behind would cost the backend
  a second `pointerdown` listener racing this one for the same event. Move it back the day a caller
  wants a press that selects text.
- **`Started` left the backend's interface rather than being re-exported** — it is the gesture's
  word, and the backend re-exporting it would say a caller has to know a backend to name what a press
  answers. Nothing moved: `editor.ts` names it nowhere, answering in literals.
- **One in-flight gesture, kept in a variable, rather than a closure per press** — the listeners
  could have closed over the press instead, with no shared state; but then two primary presses with
  no release between them would leave the first pair attached for good, where one variable keeps
  exactly the *last* press's gesture, as before. Key by `pointerId` the day a gesture per pointer is
  wanted.
