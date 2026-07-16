# `react-native-nitro-fetch` patches

### [react-native-nitro-fetch+1.5.0.patch](react-native-nitro-fetch+1.5.0.patch)

- Reason:

    ```
    NitroFetch uses Cronet on Android, so requests made through it bypass the React Native OkHttp
    client configured by CertificatePinning.install(). This patch applies Expensify's public-key
    pins to both NitroFetch Cronet engines and prevents local trust anchors from bypassing pinning
    in release builds.
    ```

- Upstream PR/issue: None. The certificate hosts and public-key pins are specific to Expensify's application configuration and are not appropriate defaults for react-native-nitro-fetch.
- E/App issue: https://github.com/Expensify/App/issues/90023
- PR Introducing Patch: https://github.com/Expensify/App/pull/95518
