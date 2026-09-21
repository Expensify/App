# `@rnmapbox/maps` patches

### [@rnmapbox+maps+10.3.2+001+immediate-follow-camera-transition.patch](@rnmapbox+maps+10.3.2+001+immediate-follow-camera-transition.patch)

- Reason: Removes the long "fly-in from space" animation that plays the first time a `Camera` with `followUserLocation={true}` engages follow mode (used by `GPSMapView` on the GPS distance screen). When entering follow mode, `@rnmapbox/maps` calls the Mapbox viewport transition with no explicit transition argument, so the SDK uses its `DefaultViewportTransition`, which animates from the current camera (world view / zoom ~0) all the way in to the user. Because the JS layer discards `defaultStop`/`stop` while `followUserLocation` is true (`src/components/Camera.tsx`), there is no JS-only way to seed the start position or pick an animation mode — the only lever is the native transition itself.
- Solution: Adds an opt-in `followUserLocationUseImmediateTransition` prop to `Camera`. When `true`, entering follow mode uses `makeImmediateViewportTransition()` so the camera snaps straight to the follow state. When `false` (default), upstream behavior is preserved and the default viewport transition animates. `GPSMapView` passes the prop only on initial map load when follow is active with no route; later re-engagements (center button, follow after clearing a route) pass `false` so the camera animates back to the user.
- Files changed:
  - `src/specs/RNMBXCameraNativeComponent.ts`, `src/components/Camera.tsx`, and `lib/typescript/src/components/Camera.d.ts` — new prop
  - `lib/module/components/Camera.js` — same prop pass-through in the compiled bundle. Since 10.3.2 the package has no `react-native` source entry and its exports map falls back to `lib/module`, so Metro bundles the compiled output, not `src`.
  - iOS — `ios/RNMBX/RNMBXCamera.swift`, `ios/RNMBX/RNMBXCameraComponentView.mm`, `ios/RNMBX/RNMBXCameraViewManager.m`
  - Android — `android/src/main/java/com/rnmapbox/rnmbx/components/camera/RNMBXCamera.kt` and `RNMBXCameraManager.kt`

- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/pull/90169#issuecomment-4476930634
- PR introducing patch: https://github.com/Expensify/App/pull/91418

### [@rnmapbox+maps+10.3.2+002+rn088-compat.patch](@rnmapbox+maps+10.3.2+002+rn088-compat.patch)

- Reason:

    ```
    Three build breaks on React Native 0.88 / AGP 9:
    - iOS: RN 0.87 added `fontSizeMultiplier` to `facebook::react::LayoutMetrics` (right before
      `overflowInset`). `RNMBXMarkerViewComponentView.mm` builds a new LayoutMetrics with an aggregate
      initializer, so the struct no longer compiles without the new field.
    - Android: with RN 0.88's Fresco/Kotlin metadata `CloseableStaticBitmap.underlyingBitmap` is nullable,
      so `image.underlyingBitmap.copy(...)` in `DownloadMapImageTask.kt` fails to compile. Copy null-safely
      and skip the image when the bitmap is gone.
    - Android: AGP 9 rejects `getDefaultProguardFile('proguard-android.txt')` ("no longer supported since it
      includes -dontoptimize"); use `proguard-android-optimize.txt`.
    ```

- Upstream PR/issue: iOS: https://github.com/rnmapbox/maps/pull/4295 (open). Android bitmap: https://github.com/rnmapbox/maps/pull/4297 and ProGuard: https://github.com/rnmapbox/maps/pull/4282 (both merged 2026-09-21, not in a release yet; latest is 10.3.5 from 2026-07-22). Drop the Android hunks once we bump past a release that contains them, and the iOS hunk once #4295 ships.
- E/App issue: https://github.com/Expensify/App/issues/101427
- PR introducing patch: TBD (RN 0.88 / Expo SDK 58 upgrade)
