# 01 — The diagram schema

**What to build:** The diagram as a type, and nothing that acts on it yet. Every kind the notation
has — boxes, term-dots, paths, arrows, equivalences — expressed exactly as
[ticket 08](../../initial-planning/issues/08-persistence-format.md) designed the file, so a later
save is a serialization rather than a reshape. Kinds no gesture can yet produce are typed anyway:
the shape is complete on paper before anything draws.

The types carry as much of the notation as types can hold. Structural invariants — the ones
[ADR 3](../../../docs/adr/0003-a-save-records-the-diagram.md) says to make unrepresentable where a
single writable place can do it — become unforgeable here. So does one that is not structural: a
[built-in rule](../../../CONTEXT.md#built-in-rule) cannot be marked a
[conclusion](../../../CONTEXT.md#conclusion), because that is not a wrong drawing but a meaningless
one, and the model holds nothing meaningless. Everything a drawing can get *wrong* rather than
mean nothing by — an equivalence's arrows not opposed, a label unsuited to its endpoints — stays
representable for the [checking layer](../../../CONTEXT.md#checking-layer).

No reader, no validator, no serializer. Those arrive with Save, which is the only thing that can
receive a file it did not construct.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] All five kinds are typed, including those nothing can yet draw
- [x] Ids are integers in one space shared across kinds, assigned in creation order from a root
      counter, and are branded per kind so a box id cannot be passed where a dot id belongs
- [x] An [equivalence](../../../CONTEXT.md#equivalence) holds exactly two arrow ids — the count is
      the type's, not a check
- [x] An [arrow](../../../CONTEXT.md#arrow)'s inputs are ordered, and it has exactly one output
- [x] A [term-dot](../../../CONTEXT.md#term-dot) names its one [box](../../../CONTEXT.md#box); a box
      does not list its dots
- [x] A box carries its own extent and a label — a [source](../../../CONTEXT.md#source) and a
      [label slot](../../../CONTEXT.md#label-slot); a term-dot carries a source and a side
- [x] A concluding built-in rule does not typecheck, and a concluding in-theory function, path or
      equivalence does
- [x] Nothing [ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md) derives is stored:
      no curvature, no junction, no [halo](../../../CONTEXT.md#halo), no
      [glyph geometry](../../../CONTEXT.md#glyph-geometry) — a label keeps its source only
- [x] An empty diagram is constructible, and the tests are type-level plus construction

Built as `src/diagram.ts`, with `src/diagram.test.ts` alongside. Nothing imports it yet, which is
the point: it is a type until [ticket 03](./03-boxes-on-the-canvas.md) draws from it.

## Choices

- **Rows are readonly arrays, not id-keyed maps** — the file's shape is the model's, so a save
  writes the rows out as they stand, and creation-ordered ids leave them already sorted by id.
  Move to a `Map` if a lookup ever shows up in a profile.
- **The file's `version` is the file's, not the diagram's** — nothing in memory reads it, and a
  field nothing reads is the redundancy `AGENTS.md` warns against. Save stamps it on the way out.
- **A box's `x, y` is its centre and `w, h` its full extent**, and a dot's position is relative to
  that centre — so no corner has to be agreed on and the y-up flip costs a box nothing.
  [Ticket 08](../../initial-planning/issues/08-persistence-format.md) left the origin unsaid, but
  its worked row puts a dot at `y: -8` inside a box of height 24 at `y: 0`, which a lower-left
  origin would place outside. Ticket 03's hit-testing is what would notice another choice.
- **`labelT` is a fraction, 0 at the start and 1 at the end** — an absolute distance would not
  survive the ends moving, which is the property `labelSide` was made direction-relative for, and
  derived curvature leaves an element no stable length to measure along. The
  [label slot](../../../CONTEXT.md#label-slot) entry carries it now; whether the fraction is the
  curve's own parameter or its arc length is [the spec](../spec.md)'s to hold until a backend
  draws one. It stays a bare `number`: off-the-end placements are a layout question rather than a
  meaningless state, and a brand with one clamping door is additive if they turn out to be noise.
- **A term-dot's label is optional, and its source and side are one pair** —
  [ticket 04](./04-term-dots-in-the-model.md) places a dot before
  [05](./05-term-dot-labels.md) can name it, so required would block it, and a side with no source
  would place a label that does not exist. A path's and an arrow's stay required, ticket 08 having
  named the dot's as the optional one. `BothOrNeither` carries the pattern once, the self-path's
  bend being the other pair.
- **`takeId` ships here, though this ticket builds no transitions** — a branded id has no other
  factory, so "assigned in creation order from a root counter" would otherwise be unverifiable and
  no test could construct a row. It fixes `[value, next]` as the shape before
  [ticket 03](./03-boxes-on-the-canvas.md) picks a convention for transitions that can refuse;
  taking an id cannot refuse, so 03 stays free to choose.
- **A term-dot's label takes one of four absolute sides** — the set is ticket 05's to settle, per
  the spec's *"numbers still unset"*, but a side needs a type to be carried at all. Four is what
  `goal.jpg` evidences; adding corners there is additive and costs a line.
- **Lengths stay bare numbers, and a `Source` is a bare string** — a branded
  [diagram unit](../../../CONTEXT.md#diagram-unit) would put a cast on every step of ticket 03's
  geometry, and no cheap check tells LaTeX from any other string. Ids are branded because they are
  compared and passed, never computed with.
- **The self-path's direction and size are a flat optional pair on a path** — ticket 08 records them
  as written but never named the fields. That they belong to a self-path and to nothing else is
  `a === b`, which no type can say, so it falls to the
  [checking layer](../../../CONTEXT.md#checking-layer).
- **An equivalence carries no source and no placement** — `≈` is its glyph and it stands where its
  two arrows put it. Ticket 08 left the row empty; this is the reading of `CONTEXT.md` that leaves
  nothing derived stored.
- **The type-level tests are `@ts-expect-error`, checked by `pnpm typecheck`** — the negative
  assertions cost no new tooling and the pre-commit hook already runs them. `vitest --typecheck`
  and `expectTypeOf` would move them under the test run, at the price of a second tsc pass.
- **The brand's five-way witness is a private `Sort`, not a glossary term** — `kind` is taken, and
  "which of the five tables" is a fact about the schema rather than about the notation, so it is
  named in the module and nowhere else. It earns a `CONTEXT.md` entry only if it ever escapes.
