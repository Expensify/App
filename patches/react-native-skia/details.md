# `react-native-skia` patches

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
