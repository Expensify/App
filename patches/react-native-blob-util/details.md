# `react-native-blob-util` patches

### [react-native-blob-util+0.24.9+001+agp9-proguard-optimize.patch](react-native-blob-util+0.24.9+001+agp9-proguard-optimize.patch)

- Reason:

    ```
    AGP 9 (pulled in by React Native 0.88's gradle plugin) rejects `getDefaultProguardFile('proguard-android.txt')`
    ("no longer supported since it includes -dontoptimize"). Use `proguard-android-optimize.txt`.
    ```

- Upstream PR/issue: https://github.com/RonRadtke/react-native-blob-util/pull/473 (merged and released in 0.24.10 on 2026-06-19). Drop this patch when bumping to >= 0.24.10.
- E/App issue: https://github.com/Expensify/App/issues/101427
- PR introducing patch: TBD (RN 0.88 / Expo SDK 58 upgrade)
