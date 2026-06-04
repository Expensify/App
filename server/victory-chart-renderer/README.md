# Victory Chart Renderer

Standalone Bun CLI (`@expensify/victory-chart-renderer`) that renders Expensify charts to PNG using the same `victory-native` and Skia code paths as the App.

This package is an [npm workspace](https://docs.npmjs.com/cli/using-npm/workspaces) child of the App root. React Native peer dependencies are declared as local `file:` stub packages under [`../stubs/`](../stubs/) (with `overrides` + `installConfig.hoistingLimits` so they stay in this workspace). At runtime, `scripts/dev.ts` and `scripts/build.ts` bundle the CLI with [`../plugins/rnStubPlugin.ts`](../plugins/rnStubPlugin.ts), which redirects `react-native`, `react-native-reanimated`, `react-native-gesture-handler`, and `react-native/*` imports to those stubs, because hoisted `victory-native` at the repo root would otherwise resolve the real native modules. The in-app Metro build is unaffected.

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

Binaries are written to `dist/` (gitignored). `canvaskit.wasm` (~8 MB) is embedded in the executable via Bun's `with { type: "file" }` import, so only the binary needs to be shipped.
