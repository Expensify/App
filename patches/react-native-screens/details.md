# `react-native-screens` patches

### [react-native-screens+4.28.0+001+animate-hiding-the-native-tab-bar.patch](react-native-screens+4.28.0+001+animate-hiding-the-native-tab-bar.patch)

- Reason: The App hides the native tab bar on screens that are not a tab root, which React Navigation forwards to RNScreens as `tabBarHidden` (it derives the flag from `tabBarStyle.display === 'none'`). RNScreens calls UIKit's `setTabBarHidden:animated:` with `animated:NO`, so the bar blinks in and out instead of travelling with the screen that hid it. The patch passes `YES`, which lets UIKit run its own show/hide animation. The pre-iOS 18 branch is left alone: it assigns `tabBar.hidden` directly and has no animated counterpart.
- Upstream PR/issue: not reported yet.
- E/App issue: [#101169](https://github.com/Expensify/App/issues/101169)
- PR introducing patch: [#101339](https://github.com/Expensify/App/pull/101339)

### [react-native-screens+4.28.0+002+bold-selected-tab-label.patch](react-native-screens+4.28.0+002+bold-selected-tab-label.patch)

- Reason: The Android tab bar takes one font weight for every label, while the design marks the selected tab with a bold label, the same way the JS side bar does. Material's `BottomNavigationView` draws each item with two labels, a small one shown while unselected and a large one shown while selected. The patch turns on Material's own `setItemTextAppearanceActiveBoldEnabled`, which keeps the large label bold whenever Material re-applies its text appearance, and calls it before `updateFontStyles`, because enabling it re-applies Material's text appearance and would otherwise replace the app's typeface. `updateFontStyles` then sets the large label's typeface with `Typeface.BOLD`, the way Material applies its own bold, so Android picks the bold face of the same font family.
- Upstream PR/issue: not reported yet.
- E/App issue: [#101169](https://github.com/Expensify/App/issues/101169)
- PR introducing patch: [#101339](https://github.com/Expensify/App/pull/101339)

### [react-native-screens+4.28.0+003+no-android-tab-icon-tint.patch](react-native-screens+4.28.0+003+no-android-tab-icon-tint.patch)

- Reason: The Android account tab shows the user's avatar. `TabsAppearanceApplicator` assigns `bottomNavigationView.itemIconTintList` unconditionally, and a `ColorStateList` tint is `SRC_IN`, so it flattens the avatar to a solid silhouette in the tint color. React Navigation's `tinted: false` only reaches iOS, since `getPlatformIcon` in `@react-navigation/bottom-tabs` always hands Android a plain `imageSource`. The patch drops the icon tint list so Android draws every icon bitmap as supplied. The App recolors the glyphs off-screen in Skia for both selection states, so they keep the design's colors. Label colors are untouched and keep coming from `tabBarItemTitleFontColor`.
- Upstream PR/issue: not reported yet.
- E/App issue: [#101169](https://github.com/Expensify/App/issues/101169)
- PR introducing patch: [#101339](https://github.com/Expensify/App/pull/101339)

### [react-native-screens+4.28.0+004+android-tab-label-letter-spacing.patch](react-native-screens+4.28.0+004+android-tab-label-letter-spacing.patch)

- Reason: `TabsAppearanceApplicator.updateFontStyles` replaces the typeface and size of Material's tab labels but keeps the rest of Material 3's `LabelMedium` text appearance, which tracks letters 0.5sp apart. With Expensify Neue the labels read too spread out next to the rest of the app. React Navigation has no option that reaches the native label's letter spacing, so the patch sets a fixed -0.5dp tracking on both labels, converted to the `em` unit `TextView.letterSpacing` expects for each label's size.
- Upstream PR/issue: not reported yet.
- E/App issue: [#101169](https://github.com/Expensify/App/issues/101169)
- PR introducing patch: [#101339](https://github.com/Expensify/App/pull/101339)
