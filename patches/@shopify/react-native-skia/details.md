# `@shopify/react-native-skia` patches

### [@shopify+react-native-skia+2.11.2+001+fix-runtime-aware-cache-uaf.patch](@shopify+react-native-skia+2.11.2+001+fix-runtime-aware-cache-uaf.patch)

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

### [@shopify+react-native-skia+2.11.2+002+fallback-to-software-surface.patch](@shopify+react-native-skia+2.11.2+002+fallback-to-software-surface.patch)

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

    GetWebGLContext does not return a falsy handle when the browser refuses the
    context outright - it throws ("failed to create webgl context") - so the
    constructor wraps it in a try/catch and treats a throw like a falsy handle.
    Without that, the exhausted-context-limit case would never reach the fallback.

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
### [@shopify+react-native-skia+2.11.2+003+defer-webgl-context-loss-to-unmount.patch](@shopify+react-native-skia+2.11.2+003+defer-webgl-context-loss-to-unmount.patch)

- Reason:

    ```
    Fixes charts staying permanently blank on web whenever React re-runs the
    layout effects of a mounted <Canvas> on the same DOM node: a screen wrapped
    in React <Activity> being hidden and revealed (the ScreenActivityWrapper
    rollout) and StrictMode's DEV double-invoke.

    The effect cleanup calls WebGLRenderer.dispose(), which lost the WebGL
    context of the <canvas>. Per the WEBGL_lose_context spec that loss is
    permanent for the element, so the renderer the re-run creates on the same
    element can never get a surface again: CanvasKit.MakeWebGLCanvasSurface
    throws "Cannot read properties of null (reading 'rangeMin')", which patch
    002 turns into the "unable to display chart" fallback.

    dispose() now only loses the context when the canvas has left the
    document, and defers that check by a microtask. The deferral is needed
    because in 2.11.2 the renderer is created and disposed from a
    useLayoutEffect, whose cleanup React flushes *before* it detaches the host
    node - isConnected is still true at cleanup time even on a real unmount,
    so an immediate check would never release anything. A microtask runs once
    the commit is over, by which point a real unmount has detached the node
    and the context is released deterministically (browsers cap a page at ~16
    live contexts). This is the same deferral upstream uses, for the same
    reason. An Activity hide or a StrictMode re-run keeps the element
    connected, so the context and the last presented frame survive and the
    next renderer builds its surface on the live context like the resize path
    already does. The kept frame matters because ScreenActivityWrapper keeps
    the hidden screen painted as a static backdrop (AlwaysPaintedView).

    Only the WEBGL_lose_context call is guarded. Everything 2.11.2's dispose()
    frees around it - the surface, the GrDirectContext and the CanvasKit
    context handle - still goes at every cleanup, so a hidden screen holds
    nothing but the context and its drawing buffer. The handle is deleted
    before the deferred loseContext() runs; losing a context goes through the
    element's own extension object and does not depend on CanvasKit's
    registry.

    One case gets worse than before: a screen unmounted while hidden. Its
    cleanup already ran at hide time, when the canvas was still connected, so
    React runs none at unmount and the context, with its full-size drawing
    buffer, is only reclaimed by the browser's LRU force-loss once the cap is
    hit. Before the patch every unmount, background screen or not, released
    its context. Mounted screens are unchanged, each held a live context
    before Activity too. Upstream #4002 skips the same release, but it is
    less exposed: it also zeroes the canvas size on cleanup, freeing the
    drawing buffer, so only the context slot survives there. That size reset
    is what would blank the backdrop, which is why this patch does not copy
    it.
    ```

- Upstream PR/issue: https://github.com/Shopify/react-native-skia/issues/3976, fixed by https://github.com/Shopify/react-native-skia/pull/4002 (merged 2026-09-02, not in any release as of 2026-09-16; the latest is 2.11.2 and 2.12.0-next.1 does not carry it either). Its dispose() applies the same isConnected guard (deferred by a microtask, since its caller is a layout effect) and adds context-restore handling, but it also zeroes the canvas size on cleanup, so a hidden Activity screen would show a blank chart in the backdrop. When the Skia dependency is bumped past that merge, either accept the blank backdrop and drop this patch or replace it with a patch that only removes the size reset.
- E/App issue: https://github.com/Expensify/App/issues/98254
- PR introducing patch: https://github.com/Expensify/App/pull/100714
