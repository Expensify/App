# `react-native-pdf` patches

### [react-native-pdf+7.0.2+001+fix-onPressLink-android.patch](react-native-pdf+7.0.2+001+fix-onPressLink-android.patch)

- Reason:
  
    ```
    This patch fixes the onPressLink callback not working on Android by upgrading the pdfiumandroid library from version 1.0.32 to 1.0.35.
    
    The onPressLink prop works correctly on iOS but was broken on Android due to a bug in the older pdfiumandroid library.
    Version 1.0.35 includes fixes for link handling that make the callback work properly.
    ```
  
- Upstream PR/issue: https://github.com/wonday/react-native-pdf/issues/464, https://github.com/wonday/react-native-pdf/issues/983, https://github.com/wonday/react-native-pdf/issues/533
- E/App issue: https://github.com/Expensify/App/issues/73253
- PR introducing patch: https://github.com/Expensify/App/pull/75333
