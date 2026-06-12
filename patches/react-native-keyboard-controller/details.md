# `react-native-keyboard-controller` patches

### [react-native-keyboard-controller+1.21.0-beta.1+001+fix-insets-in-landscape.patch](react-native-keyboard-controller+1.21.0-beta.1+001+fix-insets-in-landscape.patch)

- Reason:
  
    ```
    In EdgeToEdgeReactViewGroup.setupWindowInsets(), the library unconditionally applies navBarInsets.left and navBarInsets.right as margins on the content view, even though the bottom margin is already conditional on navigationBarTranslucent. In landscape mode on Android, the navigation bar moves to the side of the screen, and these unconditional margins shrink the content area by the nav bar width. This causes useSafeAreaFrame() to report a reduced windowWidth and useSafeAreaInsets() to return 0 for left/right insets, since the SafeAreaProvider view no longer overlaps with the nav bar area. The patch makes left/right margins respect the same shouldApplyZeroPaddingBottom condition used for the bottom margin.
    ```
  
- Upstream PR/issue: -
- E/App issue: https://github.com/Expensify/App/issues/87307
- PR introducing patch: https://github.com/Expensify/App/pull/87376