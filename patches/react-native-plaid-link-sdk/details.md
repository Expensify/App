# `react-native-plaid-link-sdk` patches

### [react-native-plaid-link-sdk+12.8.6+001+fix-oauth-hybrid-app-ios.patch](react-native-plaid-link-sdk+12.8.6+001+fix-oauth-hybrid-app-ios.patch)

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
- 12.8.6 port: upstream moved every place that drops `linkHandler` (success, exit, `dismiss`, the new `destroy`, `invalidate`) into `releaseCurrentSession`, so `sSharedInstance` is now cleared there instead of in the exit callback. The handoff path still drops `linkHandler` on its own and keeps its own clear.
