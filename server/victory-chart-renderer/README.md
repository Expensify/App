# Victory Chart Renderer

Standalone Bun CLI that will render Expensify chart XML to PNG using the same chart code as the App.

This directory is introduced in PR 2 of the [Victory Chart Renderer rollout](https://github.com/Expensify/App/issues/91528) as a scaffold only: no Skia, no `victory-native`, and no chart rendering yet.

## Development

From the App repository root:

```bash
npm run server:vcr:dev /tmp/out.txt
```

## Tests

```bash
cd server/victory-chart-renderer && bun test
```

## Compiled binaries

```bash
npm run server:vcr:build:linux
npm run server:vcr:build:macos
```

Binaries are written to `server/victory-chart-renderer/dist/` (gitignored).
