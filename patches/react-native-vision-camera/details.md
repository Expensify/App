# `react-native-vision-camera` patches

### [react-native-vision-camera+5.2.3+001+restore-v4-shutter-muting.patch](react-native-vision-camera+5.2.3+001+restore-v4-shutter-muting.patch)

- Reason:

    ```
    VisionCamera v5 dropped two ways v4 kept the photo shutter silent, so the upgrade made receipt, odometer and
    attachment photos play the shutter sound where they did not before:

    - iOS: `enableShutterSound: false` only works on iOS 18+, through `isShutterSoundSuppressionEnabled`. On iOS 16.4-17,
      plain receipt scans and every photo taken with "Mute all sounds from Expensify" on now play the shutter sound.
      The patch restores v4's fallback below iOS 18: when the sound is disabled, it disposes the system shutter sound
      (`AudioServicesDisposeSystemSoundID(1108)`) right before capture. iOS 18+ keeps v5's own suppression.
    - Android: v4 skipped the shutter sound while the ringer was on silent or vibrate (the fix for
      https://github.com/Expensify/App/issues/39241). v5 only checks `enableShutterSound`, so the click plays on silent.
      The patch restores the ringer check. Regions that legally require the sound still play it.
    ```

- Upstream PR/issue: The maintainer offered to take the fix into V5 (https://github.com/Expensify/App/pull/102898#discussion_r4315528609). Upstream PR: https://github.com/margelo/react-native-vision-camera/pull/4228. Drop this patch once a release with it is installed.
- E/App issue: https://github.com/Expensify/App/issues/102514
- PR introducing patch: https://github.com/Expensify/App/pull/102898

### [react-native-vision-camera+5.2.3+002+unbind-own-session-only.patch](react-native-vision-camera+5.2.3+002+unbind-own-session-only.patch)

- Reason:

    ```
    On Android, every V5 CameraSession calls `cameraProvider.unbindAll()` when it configures and when it is disposed.
    The provider is shared by the whole app, so opening one camera unbinds every other mounted camera. The Scan screen
    stays mounted (inactive) under the confirmation page, so after Replace receipt opens and closes its own camera, Scan
    comes back with nothing bound and the viewfinder stays black until the screen remounts. V4 only unbound its own use
    cases. The patch makes each session remember what it bound (its `SessionConfig`, or its use cases for multi-camera)
    and unbind only that.
    ```

- Upstream PR/issue: https://github.com/margelo/react-native-vision-camera/pull/4229. Drop this patch once a release with it is installed.
- E/App issue: https://github.com/Expensify/App/issues/102514
- PR introducing patch: https://github.com/Expensify/App/pull/102898

### [react-native-vision-camera+5.2.3+003+restore-v4-ios-session-restart.patch](react-native-vision-camera+5.2.3+003+restore-v4-ios-session-restart.patch)

- Reason:

    ```
    AVFoundation stops the iOS capture session on a runtime error (for example when media services are reset) and does
    not restart it. V4 called `startRunning()` again while the camera was active. V5 only forwards the error to JS, so the
    Scan viewfinder stays empty until the user leaves the screen. The patch restarts the session if JS still wants it
    running, at most once per 5 s so a camera that keeps failing does not restart in a loop.
    ```

- Upstream PR/issue: https://github.com/margelo/react-native-vision-camera/pull/4230. Drop this patch once a release with it is installed.
- E/App issue: https://github.com/Expensify/App/issues/102514
- PR introducing patch: https://github.com/Expensify/App/pull/102898

### [react-native-vision-camera+5.2.3+004+restore-v4-ios-keep-screen-awake.patch](react-native-vision-camera+5.2.3+004+restore-v4-ios-keep-screen-awake.patch)

- Reason:

    ```
    V4 kept the iPhone screen awake while a camera was active (`UIApplication.shared.isIdleTimerDisabled = isActive`
    in `CameraView.swift`). V5 never sets the idle timer, so the screen dims and locks on Scan, the odometer camera and
    Take photo, which matters most during multi-scan. The patch sets it in `start()` and clears it in `stop()` and on
    deinit. Android is unaffected: V4 never kept the screen on there either.
    ```

- Upstream PR/issue: https://github.com/margelo/react-native-vision-camera/pull/4233. Drop this patch once a release with it is installed.
- E/App issue: https://github.com/Expensify/App/issues/102514
- PR introducing patch: https://github.com/Expensify/App/pull/102898
