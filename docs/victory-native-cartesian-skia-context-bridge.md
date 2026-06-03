# Victory Native: Cartesian chart Skia context bridge

## Problem

Custom React components rendered inside `CartesianChart` (including the `renderOutside` callback) cannot read React context from ancestors above the chart—for example, a `ChartFontsProvider` wrapping the HTML Victory chart tree.

This surfaces as runtime errors such as:

```text
useChartTypefaces must be used within ChartFontsProvider
```

The failure occurs in Skia overlay components (`VictoryChartLabel`, `VictoryChartLegend`) even when the provider is correctly placed on the main React tree (`BaseVictoryChartRenderer`).

## Cause

`victory-native` draws charts inside `@shopify/react-native-skia`’s `<Canvas>`, which uses a **separate React reconciler**. Context from the host app does not cross into that tree unless it is explicitly bridged.

| Chart type        | Context bridge (`its-fine`) | Notes                                      |
| ----------------- | --------------------------- | ------------------------------------------ |
| `PolarChart`      | Yes                         | Added in [victory-native-xl#440](https://github.com/FormidableLabs/victory-native-xl/pull/440) |
| `CartesianChart`  | No                          | `children` and `renderOutside` run inside `<Canvas>` without a bridge |

`ChartWrapper` already exposes `wrapCanvasContent` for this purpose; `PolarChart` uses it, `CartesianChart` does not.

## Impact on Expensify App

Victory HTML charts load default typefaces via `ChartFontsProvider` and consume them with `useChartTypefaces()` in label/legend components. After moving font loading into that provider, cartesian overlays broke until we added **nested** `ChartFontsProvider` instances inside `renderOutside` (and polar children)—which reloads fonts and duplicates logic.

## Proposed upstream solution

**Repository:** [FormidableLabs/victory-native-xl](https://github.com/FormidableLabs/victory-native-xl) (npm package: `victory-native`)

**Change:** Give `CartesianChart` the same `its-fine` pattern as `PolarChart`:

1. Wrap the cartesian chart entry in `<FiberProvider>` (from `its-fine`, already a dependency).
2. In the component that renders `ChartWrapper`, call `useContextBridge()` and pass  
   `wrapCanvasContent={(content) => <Bridge>{content}</Bridge>}`  
   (omit in headless mode, matching polar).

All canvas content—including `children(renderArg)` and `renderOutside(renderArg)`—is built into `chartContent` and passed through `ChartWrapper`, so one bridge covers both.

**Scope:** Small parity fix; no new public API. Aligns with the intent of [#433](https://github.com/FormidableLabs/victory-native-xl/issues/433) / [#440](https://github.com/FormidableLabs/victory-native-xl/pull/440).

**Suggested PR title:** `Add its-fine context bridge to CartesianChart (parity with PolarChart)`

## App workaround (until upstream ships)

Until a `victory-native` release includes the bridge:

- Keep a single `ChartFontsProvider` on `BaseVictoryChartRenderer` for `VictoryChartProvider` / tree parsing.
- Add nested providers (or a local `its-fine` bridge) at Skia boundaries where context is still missing—today: `VictoryChartCartesian` `renderOutside` and `VictoryChartPolar` children.

After upgrading to a fixed `victory-native` version, remove nested providers and rely on the outer provider only.
