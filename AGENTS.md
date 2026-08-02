# AGENTS.md

This file provides guidance to ZCode (and other AI coding agents) when working with code in this repository.

## Project Overview

A Windows desktop application for simulating League of Legends Ban/Pick phases. Built with Electron + React + TypeScript, using React Context for state management and TailwindCSS for styling.

**Package manager**: pnpm (not npm). The project uses pnpm 11+ with specific build script allowances for electron.

**Quick start**: Double-click `启动开发环境.bat` to launch the full Electron development environment.

## Development Commands

```bash
# Frontend development only (Vite dev server on localhost:5173)
pnpm dev

# Full Electron development (Vite + Electron window)
pnpm electron:dev

# Build frontend
pnpm build

# Lint (ESLint, config in .eslintrc.cjs)
pnpm lint

# Type-check (dedicated scripts — preferred over raw `tsc`)
pnpm typecheck          # frontend only (tsconfig.json)
pnpm typecheck:electron # Electron main process (tsconfig.electron.json)
pnpm typecheck:all      # both — run this as the static gate

# Run tests once (Vitest)
pnpm test

# Run a single test file / match a test name
pnpm test src/utils/__tests__/cn.test.ts
pnpm test -t "拼接多个字符串类名"

# Watch mode / coverage
pnpm test:watch
pnpm test:coverage

# Preview production build
pnpm preview

# Build Windows installer (electron-builder)
pnpm electron:build
```

> **Lint config**: [.eslintrc.cjs](.eslintrc.cjs) — eslint 8 + `@typescript-eslint` + react-hooks/react-refresh, standard baseline + single-quote / no-semicolon style. Two overrides: `src/main/*.js` (CommonJS) uses `espree` + node env; `src/contexts/**` turns off `react-refresh/only-export-components` (provider + hook + default export coexist intentionally). Verification gate: `pnpm lint` + `pnpm typecheck:all` + `pnpm test` (run before declaring a task done).

**Alternative**: Use the batch files in project root:
- `启动开发环境.bat` - Full Electron development
- `快速启动（仅前端）.bat` - Frontend only
- `构建并运行.bat` - Build production version

## pnpm Configuration

The project uses pnpm 11+. Critical configuration files:

- **pnpm-workspace.yaml**: Contains `allowBuilds` whitelist allowing electron and esbuild to run postinstall scripts. This is required for electron binary download. The deprecated `package.json#pnpm` field is NOT used.
- **.npmrc**: Configures npmmirror.com mirror for faster electron binary downloads in China.

## Electron Debugging

**Important**: If you encounter `TypeError: Cannot read properties of undefined (reading 'whenReady')`, the root cause is likely `ELECTRON_RUN_AS_NODE=1` environment variable being set. This makes electron run as pure node interpreter instead of app mode.

**Diagnosis checklist**:
1. Check `node_modules/electron/dist/electron.exe` and `path.txt` exist. If missing, run: `ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ node node_modules/electron/install.js`
2. Check `env | grep ELECTRON_RUN_AS_NODE`. If `1`, unset it before running: `unset ELECTRON_RUN_AS_NODE`
3. Only suspect code issues after both are verified.

## Testing

The suite (Vitest + @testing-library/react + jsdom) follows a layered convention by test **environment**. (This repo previously referenced an external LambChat dev guide for test style; that doc has been removed — the conventions below are the authoritative summary.)

- **Config**: `vitest.config.ts` (default environment `node`); global setup `vitest.setup.ts`.
- **Location**: `src/**/__tests__/**/*.test.{ts,tsx,js}`, co-located with the code under test.
- **Layering by environment**:
  - Pure utilities & Electron main-process logic → default `node` env (fast, no DOM). e.g. `src/utils/__tests__/cn.test.ts`, `src/main/services/__tests__/heroService.test.js`.
  - Components & hooks that need a DOM → put `/** @vitest-environment jsdom */` as the **first line** of the file. e.g. `src/components/bp/__tests__/HeroCard.test.tsx`, `src/contexts/__tests__/BPContext.test.tsx`.
- **Globals are off** (`test.globals` is not enabled), so `@testing-library/react`'s built-in auto-cleanup does **not** fire. `vitest.setup.ts` manually registers `afterEach(cleanup)` to stop `screen` queries leaking between tests — keep it.
- **Component tests** mock `react-i18next` (`useTranslation: () => ({ t: (k) => k })`) and stub `window.electronAPI`, since neither exists outside Electron.

There is no separate backend service: the "backend" here is the Electron main process (`src/main/`), tested under the node environment.

## Architecture

### Electron Structure

```
src/main/
├── main.js                    # Main process entry, window creation, registers all IPC handlers
├── preload.js                 # IPC bridge via contextBridge → window.electronAPI
├── ipc/
│   ├── heroHandler.js         # fetchHeroes / getHeroImageUrl / getCurrentVersion
│   └── dataHandler.js         # exportData / importData (file save/open dialogs + validation)
├── services/
│   └── heroService.js         # Hero data service with caching
└── utils/
    └── logger.js              # Dev-only info/debug, always-on warn/error
```

**IPC Pattern**: Each handler module exports a `registerXxxHandlers()` function; `main.js` calls both in `app.whenReady().then(...)`. Preload exposes via `contextBridge` as `window.electronAPI`. Renderer invokes with `await window.electronAPI.handlerName()`.

Available IPC methods:
- `fetchHeroes()` - Fetch all champions from Data Dragon API
- `getHeroImageUrl(heroId)` - Get champion avatar URL
- `getCurrentVersion()` - Get current game version
- `exportData(data)` - Save BP snapshot to a JSON file via native dialog. Main process wraps data as `{ version: 1, ...data }`; timestamp (`exportedAt`) is passed in by the renderer.
- `importData()` - Open + read a JSON file, run server-side validation (`isValidBPSnapshot`: version + field types + TeamState shape), enforce a 5MB size cap. Renderer re-validates via `isValidBPSnapshotRenderer` before calling `loadSnapshot`.

**Security boundary**: imported data is untrusted. It is validated three times — file-size cap + basic schema in `dataHandler.js`, then runtime type guard (`isValidBPSnapshotRenderer` in `src/utils/typeGuards.ts`), then `BPContext.loadSnapshot` does its own field whitelist check. Do not weaken any layer; treat the JSON as hostile input.

**Logging rule**: main-process code uses `src/main/utils/logger.js` (`logger.info/debug/warn/error`), NOT bare `console.*`. `info`/`debug` are dev-only; `warn`/`error` always print. This keeps production logs clean.

### State Management (React Context)

Three nested Context providers in App.tsx:

```
HeroContext (outer)
  └─ BPContext
      └─ DataContext (inner)
```

**HeroContext** (`src/contexts/HeroContext.tsx`):
- State: `heroes`, `filteredHeroes`, `searchQuery`, `selectedTags`, `availableTags`
- Actions: `setSearchQuery`, `setSelectedTags`, `getHeroById`, `refreshHeroes`
- Data source: Data Dragon API via Electron IPC (zh_CN locale, Chinese names)
- Filtering logic: search by name/title + filter by tags (OR logic)

**BPContext** (`src/contexts/BPContext.tsx`):
- State: `currentPhase`, `blueTeam`, `redTeam`, `history`, `isComplete`
- Actions: `banHero`, `pickHero`, `undo`, `reset`, `getCurrentPhase`, `loadSnapshot(snap)`, plus `totalPhases` (read-only = `BP_PHASES.length`)
- `banHero`/`pickHero` are thin wrappers over a shared `applyAction` core (validates phase action type + duplicate detection across both teams). Do not bypass it.
- `loadSnapshot` takes a `BPSnapshot` (the serializable subset of `BPState`), re-validates and field-whitelists it, returns a boolean success. Used by import.
- Exports `BP_PHASES` constant: 20 steps total. Also exports `SLOTS_PER_TEAM = 5` and the `HeroAction` / `TeamState` / `BPSnapshot` types.

**DataContext** (`src/contexts/DataContext.tsx`):
- State: `recommendations`, `synergyAnalysis`, `matchupAnalysis`, `loading`
- Actions: `analyze()` (async), `clear()`
- Backed by the local analysis engine in `src/analysis/rules/` (see below) — **fully implemented, not a stub**. Auto-`clear`s whenever `bp.currentPhase` or `bp.history.length` changes (stale-analysis guard).

### Analysis Engine (`src/analysis/`)

Local rule-based hero analysis — no external API, runs entirely in the renderer:

```
src/analysis/
├── types.ts              # Recommendation, SynergyScore, MatchupAnalysis
└── rules/
    ├── constants.ts      # tag weights, thresholds, tunable knobs
    ├── synergy.ts        # calcSynergy(ownPicks) → SynergyScore
    ├── matchup.ts        # calcMatchup(bluePicks, redPicks) → MatchupAnalysis
    └── recommend.ts      # recommendHeroes(pool, own, enemy, excluded) → Recommendation[]
```

The "own" vs "enemy" split is derived from `getCurrentPhase().side` (the side to move is "own"). When touching analysis logic, keep the rules pure functions (they're tested under node env) and consume them only through `DataContext.analyze`.

### i18n Configuration

The project uses i18next for internationalization:

```
src/i18n/
├── locales/
│   ├── zh-CN.json    # Simplified Chinese (default)
│   ├── zh-TW.json    # Traditional Chinese
│   └── en.json       # English
├── types.ts          # TypeScript type definitions
└── index.ts          # i18next configuration
```

Usage in components:
```typescript
import { useTranslation } from 'react-i18next'
const { t } = useTranslation()
// Use: t('bp.ban'), t('hero.tags.assassin'), etc.
```

### Component Layout

`App.tsx` wraps everything in `EnvironmentGuard` (refuses to render outside Electron — shows a "run via `pnpm electron:dev`" error otherwise), then renders the three nested providers. The main layout is header + two stacked sections + footer:

- **Header**: title, language switcher (zh-CN / zh-TW / en), "分析" button, status.
- **Top section** (`h-[32vh]`): `HeroGrid` — searchable hero pool with tag filters.
- **Center section** (`flex-1`): `BanPickArena` — blue/red teams with ban/pick slots.
- **Footer**: undo / reset buttons, BP progress bar (`currentPhase/totalPhases`), export / import buttons.
- **Overlay**: `AnalysisDrawer` — a slide-in drawer (collapsed by default; opened from the header "分析" button), containing `AnalysisPanel`.

Components live under `src/components/{bp,analysis}/`. The BP sub-components (`BanPickArena`, `HeroGrid`, `TeamSection`, `TeamSlot`, `HeroCard`, `PhaseIndicator`) compose the arena.

### BP Flow Invariant

The current action is always determined by `currentPhase` index into `BP_PHASES`. Components should not track "whose turn is it" separately — always read from `useBP().getCurrentPhase()`.

**Important**: `banHero()` and `pickHero()` include duplicate detection — they will not add a hero that's already been banned or picked by either team. They also silently no-op if the phase's action type doesn't match (e.g. calling `pickHero` during a ban step).

## BP Phase Order Reference

**Current rules** (A=Blue, B=Red):

```
Step 1-6:   Ban Phase 1   (ABABAB) - fills first 3 ban slots per team
Step 7-12:  Pick Phase 1  (ABBAAB)
Step 13-16: Ban Phase 2   (BABA) - fills last 2 ban slots per team
Step 17-20: Pick Phase 2  (BAAB)
```

Each team has 5 ban slots total (displayed in UI), filled in two phases:
- **Team**: Blue | Red
- **Ban 1**: Steps 1,3,5 | Steps 2,4,6
- **Ban 2**: Steps 14,16 | Steps 13,15

This is defined in `BPContext.tsx` `BP_PHASES` constant. Do not modify without verifying against actual League of Legends rules.

## Type System

- `src/types/hero.ts` - Hero, HeroStats, CounterInfo, DataDragonResponse types
- `src/types/global.d.ts` - ElectronResponse<T>, ElectronAPI interface, window.electronAPI
- `src/utils/typeGuards.ts` - runtime type guards for imported BP snapshots (`isValidBPSnapshotRenderer`)

## Import / Path Conventions

- **Use relative imports, not the `@` alias.** `tsconfig.json` and `vite.config.ts` both define an `@ → src/` alias, but it is currently unused across the codebase (0 occurrences). All imports are relative (`./`, `../`). Keep doing that for consistency; do not introduce a mix.
- Context hooks are named exports consumed as `useBP` / `useHeroes` / `useData` — there is no default export (the provider + hook deliberately coexist, which is why `react-refresh/only-export-components` is turned off under `src/contexts/**`).
- One custom hook lives in `src/hooks/useHeroImage.ts` (hero avatar URL resolution via IPC).

## TailwindCSS & Styling

Theme extensions live in `tailwind.config.js`:

- **Colors**: `lol-blue` / `-glow` / `-dark`, `lol-red` / `-glow` / `-dark`, `lol-gold` / `-glow`, plus `lol-dark`, `lol-darker`.
- **Glow shadow tiers**: `blue-sm` / `blue` / `blue-lg`, and matching `-sm` / `-lg` tiers for `red-*` and `gold-*`.
- **Animations**: `border`, `fade-in`, `slide-in-up`, `scale-in` are config-driven (keyframes co-located in `tailwind.config.js`); `glow` lives in `src/styles/animations.css` (opacity pulse on `::after`, team color set by the `.glow-blue` / `.glow-red` / `.glow-gold` classes).

**Custom `boxShadow` keys do NOT support Tailwind's opacity modifier.** Writing `shadow-blue/40` is silently reinterpreted as shadow-*color* tinting and emits no glow at all — the named key is ignored. That's why each intensity is its own explicit key (`blue-sm` / `blue` / `blue-lg`): use the named tiers directly and never append `/N` to them. (Standard color utilities like `border-lol-blue/30` are unaffected — this caveat is specific to the custom `boxShadow` keys.)

**A color-only shadow utility emits no shadow without a size class.** `shadow-green-500/50` (or `shadow-lol-blue/30`) alone only sets `--tw-shadow-color`; Tailwind emits no `box-shadow` unless a size utility (`shadow` / `shadow-md` / `shadow-lg`) is also present. Always pair the color utility with a size class, or the intended glow silently fails to render. (This is the sibling gotcha to the `/N` caveat above.)

**`@import` statements must precede `@tailwind` directives.** In `globals.css`, put all `@import` lines at the very top, before `@tailwind base/components/utilities`. Otherwise Vite emits a `[vite:css] @import must precede all other statements` warning per import on every build, and stricter future Vite/PostCSS versions may silently drop the imported CSS (breaking all `var(--lol-*)` tokens and custom classes). `@layer` blocks still merge correctly regardless of import position.

**Never construct Tailwind class names by string interpolation.** The JIT scanner only emits CSS for class names that appear as **complete literals** in source. `border-${color}`, `bg-${side}`, `shadow-${x}` produce no CSS at all — the class is silently absent from the build, and a refactor that introduces this will pass all unit tests (tests don't check CSS generation). When consolidating color-varying branches (ban/pick, red/blue), use a **ternary of full literal strings** (`isBan ? 'border-lol-red/40 hover:shadow-red' : 'border-lol-blue/40 hover:shadow-blue'`) or a **lookup object with literal values**. Also note the custom `boxShadow` keys are `shadow-red` / `shadow-blue` (tier names), not `shadow-lol-red`.

**Editing `tailwind.config.js` requires restarting the Vite dev server.** HMR does not reload the Tailwind config, so config-driven style changes silently appear to "not work" until the server is restarted.

Game-feel design tokens and motion live in `src/styles/`, imported once via the app entry: `main.tsx` → `globals.css` → (`@import './design-system.css'`, `@import './animations.css'`). Add CSS custom properties / keyframes there rather than inlining them in components.

## Key Implementation Details

### Hero Data Caching

The Electron main process (`src/main/services/heroService.js`) implements a 6-hour cache for hero data to minimize API calls to Data Dragon. The cache is stored in a Map and cleared on app restart if expired.

**Data Dragon locale**: Uses `zh_CN` endpoint, returning Chinese hero names and descriptions.

### Context Provider Order

HeroProvider is outermost because other components may need hero data independent of BP state. BPProvider is in the middle because DataContext depends on BP state for analysis. DataProvider is innermost as it's only used by AnalysisPanel.

### TypeScript Configs

- `tsconfig.json` - Frontend (src/), includes React types, JSX
- `tsconfig.electron.json` - Electron main process (src/main/), outputs to build/main/
- `tsconfig.node.json` - Vite config files only
