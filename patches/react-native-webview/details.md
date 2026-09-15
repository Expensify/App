# `react-native-webview` patches

### [react-native-webview+16.0.0+001+certificate-pinning.patch](react-native-webview+16.0.0+001+certificate-pinning.patch)

- Reason:
  
    ```
    Adds TrustKit certificate pinning validation to WKWebView's server-trust authentication challenge
    handler (didReceiveAuthenticationChallenge) in RNCWebViewImpl.m. WKWebView runs
    out-of-process and is not covered by TrustKit's NSURLSession delegate swizzling, so
    server-trust challenges for pinned domains are routed through TSKPinningValidator
    explicitly. Whether mismatches block the connection is controlled by kTSKEnforcePinning in
    CertificatePinning.swift. The block is compiled out in debug builds (#if !DEBUG) so local dev
    proxies and debugging tools keep working.
    ```
  
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR introducing patch: 🛑

### [react-native-webview+16.0.0+002+certificate-pinning-android.patch](react-native-webview+16.0.0+002+certificate-pinning-android.patch)

- Reason:
  
    ```
    Adds certificate pinning monitoring to the Android WebView. Android WebView does not expose a
    server-trust challenge delegate like iOS WKWebView, so the patch calls
    WebViewCertificateMonitor.validateCertificate() via reflection from RNCWebViewClient.onPageFinished.
    The monitor extracts the X509 certificate from WebView.getCertificate(), computes the SPKI
    SHA-256 hash of the leaf public key, and reports mismatches to Sentry. This closes the
    monitor-mode gap where Android WebView traffic was unmonitored (unlike iOS which monitors via
    TrustKit in the +002 patch). In debug builds the monitor is not initialized so the reflection
    call is a no-op.
    ```
  
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR introducing patch: 🛑

### Patches dropped in the 13.16.0 → 16.0.0 bump

- `fix-dataDetectorTypes` (E/App [#8503](https://github.com/Expensify/App/issues/8503), introduced by [#13767](https://github.com/Expensify/App/pull/13767)) — fixed upstream in 16.0.0: `RNCWebView.mm` now reads `newViewProps.dataDetectorTypes` and accumulates the `WKDataDetectorTypes` bitmask with separate `if`s instead of an `else if` chain.
- `fix-webview-props-type` — the `WebView<P = undefined>` regression from [#3931](https://github.com/react-native-webview/react-native-webview/pull/3931) is fixed upstream by [#3974](https://github.com/react-native-webview/react-native-webview/pull/3974), shipped in 16.0.0.
