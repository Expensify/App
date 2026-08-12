# `expo-modules-jsi` patches

### [expo-modules-jsi+57.0.4+001+fix-xcode-26-2-type-inference.patch](expo-modules-jsi+57.0.4+001+fix-xcode-26-2-type-inference.patch)

- Reason: Qualifies Swift's `abs` function to avoid an Xcode 26.2 type-inference failure when building the `ExpoModulesJSI` XCFramework in Swift 6 mode.
- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/96278
- PR introducing patch: https://github.com/Expensify/App/pull/96372
