# `react-native` patches

### [react-native+0.79.2+025+fix-textinput-oncontentsizechange-dispatched-only-once-ios.patch](react-native+0.79.2+025+fix-textinput-oncontentsizechange-dispatched-only-once-ios.patch)

- Reason:
  
    ```
    This patch updates RCTTextInputComponentView.mm to fix an issue where the TextInput onContentSizeChange event is dispatched only once on iOS instead of being triggered for subsequent content size changes.
    ```
  
- Upstream PR/issue: https://github.com/facebook/react-native/pull/50782
- E/App issue: https://github.com/Expensify/App/issues/64900
- PR introducing patch: [#65804](https://github.com/Expensify/App/pull/65804)