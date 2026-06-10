# `react-native-webview` patches

### [react-native-webview+13.16.0+001+fix-dataDetectorTypes.patch](react-native-webview+13.16.0+001+fix-dataDetectorTypes.patch)

- Reason:
  
    ```
    This patch fixes dataDetectorTypes.
    ```
  
- Upstream PR/issue: 🛑, there's no upstream PR/issue found. 
- E/App issue: https://github.com/Expensify/App/issues/8503
- PR introducing patch: https://github.com/Expensify/App/pull/13767

### [react-native-webview+13.16.0.patch](../react-native-webview+13.16.0.patch)

- Reason:
  
    ```
    Adds TrustKit certificate pinning to WKWebView's server-trust authentication challenge
    handler (didReceiveAuthenticationChallenge) in RNCWebViewImpl.m. WKWebView runs
    out-of-process and is not covered by TrustKit's NSURLSession delegate swizzling, so
    server-trust challenges for pinned domains are routed through TSKPinningValidator
    explicitly. The block is compiled out in debug builds (#if !DEBUG) so local dev
    proxies and debugging tools keep working.
    ```
  
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR introducing patch: 🛑
