# `expo` patches

### [expo+58.0.0-preview.3+001+fix-hmrclient-race-condition.patch](expo+58.0.0-preview.3+001+fix-hmrclient-race-condition.patch)

- Reason:

    ```
    On native platforms, HMRClient.setup() is called asynchronously from native code (DevServerHelper.cpp),
    but registerBundle() can be called synchronously during module loading when a dynamic import() triggers.
    This race condition causes a crash: "Expected HMRClient.setup() call at startup."
    The fix queues entry points in pendingEntryPoints when hmrClient is not yet initialized,
    matching the existing pattern used by the log() method. Queued entry points are processed
    when setup() eventually calls registerBundleEntryPoints().
    ```

- SDK 58 / RN 0.88 update: SDK 58 packages (expo-image, expo-audio, expo-video, ...) import from `expo` instead of
  `expo-modules-core`, so `expo/build/Expo.fx.js` now runs at startup on native and installs Expo's lazy-bundle
  loader. The shipped `build/async-require/hmr.js` is what executes, so the patch now covers `build/` as well as
  `src/`; without it the first `import()` during startup asserts and the app hangs on the splash screen.
- Upstream PR/issue: https://github.com/expo/expo/pull/43864 (same change, closed as a stale draft on 2026-05-12; https://github.com/expo/expo/issues/43627 is closed but still reported). The assert is still present in `expo@58.0.0-canary-20260909`, so a fresh upstream PR is needed. See also https://github.com/Expensify/App/issues/101427
- E/App issue: https://github.com/Expensify/App/issues/75120
- PR introducing patch: https://github.com/Expensify/App/pull/79962
