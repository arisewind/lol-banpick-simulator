# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Windows desktop application for simulating League of Legends Ban/Pick phases. Built with Electron + React + TypeScript, using React Context for state management and TailwindCSS for styling.

**Package manager**: pnpm (not npm). The project uses pnpm 11+ with specific build script allowances for electron.

## Development Commands

```bash
# Frontend development only (Vite dev server on localhost:5173)
pnpm dev

# Full Electron development (Vite + Electron window)
pnpm electron:dev

# Build frontend
pnpm build

# Lint TypeScript/TSX files
pnpm lint

# Preview production build
pnpm preview

# Build Windows installer (electron-builder)
pnpm electron:build
```

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

See `memory/electron-run-as-node-env-trap.md` for full details.

## Memory Sync

This CLAUDE.md is kept in sync with `memory/project-architecture.md`. When updating architectural documentation, update both files to maintain consistency.

## Architecture

### Electron Structure

```
electron/
├── main.js                    # Main process entry, window creation
├── preload.js                 # IPC bridge via contextBridge
├── ipc/heroHandler.js         # IPC handlers for hero data
└── services/heroService.js    # Hero data service with caching
```

**IPC Pattern**: Main process handlers register in `electron/ipc/heroHandler.js`. Preload exposes via `contextBridge` as `window.electronAPI`. Renderer invokes with `await window.electronAPI.handlerName()`.

Available IPC methods:
- `fetchHeroes()` - Fetch all champions from Data Dragon API
- `getHeroImageUrl(heroId)` - Get champion avatar URL
- `getCurrentVersion()` - Get current game version
- `exportData(data)` - Export BP data (to be implemented)
- `importData()` - Import BP data (to be implemented)

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
- Data source: Data Dragon API via Electron IPC
- Filtering logic: search by name/title + filter by tags (OR logic)

**BPContext** (`src/contexts/BPContext.tsx`):
- State: `currentPhase`, `blueTeam`, `redTeam`, `history`, `isComplete`
- Actions: `banHero`, `pickHero`, `undo`, `reset`, `getCurrentPhase`
- BP_PHASES constant: 20 steps total (10 bans → 10 picks)
- **Note**: TODO.md records pending change to 6 bans (3 per side) → 10 picks

**DataContext** (`src/contexts/DataContext.tsx`):
- State: `recommendations`, `synergyAnalysis`, `matchupAnalysis`, `loading`
- Actions: `analyze`, `clear`
- Note: Analysis logic is not yet implemented - this is a stub for future functionality

### Component Layout

App.tsx three-panel layout:
- **Left** (`w-80`): HeroGrid - searchable hero pool with tag filters
- **Center** (`flex-1`): BanPickArena - shows blue/red teams with ban/pick slots
- **Right** (`w-96`): AnalysisPanel - recommendations and stats (stub)

### BP Flow Invariant

The current action is always determined by `currentPhase` index into `BP_PHASES`. Components should not track "whose turn is it" separately — always read from `useBP().getCurrentPhase()`.

**Important**: `banHero()` and `pickHero()` include duplicate detection - they will not add a hero that's already been banned or picked by either team.

## BP Phase Order Reference

```
Ban Phase (steps 1-10):
Blue → Red → Blue → Red → Blue → Red → Red → Blue → Red → Blue

Pick Phase (steps 11-20):
Blue → Red → Red → Blue → Blue → Red → Red → Blue → Blue → Red
```

This is defined in `BPContext.tsx` `BP_PHASES` constant. Do not modify without verifying against actual League of Legends rules.

**Pending change**: TODO.md records requirement to change from 5 bans per side to 3 bans per side.

## Type System

- `src/types/hero.ts` - Hero, HeroStats, CounterInfo, DataDragonResponse types
- `src/types/global.d.ts` - ElectronResponse<T>, ElectronAPI interface, window.electronAPI

## TailwindCSS Custom Colors

Extended theme in `tailwind.config.js`:
- `lol-blue`, `lol-red`, `lol-gold`, `lol-dark`, `lol-darker` - League of Legends brand colors

## Key Implementation Details

### Hero Data Caching

The Electron main process (`electron/services/heroService.js`) implements a 6-hour cache for hero data to minimize API calls to Data Dragon. The cache is stored in a Map and cleared on app restart if expired.

**Data Dragon locale**: Uses `zh_CN` endpoint, returning Chinese hero names and descriptions. This means hero data is already localized.

### Context Provider Order

HeroProvider is outermost because other components may need hero data independent of BP state. BPProvider is in the middle because DataContext depends on BP state for analysis. DataProvider is innermost as it's only used by AnalysisPanel.

### TypeScript Configs

- `tsconfig.json` - Frontend (src/), includes React types, JSX
- `tsconfig.electron.json` - Electron main process (electron/), outputs to dist-electron/
- `tsconfig.node.json` - Vite config files only
