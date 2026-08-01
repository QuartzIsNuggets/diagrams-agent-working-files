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

**Status:** ready-for-agent

- [ ] All five kinds are typed, including those nothing can yet draw
- [ ] Ids are integers in one space shared across kinds, assigned in creation order from a root
      counter, and are branded per kind so a box id cannot be passed where a dot id belongs
- [ ] An [equivalence](../../../CONTEXT.md#equivalence) holds exactly two arrow ids — the count is
      the type's, not a check
- [ ] An [arrow](../../../CONTEXT.md#arrow)'s inputs are ordered, and it has exactly one output
- [ ] A [term-dot](../../../CONTEXT.md#term-dot) names its one [box](../../../CONTEXT.md#box); a box
      does not list its dots
- [ ] A box carries its own extent and a label — a [source](../../../CONTEXT.md#source) and a
      [label slot](../../../CONTEXT.md#label-slot); a term-dot carries a source and a side
- [ ] A concluding built-in rule does not typecheck, and a concluding in-theory function, path or
      equivalence does
- [ ] Nothing [ADR 2](../../../docs/adr/0002-geometry-is-abstract-and-derived.md) derives is stored:
      no curvature, no junction, no [halo](../../../CONTEXT.md#halo), no
      [glyph geometry](../../../CONTEXT.md#glyph-geometry) — a label keeps its source only
- [ ] An empty diagram is constructible, and the tests are type-level plus construction

## Choices
