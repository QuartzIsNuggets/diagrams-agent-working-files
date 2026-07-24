# MathJax v4 — SVG output font configuration (programmatic Node/ESM/TypeScript)

**Research note — 2026-07-24.** Primary sources only (docs.mathjax.org, mathjax/MathJax-src + MathJax-docs on GitHub, npm registry).

**Version documented:** MathJax v4 as published in the **`@mathjax/src`** package, **v4.1.3** (latest on npm at time of writing). The font packages are all at the matching version **v4.1.3**.

---

## ⚠️ Headline correction (read first)

The question assumes a package called **`mathjax-full@4`**. **That does not exist as a stable release.** On npm, `mathjax-full`'s `latest` dist-tag is **3.2.2**, and the package is **deprecated** with the notice: *"Version 4 replaces this package with the scoped package `@mathjax/src`."* The only `4.x` things ever published under `mathjax-full` are the pre-releases `4.0.0-alpha.1` and `4.0.0-beta.1 … 4.0.0-beta.7`.

**Stable MathJax v4 lives in `@mathjax/src`.** Everywhere the old docs said `mathjax-full/js/...`, v4 uses **`@mathjax/src/js/...`**. All import paths below use the real, shipping `@mathjax/src`. (If you genuinely must stay on the `mathjax-full` name you are on a beta; don't.)

---

## Answer summary (the 5 answers, tight)

**1. Font packaging.** Fonts are **separate npm packages** under the `@mathjax` scope, not bundled into one monolith. The **default font** (`@mathjax/mathjax-newcm-font`) is pulled in **automatically** as a direct dependency of `@mathjax/src`, so you get it for free. Any **non-default** font is an extra package.

  - `pnpm add @mathjax/src` — this alone gives you MathJax v4 + the default **newcm** font (transitive dep).
  - `pnpm add @mathjax/mathjax-stix2-font` (or any other `@mathjax/mathjax-<name>-font`) — **only if you want a non-default font.**

**2. The exact API.** Import the **SVG output jax** and the **font-data class** for your chosen font, then pass the class to `new SVG({...})` via the **`fontData`** option:

  ```ts
  import { SVG } from '@mathjax/src/js/output/svg.js';
  import { MathJaxStix2Font } from '@mathjax/mathjax-stix2-font/js/svg.js';

  const svg = new SVG({ fontData: MathJaxStix2Font, fontCache: 'none' });
  ```

  - The option is **`fontData`** (an SVG/CommonOutputJax OPTIONS key, default `null`). It accepts **either a FontData *class* (constructor)** *or* an already-constructed instance. Passing the imported class is the normal path; MathJax instantiates it internally.
  - It is **not** a string. The `output.font: 'mathjax-stix2'` *string* form is the **startup-config / component** path (browser `MathJax = {...}` or `mathjax.document` component loader), not the direct-module path.
  - The font-data class for **SVG** lives at `@mathjax/mathjax-<name>-font/js/svg.js` (there is a separate `.../js/chtml.js` for CHTML). Export name pattern: `MathJax<Name>Font` (e.g. `MathJaxNewcmFont`, `MathJaxStix2Font`, `MathJaxFiraFont`, `MathJaxTexFont`).
  - **SVG needs no `fontURL`** (glyphs are embedded path geometry). `fontURL` is a CHTML-only concern (it points at WOFF2 files).

**3. Minimal TypeScript/ESM snippet** — LaTeX in → standalone `<svg>` string out, non-default font (stix2), `fontCache: 'none'` (inline `<path>`, no `<use>`/`<defs>`): see [Minimal snippet](#minimal-working-snippet) below.

**4. Available fonts + default.** 11 shipping main fonts (all `@mathjax/mathjax-<name>-font`, v4.1.3): **newcm (DEFAULT)**, tex, stix2, modern, fira, schola, bonum, pagella, termes, asana, dejavu. Plus 5 **font-extension** packages (not standalone fonts): euler, mhchem, bbm, bboldx, dsfont — each `@mathjax/mathjax-<name>-font-extension`. Note vs. the question's candidate list: **`mathjax-modern` is a real font** (you didn't list it), and **`euler` is an *extension*, not a standalone main font** (`@mathjax/mathjax-euler-font-extension`). There is no separate `mathjax-tex` vs `mathjax-newcm` default confusion — **newcm is the default** (v2/v3 default was the TeX font, now shipped as `mathjax-tex`).

**5. Vite/TS gotchas.** Subpath imports `@mathjax/src/js/...` and `@mathjax/mathjax-*-font/js/...` resolve through each package's `exports` map (the font packages map `./js/*` → `./mjs/*` for ESM). `@mathjax/src` is pure ESM (`"type": "module"`) and **ships TypeScript** (authored in TS; `.d.ts`/`.d.cts` present) — no `@types/*` needed. **Font ranges load dynamically via `import()`** at conversion time; for direct-module use you must `import '@mathjax/src/js/util/asyncLoad/esm.js'` (enables `import()`-based loading) and either `await svg.font.loadDynamicFiles()` before a synchronous `convert()`, or use the async conversion path. Practical Vite advice below.

---

## Minimal working snippet

```ts
// tex2svg.ts  —  LaTeX string in, standalone <svg> string out.
// Requires: pnpm add @mathjax/src @mathjax/mathjax-stix2-font

import { mathjax } from '@mathjax/src/js/mathjax.js';
import { TeX } from '@mathjax/src/js/input/tex.js';
import { SVG } from '@mathjax/src/js/output/svg.js';
import { liteAdaptor } from '@mathjax/src/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from '@mathjax/src/js/handlers/html.js';
import '@mathjax/src/js/util/asyncLoad/esm.js';        // let MathJax use import() for dynamic font ranges

// TeX packages you want available:
import '@mathjax/src/js/input/tex/base/BaseConfiguration.js';
import '@mathjax/src/js/input/tex/ams/AmsConfiguration.js';

// The chosen NON-DEFAULT font, SVG variant (a FontData *class*, not a string, not an instance):
import { MathJaxStix2Font } from '@mathjax/mathjax-stix2-font/js/svg.js';

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const tex = new TeX({ packages: ['base', 'ams'] });
const svg = new SVG({
  fontData: MathJaxStix2Font,   // <-- font selection happens here
  fontCache: 'none',            // inline <path> glyphs; no <use>/<defs> cross-references
});

const doc = mathjax.document('', { InputJax: tex, OutputJax: svg });

// Preload all dynamic font ranges so the synchronous convert() below can't miss a glyph:
await svg.font.loadDynamicFiles();

const node = doc.convert('\\frac{a}{b} = \\sqrt{c^2 + d^2}', { display: true });

// `node` is an <mjx-container>; its single child is the standalone <svg>.
// innerHTML of the container = just the "<svg>…</svg>" string.
const svgString = adaptor.innerHTML(node);
console.log(svgString);
```

To use the **default** font instead, drop the `@mathjax/mathjax-stix2-font` import and the `fontData` option entirely (newcm is the built-in default), or import `MathJaxNewcmFont` from `@mathjax/mathjax-newcm-font/js/svg.js`.

Notes on the output string:
- With `fontCache: 'none'`, glyph outlines are emitted as inline `<path>` elements inside the `<svg>` (self-contained geometry) — this is what you want for a standalone, portable SVG. `'local'` (the default) and `'global'` instead emit `<defs>` + `<use>` references.
- The `<svg>` carries its own width/height/viewBox. MathJax normally also produces a little CSS for the `mjx-container` wrapper (`adaptor.cssText(svg.styleSheet(doc))`), but for a bare standalone `<svg>` with inline paths you generally don't need it.

---

## Details & citations

Every non-obvious claim below links to the specific primary source.

### Version & package identity

- `mathjax-full` latest = **3.2.2**, deprecated → *"Version 4 replaces this package with the scoped package `@mathjax/src`"*, and its `dist-tags` are `{ latest: 3.2.2, alpha: 4.0.0-alpha.1, beta: 4.0.0-beta.4 }` with 4.x existing only as `-alpha`/`-beta`. Source: npm registry JSON `https://registry.npmjs.org/mathjax-full` and `https://registry.npmjs.org/mathjax-full/latest`.
- `@mathjax/src` latest = **4.1.3**, `"type": "module"`, dependencies include **`@mathjax/mathjax-newcm-font` 4.1.3** (the default font, hence "free"), `mhchemparser`, `mj-context-menu`, `speech-rule-engine`. Ships TypeScript (`exports` include `.d.cts` and TS `./source`). Source: `https://registry.npmjs.org/@mathjax/src/latest`.
- MathJax-src GitHub default branch is **`master`** (this is the v4 line). Source: `https://api.github.com/repos/mathjax/MathJax-src` (`"default_branch":"master"`).
- docs.mathjax.org `/en/latest/` self-identifies as **MathJax 4.0** documentation (build date May 2026); a `/en/v4.1/` tree also exists. Source: `https://docs.mathjax.org/en/latest/`.

### 1 — Font packaging

- Fonts are separate `@mathjax`-scoped packages; install by appending `-font` to the font name, e.g. `npm install @mathjax/mathjax-stix2-font`. Default is `mathjax-newcm`. Source: **Font Support** docs `https://docs.mathjax.org/en/latest/output/fonts.html` and **What's new in v4 / Extended Font Support** `https://docs.mathjax.org/en/latest/upgrading/whats-new-4.0/fonts.html`.
- The default font ships transitively: `@mathjax/src` depends on `@mathjax/mathjax-newcm-font@4.1.3` (registry metadata, above). So `pnpm add @mathjax/src` is sufficient for default; non-default fonts need an extra `pnpm add @mathjax/mathjax-<name>-font`.

### 2 — The exact API (fontData option + import paths)

- Direct-module Node imports use `@mathjax/src/js/...`. Verified verbatim from the docs source (Node "direct" examples), which import `mathjax.js`, `input/tex.js`, `output/svg.js` (or `output/chtml.js`), `adaptors/liteAdaptor.js`, `handlers/html.js`, and `util/asyncLoad/esm.js`. Source: `https://raw.githubusercontent.com/mathjax/MathJax-docs/master/server/direct.rst` (rendered: `https://docs.mathjax.org/en/latest/server/direct.html`).
- Font is selected by importing the font class and passing it as **`fontData`**. The docs show the CHTML form verbatim:
  ```js
  import {MathJaxFiraFont} from '@mathjax/mathjax-fira-font/js/chtml.js';
  const chtml = new CHTML({
    fontData: MathJaxFiraFont,
    fontURL: 'https://cdn.jsdelivr.net/npm/@mathjax/mathjax-fira-font/chtml/woff2',
  });
  ```
  The SVG form is the same minus `fontURL`, importing from `.../js/svg.js`. Source: `server/direct.rst` (above).
- **`fontData` is a real OPTIONS key** and accepts a class *or* an instance. Confirmed in the actual TS source of `CommonOutputJax`:
  ```ts
  const [fontClass, font] =
    options.fontData instanceof FontData
      ? [options.fontData.constructor as typeof FontData, options.fontData]
      : [options.fontData || defaultFont, null];
  // …later…
  this.font = font || new fontClass(fontOptions);
  ```
  and `fontData: null` appears in the static `OPTIONS`. Type is a `FontDataClass` (generic `FC`). Source: `https://raw.githubusercontent.com/mathjax/MathJax-src/master/ts/output/common.ts`.
- **`fontCache`** is an SVG-specific option; verified from the `SVG` static `OPTIONS`:
  ```ts
  public static OPTIONS: OptionList = {
    ...CommonOutputJax.OPTIONS,
    blacker: 3,
    fontCache: 'local',   // or 'global' or 'none'
    localID: null,
    useXlink: true,
  };
  ```
  Default `'local'`; allowed `'local' | 'global' | 'none'`. `'none'` = inline `<path>` (no `<use>`/`<defs>`). Source: `https://raw.githubusercontent.com/mathjax/MathJax-src/master/ts/output/svg.ts`.
- SVG font-data class export names verified from the published packages:
  - `@mathjax/mathjax-newcm-font/js/svg.js` exports **`MathJaxNewcmFont`** (extends `CommonMathJaxNewcmFontMixin(SvgFontData)`, no default export). Source: `https://cdn.jsdelivr.net/npm/@mathjax/mathjax-newcm-font/mjs/svg.js`.
  - `@mathjax/mathjax-stix2-font/js/svg.js` exports **`MathJaxStix2Font`**. Source: `https://cdn.jsdelivr.net/npm/@mathjax/mathjax-stix2-font/mjs/svg.js`.
  - Pattern therefore: `MathJax<Name>Font` from `.../js/svg.js`. (The `./js/*` → `./mjs/*` mapping is in the font package `exports`.)
- Font package `exports` (why `/js/svg.js` resolves): `{ "./js/*": { "import": "./mjs/*", "require": "./cjs/*" }, "./*": "./*" }`. Source: `https://cdn.jsdelivr.net/npm/@mathjax/mathjax-newcm-font/package.json`.

### 3 — Minimal snippet

Assembled from the docs' `tex2chtml.mjs` direct example (imports, `liteAdaptor`, `RegisterHTMLHandler`, `mathjax.document('', {...})`, `await <jax>.font.loadDynamicFiles()`, `html.convert(str, {display:true, em, ex, containerWidth})`, `adaptor.outerHTML(node)`), adapted to SVG (`output/svg.js`, `fontData`/`fontCache`, drop `fontURL`, use `adaptor.innerHTML(node)` to get the bare `<svg>`). The docs' `tex2chtml.mjs` is quoted in full in `server/direct.rst`. Source: `https://raw.githubusercontent.com/mathjax/MathJax-docs/master/server/direct.rst`.

### 4 — Available fonts (real, shipping list) + default

Enumerated from the npm registry search for `@mathjax/mathjax-*`, all **v4.1.3**, Apache-2.0:

**Main fonts** (`@mathjax/mathjax-<name>-font`): `newcm` (**default**), `tex`, `stix2`, `modern`, `fira`, `schola`, `bonum`, `pagella`, `termes`, `asana`, `dejavu` — 11 total.

**Font extensions** (`@mathjax/mathjax-<name>-font-extension`, NOT standalone fonts): `euler`, `mhchem`, `bbm`, `bboldx`, `dsfont`.

Sources: `https://registry.npmjs.org/-/v1/search?text=%40mathjax%2Fmathjax&size=60`; default confirmed by `output/fonts.html` and `whats-new-4.0/fonts.html` ("changes the default font to `mathjax-newcm`"). The doc "font name" strings (`mathjax-newcm`, `mathjax-stix2`, …) are what the *string* config form uses; the npm package for each is `@mathjax/mathjax-<name>-font`.

Discrepancy note vs. the question's candidate list: `mathjax-euler` is **not** a standalone main font — it's the `@mathjax/mathjax-euler-font-extension`. `mathjax-modern` **is** a real main font. No `mathjax-*` beyond the 11 above are published as main fonts.

### 5 — Vite + TypeScript ESM wiring

- **Subpath imports** `@mathjax/src/js/...` and `@mathjax/mathjax-*-font/js/...` are driven entirely by the packages' `exports` maps (no `main`/`module` fields on the font packages). Vite and Node16/bundler resolution honor `exports`, so the deep `.js` specifiers resolve. `@mathjax/src` is `"type": "module"` — clean ESM, so **no CJS-interop shim is normally required** (this is the big improvement over v3's `mathjax-full`). Verified from `@mathjax/src` and font-package `package.json` (registry + jsdelivr, above).
- **Types ship** with `@mathjax/src` (authored in TS; `exports` include `.d.cts` and TS `./source`). No `@types/mathjax*` needed. Minor caveat (flagged as inference, not from a doc): for deep subpath imports like `@mathjax/src/js/output/svg.js` under TypeScript, set `"moduleResolution": "bundler"` (or `"node16"`/`"nodenext"`) so TS follows the `exports` map to the matching `.d.ts`; classic `"node"` resolution may not find the declaration for a deep subpath.
- **Font data loads asynchronously.** Font *ranges* are fetched on demand via dynamic `import()` during conversion. For direct-module use you must `import '@mathjax/src/js/util/asyncLoad/esm.js'` — the docs state this "tells MathJax to use `import()` commands to load external files, when needed" — and, because that's async, either call `await <outputjax>.font.loadDynamicFiles()` up front (then synchronous `convert()` is safe) or use the promise-based conversion. Source: `server/direct.rst` (the `loadDynamicFiles()` / `asyncLoad/esm.js` discussion).
- **`optimizeDeps` / dynamic-import guidance** (reasoned from the above; not a specific MathJax doc): the on-demand `import()`s target files deep inside the font package (its dynamic range modules). In a Vite app, prefer running this conversion **server-side** (Node/SSR/build step) with `liteAdaptor` rather than in the browser bundle. If you do bundle it, expect Vite to want to handle those dynamic imports as separate chunks; you may need to add `@mathjax/src` and the font package to `optimizeDeps.include` (or conversely `exclude` if pre-bundling breaks the dynamic `import()` paths) and ensure the font package's asset files are copied/served. Because `fontCache: 'none'` still resolves glyphs through the same dynamic ranges, `loadDynamicFiles()` is the reliable way to avoid mid-render async surprises. Treat the exact `optimizeDeps` toggles as project-specific tuning, not a fixed recipe.

---

## Uncertainties / caveats

- Exact npm timestamps for `@mathjax/src` 4.1.3 weren't captured (registry `time` field not read); the **version** 4.1.3 is confirmed via `/latest`. If you need the publish date, read `https://registry.npmjs.org/@mathjax/src` `time["4.1.3"]`.
- The `tex2svg.ts` snippet is *assembled/adapted* from the docs' CHTML direct example + verified SVG option names + verified font export names; it was not copy-run in this environment. Every individual piece (import paths, `fontData`, `fontCache: 'none'`, `MathJaxStix2Font` from `.../js/svg.js`, `loadDynamicFiles`, `adaptor.innerHTML`) is source-verified, but you should smoke-test the exact assembly once.
- The TS `moduleResolution` and Vite `optimizeDeps` points are engineering guidance inferred from the packaging facts, explicitly not lifted from a MathJax doc page.
