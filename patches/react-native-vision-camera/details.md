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

- Upstream PR/issue: The maintainer offered to take the fix into V5 (https://github.com/Expensify/App/pull/102898#discussion_r4315528609). Upstream PR: TODO. Drop this patch once a release with it is installed.
- E/App issue: https://github.com/Expensify/App/issues/102514
- PR introducing patch: https://github.com/Expensify/App/pull/102898
