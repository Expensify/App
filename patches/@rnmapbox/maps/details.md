# `@rnmapbox/maps` patches

### [@rnmapbox+maps+10.1.44+001+immediate-follow-camera-transition.patch](@rnmapbox+maps+10.1.44+001+immediate-follow-camera-transition.patch)

- Reason: Removes the long "fly-in from space" animation that plays the first time a `Camera` with `followUserLocation={true}` engages follow mode (used by `GPSMapView` on the GPS distance screen). When entering follow mode, `@rnmapbox/maps` calls the Mapbox viewport transition with no explicit transition argument, so the SDK uses its `DefaultViewportTransition`, which animates from the current camera (world view / zoom ~0) all the way in to the user. Because the JS layer discards `defaultStop`/`stop` while `followUserLocation` is true (`src/components/Camera.tsx`), there is no JS-only way to seed the start position or pick an animation mode — the only lever is the native transition itself.
- Solution: Adds an opt-in `followUserLocationUseImmediateTransition` prop to `Camera`. When `true`, entering follow mode uses `makeImmediateViewportTransition()` so the camera snaps straight to the follow state. When `false` (default), upstream behavior is preserved and the default viewport transition animates. `GPSMapView` passes the prop only on initial map load when follow is active with no route; later re-engagements (center button, follow after clearing a route) pass `false` so the camera animates back to the user.
- Files changed:
  - `src/specs/RNMBXCameraNativeComponent.ts`, `src/components/Camera.tsx`, and `lib/typescript/src/components/Camera.d.ts` — new prop
  - iOS — `ios/RNMBX/RNMBXCamera.swift`, `ios/RNMBX/RNMBXCameraComponentView.mm`, `ios/RNMBX/RNMBXCameraViewManager.m`
  - Android — `android/src/main/java/com/rnmapbox/rnmbx/components/camera/RNMBXCamera.kt` and `RNMBXCameraManager.kt`

- Upstream PR/issue: 🛑
- E/App issue: TBD
- PR introducing patch: TBD
