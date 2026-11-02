# `react-native-reanimated` patches

### [react-native-reanimated+4.7.0+001+retain-focused-flatlist-cell.patch](react-native-reanimated+4.7.0+001+retain-focused-flatlist-cell.patch)

- Reason:

    `Animated.FlatList` replaces the standard cell renderer but drops the focus
    notification supplied by `VirtualizedList`. Without that notification, the
    list cannot retain a focused cell outside its calculated render window during
    a resize. Recycling a PDF cell resets its password form, input, and document.

    Forward the notification through `onFocus`, which React Native Web's `View`
    supports. The receiving `VirtualizedList` callback records the cell key and
    does not consume the event. Both the source and module entry points are
    patched. No input focus, selection, or keyboard state is changed by this patch.

- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/pull/104182#issuecomment-6566849247
- PR introducing patch: https://github.com/Expensify/App/pull/104182

Manual investigation on iPhone 17 / iOS 26.2 Safari confirmed that, without the
callback, rotating with the password input focused unmounts the selected cell,
destroys the PDF loading task, and remounts the password form in its initial
state. With the callback, the selected cell and form stay mounted and the input
selection survives rotation. The carousel page index stays unchanged in both
runs. Rsbuild tracks this patched dependency outside `managedPaths` so its
persistent cache cannot mask changes to the focus callback.
