# `react-native` patches

### [react-native+0.77.1+011+Add-onPaste-to-TextInput.patch](react-native+0.77.1+011+Add-onPaste-to-TextInput.patch)

- Reasons:
    - Adds `onPaste` callback to `TextInput` to support image pasting on native
    - Fixes an issue where pasted image displays as binary text on some Android devices where rich clipboard data is stored in binary form
    - Fixes an issue where pasting from WPS Office app crashes the app on Android where its content URI is not recognized by Android `ContentResolver`
- Upstream PR/issue: https://github.com/facebook/react-native/pull/45425
- Upstream RFC: https://github.com/s77rt/discussions-and-proposals/blob/TextInput-onPaste/proposals/0000-textinput-onpaste.md
- E/App issue:
    - https://github.com/Expensify/App/issues/41239
    - https://github.com/Expensify/App/issues/55304
    - https://github.com/Expensify/App/issues/63191
- PR Introducing Patch: [#47203](https://github.com/Expensify/App/pull/47203)
