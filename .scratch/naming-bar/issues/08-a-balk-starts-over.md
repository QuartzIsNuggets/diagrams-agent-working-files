# 08 — A balk starts over rather than riding one already running

**What to build:** Every refusal gets its own [balk](../../../CONTEXT.md#balk), including one
arriving while the bar is still balking at the last. Mash Enter at a source that will not set, or
press away twice quickly, and each refusal is answered rather than absorbed by the animation already
in flight.

[05](./05-a-press-elsewhere-cancels-or-is-refused.md) parked exactly this behind a condition —
"restart it on every press if the swing is ever slowed enough for that to read as absorbing one" —
and [07](./07-the-bar-balks-and-says-why.md) meets it by meaning rather than by duration: once a balk
is what says a refusal *happened*, one that shows nothing is a channel that fails precisely where the
user is most insistent.

The arrangement 05 rests on stands: the class comes off an `animationend`, and a reader who wants no
motion is answered by another animation rather than by none. So the restart may not be a switch to
none and back.

**Blocked by:** [07](./07-the-bar-balks-and-says-why.md).

**Status:** ready-for-agent

- [ ] A refusal arriving mid-balk starts the balk over instead of riding it
- [ ] Both refusals restart it, a repeated source and a repeated press alike
- [ ] The class still comes off an `animationend`, in the moving branch and the still one
- [ ] Pinned by a test, the restart being invisible in a DOM that animates nothing

## Choices
