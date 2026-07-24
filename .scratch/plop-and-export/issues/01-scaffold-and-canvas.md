# 01 — Scaffold build system + blank SVG canvas

**What to build:** Running `pnpm dev` in the code project (`../`, the `diagrams` repo) opens a
browser tab showing a **full-viewport `<svg>` canvas** — the "window". The whole toolchain is
stood up and clean: `pnpm build` (`tsc --noEmit && vite build`) succeeds and `pnpm lint` reports
no problems. This is the foundation slice — the thinnest complete path from an empty repo to a
running window with the first visible pixels.

Scaffold is turnkey: the exact `mise.toml`, `package.json`, `tsconfig.json` (max-strict, pure
ESM, `moduleResolution: bundler`, `verbatimModuleSyntax`, `noEmit`), `vite.config.ts`,
`.oxlintrc.json`, `.prettierrc.json`, `lefthook.yml`, `.gitignore`/`.prettierignore`/`.editorconfig`,
and the `src/` layout are all specified in the planning ticket
[06 — build tooling](../../initial-planning/issues/06-build-tooling.md). Copy them in, install,
verify. `tsc` type-checks only; Vite transpiles.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] All config files from planning ticket 06 exist in `../` and `mise install && pnpm install` reproduces the toolchain
- [ ] `pnpm dev` opens a browser tab with a **visible, full-viewport `<svg>`** filling the window
- [ ] `pnpm build` succeeds (type-check + bundle)
- [ ] `pnpm lint` is clean
- [ ] Lefthook pre-commit hook is installed (format + lint + typecheck run on commit)
