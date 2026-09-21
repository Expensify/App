# `@expensify/react-native-live-markdown` patches

### [@expensify+react-native-live-markdown+0.1.336+001+rn088-compat.patch](@expensify+react-native-live-markdown+0.1.336+001+rn088-compat.patch)

- Reason:

    ```
    - iOS: React Native 0.87 removed `RCTCxxBridge`, which `LiveMarkdownModule.install` used to reach the JSI
      runtime. Inject the bindings from `installJSIBindingsWithRuntime:callInvoker:` instead
      (`RCTTurboModuleWithJSIBindings`, called by `RCTTurboModuleManager` when the TurboModule is created);
      `install()` stays as a no-op so the JS side keeps working unchanged.
    - Android: in React Native 0.88 `TextLayoutManager.measureText` gained a trailing `TextEffectRegistry`
      parameter, so the `latest` `CustomFabricUIManager` override must pass `getTextEffectRegistry()`.
    ```

- Upstream PR/issue: None yet: `main` of https://github.com/Expensify/react-native-live-markdown still has both call sites (only #776 "[HOLD for RN 0.88]" exists, about parser registration). Upstream PRs to be opened as part of the RN 0.88 upgrade; drop this patch once a release contains them.
- E/App issue: https://github.com/Expensify/App/issues/101427
- PR introducing patch: TBD (RN 0.88 / Expo SDK 58 upgrade)
