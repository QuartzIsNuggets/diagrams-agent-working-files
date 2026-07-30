# 1. The diagram draws; a checking layer interprets

Date: 2026-07-30

## Status

Accepted. Resolves
[ticket 04, notation domain model](../../.scratch/initial-planning/issues/04-notation-domain-model.md).

## Context

The editor's notation is mathematical: boxes are types, dots are terms, paths are identity
proofs. That invites a model which *understands* what it holds — one that knows `A(z)×B(z)` is a
product, that `pr₂` projects out of it, and that an arrow landing in the wrong box is an error.

Two facts push the other way. The reference drawings (`goal.jpg`) are full of things a checker
would reject: arrows crossing box walls, curves drawn for legibility, the same theorem drawn
twice at two layers of the ∞-groupoid. And a model that understands HoTT needs an elaborator,
which dwarfs the editor and is not what this effort is finding its way to.

But the mathematics is not absent either. An equivalence's two arrows must be **opposed**. A
built-in rule can never be a conclusion, being meta-theoretic. Both are typing-level facts, and
both are real.

## Decision

The **diagram** records *kinds* and nothing more: this is an arrow, its role is *built-in rule*,
its label's source is `\mathrm{pr}_2`, it runs from these anchors to that one. Type expressions
stay opaque LaTeX. The diagram cannot tell a well-typed drawing from an ill-typed one, and does
not try.

A separate **checking layer** holds the interpretation — layers, opposedness, whether a label
suits its endpoints. It reads a diagram and never draws one.

The seam runs one way: the checking layer may depend on the diagram; nothing it knows may become
something a render backend needs.

## Consequences

The editor draws whatever you draw, including nonsense. There is no correctness feedback until
the checking layer is built, and building it is deliberately deferred.

In exchange, the checking layer is genuinely optional and genuinely additive — it can arrive
whenever it earns its place, and its absence costs the renderers nothing. Constraints that would
otherwise have to be enforced at draw time, rejecting legitimate drawings, instead live where
they can be advisory.

The same seam decides where *ink* lives: a **role** is meaning and belongs to the diagram, while
the colour expressing it belongs to each render backend. This is what lets one diagram feed both
the SVG renderer and the TikZ emitter
([ticket 07](../../.scratch/initial-planning/issues/07-output-formats.md)) — TikZ wants a style
name, not a hex triple.

It also unblocks
[ticket 05](../../.scratch/initial-planning/issues/05-theorem-highlight-redesign.md): the
conclusion is a property on the element, so redesigning how it *looks* touches no model.
