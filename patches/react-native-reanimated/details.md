
# `react-native-reanimated` patches

### [react-native-reanimated+4.5.1+001+catch-all-exceptions-on-stoi.patch](react-native-reanimated+4.5.1+001+catch-all-exceptions-on-stoi.patch)

- Reason: Reanimated wasn't able to catch an exception here, so the catch clause was broadened.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: [Upgrade to React Native 0.76](https://github.com/Expensify/App/pull/51475)

### [react-native-reanimated+4.5.1+002+fix-react-native-dir-cast.patch](react-native-reanimated+4.5.1+002+fix-react-native-dir-cast.patch)

- Reason: `resolveReactNativeDirectory()` in `android/build.gradle.kts` cast the `REACT_NATIVE_NODE_MODULES_DIR` extra property directly to `String?`. In the HybridApp Android build, Mobile-Expensify sets that property to a Groovy `File` (see `Mobile-Expensify/Android/build.gradle`), so the cast threw `class java.io.File cannot be cast to class java.lang.String` during Gradle configuration. The fix drops the cast and passes the raw value straight to `file(...)`, which accepts both `String` and `File`. Same root cause as the [react-native-worklets patch](../react-native-worklets/details.md).
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: N/A (patched alongside the react-native-reanimated 4.5.1 / react-native-worklets 0.10.2 bump)
