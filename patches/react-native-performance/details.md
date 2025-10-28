# `react-native-performance` patches

### [react-native-performance+5.1.4+001+fix-soft-crash-by-checking-for-active-react-instance.patch](react-native-performance+5.1.4+001+fix-soft-crash-by-checking-for-active-react-instance.patch)

- Reason:

    ```
    `react-native-performance` emits some events using `RCTDeviceEventEmitter` on Android. Emitter should be used only after react instance has been created.
    Otherwise, soft exception is thrown:
      
      ```
      raiseSoftException(callWithExistingReactInstance(callFunctionOnModule("RCTDeviceEventEmitter", "emit"))): Execute: reactInstance is null. Dropping work.
      ```
    ```

- Upstream PR/issue: https://github.com/oblador/react-native-performance/pull/117
- E/App issue: https://github.com/Expensify/App/issues/66231
- PR introducing patch: https://github.com/Expensify/App/pull/66230

### [react-native-performance+5.1.4+002+fix-listeners-memory-leak.patch](react-native-performance+5.1.4+002+fix-listeners-memory-leak.patch)

- Reason:

    ```
    `react-native-performance` has a memory leak where ReactMarker listeners are not properly removed when the module is destroyed.
    Additionally, `setupListener()` can be called multiple times when `getPackages()` is called multiple times, causing duplicate listeners.
    This patch:
    1. Extracts listeners to class fields to avoid duplication and enable later removal
    2. Properly removes listeners in the `invalidate()` method
    3. Fixes the logic in `removeListener()` to only remove if the listener exists
    ```

- Upstream PR/issue: https://github.com/oblador/react-native-performance/pull/118
- E/App issue: https://github.com/Expensify/App/issues/72343
- PR introducing patch: https://github.com/Expensify/App/pull/72341
