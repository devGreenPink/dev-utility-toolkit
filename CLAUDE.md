# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**อีสาน DevTools** — a static, single-page developer toolkit with 15+ tools aimed at Thai developers. Everything runs client-side; there is no backend, no build step, no npm, no framework.

Live: https://devgreenpink.github.io/dev-utility-toolkit/

## Running Locally

Open `index.html` directly in a browser, or serve it with VS Code Live Server. No build or install step needed.

## Deployment

Push to `main` → GitHub Actions (`.github/workflows/static.yml`) deploys the whole repo to GitHub Pages automatically. The entire repository root is the deployment artifact.

## Architecture

The app is a single HTML page with a few companion files:

- `index.html` — all tool UI markup. Each tool lives in a `<div id="<name>-tab" class="tab-content">` block.
- `assets/js/app.js` — all JavaScript in one file, organized into `// ── SECTION ──`-delimited blocks (one per tool/feature — grep for `// ── ` to get the full tool list).
- `assets/css/style.css` — all styles via CSS custom properties (`--accent`, `--surface`, etc.).
- `manifest.json` — PWA metadata.
- `sw.js` — service worker: cache-first for same-origin assets, network-first (with cache fallback) for cross-origin (CDN/fonts). See Versioning below for why its `CACHE` constant must stay in sync with the app version.

### Tab/navigation system

`openTab(evt, id)` shows the matching `.tab-content` div and persists the active tab to `localStorage` (`isaan-devtools-tab`). Tab metadata (title/subtitle shown in the top bar) is declared in the `TAB_META` object at the top of `app.js`.

Adding a new tool requires three things:
1. A `<div id="newtool-tab" class="tab-content">` block in `index.html`
2. A `<div class="nav-item" data-tab="newtool-tab" onclick="openTab(event,'newtool-tab')">` in the sidebar nav
3. An entry in `TAB_META` in `app.js`

### State persistence

`localStorage` keys used:
- `isaan-devtools-theme` — active theme name
- `isaan-devtools-tab` — last active tab id
- `isaan-devtools-navsearch` — last sidebar search query
- `isaan-devtools-favorites` — favorited tool ids (see Favorites below)

### Favorites store

Favorites persistence is behind a swappable interface (`assets/js/app.js:56`): any store object
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
- `CACHE` constant in `sw.js` (e.g. `isaan-devtools-v14`) — must be bumped on any deploy that
  changes cached assets, or returning users keep getting stale files from the service worker
- the version badge in `README.md` (CI only warns on mismatch here, doesn't fail)

### External dependencies (CDN, no local copy)

- **jsdiff 5.1.0** (`diff.min.js` from cdnjs) — Text/JSON diff
- **Google Fonts** — IBM Plex Sans Thai, JetBrains Mono
- **Web Crypto API** — Hash generation (`crypto.subtle`), UUID v4 (`crypto.randomUUID`)
- **Canvas API** — Color Picker SV square, hue/alpha sliders, image color picker loupe
- **EyeDropper API** — Screen color picking (Chrome/Edge only, gracefully absent on unsupported browsers)
- **Clipboard API** — Copy to clipboard with `document.execCommand('copy')` fallback

### Keyboard shortcuts

- `Ctrl+Enter` — triggers the primary action of the active tool
- `Ctrl+K` — focuses the search input (sidebar nav search, or kubectl/Linux command search on those tabs)

### Themes

5 themes set via `data-theme` attribute on `<body>`. Default (Indigo) uses no attribute value. Stored in `localStorage`.

## Key patterns in app.js

- All tool logic is in plain functions (no classes). Functions are grouped with `// ── SECTION ──` comments.
- `showToast(msg)` — displays a 2-second toast notification.
- `copyText(txt)` — copies to clipboard (Clipboard API + execCommand fallback).
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
