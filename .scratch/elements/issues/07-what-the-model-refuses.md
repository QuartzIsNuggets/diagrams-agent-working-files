# What the model refuses an element

Type: grilling
Status: open
Blocked by: 01

## Question

`addDot` refuses three ways and `addBox` refuses none — it makes room instead. **What do `addPath`
and `addArrow` do?** The split the model already keeps is the one to answer within: it **refuses the
meaningless and makes room where it can**, and leaves what a drawing can get *wrong* representable
for the [checking layer](../../../CONTEXT.md#checking-layer)
([ADR 1](../../../docs/adr/0001-diagram-draws-checking-layer-interprets.md)). Some of what follows
may not be a refusal at all but something the *types* already make unwritable, which is the better
answer wherever a single writable place can hold the rule.

The cases:

- **A drag released on nothing.** The gesture found no anchor under the release. Is that a
  [refusal](../../../CONTEXT.md#refusal) with wording of its own, or does the gesture simply not
  land — nothing having been attempted, so nothing to answer for? A box drawn on empty canvas is
  what the same release means in a different place, which is the awkward part.
- **An arrow whose output is among its inputs**, and a path whose two anchors are the same. The
  second is a [self-path](../../../CONTEXT.md#self-path) and is legal — `refl` is one. The first is
  **not** the same shape, which this ticket first assumed and
  [ticket 04](./04-what-a-selection-is.md) disproved twice over. It is reachable by an
  ordinary-looking drag: shift-click `a`, shift-click `b`, then drag `c` → `a` commits inputs
  `(a, b, c)` onto output `a`, three distinct anchors and nothing in the gesture to mark it out, the
  collision being with a [selection](../../../CONTEXT.md#selection) built three clicks earlier. And
  the drawing it makes is one the notation already has by name: a function carrying `a` and `b` to
  `a` is the first projection, and `pr₁` is the very example
  [Label](../../../CONTEXT.md#label) gives of a [built-in rule](../../../CONTEXT.md#built-in-rule).
  So say what it is knowing that — under
  [ADR 1](../../../docs/adr/0001-diagram-draws-checking-layer-interprets.md)'s split it looks like
  neither the meaningless nor the wrong, and *not refused* has a reason better than nobody having
  thought of one.
- **A second element between the same two anchors.** Legal and expected: that is what a
  [fan](../../../CONTEXT.md#fan) is for, and `p` and `p⁻¹` are two different proofs. Confirm there
  is no duplicate rule, so no later reader invents one.
- **A cycle.** Two elements each landing on the other — `p` attaching to `q` while `q` attaches to
  `p`. Neither refused nor made unmakeable, being unreachable: an element only ever anchors onto
  anchors that already exist and nothing re-anchors one afterwards, so its anchor ids are strictly
  smaller than its own and the relation points backwards in time.
  [What a shaft is](./01-what-a-shaft-is.md) rests its resolution pass on exactly that and carries no
  guard. Name it here as not refused, and say why, so no later reader invents a rule for it.
- **An element onto an anchor it cannot reach**, if such a thing exists — an element inside a box it
  is not in, an arrow across [levels](../../../CONTEXT.md#level). Most of this smells like the
  checking layer's; the ticket's job is to say which of it is and to stop there.

Whatever is refused joins `Refusal` in the model as a reason and not a sentence, the wording living
in the shell beside the three that are there. Whatever is not refused is named here anyway, so that
the spec records the decision rather than the silence.

Resolve with `/grilling` and `/domain-modeling`.
