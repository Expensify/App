# Victory Chart Renderer

Standalone Bun CLI (`@expensify/victory-chart-renderer`) that renders Expensify chart XML to PNG using the same `victory-native` and Skia code paths as the App.

This package is an [npm workspace](https://docs.npmjs.com/cli/using-npm/workspaces) child of the App root. React Native peer dependencies are declared as local `file:` stub packages under [`../stubs/`](../stubs/) (with `overrides` + `installConfig.hoistingLimits` so they stay in this workspace). App import aliases (`@components/*`, etc.) come from [`tsconfig.json`](./tsconfig.json) via [Bun path re-mapping](https://bun.com/docs/guides/runtime/tsconfig-paths). `scripts/dev.ts` and `scripts/build.ts` pass that tsconfig to `Bun.build` and use [`../plugins/rnStubPlugin.ts`](../plugins/rnStubPlugin.ts) to redirect native modules to stubs.

## Usage

From the App repository root:

```bash
npm run server:vcr:dev -- '<victorychart width="400" height="300">...</victorychart>' /tmp/out.png
```

Or pass a path to a `.xml` file:

```bash
npm run server:vcr:dev -- server/victory-chart-renderer/tests/fixtures/monthly-spend.xml /tmp/out.png
```

From this directory:

```bash
npm run dev -- path/to/chart.xml /tmp/out.png
```

## Tests

From the App repository root:

```bash
npm run server:vcr:test
```

See [tests/README.md](tests/README.md) for fixture details and golden PNG policy.

To refresh reference PNGs after an intentional rendering change:

```bash
UPDATE_GOLDEN=1 npm run server:vcr:test
```

## Compiled binaries

From the App repository root:

```bash
npm run server:vcr:build:linux
npm run server:vcr:build:linux-arm
npm run server:vcr:build:macos
```

Binaries are written to `dist/` (gitignored).
