# Facet (@ecrindigital/facetpack) Metro spike

Spike branch: `rory-oxc-loader-v2`

Reference: [Facet](https://facet.ecrin.digital/)

## Setup

The advertised one-liner uses `withFacet` but the published API is `withFacetpack` from `@ecrindigital/facetpack@0.2.0`.

Expensify requires additional Metro config beyond the one-liner:

1. **Module aliases** — OXC does not run Babel's `module-resolver`, so `@libs`, `@components`, etc. must be resolved at the Metro layer via a custom `resolveRequest`.
2. **Skip Facet's resolver** — Facet's custom resolver breaks alias resolution and Node built-ins (`fs` in `canvaskit-wasm`). We keep Facet's OXC transformer but retain our resolver.
3. **Font assets** — Added `woff`, `woff2`, `ttf`, `otf` to `assetExts` so aliased font `require()` calls resolve correctly.

## Benchmarks

Method: `scripts/benchmark-metro.sh` runs `react-native bundle --dev true` for iOS on the same machine (Apple Silicon, Node 20.20.2).

| Scenario | Babel (baseline) | Facet | Delta |
|----------|------------------|-------|-------|
| Cold (`--reset-cache`) | 86.34s | 36.24s | **2.4× faster** |
| Warm (cached) | 13.14s | 12.24s | ~7% faster |
| Bundle size | 81.2 MB | 70.3 MB | **13% smaller** |

Live Metro dev server bundle (warm): ~13s, 70.3 MB — matches benchmark.

## Smoke test

| Check | Result |
|-------|--------|
| Metro starts with Facet config | Pass |
| `react-native bundle` (cold) | Pass |
| Live bundle from `http://localhost:8081/index.bundle?platform=ios&dev=true` | Pass |
| agent-device app launch (physical iPhone) | Fail — CoreDeviceError 10002 (device trust/unlock) |
| agent-device app launch (simulator) | Fail — dev build not installed on simulator |

## Risks / follow-ups

- **Not a true one-liner** for Expensify — alias resolver shim is required unless we migrate aliases to Metro-native resolution everywhere.
- **Babel fallback still needed** for Reanimated worklets, React Compiler, FullStory annotation, and `node_modules` transforms. Facet handles this automatically for worklets/node_modules but React Compiler is not applied by OXC.
- **Production builds** intentionally unchanged (Facet only enabled in dev).
- **Bundle size delta** may reflect different minification/transform paths; needs validation that runtime behavior matches Babel output.
- **HybridApp** smoke test on simulator requires installing a dev build built against this Metro config.

## Recommendation

Promising for **dev Metro cold-start** (~2.4× improvement). Worth a deeper spike on:

1. React Compiler compatibility (how many files fall back to Babel?)
2. Full HybridApp device QA after installing a dev build
3. Whether alias resolution can move out of Babel entirely (single source of truth)
