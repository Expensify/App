# `expo-location` patches

### [expo-location+57.0.6+001+expose-request-timeout.patch](expo-location+57.0.6+001+expose-request-timeout.patch)

- Reason:

    ```
    Adds a `timeout` option to `LocationOptions` so `getCurrentPositionAsync` can be bounded.

    Without it the wait is unbounded on the two platforms that matter:

    - Android: `LocationHelpers.prepareCurrentLocationRequest` builds a Play Services
      `CurrentLocationRequest` and never calls `setDurationMillis()`, so the request takes Play's
      30s default. That is the 30,385ms worst case measured on the `ManualGeolocationWait` span.
      The patch forwards `timeout` to `setDurationMillis()`, which makes Play Services abandon the
      request itself at the deadline rather than leaving it running.
    - Web: `ExpoLocation.web.js` already spreads `...options` into `navigator.geolocation`'s
      `PositionOptions`, whose spec default is `timeout: Infinity`. Only the type was missing, so
      web needs no code change — just the `LocationOptions` field.

    iOS is already bounded by `CLLocationManager.requestLocation()` (p95 197.7ms), so
    `LocationOptions.swift` only declares the field to keep the Record decoder happy when the
    shared JS call site passes it.

    `src/Location.types.ts` is deliberately left untouched — the package resolves types from
    `build/`, so patching the TS source would add patch surface with no effect on the build.
    ```

- Upstream PR/issue: 🛑, not yet filed. This is a general expo gap, not an Expensify quirk, and should be upstreamed.
- E/App issue: https://github.com/callstack-internal/expensify-issues/issues/2907
- PR introducing patch: TBD
