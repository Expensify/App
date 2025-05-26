# `react-native` patches

### [react-native+0.77.1+026+textinput-prevent-focus-on-first-responder.patch](react-native+0.77.1+026+textinput-prevent-focus-on-first-responder.patch)

- Reason: On iOS, a text input automatically becomes the "first responder" in UIKit's "UIResponder" chain. Once a text input becomes the first responder, it will be automatically focused. (This also causes the keyboard ot open)
  - This is not handled by React or React Native, but is rather an native iOS/UIKit behaviour. This patch adds additional an additional `TextInput` prop (`preventFocusOnFirstResponder`) and a ref method (`preventFocusOnFirstResponderOnce`) to bypass the focus on first responder.
  - In E/App this causes issues with e.g. the keyboard briefly opening after a modal has been dismissed before another modal is opened (`ReportActionContextMenu` -> `EmojiPicker`)
- Upstream PR/issue: None, because this is not a real bug fix but a hotfix specific to Expensify
- E/App issue: [#54813](https://github.com/Expensify/App/issues/54813)
- PR Introducing Patch: [#61492](https://github.com/Expensify/App/pull/61492)
