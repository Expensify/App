# `react-native-nitro-fetch` patches

### [react-native-nitro-fetch+1.5.0.patch](react-native-nitro-fetch+1.5.0.patch)

- Reason:

    ```
    NitroFetch bypasses the app's existing certificate-pinning clients on mobile. This patch applies
    Expensify's public-key pins to both Android Cronet engines, supports monitor-only reporting via
    a separate pinned Cronet probe, enforces pins on real traffic when enabled, and gives every iOS
    URLSession a delegate so TrustKit can validate standard requests, startup prefetches, token
    refreshes, and streaming requests.
    ```

- Upstream PR/issue: None. The certificate hosts and public-key pins are specific to Expensify's application configuration and are not appropriate defaults for react-native-nitro-fetch.
- E/App issue: https://github.com/Expensify/App/issues/90023
- PR Introducing Patch: https://github.com/Expensify/App/pull/95518
