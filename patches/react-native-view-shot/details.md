# `react-native-view-shot` patches

### [react-native-view-shot+6.2.1+001+swiftpm-name.patch](react-native-view-shot+6.2.1+001+swiftpm-name.patch)

- Reason:

    ```
    This patch declares the library's Swift Package Manager name (`swiftpmConfig.name`) in its `package.json`.
    The library's `Package.swift` calls its product `ReactNativeViewShot`, but without a declared name React Native's
    SwiftPM autolinking names the library after its podspec (`react-native-view-shot`) and the build fails with
    "product 'react-native-view-shot' ... not found in package 'react-native-view-shot'".
    The field is only read by the SwiftPM tooling, so the patch has no effect on the CocoaPods build.
    ```

- Upstream PR/issue: https://github.com/gre/react-native-view-shot/pull/777
- E/App issue: https://github.com/Expensify/App/issues/96908
- PR introducing patch: https://github.com/Expensify/App/pull/108233
