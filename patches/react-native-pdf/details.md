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


### [react-native-pdf+7.0.2+002+fix-pdf-crash-already-closed-android.patch](react-native-pdf+7.0.2+002+fix-pdf-crash-already-closed-android.patch)

- Reason:
  
    ```
    This patch fixes a fatal Android crash (java.lang.IllegalStateException: Already closed) that occurs when users navigate away from a PDF while it's still rendering.

    The crash is caused by a race condition between the background rendering thread and the main thread during component unmount. The fix sets AlreadyClosedBehavior.IGNORE via pdfiumandroid's global config, so that attempts to close already-closed resources are silently ignored instead of throwing.
    ```

- Upstream PR/issue: https://github.com/wonday/react-native-pdf/issues/976, https://github.com/wonday/react-native-pdf/issues/882, https://github.com/wonday/react-native-pdf/issues/830, https://github.com/wonday/react-native-pdf/pull/999
- E/App issue: https://github.com/Expensify/App/issues/82570
- PR introducing patch: https://github.com/Expensify/App/pull/82628
