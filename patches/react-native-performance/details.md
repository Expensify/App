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
