# Victory chart renderer tests

Golden PNG fixtures are derived from the [Virtual CFO Charts](https://virtual-cfo-charts.netlify.app/) presets:

- `top-categories-6.xml` / `top-categories-10.xml` — pie charts (pinned data)
- `monthly-spend.xml` — vertical multi-series bar chart
- `top-employees-by-spend.xml` — horizontal grouped bar chart

## Running tests

From the App repo root:

```bash
npm run server:vcr:test
```

## Updating golden PNGs

Only when visuals change intentionally:

```bash
UPDATE_GOLDEN=1 npm run server:vcr:test
```

Rendered outputs for review are written to `tests/__output__/`.

## Manual CLI

```bash
npm run server:vcr:dev -- --chart-xml server/victory-chart-renderer/tests/fixtures/monthly-spend.xml --out /tmp/chart.png
```
