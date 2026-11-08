# `mapbox-gl` patches

### [mapbox-gl+3.24.0+001+guard-null-telemetry-error-callback.patch](mapbox-gl+3.24.0+001+guard-null-telemetry-error-callback.patch)

- Reason:

    ```
    `Map.remove()` calls `remove()` on the shared `MapLoadEvent` and `MapSessionAPI` telemetry singletons, which sets their
    `errorCb` to `null` without cancelling the telemetry request already in flight. When that request fails after the map is
    gone, its callback in `processRequests` calls `this.errorCb(e)` on the nulled field and throws
    `TypeError: this.errorCb is not a function` as an unhandled rejection (Sentry APP-FR5). On web this happens when the user
    leaves the distance map before the request to events.mapbox.com settles.

    The patch only calls `errorCb` while it is still set, in both `processRequests` callbacks in `dist/mapbox-gl.js`, the
    bundle `react-map-gl/mapbox` loads. Telemetry itself is unchanged. The bundle is minified onto a few very long lines,
    which is why the patch file is large for a two-expression change.
    ```

- Upstream PR/issue: https://github.com/mapbox/mapbox-gl-js/issues/13735, fixed upstream in https://github.com/mapbox/mapbox-gl-js/commit/8a04af5eb487d328457dfdd7ad25e5f656255c40, which ships in v3.36. Remove this patch when we upgrade to that version.
- E/App issue: https://github.com/Expensify/App/issues/100845
- PR introducing patch: https://github.com/Expensify/App/pull/106319
