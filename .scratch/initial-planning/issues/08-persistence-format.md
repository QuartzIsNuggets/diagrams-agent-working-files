# Persistence & file format

Type: grilling
Status: resolved

## Question

How is a diagram saved and reopened? The domain model is now settled
([ticket 04](./04-notation-domain-model.md), with the glossary in
[CONTEXT.md](../../../CONTEXT.md)), so a serialization of it is finally specifiable.

- **What is written.** The diagram holds boxes, term-dots, paths, arrows, equivalences, roles,
  conclusion properties, label sources, and geometry. Shape is *derived*
  ([ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md)) — so it is not written,
  and reopening a file recomputes it. Confirm nothing else is secretly derived.
- **Identity.** Anchors reference anchors recursively — a path may point at a path or an arrow —
  so the format needs stable ids and must tolerate cycles-by-reference without infinite nesting.
  Flat table of elements plus id references, or nested?
- **Format.** JSON is the obvious default. Is it the right one, given the file is a document the
  user owns and may want to diff in git?
- **Versioning.** The model will move — a manual curvature override is already anticipated. What
  carries the version, and what is the compatibility promise?
- **Boundary.** Persistence is *not* export ([ticket 07](./07-output-formats.md)): a save is
  reopenable and lossless, an export leaves the editor behind and is standalone. Keep the two
  from bleeding into one another.

Resolve with `/grilling` + `/domain-modeling`.

## Answer

A save records the **diagram**, as legible JSON shaped like a normalized relational schema.
[ADR 3](../../../docs/adr/0003-a-save-records-the-diagram.md) holds the architectural half;
the concrete format is below. The save/open **mechanism** proved to be a separate decision and
moved to [ticket 10](./10-save-open-mechanism.md).

### A save is the diagram; SVG is one-way

Reopening an exported SVG is never supported. The drawing has already lost what the model needs:
**role** is recorded but colour is each backend's mapping, so red ink cannot be read back as
"in-theory function"; the **halo** is derived from a conclusion property, so a wide pale copy of a
path is indistinguishable from a deliberately drawn one; **shape is derived**
([ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md)), so reopening would silently
promote every derived lens into stored geometry. Decisively, an SVG holds glyph outlines and not
`\Sigma_{(x:A)} P(x)` — so a reopened SVG could never be emitted as TikZ, forfeiting the second
backend ([ticket 07](./07-output-formats.md)).

Consequence: persistence **forces the real in-memory model into existence**. The MVP has none —
`src/canvas.ts` says the DOM *is* the document, and reads dot positions back out of it. A lossless
save→reopen round-trip is a sharp, testable spec for "the model records everything".

### The file is legible and diffable, but not hand-authored

Pretty-printed, **stable field order**, elements sorted by id — a deterministic writer, so the same
drawing actions produce byte-identical files. Hand-editing works if you are careful; it is not a
designed feature. A *hand-authorable* textual notation was weighed and ruled **out of scope**: it is
a committed public syntax owing a parser and error reporting, and it competes with the destination,
which is a GUI editor whose premise is that the drawing gesture is the interface. It returns, if
ever, as a fresh effort over the same model.

### JSON, shaped like a relational schema

SQL was tested seriously and fits — class-table inheritance gives an `anchor` supertype that makes
"a path may point at a path" a checked foreign key, and an `arrow_input(arrow, ord, anchor)` join
table handles many-to-one *and* input order natively.

It was rejected on an **architectural** ground, not on cost. A schema invites constraints like
`CHECK (role <> 'built-in' OR conclusion = 0)` — correct per `CONTEXT.md`, but it puts **checking
inside storage**, which [ADR 1](../../../docs/adr/0001-diagram-draws-checking-layer-interprets.md)
forbids: the checking layer reads a diagram and is bolted on later. A format that refuses to store a
drawing is a checker that can never be disabled or run in warn mode, and it makes *saving* the
operation that fails — so a half-finished drawing becomes unsaveable. Supporting reasons: SQLite is
binary and breaks diffability; `sqlite-wasm` is ~1 MB of WASM plus OPFS plumbing where
`JSON.stringify` is free; and none of what SQLite is for (files too large to hold in memory,
queried rather than loaded, written incrementally) is true of a proof diagram.

**What was kept: the schema is the design.** Invariants become a **load-time validator** — where
ADR 1 wants them, and where they can warn rather than refuse — and SQLite stays a drop-in swap
later, because the shape is already normalized.

### Shape of the data

**Flat, id-keyed, nothing nests.** The reference graph is not a tree: one path can be an endpoint
of several other paths and arrows at once (2.6.5's 2-path; `ap_g` targeting a path), so nesting
would duplicate elements or fall back to ids anyway.

**Membership sits on the term-dot** (`box: <id>`), never a `dots: [...]` list on the box. A dot has
exactly one box, so one writable place makes the invariant unforgeable — the reverse direction
admits "in two boxes" and "orphaned while the box disowns it" as representable states.

**Ids are integers, one shared id space across all kinds**, assigned in creation order, never
reused, with a root `nextId` counter. Shared space is not optional: anchor references are
polymorphic, so per-kind counters would make a reference to `3` ambiguous. Integers over UUIDs for
diff legibility and determinism; the duplicate-id risk from two git branches is *loud* (the
validator refuses) rather than silent. Escape hatch if copy-paste across files or real merges are
ever wanted: migrate ids to UUID strings.

**Encoding: per-kind arrays of rows** (`boxes`, `dots`, `paths`, `arrows`, `equivalences`), each
sorted by id, fields in fixed order — the literal JSON transcription of the tables.

**Arrow inputs are an ordered list, not a set.** `Σ-intro` on `(a, b)` is not the drawing `(b, a)`.

### The derived audit

Confirmed derived, therefore **not written**: curvature and shape, the junction, the halo, glyph
geometry (written as `source` only), kind (implied by which array an element sits in). Confirmed
**written**: the self-path's own direction and size, the sole ADR 2 exception.

Two were unsettled anywhere and were decided here:

**A box's extent is stored** (`w`, `h`), not derived from its label. Deriving it fails on
[ticket 07](./07-output-formats.md): TikZ **re-typesets labels in the including document**, so at
export time the label's extent depends on the paper's fonts and is not knowable to the editor —
a derived box would be one size on screen, another in TikZ, and undefined when the emitter runs.
One model with two backends requires the same geometry in both. It would also put the typesetting
seam on the critical path of geometry (a MathJax point release moves every box) and make "boxes
never overlap" unstable across reopens. **Boxes auto-size on plop** — an initial value, not an
invariant; after that the number is the user's.

**Label placement is a small set of discrete slots, not free coordinates.** A free `(dx, dy)`
offset was proposed and dropped: constrained slots make diagrams consistent by construction and
cannot drift.

- **Box label → one enum of six `labelSlot` values**, `{top, bottom} × {left, center, right}`,
  all *inside* the box. `goal.jpg` shows 2.7.1's labels sitting outside their boxes, which six
  inside-slots could not express — auto-sizing on plop closes that gap, since the box is born big
  enough. The UI gesture is dragging the label between highlighted slots.
- **Path/arrow label → a scalar `labelT` along the edge plus `labelSide`.** The perpendicular
  clearance is *fixed*, so it is a backend constant (the class of thing the halo's wash colour is),
  not model data. On a many-to-one arrow, `labelT` runs along the **output segment** (junction →
  output anchor) — the one segment every arrow has exactly one of, and where `Σ-intro` and `pair=`
  are labelled in the drawings.
- **`labelSide` is direction-relative** (`left`/`right` as you walk the edge start→end), not
  absolute `above`/`below`. An edge is inherently directional here, so the label reads *with* the
  arrow; and absolute has no answer at all for a vertical edge — 2.6.5 is full of them — or for a
  self-path's loop. The chrome may still *say* "above/below" for a roughly horizontal edge; that is
  a labelling choice, not what the file records.

**Vocabulary:** these six positions are **label slots**. "Anchor" was nearly overloaded for them,
but `CONTEXT.md` reserves it for a term-dot, path, or arrow.

### Versioning

A single monotonic integer `version` at the root, forward-only migration, and an explicit split:

- **Additive** (new optional field with a default, new element kind): old files stay valid,
  **no bump**; the reader defaults what is missing.
- **Breaking** (renamed field, changed meaning, newly required field): **bump**, and write a
  migration from *n* to *n+1*. Load runs the chain up to current.

Every change the map anticipates is additive — manual curvature override, ticket 09's attachment
position, more label freedom — so **version 1 should last**, and
[ticket 09](./09-targeting-anchors.md) does **not** block this ticket.

An integer rather than SemVer: SemVer encodes compatibility across *multiple independent
consumers*, and this file has one. A **higher version is refused** with a clear message, never
read best-effort; **unknown fields within a known version are rejected**, catching typos and
corruption. The two compose — a newer file fails on `version` first.

**The writing app's version is not recorded.** It would make the same drawing serialize to
different bytes after every release: permanent diff noise, against determinism, for information
that does not affect meaning.

### The root stays minimal

Just `version`, `nextId`, and the element arrays. Two candidates were deliberately left out:
**`level`** (ADR 1 puts levels in the checking layer, and there is no checker yet) and **`title`**
(the filename already names the diagram). This is where the additive policy pays for itself
immediately — adding `level` the day the checker arrives costs zero. Writing a field nothing reads
is the redundancy `AGENTS.md` warns against.

```json
{ "version": 1, "nextId": 12,
  "boxes": [ { "id": 1, "source": "A \\times B", "x": 0, "y": 0, "w": 40, "h": 24,
               "labelSlot": "top-left" } ],
  "dots":  [ { "id": 2, "box": 1, "x": 6, "y": -8 } ],
  "paths": [ { "id": 5, "a": 2, "b": 3, "source": "p", "labelT": 0.5, "labelSide": "left",
               "conclusion": true } ],
  "arrows": [ { "id": 7, "inputs": [2, 4], "output": 6, "role": "in-theory",
                "source": "\\mathsf{pair}^=" } ],
  "equivalences": [] }
```

### Extension

**`.hott.json`** (e.g. `2.7.2.hott.json`). A compound extension is strictly better than either
alternative: every `*.json` tool still matches — syntax highlighting, `jq`, git treating it as
text, GitHub rendering the diff — while `*.hott.json` stays a distinguishable glob for a file-type
association once there is a desktop build. Plain `.json` gives up the identity; a bare `.hottd`
gives up the tooling this format was made legible for.

### Split out: the save/open mechanism

`src/export-svg.ts` downloads via a Blob and a synthetic `<a download>` click. That is right for a
one-way export and **broken for a save**: it cannot overwrite the file that was opened, so the
second save yields `2.7.2.hott (1).json`. The fix is the File System Access API, whose cross-browser
support needs *verifying* rather than recalling — and if a real save needs a real file dialog, that
may pull **Tauri forward out of the fog**, re-ordering the map. Too big for a footnote here, and no
format decision depends on it: the bytes are the same whether a picker or a download writes them.
Now [ticket 10](./10-save-open-mechanism.md).
