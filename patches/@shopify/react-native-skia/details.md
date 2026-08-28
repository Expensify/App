# `@shopify/react-native-skia` patches

### [@shopify+react-native-skia+2.11.0+001+fix-runtime-aware-cache-uaf.patch](@shopify+react-native-skia+2.11.0+001+fix-runtime-aware-cache-uaf.patch)

- Reason:

    ```
    Fixes an intermittent UAF crash (EXC_BAD_ACCESS / SIGSEGV; Sentry APP-AVB) when
    switching from NewDot to Expensify Classic on iOS HybridApp. RuntimeAwareCache
    only tracks the lifecycle of secondary runtimes; for the primary runtime it
    assumes the cache owner dies first. The HybridApp handoff breaks that - it tears
    down the RN runtime while the cache owner is still being released on the main
    queue, so ~RuntimeAwareCache destroys cached JSI values into freed runtime
    memory.

    Fix: extend skia's own secondary-runtime handling to the primary runtime -
    register a RuntimeLifecycleMonitor listener (from get(), on the JS thread) and
    reset _primaryCache in onRuntimeDestroyed, while the runtime is still valid,
    instead of in the later main-queue destructor. A mutex makes that teardown
    race-safe; no memory is leaked.
    ```

- Upstream PR/issue:
- E/App issue: https://github.com/Expensify/App/issues/90135
- PR introducing patch: https://github.com/Expensify/App/pull/93295

### [@shopify+react-native-skia+2.11.0+002+fallback-to-software-surface.patch](@shopify+react-native-skia+2.11.0+002+fallback-to-software-surface.patch)

- Reason:

    ```
    Fixes an uncatchable crash on web (Sentry APP-7MV: "failed to create webgl
    context: err 0") when the browser cannot create a WebGL2 context - hardware
    acceleration disabled, GPU blocklisted, or the per-page live context limit
    exhausted.

    WebGLRenderer throws in two places when that happens: its constructor, where
    GetWebGLContext / MakeWebGLContext fail, and onResize(), where
    MakeOnScreenGLSurface returns null. The constructor runs from a layout effect,
    so its throw tears down the view tree; onResize runs from a ResizeObserver
    callback, so its throw escapes as an unhandled error that no try/catch or React
    error boundary can reach, and the chart area is left blank. Guarding at the call
    site cannot prevent either: a capability check runs when the chart mounts, but
    the context is created much later, after the CanvasKit WASM module loads.

    Fix: keep the renderer alive without a GrDirectContext and fall back to
    CanvasKit.MakeSWCanvasSurface in onResize, so the chart still renders (on the
    CPU) instead of crashing the page. If that also fails, leave this.surface null -
    the constructor already initialises it to null and both draw() and
    makeImageSnapshot() null-check it. This mirrors the sibling
    renderPictureToSurface path, which already treats a failed WebGL surface as
    recoverable rather than fatal. Charts on capable clients are unaffected and
    still render through WebGL.

    The software fallback is only used when the canvas can actually provide a 2D
    context. MakeSWCanvasSurface just stores the canvas and calls getContext("2d")
    later, when the surface is flushed, so a canvas that already holds a WebGL
    context (one whose chart rendered before WebGL became unavailable, or one where
    only MakeWebGLContext failed) would return null there and turn into an
    uncatchable "Cannot read properties of null (reading 'putImageData')". Checking
    the 2D context up front keeps that case stable.

    When no surface can be created at all, the renderer dispatches a bubbling
    "skia-surface-unavailable" CustomEvent on its canvas (a no-op without a listener).
    A capability check cannot cover this case - it runs at chart mount while the
    context is created only after the CanvasKit WASM module loads - so the event is
    the only reliable signal, and SkiaWebChart uses it to swap in its "unable to
    display chart" empty state instead of leaving a blank canvas. The dispatch is
    deferred a frame because the renderer is built in a layout effect, which runs
    before the effect that attaches the listener.
    ```

- Upstream PR/issue: https://github.com/Shopify/react-native-skia/pull/3996
- E/App issue: https://github.com/Expensify/App/issues/97104
- PR introducing patch: https://github.com/Expensify/App/pull/97219
