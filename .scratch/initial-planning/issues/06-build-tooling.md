# Build system & tooling

Type: grilling
Status: resolved

## Question

The MVP build system should be "perfectly clean already." What are the exact modern tools and
config — package manager, TS/module style, lint/format, toolchain pinning, git hooks?

## Answer

Locked toolchain (2026):

| Concern            | Choice                                                              |
|--------------------|---------------------------------------------------------------------|
| Package manager    | **pnpm** (strict `node_modules`, no phantom deps)                   |
| Toolchain pinning  | **mise** (`mise.toml` pins Node + pnpm)                             |
| Build / dev server | **Vite** (stable/Rollup; rolldown-vite flippable later)             |
| Language           | **TypeScript**, pure **ESM**, bundler resolution                    |
| Math               | **KaTeX**                                                           |
| Lint               | **oxlint** (Rust; fast)                                             |
| Format             | **Prettier** (no oxlint/Prettier conflict — one lints, one formats) |
| Test               | **Vitest**                                                          |
| Git hooks          | **Lefthook** (pre-commit: format + lint + typecheck)                |

`tsc` **never emits** — it is the type-checker only (`--noEmit`); Vite/esbuild transpiles.
`build` = `tsc --noEmit && vite build`, so type errors gate the build.

### Concrete config (all files live in `../`, the `diagrams` code repo)

**`mise.toml`** — pin exact versions once, `mise install` reproduces them:
```toml
[tools]
node = "24"   # current LTS; pin exact e.g. "24.4.1" for full reproducibility
pnpm = "10"   # pin exact e.g. "10.6.0"
```

**`package.json`**:
```jsonc
{
  "name": "diagrams",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "oxlint",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "prepare": "lefthook install"
  },
  "dependencies": {
    "katex": "^0"
  },
  "devDependencies": {
    "@types/katex": "^0",
    "lefthook": "^1",
    "oxlint": "^1",
    "prettier": "^3",
    "typescript": "^5",
    "vite": "^7",
    "vitest": "^3"
  }
}
```
(No `packageManager`/corepack field — mise owns the toolchain. Pin exact ^-ranges after first
install from `pnpm-lock.yaml`.)

**`tsconfig.json`** — the "module style" block + Agda-brain strictness, self-contained:
```jsonc
{
  "compilerOptions": {
    // Environment
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",

    // Modules & emit — Vite transpiles; tsc only type-checks
    "moduleDetection": "force",
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "resolveJsonModule": true,

    // Strictness
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    // Pragmatics
    "skipLibCheck": true,
    "allowJs": false
  },
  "include": ["src", "vite.config.ts"]
}
```

**`vite.config.ts`**:
```ts
import { defineConfig } from "vite";

export default defineConfig({
  build: { target: "es2022", sourcemap: true },
});
```

**`.oxlintrc.json`**:
```jsonc
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "categories": { "correctness": "error", "suspicious": "warn", "pedantic": "warn" }
}
```

**`.prettierrc.json`**:
```jsonc
{ "semi": true, "singleQuote": false, "trailingComma": "all", "printWidth": 100 }
```

**`lefthook.yml`** — auto-fix formatting + lint + full typecheck on commit:
```yaml
pre-commit:
  parallel: true
  commands:
    format:
      glob: "*.{ts,js,json,css,md,html}"
      run: pnpm prettier --write {staged_files}
      stage_fixed: true
    lint:
      glob: "*.{ts,js}"
      run: pnpm oxlint {staged_files}
    typecheck:
      run: pnpm typecheck
```

Plus `.gitignore` (`node_modules`, `dist`, `*.local`, `coverage`), `.prettierignore`
(`dist`, `pnpm-lock.yaml`), and an `.editorconfig`.

### Source layout (no barrel files, named exports, one concern per module)
```
diagrams/
├── mise.toml · package.json · tsconfig.json · vite.config.ts
├── .oxlintrc.json · .prettierrc.json · lefthook.yml · .gitignore
├── index.html                 # Vite entry
└── src/
    ├── main.ts                # app entry / wiring
    ├── canvas.ts              # the <svg> canvas + plop-a-dot
    ├── katex-label.ts         # LaTeX → KaTeX → SVG-embeddable node
    └── export-svg.ts          # serialize <svg> → standalone .svg download
```

### First-time scaffold steps
1. `mise install` (Node + pnpm per `mise.toml`)
2. `pnpm install`
3. `pnpm dev` → window; `pnpm build` → bundle; `pnpm test` → Vitest.
