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

The app is a single HTML page with two companion files:

- `index.html` — all tool UI markup. Each tool lives in a `<div id="<name>-tab" class="tab-content">` block.
- `assets/js/app.js` — all JavaScript in one file. No modules, no imports.
- `assets/css/style.css` — all styles via CSS custom properties (`--accent`, `--surface`, etc.).
- `manifest.json` — PWA metadata.

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
