# `expo` patches

### [expo+58.0.14+001+fix-hmrclient-race-condition.patch](expo+58.0.14+001+fix-hmrclient-race-condition.patch)

- Reason:

    ```
    On native platforms, HMRClient.setup() is called asynchronously from native code (DevServerHelper.cpp),
    but registerBundle() can be called synchronously during module loading when a dynamic import() triggers.
    This race condition causes a crash: "Expected HMRClient.setup() call at startup."
    The fix queues entry points in pendingEntryPoints when hmrClient is not yet initialized,
    matching the existing pattern used by the log() method. Queued entry points are processed
    when setup() eventually calls registerBundleEntryPoints().

    Expo SDK 58 packages (expo-image, expo-audio, expo-video, ...) import from `expo`, so `expo/build/Expo.fx.js`
    runs at startup on native and installs Expo's lazy-bundle loader. Without the patch the first `import()` during
    startup asserts and the app hangs on the splash screen. The patch edits the shipped `build/async-require/hmr.js`,
    because `src/` is only reachable through the `expo-source` export condition, which no bundler here enables.
    ```

- Upstream PR/issue: https://github.com/expo/expo/pull/43864 (same change, closed without merging). Still unfixed in 58.0.14.
- E/App issue: https://github.com/Expensify/App/issues/75120
- PR introducing patch: https://github.com/Expensify/App/pull/79962
