# `@react-native-documents/picker` patches

### [@react-native-documents+picker+10.1.3+001+rn088-kotlin-currentActivity.patch](@react-native-documents+picker+10.1.3+001+rn088-kotlin-currentActivity.patch)

- Reason:

    ```
    `ReactContextBaseJavaModule.getCurrentActivity()` has been deprecated since React Native 0.80 in favor of
    `reactApplicationContext.currentActivity`. In React Native 0.88 the class is Kotlin, so the `currentActivity`
    property the library relies on no longer exists and the Android build fails. The patch applies the replacement
    React Native suggests.
    ```

- Upstream PR/issue: Fixed upstream from 12.0.0 (11.x still has the bare `currentActivity`). Drop this patch when bumping to >= 12.0.0 (11.0.0 stops shipping CommonJS, 12.0.0 moves iOS to Swift 6 concurrency).
- E/App issue: https://github.com/Expensify/App/issues/106112
- PR introducing patch: https://github.com/Expensify/App/pull/101739
