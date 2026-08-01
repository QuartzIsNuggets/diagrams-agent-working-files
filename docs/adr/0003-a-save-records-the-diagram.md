# 3. A save records the diagram, and the format does not check it

Date: 2026-07-31

## Status

Accepted. Resolves
[ticket 08, persistence & file format](../../.scratch/initial-planning/issues/08-persistence-format.md).
Builds on [ADR 1](./0001-diagram-draws-checking-layer-interprets.md) and
[ADR 2](./0002-geometry-is-abstract-and-derived.md).

## Context

The editor can already serialize its canvas to a standalone SVG, and today that canvas *is* the
document — nothing is held apart from what is drawn. So the cheapest imaginable save is to write
the SVG and reopen it, inventing no format at all.

Separately, once a format does exist, it has to decide how much it polices. A normalized schema
invites integrity constraints, and several of the notation's rules are expressible as ones — an
equivalence attaches to exactly two arrows, those two arrows must be **opposed**, a built-in rule
can never be a **conclusion**. Three different kinds of rule wearing one costume: the first is
structural, and a type that holds a pair settles it outright; the second is a claim a drawing can
get *wrong*; the third is not a claim a drawing could get wrong at all, there being nothing for the
mark to mean.

## Decision

**A save records the diagram, never the drawing.** The file carries boxes, term-dots, paths,
arrows, equivalences, roles, conclusion properties, label sources and abstract geometry. An
exported SVG or TikZ file is **one-way**: it leaves the editor behind and is never reopened.

**The format stores; a validator checks.** The file format enforces no notation rule beyond what
it takes to resolve the file into a model — ids unique, references resolving, enums in range.
Everything else the notation asks of a drawing is read by the checking layer of ADR 1, outside
both storage and rendering.

**Structural invariants are made unrepresentable where a single writable place can do it**, and
validated otherwise. A term-dot names its one box, and a box does not list its dots; an equivalence
holds a pair of arrows rather than a list of whatever length. None of that is about meaning — only
about which states can be written down at all.

**What could mean nothing is unrepresentable too**, for a different reason: not that one writable
place suffices, but that there is no state to write. A **conclusion on a built-in rule** is
meta-theoretically nonsensical rather than merely wrong, so the model has nowhere to put it, and a
file carrying one is **loaded with the field dropped and a warning** rather than refused. Every
rule that leaves a drawing meaning something — opposedness among them — stays where ADR 1 put it.

## Consequences

A real in-memory model must now exist, which the MVP deliberately did without. A lossless
save→reopen round-trip is the spec for it, and a sharp one: anything the round-trip loses was
missing from the model. The trip is anchored at the model and not at the file, which is what lets
a dropped meaningless field cost it nothing — no diagram the editor made could carry one.

Rendering stays free to lose information. Colour is a backend's mapping of a **role**, and the
**halo** is derived from a conclusion property — neither is recoverable from the ink. Most
decisively, an SVG holds glyph outlines rather than the LaTeX **source**, so a reopened SVG could
never be emitted as TikZ. Keeping export one-way is what protects the second backend.

Neither saving nor opening fails on a rule of the notation, so a half-finished or wrong drawing is
always saveable, always reopenable, and is told about separately. The cost is that a file can hold
a drawing the checking layer will reject; that is the same trade ADR 1 already made, extended to
storage.
