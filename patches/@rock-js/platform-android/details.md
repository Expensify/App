# `@rock-js/platform-android` patches

### [@rock-js+platform-android+0.11.9+001+missing-app-name-hybrid-case.patch](@rock-js+platform-android+0.11.9+001+missing-app-name-hybrid-case.patch)

- Reason:

    ```
    This patch adds a fallback mechanism to find Android build output files (APK/AAB) when the appName value is not properly read from the project structure. 
    In a hybrid app scenario, the Android build process generates output files with names like `Expensify-debug.apk` instead of the expected '-debug.apk' based on the project structure (no appName due to the lack of a project subfolder in Mobile-Expensify/Android). 
    ```

- Upstream PR/issue: https://github.com/callstackincubator/rock/pull/628
- E/App issue: https://github.com/Expensify/App/issues/74400
- PR introducing patch: https://github.com/Expensify/App/pull/73525

### [@rock-js+platform-android+0.11.9+002+use-zip-instead-admzip.patch](@rock-js+platform-android+0.11.9+002+use-zip-instead-admzip.patch)

- Reason:

    ```
    Fixes bundle corruption in cache and re-sign flow by replacing AdmZip with native zip commands.
    The AdmZip library was applying default compression when adding files, which corrupted artifacts (native libraries).
    This caused INSTALL_FAILED_CONTAINER_ERROR with size/crc32 mismatch errors on second builds using cache.
    The fix uses native zip commands with -0 flag (store-only compression) to prevent bundle corruption.
    ```

- Upstream PR/issue: https://github.com/callstackincubator/rock/pull/647
- E/App issue: https://github.com/Expensify/App/issues/62296
- PR introducing patch: https://github.com/Expensify/App/pull/76061