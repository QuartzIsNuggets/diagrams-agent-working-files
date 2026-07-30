# Persistence & file format

Type: grilling
Status: open

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
