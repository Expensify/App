# victory-native patch: explicitSize + headless props

Mirrors upstream PR: <https://github.com/FormidableLabs/victory-native-xl/pull/657>

## Why

The `server/victory-chart-renderer` Bun CLI renders Expensify chart XML to PNG using
the same `CartesianChart` users see in-app, but it runs without React Native — there is no
host view to fire `onLayout`, and the existing `<Canvas>` wrapper expects to be mounted
inside one. This patch adds two opt-in props that let the CLI drive the chart with a
fixed canvas size and emit only the Skia subtree (so we can paint it onto an offscreen
surface created via `LoadSkiaWeb`):

- `explicitSize?: { width: number; height: number }` — seeds the chart's size state
  immediately, skipping the `onLayout` round-trip.
- `headless?: boolean` — when paired with `explicitSize`, returns a Skia-only `<Group>`
  containing the chart contents instead of wrapping them in `<Canvas>` and a gesture
  handler. The chart still renders identically inside React Native when neither prop is
  passed, so the in-app code path is unchanged.

The patch lives in both `src/` (consumed by Metro via the package's `react-native`
field) and `dist/` (consumed by Bun, which falls through to the `import` condition and
loads compiled JS / `.d.ts`).

A small `tsconfig.json` is also dropped into the installed package. Bun's
resolver walks up to the closest `tsconfig.json` when resolving bare specifiers
in `node_modules/victory-native/...`, so this file remaps the chart's React
Native dependencies (`react-native`, `react-native-reanimated`,
`react-native-gesture-handler`) to the stubs in
`server/victory-chart-renderer/stubs/`. Metro doesn't honor `tsconfig.json`
paths, so the in-app build is unaffected.

## Remove when

Upstream PR is merged and we upgrade `victory-native` to a release containing it.
