# `react-native-nitro-fetch` patches

### [react-native-nitro-fetch+1.6.2+001+certificate-pinning.patch](react-native-nitro-fetch+1.6.2+001+certificate-pinning.patch)

- Reason:

    ```
    NitroFetch bypasses the app's existing certificate-pinning clients on mobile. This patch applies
    Expensify's public-key pins to both Android Cronet engines, supports monitor-only reporting via
    a separate pinned Cronet probe, enforces pins on real traffic when enabled, validates standard requests, startup prefetches, token
    refreshes, and streaming requests.
    ```

- Upstream PR/issue: None. The certificate hosts and public-key pins are specific to Expensify's application configuration and are not appropriate defaults for react-native-nitro-fetch.
- E/App issue: https://github.com/Expensify/App/issues/90023
- PR Introducing Patch: https://github.com/Expensify/App/pull/95518

### [react-native-nitro-fetch+1.6.2+002+redirect-accepts-url.patch](react-native-nitro-fetch+1.6.2+002+redirect-accepts-url.patch)

- Reason:

    ```
    `Response.redirect()` only accepts a string, while the standard signature (and React Native's global `Response`
    type) accepts `string | URL`. That makes `globalThis.Response = NitroResponse` fail to typecheck once native code
    no longer sees the DOM types. The patch accepts `string | URL` and converts it with `String(url)` before setting
    the `location` header.
    ```

- Upstream PR/issue: 🛑, upstream PR to be opened.
- E/App issue: https://github.com/Expensify/App/issues/99287
- PR introducing patch: https://github.com/Expensify/App/pull/105816
