# Victory Chart Renderer

Standalone Bun CLI that will render Expensify chart XML to PNG using the same chart code as the App.

## Project layout

- `src/` — CLI source
- `tests/` — Bun integration tests (`bun:test`)
- `dist/` — compiled binaries (gitignored)

## Development

From the App repository root:

```bash
npm run server:vcr:dev /tmp/out.txt
```

## Tests

From the App repository root:

```bash
npm run server:vcr:test
```

Or from this directory:

```bash
bun test
```

## Compiled binaries

```bash
npm run server:vcr:build:linux
npm run server:vcr:build:macos
```

Binaries are written to `server/victory-chart-renderer/dist/` (gitignored).
