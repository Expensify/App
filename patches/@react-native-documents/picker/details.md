# `@react-native-documents/picker` patches

### [@react-native-documents+picker+10.1.3+001+rn088-kotlin-currentActivity.patch](@react-native-documents+picker+10.1.3+001+rn088-kotlin-currentActivity.patch)

- Reason:

    ```
    In React Native 0.88 `ReactContextBaseJavaModule.getCurrentActivity()` is a plain Kotlin `fun`, so Kotlin no
    longer exposes a synthetic `currentActivity` property. `val currentActivity = currentActivity` fails with
    "Function invocation 'currentActivity()' expected". Read `reactApplicationContext.currentActivity` instead.
    ```

- Upstream PR/issue: Fixed upstream from 12.0.0 (11.x still has the bare `currentActivity`). Drop this patch when bumping to >= 12.0.0 (11.0.0 stops shipping CommonJS, 12.0.0 moves iOS to Swift 6 concurrency).
- E/App issue: https://github.com/Expensify/App/issues/101427
- PR introducing patch: https://github.com/Expensify/App/pull/101739
