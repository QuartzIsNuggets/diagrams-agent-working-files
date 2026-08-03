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

**Status:** resolved

- [x] A refusal arriving mid-balk starts the balk over instead of riding it
- [x] Both refusals restart it, a repeated source and a repeated press alike
- [x] The class still comes off an `animationend`, in the moving branch and the still one
- [x] Pinned by a test, the restart being invisible in a DOM that animates nothing

## Choices

- **The restart is the class off and back on, with the bar measured between** — the class is what
  both branches of the stylesheet hang an animation off, so taking that off is the one move that
  restarts the swing and the still one alike, where switching `animation` to none and back would
  reach only the branch it named. The measurement is what makes the pair two style changes rather
  than none the browser ever saw. Drop it the day the balk is a Web Animations object with a
  `currentTime` to rewind.
- **Every balk restarts, not only one landing mid-balk** — a first refusal takes the same three
  lines as a second, because the guard telling them apart would buy one skipped measurement on a
  path a user's press already paces, and the balk having one shape is what stops a first refusal and
  a second drifting apart. Guard it if a balk is ever raised by something faster than a hand.
- **The tests read the class through a `MutationObserver`, and the measurement through the stub**
  — both moments are gone by the time an assertion runs: the class is on the bar before the second
  refusal and on it after, and jsdom lays nothing out, so what is pinned is the class the bar wore
  when it was measured. That leaves the measurement pinned by the one call it is made with — rewrite
  the test with it if the flush is ever forced some other way.
- **Verified in the shell as well as in jsdom** — jsdom animates nothing, so the class is the whole
  of what a test can see and whether the swing actually starts over is a WebKitGTK fact. Two presses
  ~120ms apart moved the bar for ~370ms against ~250ms with the restart taken out, which is the
  second refusal being answered rather than absorbed.

## Left open

A refusal landing in the frame between a balk's animation finishing and its `animationend` being
delivered still loses part of its own balk: the stale event arrives after the restart and takes the
class off a swing a few milliseconds old. The DOM hands the listener nothing that tells one balk's
event from the next's, and what the user sees is a short balk rather than none, so it is recorded
rather than built against.
