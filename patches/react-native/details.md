# `react-native` patches

### [react-native+0.79.2+001+initial.patch](react-native+0.79.2+001+initial.patch)

- Reason: Fixes keyboard flickering issue when opening/closing modals. When an input is blurred and a modal is opened, the `rootView` becomes the `firstResponder`, causing the system to retain an incorrect keyboard state. This leads to keyboard flickering when the modal is closed. The patch adds code to resign the `rootView`'s `firstResponder` status before presenting the modal to prevent this issue.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/23994

### [react-native+0.79.2+002+fixMVCPAndroid.patch](react-native+0.79.2+002+fixMVCPAndroid.patch)

- Reason: Fixes content jumping issues with `MaintainVisibleContentPosition` on Android, particularly in bidirectional pagination scenarios. The patch makes two key improvements:
  1. Changes when the first visible view is calculated - now happens on scroll events instead of during Fabric's willMountItems lifecycle, which was causing incorrect updates
  2. Improves first visible view selection logic to handle Fabric's z-index-based view reordering by finding the view with the smallest position that's still greater than the scroll position
- Upstream PR/issue: https://github.com/facebook/react-native/pull/46247
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/46315 (introduced), https://github.com/Expensify/App/pull/45289 (refactored)

### [react-native+0.79.2+003+disableTextInputRecycling.patch](react-native+0.79.2+003+disableTextInputRecycling.patch)

- Reason: Disables text input recycling to prevent issues with state of recycled component
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/13767

### [react-native+0.79.2+004+iOSFontResolution.patch](react-native+0.79.2+004+iOSFontResolution.patch)

- Reason: Fixes font resolution issues on iOS by properly preserving font properties when loading fonts by name. When a font is loaded by its name, the patch now correctly extracts and uses its actual weight and style properties instead of ignoring them.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/13767

### [react-native+0.79.2+005+resetAutoresizingOnView.patch](react-native+0.79.2+005+resetAutoresizingOnView.patch)

- Reason: This is a workaround fix for an issue with `UIPageViewController` and Fabric's view recycling system. The problem occurs because pager-view was incorrectly using a Fabric-provided view as its content-view. This is problematic because `UIPageViewController` modifies its content view, and when Fabric later recycles this modified view, it can lead to unexpected layout issues. The patch addresses this by resetting the autoresizing mask on the view to prevent layout corruption when views are recycled. The root cause should be addressed in react-native-pager-view: https://github.com/callstack/react-native-pager-view/issues/819
- Upstream PR/issue: https://github.com/facebook/react-native/issues/42732
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/13767

### [react-native+0.79.2+006+disableNonTranslucentStatusBar.patch](react-native+0.79.2+006+disableNonTranslucentStatusBar.patch)

- Reason: Disables non-translucent status bar to fix UI issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.79.2+007+TextInput.patch](react-native+0.79.2+007+TextInput.patch)

- Reason: Fixes TextInput component issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.79.2+008+iOSCoreAnimationBorderRendering.patch](react-native+0.79.2+008+iOSCoreAnimationBorderRendering.patch)

- Reason: Fixes border rendering issues with Core Animation on iOS
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.79.2+009+copyStateOnClone.patch](react-native+0.79.2+009+copyStateOnClone.patch)

- Reason: Ensures state is properly copied when cloning components
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.79.2+010+textinput-clear-command.patch](react-native+0.79.2+010+textinput-clear-command.patch)

- Reason: Adds clear command functionality to TextInput
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

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

- Reason: Fixes alert styling issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.79.2+013+fixNavigationAnimations.patch](react-native+0.79.2+013+fixNavigationAnimations.patch)

- Reason: Fixes navigation animation issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.79.2+014+fixScrollViewState.patch](react-native+0.79.2+014+fixScrollViewState.patch)

- Reason: Fixes ScrollView state management issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.79.2+015+redactAppParameters.patch](react-native+0.79.2+015+redactAppParameters.patch)

- Reason: Adds redaction of sensitive app parameters
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.79.2+016+android-keyboard-avoiding-view.patch](react-native+0.79.2+016+android-keyboard-avoiding-view.patch)

- Reason: Fixes keyboard avoiding view behavior on Android
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.79.2+017+fix-mask-persisting-recycling.patch](react-native+0.79.2+017+fix-mask-persisting-recycling.patch)

- Reason: Fixes mask persisting and recycling issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.79.2+018+fix-text-selecting-on-change.patch](react-native+0.79.2+018+fix-text-selecting-on-change.patch)

- Reason: Fixes text selection issues during onChange events
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.79.2+019+fix-scroll-view-jump.patch](react-native+0.79.2+019+fix-scroll-view-jump.patch)

- Reason: Fixes ScrollView jumping issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.79.2+020+fix-dropping-mutations-in-transactions.patch](react-native+0.79.2+020+fix-dropping-mutations-in-transactions.patch)

- Reason: Fixes issues with dropping mutations in transactions
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.79.2+021+fix-crash-when-deleting-expense.patch](react-native+0.79.2+021+fix-crash-when-deleting-expense.patch)

- Reason: Fixes crash when deleting expenses
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.79.2+022+fix-surface-stopped-before-started.patch](react-native+0.79.2+022+fix-surface-stopped-before-started.patch)

- Reason: Fixes surface lifecycle issues where surface is stopped before being started
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.79.2+023+publish-gradle.patch](react-native+0.79.2+023+publish-gradle.patch)

- Reason: This patch customizes the Gradle publishing script to allow publishing our custom React Native artifacts to GitHub Packages.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/59738

### [react-native+0.79.2+024+fix-display-contents-not-updating-nodes.patch](react-native+0.79.2+024+fix-display-contents-not-updating-nodes.patch)

- Reason: This patch updates Yoga to correctly update the subtrees of `display: contents` nodes so that they are in sync with their React Native counterparts.
- Upstream PR/issue: https://github.com/facebook/react-native/pull/52530
- E/App issue: https://github.com/Expensify/App/issues/65268
- PR introducing patch: [#65925](https://github.com/Expensify/App/pull/65925)

### [react-native+0.79.2+026+fix-textinput-oncontentsizechange-dispatched-only-once-ios.patch](react-native+0.79.2+026+fix-textinput-oncontentsizechange-dispatched-only-once-ios.patch)

- Reason: This patch updates RCTTextInputComponentView.mm to fix an issue where the TextInput onContentSizeChange event is dispatched only once on iOS instead of being triggered for subsequent content size changes.
- Upstream PR/issue: https://github.com/facebook/react-native/pull/50782
- E/App issue: https://github.com/Expensify/App/issues/64900
- PR introducing patch: [#65804](https://github.com/Expensify/App/pull/65804)
