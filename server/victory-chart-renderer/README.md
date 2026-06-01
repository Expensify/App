# Victory Chart Renderer

Standalone Bun CLI (`@expensify/victory-chart-renderer`) that renders Expensify charts to PNG using the same `victory-native` and Skia code paths as the App.

This package is an [npm workspace](https://docs.npmjs.com/cli/using-npm/workspaces) child of the App root. React Native peer dependencies are declared as local `file:` stub packages under [`../stubs/`](../stubs/) (with `overrides` + `installConfig.hoistingLimits` so they stay in this workspace). At runtime, `scripts/dev.ts` and `scripts/build.ts` bundle the CLI with a Bun plugin that redirects `react-native`, `react-native-reanimated`, `react-native-gesture-handler`, and `react-native/*` imports to those stubs, because hoisted `victory-native` at the repo root would otherwise resolve the real native modules. The in-app Metro build is unaffected.

## Project layout

- `src/` — CLI source
- `../stubs/` — shared `file:` stub packages (`react-native`, `react-native-reanimated`, `react-native-gesture-handler`) for server-side Bun tooling
- `scripts/` — Bun bundler entrypoints (`dev.ts`, `build.ts`, `rnStubPlugin.ts`)
- `tests/` — Bun integration tests (`bun:test`)
- `dist/` — compiled binaries (gitignored)

## Development

From the App repository root:

```bash
npm run server:vcr:dev -- --outPath /tmp/out.png
```

Or from this directory:

```bash
npm run dev -- --outPath /tmp/out.png
```

## Tests

From the App repository root:

```bash
npm run server:vcr:test
```

Or from this directory:

```bash
npm test
```

To refresh the reference PNG after an intentional rendering change:

```bash
UPDATE_GOLDEN=1 npm test
```

## Compiled binaries

From the App repository root:

```bash
npm run server:vcr:build:linux
npm run server:vcr:build:linux-arm
npm run server:vcr:build:macos
```

Binaries are written to `dist/` (gitignored).
