# `react-native-worklets` patches

### [react-native-worklets+0.10.2+001+fix-react-native-dir-cast.patch](react-native-worklets+0.10.2+001+fix-react-native-dir-cast.patch)

- Reason: `resolveReactNativeDirectory()` in `android/build.gradle.kts` cast the `REACT_NATIVE_NODE_MODULES_DIR` extra property directly to `String?`. In the HybridApp Android build, Mobile-Expensify sets that property to a Groovy `File` (see `Mobile-Expensify/Android/build.gradle`), so the cast threw `class java.io.File cannot be cast to class java.lang.String` during Gradle configuration. The fix drops the cast and passes the raw value straight to `file(...)`, which accepts both `String` and `File`.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: N/A (patched alongside the react-native-worklets 0.10.2 bump)
