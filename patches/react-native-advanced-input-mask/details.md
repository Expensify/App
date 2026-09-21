# `react-native-advanced-input-mask` patches

### [react-native-advanced-input-mask+1.4.6+001+rn088-remove-RCTBaseTextInputView-import.patch](react-native-advanced-input-mask+1.4.6+001+rn088-remove-RCTBaseTextInputView-import.patch)

- Reason:

    ```
    React Native 0.87 removed the Paper text-input views from React-Core, including the
    `React/RCTBaseTextInputView.h` header. The Swift bridging header imports it without using it, so the
    iOS build fails on RN 0.87+. Dropping the unused import is enough.
    ```

- Upstream PR/issue: https://github.com/IvanIhnatsiuk/react-native-advanced-input-mask/pull/155 (same change, open). https://github.com/IvanIhnatsiuk/react-native-advanced-input-mask/pull/156 covers the AGP 9 Kotlin plugin clash, which we avoid with `android.builtInKotlin=false`. Latest release is still 1.4.6 (2025-10).
- E/App issue: https://github.com/Expensify/App/issues/101427
- PR introducing patch: TBD (RN 0.88 / Expo SDK 58 upgrade)
