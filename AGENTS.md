# AGENTS.md

Guidance for agents and engineering skills working in this repo.

## Repository layout — read this first

This directory (`agents-working-files/`) is **not** the code project. It is a git submodule whose only job is to **store and version the intermediate files agents produce** while working.

- **The code project lives one directory up**, at `../` — `~/Training in code generation/diagrams/`. That is the `diagrams` source project, tracked by its own git repo. When you read, analyse, run, or modify project code, do it there.
- **All intermediate agent output stays here**, in `agents-working-files/`, committed to this submodule independently of the code project. That includes specs and tickets under `.scratch/`, wayfinding maps, research notes, handoffs, and the domain/agent docs under `docs/`.

Rule of thumb: **read and change code in `../`; write every agent artifact here.** Don't scatter working files into the code project, and don't commit generated agent artifacts to the code repo — they belong in this submodule so the code history stays clean.

Paths in the config files below (`.scratch/`, `docs/adr/`, `CONTEXT.md`, …) are relative to **this submodule root**, since this is where agent output is versioned.

## Licensing — the code project is REUSE-compliant

The code project in `../` is MIT-licensed to Alexis Ronez and follows the [REUSE](https://reuse.software) spec. **This submodule is deliberately not covered** — don't add licence headers here.

When you add a file to `../`, give it an SPDX header in a comment:

```
SPDX-FileCopyrightText: <year> Alexis Ronez <alexis.ronez@mailfence.com>

SPDX-License-Identifier: MIT
```

Use a `.license` sidecar **only** where comments are impossible — currently `package.json`, `.prettierrc.json` and `pnpm-lock.yaml`. Don't assume `.json` means no comments: `tsconfig.json` and `.oxlintrc.json` are JSONC and carry inline headers.

Run `reuse lint` from `../` to check.

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/` in this submodule (the code project's remote is local-only — no hosted Issues). See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at this submodule root, describing the code project in `../`. See `docs/agents/domain.md`.
