# `react-native-worklets` patches

### [react-native-worklets+0.7.2+001+fix-app-crash-SerializableRemoteFunction.patch](react-native-worklets+0.7.2+001+fix-app-crash-SerializableRemoteFunction.patch)

- Reason: Fixes SIGSEGV crash in `SerializableRemoteFunction` destructor caused by a data race on `globalMarkdownWorkletRuntime`. The fix replaces the stored `jsi::Value` function reference with an ID-based lookup via a `__remoteFunctionCache` map, avoiding the unsafe cross-thread `~jsi::Value()` call during runtime teardown.

- Upstream PR/issue: N/A (patch authored by the `react-native-worklets` maintainer in https://github.com/Expensify/react-native-live-markdown/pull/752#issuecomment-3953415007)
- E/App issue: https://github.com/Expensify/App/issues/82146
- PR Introducing Patch: [#83792](https://github.com/Expensify/App/pull/83792)
