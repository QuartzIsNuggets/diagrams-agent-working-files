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
invites integrity constraints, and several of the notation's rules — a built-in rule can never be
a conclusion, an equivalence attaches to exactly two arrows — are expressible as ones.

## Decision

**A save records the diagram, never the drawing.** The file carries boxes, term-dots, paths,
arrows, equivalences, roles, conclusion properties, label sources and abstract geometry. An
exported SVG or TikZ file is **one-way**: it leaves the editor behind and is never reopened.

**The format stores; a validator checks.** The file format enforces no notation rule beyond what
it takes to resolve the file into a model — ids unique, references resolving, enums in range.
Everything else is read by the checking layer of ADR 1, outside both storage and rendering.

**Invariants are made unrepresentable where a single writable place can do it**, and validated
otherwise. A term-dot names its one box; a box does not list its dots.

## Consequences

A real in-memory model must now exist, which the MVP deliberately did without. A lossless
save→reopen round-trip is the spec for it, and a sharp one: anything the round-trip loses was
missing from the model.

Rendering stays free to lose information. Colour is a backend's mapping of a **role**, and the
**halo** is derived from a conclusion property — neither is recoverable from the ink. Most
decisively, an SVG holds glyph outlines rather than the LaTeX **source**, so a reopened SVG could
never be emitted as TikZ. Keeping export one-way is what protects the second backend.

Saving never fails on a rule of the notation, so a half-finished or wrong drawing is always
saveable and is told about separately. The cost is that a file can hold a drawing the checking
layer will reject; that is the same trade ADR 1 already made, extended to storage.

The rejected alternative was SQLite, which fits the shape well — a supertype table makes the
recursive anchor reference a real foreign key. It was declined because its constraints are a
checker welded into the file format, unable to warn instead of refuse; and because it is binary
where the file is meant to be diffed. The schema survives as the design of the JSON, so the swap
stays open if a diagram ever needs querying rather than loading.
