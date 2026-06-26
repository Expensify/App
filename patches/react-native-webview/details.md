# `react-native-webview` patches

### [react-native-webview+13.16.0+001+fix-dataDetectorTypes.patch](react-native-webview+13.16.0+001+fix-dataDetectorTypes.patch)

- Reason:
  
    ```
    This patch fixes dataDetectorTypes.
    ```
  
- Upstream PR/issue: 🛑, there's no upstream PR/issue found. 
- E/App issue: https://github.com/Expensify/App/issues/8503
- PR introducing patch: https://github.com/Expensify/App/pull/13767

### [react-native-webview+13.16.0+002+certificate-pinning.patch](react-native-webview+13.16.0+002+certificate-pinning.patch)

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

### [react-native-webview+13.16.0+003+certificate-pinning-android.patch](react-native-webview+13.16.0+003+certificate-pinning-android.patch)

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
