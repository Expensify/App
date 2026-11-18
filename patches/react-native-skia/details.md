# `react-native-skia` patches

The patch below was rebased from `@shopify/react-native-skia` 2.11.2 when the App moved to `react-native-skia` 2.15.5 (the package was renamed, and `victory-native` 43 depends on the new name). Five 2.11.2 patches were dropped because 2.15.5 fixes them (another one, `size-backing-store-to-painted-size`, was already removed by rendering inline charts at their fitted size, https://github.com/Expensify/App/pull/106512):

- `fix-runtime-aware-cache-uaf` (Sentry APP-AVB, https://github.com/Expensify/App/issues/90135): `RuntimeAwareCache` no longer exists. Its replacement, `JSICache`, is owned by the runtime's `global` (as `NativeState`), so it is destroyed by the runtime itself while the runtime is still valid. The HybridApp teardown order can no longer free cached JSI values into a dead runtime.
- `defer-webgl-context-loss-to-unmount` (https://github.com/Expensify/App/issues/98254): a view's `<canvas>` no longer owns a WebGL context. Every view draws on one WebGL context shared by the page and copies its frame onto its own element through a 2D context, so there is no per-element context to lose. The other half of that patch kept charts painted on a screen hidden in an `Activity` (`ScreenActivityWrapper` / `AlwaysPaintedView`). 2.15.3 and 2.15.4 cleared the canvas when its renderer was disposed, which blanked that backdrop; since 2.15.5 the bitmap is only freed once the canvas is no longer rendered (https://github.com/wcandillon/react-native-skia/pull/4439).
- `load-skia-web-fail-closed` (https://github.com/Expensify/App/issues/102042): since 2.15.4 `LoadSkiaWeb` no longer caches a failed init, and rewords a `LinkError` into a message naming the `canvaskit-wasm` version mismatch (https://github.com/wcandillon/react-native-skia/pull/4432). The check for a CanvasKit that links but comes up without its bindings was not taken as is: upstream verifies the downloaded binary against a size and SHA-256 fingerprint instead (`verifyWasm`), which is on in development only. The App serves the binary under a versioned URL (`CANVASKIT_WASM_FILENAME`), which is what prevents the mismatch in production; pass `verifyWasm: true` to `LoadSkiaWeb`'s options if a production safety net is wanted again. That URL is built from the root `canvaskit-wasm` pin in `package.json`, so it only matches the glue while that pin equals the exact `canvaskit-wasm` version `react-native-skia` depends on: when bumping Skia, bump the root pin (and `server/victory-chart-renderer/package.json`) with it.
- `redraw-texture-view-when-window-visible` (https://github.com/Expensify/App/issues/101396): fixed in 2.15.4 by https://github.com/wcandillon/react-native-skia/pull/4434, which latches the `TextureView`'s retained buffer when its window becomes visible again.
- `fallback-to-software-surface` (Sentry APP-7MV, https://github.com/Expensify/App/issues/97104): with a single shared context the per-page context limit can no longer be exhausted, which was the cause of APP-7MV. The uncatchable "Could not create surface" throw from a draw is gone since 2.15.5 (https://github.com/wcandillon/react-native-skia/pull/4441). What is left of it is the much smaller `001+report-surface-unavailable` below.

### [react-native-skia+2.15.5+001+report-surface-unavailable.patch](react-native-skia+2.15.5+001+report-surface-unavailable.patch)

- Reason:

    ```
    Keeps the "skia-surface-unavailable" contract SkiaWebChart relies on
    (useIsSkiaSurfaceUnavailable shows the "unable to display chart" empty state).

    In 2.15.5 the web renderer throws when it is created without a drawing
    surface to use: no WebGL context (hardware acceleration disabled, GPU
    blocked by the browser, or WebGL lost after the capability probe passed),
    or no 2D context for the element. That happens in a layout effect, so it
    would reach SkiaWebChart's error boundary, which shows "chart failed to
    load" and reports a CanvasKit load failure to Sentry: the wrong message
    and the wrong signal.

    The hook that creates the renderer now catches that error, leaves the view
    without a renderer, and dispatches a bubbling "skia-surface-unavailable"
    CustomEvent on the canvas (a no-op without a listener). The dispatch is
    deferred a frame because the renderer is built in a layout effect, which
    runs before the effect that attaches the listener.

    Unlike the 2.11.2 patch this does not fall back to a CanvasKit software
    surface.
    ```

- Upstream PR/issue: https://github.com/Shopify/react-native-skia/pull/3996 (2.11.2 software fallback, not merged)
- E/App issue: https://github.com/Expensify/App/issues/97104
- PR introducing patch: https://github.com/Expensify/App/pull/97219 (rebased onto 2.15.5 in the Skia 2.15.5 upgrade PR)
