# `expo-modules-core` patches

### [expo-modules-core+56.0.14+001+disableViewRecycling.patch](expo-modules-core+56.0.14+001+disableViewRecycling.patch)

- Reason: Opt-out from RN Fabric view recycling
- Upstream PR/issue: https://expo.canny.io/feature-requests/p/opt-out-of-react-native-fabric-view-recycling-for-expofabricviewobjc
- E/App issue: 🛑
- PR Introducing Patch: [#69649](https://github.com/Expensify/App/pull/69649)

### [expo-modules-core+56.0.14+002+worklets-adapter-boost-header-search-path.patch](expo-modules-core+56.0.14+002+worklets-adapter-boost-header-search-path.patch)

- Reason: Add the Boost pod directory to `ExpoModulesWorkletsAdapter` header search paths so RCT-Folly framework headers can resolve Boost preprocessor headers when building with frameworks.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑
