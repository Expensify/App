# `react-native-screens` patches

### [react-native-screens+4.28.0+001+animate-hiding-the-native-tab-bar.patch](react-native-screens+4.28.0+001+animate-hiding-the-native-tab-bar.patch)

- Reason: The App hides the native tab bar on screens that are not a tab root, which React Navigation forwards to RNScreens as `tabBarHidden` (it derives the flag from `tabBarStyle.display === 'none'`). RNScreens calls UIKit's `setTabBarHidden:animated:` with `animated:NO`, so the bar blinks in and out instead of travelling with the screen that hid it. The patch passes `YES`, which lets UIKit run its own show/hide animation. The pre-iOS 18 branch is left alone: it assigns `tabBar.hidden` directly and has no animated counterpart.
- Upstream PR/issue: not reported yet.
- E/App issue: [#101169](https://github.com/Expensify/App/issues/101169)
- PR introducing patch: [#101339](https://github.com/Expensify/App/pull/101339)

### [react-native-screens+4.28.0+002+bold-selected-tab-label.patch](react-native-screens+4.28.0+002+bold-selected-tab-label.patch)

- Reason: The Android tab bar takes one font weight for every label, while the design marks the selected tab with a bold label, the same way the JS side bar does. Material's `BottomNavigationView` draws each item with two labels, a small one shown while unselected and a large one shown while selected, so the patch gives the large label the bold weight of the same font family.
- Upstream PR/issue: not reported yet.
- E/App issue: [#101169](https://github.com/Expensify/App/issues/101169)
- PR introducing patch: [#101339](https://github.com/Expensify/App/pull/101339)
