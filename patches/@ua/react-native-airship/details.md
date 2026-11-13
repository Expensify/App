# `@ua/react-native-airship` patches

### [@ua+react-native-airship+26.7.0+001+rn088-suppress-accidental-override.patch](@ua+react-native-airship+26.7.0+001+rn088-suppress-accidental-override.patch)

- Reason:

    ```
    React Native 0.88 changed the Kotlin signatures of `ViewManagerDelegate.setProperty/receiveCommand`, so the
    anonymous delegates in `ReactEmbeddedViewManager` and `ReactMessageViewManager` fail with `ACCIDENTAL_OVERRIDE`.
    Suppress the diagnostic on the four overrides; the methods themselves keep working.
    ```

- Upstream PR/issue: Fixed upstream in 27.0.0, which adds the same `@Suppress("ACCIDENTAL_OVERRIDE")` on all four overrides. Drop this patch when bumping to >= 27.0.0. That is a major: on iOS `AirshipFrameworkProxy` moves from CocoaPods to Swift Package Manager, and it requires React Native >= 0.85.
- E/App issue: https://github.com/Expensify/App/issues/106111
- PR introducing patch: https://github.com/Expensify/App/pull/101739
