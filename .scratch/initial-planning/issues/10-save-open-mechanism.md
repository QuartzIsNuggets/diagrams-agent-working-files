# Save & open mechanism — and whether it pulls Tauri forward

Type: research
Status: open

## Question

[Ticket 08](./08-persistence-format.md) settled *what a save file is* — legible `.hott.json`,
shaped like a normalized schema. It deliberately left *how the bytes reach the disk*, because that
turns on external facts and may re-order the map.

The problem: `src/export-svg.ts` writes files with a Blob and a synthetic `<a download>` click.
That is correct for a one-way export, and **broken for a save** — it cannot overwrite the file that
was opened, so the second save yields `2.7.2.hott (1).json` in `~/Downloads`. A document the user
owns and keeps in git needs to be written back where it came from.

- **What the web platform actually offers.** The File System Access API
  (`showSaveFilePicker` / `showOpenFilePicker`, and a retained handle to write back through) is the
  mechanism that makes a real save possible. Its cross-browser support must be **verified against
  primary sources**, not recalled: the belief in hand is that it is Chromium-led, with Firefox and
  Safari supporting the origin-private filesystem but not the pickers. Confirm current state,
  including whether a retained handle survives a reload and what permission prompt it costs.
- **What the fallback degrades to.** If a browser lacks the pickers: download-per-save plus
  `<input type="file">` to reopen. Is that acceptable as a degraded path, or does it fail the
  destination outright?
- **Whether this pulls Tauri forward.** The map lists *native desktop packaging* under
  **Not yet specified**, on the assumption it is a free wrapper to add whenever. If a real save
  needs a real file dialog, Tauri stops being a nicety and becomes the thing that makes persistence
  work — which promotes it from fog onto the route. Establish whether that is so.
- **Origin-private filesystem as a third option.** OPFS is widely supported but invisible to the
  user and to git — a sandbox, not a document they own. Weigh it as a session-recovery mechanism
  (crash safety) distinct from saving, or rule it out.

Resolve the factual half with `/research`; the delivery decision that follows is a `/grilling`
question, and may warrant splitting into its own ticket once the facts are in.
