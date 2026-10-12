# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**อีสาน DevTools** — a static, single-page developer toolkit with 15+ tools aimed at Thai developers. Everything runs client-side; there is no backend, no build step, no npm, no framework.

Live: https://devgreenpink.github.io/dev-utility-toolkit/

## Running Locally

Open `index.html` directly in a browser, or serve it with VS Code Live Server. No build or install step needed.

`node tests/tools.test.mjs` self-checks the pure converters and parsers (BAHTTEXT / Thai ID in
`thai-tools.js`, `json2type.js`, `props-yaml.js`, `stacktrace.js`, smart paste `spDetect` in `home.js`) by loading the tool files into one
`vm` context, the same way the page loads them. Keep new parsing logic in pure functions so it can be
covered there.

## Deployment

Push to `main` → GitHub Actions (`.github/workflows/static.yml`) deploys the whole repo to GitHub Pages automatically. The entire repository root is the deployment artifact.

## Architecture

The app is a single HTML page with a few companion files:

- `index.html` — all tool UI markup. Each tool lives in a `<div id="<name>-tab" class="tab-content">` block.
- `assets/js/` — plain classic scripts sharing one global scope (no modules, no bundler — `index.html`'s inline `onclick="fn()"` handlers need globals), all `defer`-loaded in the order listed in `index.html`:
  - `core.js` — app shell: `TAB_META`, theme, favorites, nav/`openTab`/`TAB_INIT`, keyboard shortcuts, shared utils (`showToast`, `copyText`, `escHtml`, `highlightCode`), PWA install, sparkle effect.
  - `tools/<tool>.js` — one file per tool (`cheatsheets.js` holds kubectl/Linux/Git/CLI cheatsheets and
    the Linux folder view, which share `renderCmdList`).
  - `tools/refdocs.js` — shared renderer for the knowledge tabs (SQL & System Catalog, DB2 Error Codes,
    Java Exceptions / Internals, Docker & K8s, Request Path, NgRx). Each data file registers
    `REF_DOCS[id] = {placeholder, dialects?, items:[{g, t, b, bc, s, d, fix, tip, code, lang, k}]}` and the
    tab holds `<div class="ref-tool" id="ref-<id>">`; `TAB_INIT` calls `refInit(id)`. Backticks in
    `d`/`fix`/`tip` render as inline code. `refFocus(id, query)` jumps to a tab with a search filled in.
  - `tools/home.js` — the home tab (default for a first visit): one box that searches tools or, via
    smart paste, detects what was pasted and opens the tool that understands it with the input filled.
    `SP_RULES` = `[kind, label, test]` (order = priority), `SP_OPEN[kind]` = `[tool label, open(text)]`;
    the pure `spDetect(text)` also feeds the Ctrl+K palette. Recent / favorites / all-tools lists are
    built from the sidebar nav, so a new tool shows up there with no extra wiring.
  - `init.js` — the `DOMContentLoaded` init; loads last.
  - A file's top-level code may only *call* functions from files loaded before it (calls inside functions/handlers are fine — they run after every file has loaded). A new file goes in both `index.html` and `sw.js` `STATIC_ASSETS`.
- `assets/css/style.css` — all styles via CSS custom properties (`--accent`, `--surface`, etc.).
- `manifest.json` — PWA metadata.
- `sw.js` — service worker: network-first for everything, with the cache only as the offline fallback. Same-origin files are fetched with `cache: 'no-cache'` (ETag revalidation) so GitHub Pages' `max-age=600` can't serve the previous deploy's `app.js`/`style.css` under a new page. Before v1.21 assets were cache-first, which did exactly that on the first load after each release. See Versioning below for its `CACHE` constant.

### Tab/navigation system

`openTab(evt, id)` shows the matching `.tab-content` div and persists the active tab to `localStorage` (`esan-devtools-tab`). Tab metadata (title/subtitle shown in the top bar) is declared in the `TAB_META` object at the top of `core.js`.

Adding a new tool requires four things:
1. A `<div id="newtool-tab" class="tab-content">` block in `index.html`
2. A `<div class="nav-item" data-tab="newtool-tab" onclick="openTab(event,'newtool-tab')">` in the sidebar nav
3. An entry in `TAB_META` in `core.js`
4. Its logic in `assets/js/tools/newtool.js`, as a `<script defer>` before `init.js` in `index.html` and in `sw.js` `STATIC_ASSETS`

Its text inputs are remembered automatically (see State persistence). Optionally add a smart paste rule in
`home.js` if the tool has a recognisable input.

Tool layout (every converter follows it):
- Options, mode toggles (`.json-view-toggle` of `data-v` buttons, marked with `setSegmented(id, v)`) and
  "ลองตัวอย่าง" go in the `.section-header` on top. Nothing destructive there.
- `.grid-2`: input left, output right (stacks under 680px). Each field starts with a `.field-head`: the
  label left, quiet `.field-act` buttons right, "ล้าง" (x icon) on inputs and "คัดลอก" (copy icon) on outputs.
- Results update while typing (`debounced(fn)` from core.js for heavier work); no "แปลง" button.
  `Ctrl+Enter` still runs the tool.
- Search boxes use `.search-field` with an inline `.search-clear` that only shows when there is text.
- `.btn-danger` is only for wiping stored data (Settings "ล้างข้อมูลที่จำไว้", LOV "ลืมโฟลเดอร์").

Expensive setup (highlight.js, big renders) goes in `TAB_INIT` next to `openTab`, not in the
`DOMContentLoaded` init — it runs once on the tab's first open. All `<script>` tags are `defer`
(order preserved), so app code can rely on the CDN globals being loaded.

### State persistence

`localStorage` keys used:
- `esan-devtools-theme` — `mac` or a preset id (`matrix`/`nord`/`dracula`/`kitty`); pre-v2 values
  (`default`, `light`, `esan`, `cdg`, `south`) are migrated in `loadTheme()`
- `esan-devtools-appearance` — `light` / `dark` / `auto` (macOS theme only)
- `esan-devtools-accent` — accent id from `ACCENTS` or a custom `#rrggbb`
- `esan-devtools-clickfx` — `1`/`0` from the Settings effects switch (click sparkle, logo animation,
  transitions via `body.fx-off`); unset = follow the OS `prefers-reduced-motion`
- `esan-devtools-nav-collapsed` — ids of folded sidebar groups (`data-group`)
- `esan-devtools-tab` — last active tab id
- `esan-devtools-navsearch` — last sidebar search query
- `esan-devtools-favorites` — favorited tool ids (see Favorites below)
- `esan-devtools-recent` — last 8 opened tool ids, shown on the home tab
- `esan-devtools-remember` — `0` when the Settings switch "จำข้อมูลที่กรอกไว้" is off (unset = on)
- `esan-devtools-in:<key>` — a tool option remembered with the inputs via `rememberOpt` / `recallOpt`
  (`py-dir`, `b64-mode`, `url-dir`), so a restored input is converted the same way
- `esan-devtools-in:<element id>` — last value of every `textarea`/text/number `input` with an id inside a
  `.tab-content`, restored on load by `initRememberedInputs()` (core.js), which replays the field's `input`
  event so outputs come back too. Values are saved on input and again on `pagehide`, which catches clear
buttons and smart paste that change a field without an input event. Seven older fields keep their pre-v2 keys (`INPUT_LEGACY_KEYS`, e.g.
  `esan-devtools-sql-last`). Never saved: `INPUT_NEVER` (JWT token/secret, K8s Secret, mirror fields) and
  any `*-search` / `ref-q-*` box. "ล้างข้อมูลที่จำไว้" and turning the switch off drop these and the recent list.

### Favorites store

Favorites persistence is behind a swappable interface (`FAVORITES STORE` in `assets/js/core.js`): any store object
implementing `load() -> Promise<string[]>` and `save(ids) -> Promise<void>` can replace
`LocalStorageFavoritesStore` via `setFavoritesStore(store)` before `initFavorites()` runs — e.g.
to move favorites to a backend later without touching the feature code itself.

### Versioning / release

The version badge at `index.html` (`.app-version`, e.g. `v1.14`) is the single source of truth
for the app version. After every push to `main`, `.github/workflows/static.yml`'s `tag` job reads
that badge and auto-creates a matching git tag + GitHub release (skips silently if the tag already
exists — merges that don't bump the version don't fail the build). When bumping the version, keep
these in sync manually:
- `.app-version` in `index.html`
- `CACHE` constant in `sw.js` (e.g. `esan-devtools-v14`) — bump it on every release: changing
  `sw.js` is what makes browsers install the new worker, and the new name drops the old offline copy
- the version badge in `README.md` (CI only warns on mismatch here, doesn't fail)

### External dependencies (CDN, no local copy)

The cdnjs libraries are not in `<head>`: `loadLib(name)` in `core.js` (`LIBS` lists the files) fetches
them on a tool's first use, so a first visit downloads only the app. `highlightCode(sel)` loads
highlight.js by itself; anything else waits on `loadLib(...)` (in `TAB_INIT` or before first use) and
falls back to plain text if the CDN fails.

- **highlight.js 11.9.0** (+ typescript/java/properties/sql/nginx/dockerfile) — code blocks
- **CodeMirror 5.65.16** — RxJS Playground editor (loaded when the RxJS tab opens)
- **RxJS 7.8.1** — RxJS Playground runtime
- **jsdiff 5.1.0** (`diff.min.js` from cdnjs) — Text/JSON diff
- **Google Fonts** — IBM Plex Sans Thai, JetBrains Mono
- **Web Crypto API** — Hash generation (`crypto.subtle`), UUID v4 (`crypto.randomUUID`)
- **Canvas API** — Color Picker SV square, hue/alpha sliders, image color picker loupe
- **EyeDropper API** — Screen color picking (Chrome/Edge only, gracefully absent on unsupported browsers)
- **Clipboard API** — Copy to clipboard with `document.execCommand('copy')` fallback

### Keyboard shortcuts

- `Ctrl+Enter` — triggers the primary action of the active tool
- `Ctrl+K` / `⌘K` — opens the command palette (tools from the sidebar + `PALETTE_CMDS` in `core.js`)
- `Esc` — closes the palette, then any open popover, then the mobile sidebar

### Themes

macOS-style shell (translucent sidebar, unified toolbar, popovers) shared by every theme.
`data-theme` on `<body>`: `''` = macOS Dark, `light` = macOS Light, or a preset (`matrix`, `nord`,
`dracula`, `kitty`). Settings live in the toolbar gear popover (`#settings-pop`): appearance, accent,
presets, click-effect switch. The macOS themes get their accent written inline on `<body>` by
`applyAccent()`, which shades it until `--accent-fg` and the `--btn-primary-*` pair reach 4.5:1
(`console.assert` fires if not). Tokens are declared on `body`, not `:root`, because `data-theme` is on
`<body>` and derived tokens (`--material-*`, `--focus-ring`, `--wallpaper`) must resolve against it.
Each theme block sets the contrast tokens described at the top of `style.css` (`--line`, `--accent-fg`,
`--on-accent`, border alphas) and, for a light theme, the `--c-*` tints, hover/press, shadows and
`color-scheme` — a new theme must define them too, or it inherits the macOS Dark values.
Per-tool CSS uses the semantic tints `--c-green/-yellow/-red/-blue/-purple/-pink/-orange/-cyan`
instead of hex; the dark code panes (`.mq-code`, `.stor-code`, CodeMirror) keep their own palette.

## Key patterns in assets/js

- All tool logic is in plain functions (no classes). Within a file, functions are grouped with `// ── SECTION ──` comments.
- `showToast(msg, kind)` — 2-second HUD toast; `kind` is `ok` (default) / `warn` / `err` / `info` and picks the icon.
- `ic(name, cls)` — returns `<svg class="i"><use href="#i-name"/></svg>` from the lucide sprite at the top of
  `<body>`; add a `<symbol id="i-…">` there before using a new name. No emoji anywhere in the UI.
- `copyText(txt)` — copies to clipboard (Clipboard API + execCommand fallback). Every copy goes through it:
  the clicked control gets `.is-copied` and a short button's label becomes "คัดลอกแล้ว" for 1.6s
  (`flashCopied`), and the toast shows the start of what was copied. Don't add per-tool "copied" swaps.
- `escHtml(s)` — escapes HTML for safe insertion into `innerHTML`.
- Mock data generator uses `crypto.getRandomValues` for UUID and standard `Math.random` for other fields.
- Thai ID checksum: sum of `digit[i] * (13 - i)` for i 0–11, check digit = `(11 - sum % 11) % 10`.

## Design-system toolkit (`.claude/`)

Separate from the app itself: this repo also carries a generic, framework-agnostic
design-system authoring kit for Claude Code — DTCG design tokens, taste/accessibility
doctrine, component specs, and verification scripts. It doesn't run as part of
อีสาน DevTools and has no build wiring (no `package.json`/CI yet); it exists so Claude
can design/review/generate UI code to a consistent bar, including for this app's own
future UI work.

- `.claude/rules/*.md` — topic-scoped instruction files (accessibility, tokens/color,
  typography/spacing, components, frameworks, brand/operations, review/research),
  split out of a global CLAUDE.md so each loads only when relevant. Don't duplicate
  their content here — see them directly when working on design/UI tasks.
- `.claude/skills/*` — invocable skills for token generation, component design,
  accessibility audits, design review, framework code generation, etc.
- `tokens/*.json` — DTCG-format design tokens (color, type, spacing, motion, ...).
- `accessibility/`, `components/`, `content/`, `design-systems/`, `frameworks/`,
  `taste/`, `workflows/` — reference docs backing the rules/skills above.
- `scripts/` — Python/Node validators and auditors (contrast, token lint, a11y/axe,
  responsive overflow, taste audit, etc.) invoked by the skills, not by any app build
  step.

This toolkit is unrelated to the Thai ID/mock-data/SQL-parser logic above — don't
conflate the two when navigating the repo.

## Claude Code plugin: ESAN AI AGENT (`plugins/esan-office/`)

Also separate from the static site: a Claude Code plugin that shows every Claude Code
session on the user's machine as an agent in an 8-bit office, and runs "office agents"
the user commands from the page. Full docs (Thai) in `plugins/esan-office/README.md` —
don't duplicate them here.

- `.claude-plugin/marketplace.json` (repo root) declares marketplace `esan-devtools`;
  the plugin is `esan-office`. Install: `claude plugin marketplace add devgreenpink/dev-utility-toolkit`
  then `claude plugin install esan-office@esan-devtools`.
- Zero-dependency Node: `scripts/bridge.js` (server on `127.0.0.1:4567`), `scripts/start.js`
  (SessionStart hook), `office/index.html` (single-file page, three themes: `esan`, `green`/CDG, and `south`).
- GitHub Pages deploys these files too (whole repo is the artifact); runtime data
  (agents, token, log) lives in `~/.esan-office/`, never in the repo.
- Gotchas: `start.js` must never write to stdout (SessionStart stdout enters Claude's
  context); `claude -p` doesn't fire `PermissionRequest`, so office-agent approvals go
  through a per-run `PreToolUse` hook; watched sessions' hooks always get `{}` back.
- Keep `plugin.json` `version` and `VERSION` in `bridge.js` in sync; bump `CACHE` in
  `office/sw.js` when the manifest or icons change.
- Verify with `claude plugin validate plugins/esan-office` and `claude plugin validate .`;
  end-to-end tests: `plugins/esan-office/tests/office-tests.mjs` (`ONLY_FREE=1` spends no tokens).
