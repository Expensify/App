# `@shopify/react-native-skia` patches

### [@shopify+react-native-skia+2.4.14+001+fix-runtime-aware-cache-uaf.patch](@shopify+react-native-skia+2.4.14+001+fix-runtime-aware-cache-uaf.patch)

- Reason:

    ```
    Fixes an intermittent UAF crash (EXC_BAD_ACCESS / SIGSEGV; Sentry APP-AVB) when
    switching from NewDot to Expensify Classic on iOS HybridApp. RuntimeAwareCache
    only tracks the lifecycle of secondary runtimes; for the primary runtime it
    assumes the cache owner dies first. The HybridApp handoff breaks that - it tears
    down the RN runtime while Skia host objects are still being released on the main
    queue, so ~RuntimeAwareCache destroys cached jsi::Function entries into freed
    runtime memory.

    Fix: extend skia's own secondary-runtime handling to the primary runtime -
    register a RuntimeLifecycleMonitor listener (from get(), on the JS thread) and
    clear _primaryCache in onRuntimeDestroyed, while the runtime is still valid,
    instead of in the later main-queue destructor. A mutex makes that teardown
    race-safe; no memory is leaked.
    ```

- Upstream PR/issue:
- E/App issue: https://github.com/Expensify/App/issues/90135
- PR introducing patch: https://github.com/Expensify/App/pull/93295

### [@shopify+react-native-skia+2.4.14+002+fallback-to-software-surface.patch](@shopify+react-native-skia+2.4.14+002+fallback-to-software-surface.patch)

- Reason:

    ```
    Fixes an uncatchable crash on web (Sentry APP-7MV: "failed to create webgl
    context: err 0") when the browser cannot create a WebGL2 context - hardware
    acceleration disabled, GPU blocklisted, or the per-page live context limit
    exhausted.

    WebGLRenderer.onResize() calls CanvasKit.MakeWebGLCanvasSurface(canvas), which
    throws instead of returning null when no context can be created. onResize runs
    from a ResizeObserver callback, so the throw escapes as an unhandled error that
    no try/catch or React error boundary can reach, and the chart area is left blank.
    Guarding at the call site cannot prevent this: a capability check runs when the
    chart mounts, but the context is created much later, after the CanvasKit WASM
    module loads.

    Fix: catch the failure and fall back to CanvasKit.MakeSWCanvasSurface, so the
    chart still renders (on the CPU) instead of crashing the page. If that also
    fails, leave this.surface null - the constructor already initialises it to null
    and both draw() and makeImageSnapshot() null-check it. This mirrors the sibling
    renderPictureToSurface path, which already treats a failed WebGL surface as
    recoverable rather than fatal. Charts on capable clients are unaffected and
    still render through WebGL.
    ```

- Upstream PR/issue: 🛑 TODO — the same defensive handling should be sent upstream so `onResize` matches the already-guarded `renderPictureToSurface` path.
- E/App issue: https://github.com/Expensify/App/issues/97104
- PR introducing patch: https://github.com/Expensify/App/pull/97219
