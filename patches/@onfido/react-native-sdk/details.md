# `@onfido/react-native-sdk` patches

### [@onfido+react-native-sdk+15.1.0+001+type-native-event-payloads.patch](@onfido+react-native-sdk+15.1.0+001+type-native-event-payloads.patch)

- Reason:

    ```
    The SDK ships its TypeScript source, so the App type-checks it. Under the React Native Strict TypeScript API
    (the default since React Native 0.87), `NativeEventEmitter` types every listener argument as `Object` unless it
    is given an event map, so the SDK's analytics, media and biometric token listeners no longer typecheck. React
    Native 0.86 and older take no event map, so the patch asserts each listener's type instead. It only changes
    types: the JavaScript is the same.
    ```

- Upstream PR/issue: None. Expensify plans to remove the Onfido SDK, so the types are patched here instead of fixed upstream.
- E/App issue: https://github.com/Expensify/App/issues/101439
- PR introducing patch: https://github.com/Expensify/App/pull/106730
