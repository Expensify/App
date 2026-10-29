# Victory Chart Renderer

Standalone Bun CLI (`@expensify/victory-chart-renderer`) that renders Expensify chart XML to PNG in a headless skia environment, reusing as much code from the main app as possible.

## Prerequisites

Bun is installed automatically via the root `npm install` (devDependency). No separate Bun installation is required.

## Usage

From the App repository root:

```bash
npm run server:vcr:dev -- --chart-xml '<victorychart width="400" height="300">...</victorychart>' --out /tmp/out.png
```

To render from a file, pass its contents with `cat`:

```bash
npm run server:vcr:dev -- --chart-xml "$(cat server/victory-chart-renderer/tests/fixtures/monthly-spend.xml)" --out /tmp/out.png
```

From this directory:

```bash
npm run dev -- --chart-xml "$(cat path/to/chart.xml)" --out /tmp/out.png
```

## Tests

From the App repository root:

```bash
npm run server:vcr:test
```

The suite compiles a standalone binary and runs it from an isolated temp directory (no `node_modules` or App checkout assets on the load path), then compares output against golden PNGs.

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
