# @shopify/react-native-skia patch: local tsconfig for Bun headless renderer

## Why

The `server/victory-chart-renderer` Bun CLI renders Skia content without React
Native. Bun (and any other non-RN consumer) loads `@shopify/react-native-skia`'s
root entry, which transitively imports `react-native`,
`react-native-reanimated`, and `react-native/Libraries/...` subpaths. None of
those packages run in Bun.

This patch drops a minimal `tsconfig.json` inside the installed package so that
when Bun resolves imports from files in `node_modules/@shopify/react-native-skia/...`
it walks up to this `tsconfig.json` and remaps the React Native dependencies to
the stubs in `server/victory-chart-renderer/stubs/`. Metro doesn't consult
`tsconfig.json` paths, so the in-app build is unaffected.

## Remove when

We replace the Bun renderer with a different mechanism, or the Skia package
ships a `bun` export condition (or equivalent) that lets us load a stripped
entry without React Native dependencies.
