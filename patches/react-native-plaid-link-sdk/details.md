# `react-native-plaid-link-sdk` patches

### [react-native-plaid-link-sdk+12.5.3+001+fix-oauth-hybrid-app-ios.patch](react-native-plaid-link-sdk+12.5.3+001+fix-oauth-hybrid-app-ios.patch)

- Reason:

    ```
    Fixes Plaid OAuth getting stuck in a retry loop on HybridApp iOS (e.g.
    Banco Santander ES). HybridApp routes the bank's universal-link return
    through JS Linking, so LinkKit never sees the callback URL and re-fires
    OAuth after its internal timeout. The patch exposes [PLKHandler
    resumeAfterTermination:] to JS so we can forward the URL back into the SDK.

    The patch:
    1. Adds RCT_EXPORT_METHOD(continueFromRedirectUri:) to RNLinksdk.mm.
    2. Tracks the active module via a static sSharedInstance, set when
       createPlaidLink succeeds and cleared on exit/handoff, so the
       forwarder can resolve the correct handler.
    3. Adds the matching continueFromRedirectUri Spec entry to
       src/fabric/NativePlaidLinkModuleiOS.ts (required on New Architecture
       so the TurboModule codegen exposes the method to JS).
    ```

- Upstream PR/issue: -
- E/App issue: https://github.com/Expensify/App/issues/87757
- PR introducing patch: https://github.com/Expensify/App/pull/88534

### [react-native-plaid-link-sdk+12.5.3+002+rn088-kotlin-currentActivity.patch](react-native-plaid-link-sdk+12.5.3+002+rn088-kotlin-currentActivity.patch)

- Reason:

    ```
    In React Native 0.88 `ReactContextBaseJavaModule.getCurrentActivity()` is a plain Kotlin `fun`, so the bare
    `currentActivity` property reads in `PlaidModule.kt` fail to compile. Read `reactApplicationContext.currentActivity`.
    ```

- Upstream PR/issue: Fixed upstream from 12.7.0 (12.6.0 is still broken). Drop this patch when bumping to >= 12.7.0. 13.x rewrote the Android module on Expo Modules (`expo.modules.plaidlinksdk`), which is a separate migration.
- E/App issue: https://github.com/Expensify/App/issues/101427
- PR introducing patch: TBD (RN 0.88 / Expo SDK 58 upgrade)
