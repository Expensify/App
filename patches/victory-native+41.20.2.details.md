# victory-native patch: explicitSize + headless props

Mirrors upstream PR: <https://github.com/FormidableLabs/victory-native-xl/pull/657>

## Why

Expensify is building a Bun CLI that renders in-app `victory-native` charts to PNG using
the same `CartesianChart` and `PolarChart` users see in-app, but without a React Native
layout pass. This patch adds opt-in layout props:

- `explicitSize?: { width: number; height: number }` — seeds chart dimensions immediately
  instead of waiting for `onLayout`.
- `headless?: boolean` — when paired with `explicitSize`, renders a Skia-only `<Group>`
  subtree (no `GestureHandlerRootView`, `View`, or `Canvas` wrapper) for headless
  `@shopify/react-native-skia` reconcilers.

Both props default to `undefined`; existing in-app callers are unchanged.

## Packaging notes

The published `victory-native` package ships both `src/` and `dist/`:

- Metro resolves `src/` via the package `react-native` export condition.
- Bun and Node resolve compiled `dist/` via the `import` condition.

This patch updates **both** trees. `dist/` was regenerated from the patched `src/` using
the upstream `tsconfig.build.json` in `victory-native-xl/lib` (v41.20.2 base + PR diff
applied with `patch -p2`).

## Remove when

Upstream PR is merged and we upgrade `victory-native` to a release that includes it.
