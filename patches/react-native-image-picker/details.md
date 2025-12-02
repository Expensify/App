# `react-native-image-picker` patches

### [react-native-image-picker+7.1.2+001+allowedMimeTypes.patch](react-native-image-picker+7.1.2+001+allowedMimeTypes.patch)

- Reason:
  
    ```
    This patch updates picker to avoid showing svg images on android.
    ```
  
- Upstream PR/issue: The upstream PR has been merged. https://github.com/react-native-image-picker/react-native-image-picker/pull/2145
- E/App issue: https://github.com/Expensify/App/issues/26768
- PR introducing patch: https://github.com/Expensify/App/pull/27834


### [react-native-image-picker+7.1.2+002+callback-in-completion-block.patch](react-native-image-picker+7.1.2+002+callback-in-completion-block.patch)

- Reason:
  
    ```
    This patch fixes dispatch callback after dismissing modal.
    ```
  
- Upstream PR/issue: 🛑, commented in the App PR https://github.com/Expensify/App/pull/55011#issuecomment-3346267863
- E/App issue: https://github.com/Expensify/App/issues/54970
- PR introducing patch: https://github.com/Expensify/App/pull/55011