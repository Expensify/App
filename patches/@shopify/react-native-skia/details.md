# `@shopify/react-native-skia` patches

### [@shopify+react-native-skia+2.4.18+001+fix-runtime-aware-cache-uaf.patch](@shopify+react-native-skia+2.4.18+001+fix-runtime-aware-cache-uaf.patch)

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

### [@shopify+react-native-skia+2.4.18+002+fallback-to-software-surface.patch](@shopify+react-native-skia+2.4.18+002+fallback-to-software-surface.patch)

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

    The software fallback is only used when the canvas can actually provide a 2D
    context. MakeSWCanvasSurface just stores the canvas and calls getContext("2d")
    later, when the surface is flushed, so a canvas that already holds a WebGL
    context (one whose chart rendered before WebGL became unavailable) would return
    null there and turn into an uncatchable "Cannot read properties of null (reading
    'putImageData')". Checking the 2D context up front keeps that case stable.

    When no surface can be created at all, the renderer dispatches a bubbling
    "skia-surface-unavailable" CustomEvent on its canvas (a no-op without a listener).
    A capability check cannot cover this case - it runs at chart mount while the
    context is created only after the CanvasKit WASM module loads - so the event is
    the only reliable signal, and SkiaWebChart uses it to swap in its "unable to
    display chart" empty state instead of leaving a blank canvas.
    ```

- Upstream PR/issue: https://github.com/Shopify/react-native-skia/pull/3996 — applies the same defensive handling (and the `skia-surface-unavailable` event) to upstream `main`, where the throws now live in the renderer constructor and `onResize`. Once it ships in a release we consume, this patch can be dropped.
- E/App issue: https://github.com/Expensify/App/issues/97104
- PR introducing patch: https://github.com/Expensify/App/pull/97219

### [@shopify+react-native-skia+2.4.18+003+fix-dispose-symbol-eval.patch](@shopify+react-native-skia+2.4.18+003+fix-dispose-symbol-eval.patch)

- Reason:

    ```
    Fixes two iOS failures with one cause: the Top merchants pie chart killing the app
    (Sentry APP-K19, fatal unhandled "SyntaxError: Parsing source code unsupported:
    Symbol.for('Symbol.dispose');"), and every Line and Bar chart sitting on an indefinite
    loading spinner because their fonts never load.

    JsiHostObject::get() falls back to a "dispose symbol" check for any property it does
    not recognise, and that check calls jsi::eval(). Hermes without a runtime compiler
    rejects that, so any unknown property read on a Skia host object throws instead of
    returning undefined:

    - Pie: <Path path={Skia.Path.Make()} /> reaches skia's ReanimatedRecorder, whose
      isSharedValue worklet reads _isReanimatedSharedValue on the SkPath. Nothing catches
      the throw, so the app terminates.
    - Line/Bar: Skia.Data.fromURI resolves with an SkData host object and promise
      resolution reads .then on it, so every typeface load rejects, the font manager is
      never built, and the charts never leave their loading state.

    Fix: obtain the symbol through runtime.global() instead of eval.
    ```

- Upstream PR/issue: https://github.com/Shopify/react-native-skia/pull/3855 — the same fix, merged upstream on 2026-05-26. Drop this patch once the Skia dependency is bumped to >= 2.6.9.
- E/App issue: https://github.com/Expensify/App/issues/98331, https://github.com/Expensify/App/issues/95905
- PR introducing patch: https://github.com/Expensify/App/pull/98437
