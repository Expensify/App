# `react-native` patches

### [react-native+0.79.2+001+initial.patch](react-native+0.79.2+001+initial.patch)

// TODO

### [react-native+0.79.2+002+fixMVCPAndroid.patch](react-native+0.79.2+002+fixMVCPAndroid.patch)

// TODO

### [react-native+0.79.2+003+disableTextInputRecycling.patch](react-native+0.79.2+003+disableTextInputRecycling.patch)

// TODO

### [react-native+0.79.2+004+iOSFontResolution.patch](react-native+0.79.2+004+iOSFontResolution.patch)

// TODO

### [react-native+0.79.2+005+resetAutoresizingOnView.patch](react-native+0.79.2+005+resetAutoresizingOnView.patch)

// TODO

### [react-native+0.79.2+006+disableNonTranslucentStatusBar.patch](react-native+0.79.2+006+disableNonTranslucentStatusBar.patch)

// TODO

### [react-native+0.79.2+007+TextInput.patch](react-native+0.79.2+007+TextInput.patch)

// TODO

### [react-native+0.79.2+008+iOSCoreAnimationBorderRendering.patch](react-native+0.79.2+008+iOSCoreAnimationBorderRendering.patch)

// TODO

### [react-native+0.79.2+009+copyStateOnClone.patch](react-native+0.79.2+009+copyStateOnClone.patch)

// TODO

### [react-native+0.79.2+010+textinput-clear-command.patch](react-native+0.79.2+010+textinput-clear-command.patch)

// TODO

### [react-native+0.79.2+011+Add-onPaste-to-TextInput.patch](react-native+0.79.2+011+Add-onPaste-to-TextInput.patch)

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

### [react-native+0.79.2+012+alert-style.patch](react-native+0.79.2+012+alert-style.patch)

// TODO

### [react-native+0.79.2+013+fixNavigationAnimations.patch](react-native+0.79.2+013+fixNavigationAnimations.patch)

// TODO

### [react-native+0.79.2+014+fixScrollViewState.patch](react-native+0.79.2+014+fixScrollViewState.patch)

// TODO

### [react-native+0.79.2+015+redactAppParameters.patch](react-native+0.79.2+015+redactAppParameters.patch)

// TODO

### [react-native+0.79.2+016+android-keyboard-avoiding-view.patch](react-native+0.79.2+016+android-keyboard-avoiding-view.patch)

// TODO

### [react-native+0.79.2+017+fix-mask-persisting-recycling.patch](react-native+0.79.2+017+fix-mask-persisting-recycling.patch)

// TODO

### [react-native+0.79.2+018+fix-text-selecting-on-change.patch](react-native+0.79.2+018+fix-text-selecting-on-change.patch)

// TODO

### [react-native+0.79.2+019+fix-scroll-view-jump.patch](react-native+0.79.2+019+fix-scroll-view-jump.patch)

// TODO

### [react-native+0.79.2+020+fix-dropping-mutations-in-transactions.patch](react-native+0.79.2+020+fix-dropping-mutations-in-transactions.patch)

// TODO

### [react-native+0.79.2+021+fix-crash-when-deleting-expense.patch](react-native+0.79.2+021+fix-crash-when-deleting-expense.patch)

// TODO

### [react-native+0.79.2+022+fix-surface-stopped-before-started.patch](react-native+0.79.2+022+fix-surface-stopped-before-started.patch)

// TODO

### [react-native+0.79.2+023+publish-gradle.patch](react-native+0.79.2+023+publish-gradle.patch)

// TODO

### [react-native+0.79.2+024+restore-old-line-height-algorithm.patch](react-native+0.79.2+024+restore-old-line-height-algorithm.patch)

// TODO
