# `@ua/react-native-airship` patches

### [@ua+react-native-airship+26.7.0+001+rn088-suppress-accidental-override.patch](@ua+react-native-airship+26.7.0+001+rn088-suppress-accidental-override.patch)

- Reason:

    ```
    React Native 0.88 changed the Kotlin signatures of `ViewManagerDelegate.setProperty/receiveCommand`, so the
    anonymous delegates in `ReactEmbeddedViewManager` and `ReactMessageViewManager` fail with `ACCIDENTAL_OVERRIDE`.
    Suppress the diagnostic on the four overrides; the methods themselves keep working.
    ```

- Upstream PR/issue: 26.12.0 adds the same `@Suppress("ACCIDENTAL_OVERRIDE")` only on `ReactEmbeddedViewManager.setProperty`; the other three overrides are unchanged there, so a bump to >= 26.12.0 has to be compile-verified before this patch can be dropped.
- E/App issue: https://github.com/Expensify/App/issues/101427
- PR introducing patch: TBD (RN 0.88 / Expo SDK 58 upgrade)
