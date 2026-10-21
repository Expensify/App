# `react-native-screens` patches

### [react-native-screens+4.28.0+002+fix-push-same-view-controller-twice.patch](react-native-screens+4.28.0+002+fix-push-same-view-controller-twice.patch)

- Reason:

    ```
    Fixes an iOS crash: NSInvalidArgumentException "<RNSNavigationController> is pushing the same view
    controller instance (<RNSScreen>) more than once which is not supported".

    On iOS 16 and 17 (reproduced on the iOS 17.2 simulator, Sentry events are on iOS 16 and 17 only)
    UIKit can defer an animated push until the current Core Animation transaction commits. This happens
    when RNSScreenStackView applies a multi-screen change as setViewControllers:animated:NO followed by
    pushViewController:animated:YES in the same turn. Until UIKit runs the deferred push, the pushed
    RNSScreen is not in viewControllers and transitionCoordinator is nil, so neither of the existing
    guards in setPushViewControllers sees it. A second stack update in that window pushes the same
    RNSScreen again. When UIKit runs the deferred pushes, the second one fails its sanity check and throws
    from -[_UIAfterCACommitBlock run].

    The patch records the pushed controller when UIKit did not apply the push immediately (iOS < 18 only,
    newer versions keep the default path). While that push is pending, setPushViewControllers skips
    updates and remembers that it skipped one. The wait ends, and a skipped update runs once on the next
    main queue turn, when one of these happens:
    - navigationController:willShowViewController:animated: or didShowViewController:animated: reports
      the pending controller (didShow for any other controller does not count: the non-animated
      setViewControllers: right before the push reports didShow for its own top controller, sometimes
      before UIKit runs the held push),
    - a later update finds the pending controller in viewControllers.
    The skip runs before the "no change" early return in setPushViewControllers: while the push is held,
    viewControllers still equals the stack from before the push, so an update that removes the pushed
    screen would otherwise return early and never be replayed.
    The pending controller is a weak reference. UIKit retains it until the held push runs (the push then
    reports willShow and ends the wait), so in practice it is only freed if UIKit drops the push. The next
    stack update then clears the pending state together with the skipped-update flag and applies the
    full stack.
    prepareForRecycle resets the state, since a recycled stack gets a full update on the next attach. If
    a push is still held at that point, the recycled view gets a new navigation controller: resetting the
    old one may not cancel the held push, which could otherwise land in the recycled stack. The old
    navigation controller (detached, no delegate) receives the held push and is then released.
    Detaching from the window keeps the state: Fabric can detach and reattach a stack before UIKit runs
    the held push, and the update on reattach would otherwise push the same controller again. The held
    push still runs while the stack is detached, so the update on reattach finds the controller in
    viewControllers and ends the wait. There is no timer and no retry loop: like the rest of
    react-native-screens, the patch waits for UIKit callbacks instead.

    This follows the approach the react-native-screens maintainers described as correct (keep pending
    operations until they show up in the navigation controller), narrowed to this one case. RNS 5 changes
    this model.
    ```

- Upstream PR/issue: 🛑 No upstream PR. Discussed with the react-native-screens maintainers: RNS 4.x is in maintenance mode and the general fix (keep pending operations until they show up in the navigation controller) is RNS 5 material. Remove this patch when upgrading to RNS 5. Standalone repro: https://github.com/WojtekBoman/rns-ios17-push-same-vc-twice-repro
- E/App issue: https://github.com/Expensify/App/issues/102743
- PR introducing patch: https://github.com/Expensify/App/pull/103603

### [react-native-screens+4.28.0+001+fix-fragment-already-added-in-screenstack-onupdate.patch](react-native-screens+4.28.0+001+fix-fragment-already-added-in-screenstack-onupdate.patch)

- Reason:

    ```
    This patch fixes a fatal Android crash (java.lang.IllegalStateException: Fragment already added: ScreenStackFragment) in ScreenStack.onUpdate.

    When re-attaching screens from visibleBottom upward, onUpdate adds every fragment without checking whether it is already attached. If the screen under a translucent modal (for example, the AI features promo modal) is detached while the modal stays attached, the modal is added twice in the same transaction and the commit throws. The patch removes an already attached fragment before re-adding it, so it is re-appended in stack order and the translucent top stays on top.

    The skip-only guard proposed upstream stops the crash but leaves the modal hidden behind the re-added screen. Remove this patch once upstream ships a fix that keeps the draw order.
    ```

- Upstream PR/issue: https://github.com/software-mansion/react-native-screens/issues/4156, https://github.com/software-mansion/react-native-screens/pull/4157
- E/App issue: https://github.com/Expensify/App/issues/102046
- PR introducing patch: https://github.com/Expensify/App/pull/103126

### [react-native-screens+4.28.0+002+animate-hiding-the-native-tab-bar.patch](react-native-screens+4.28.0+002+animate-hiding-the-native-tab-bar.patch)

- Reason: The App hides the native tab bar on screens that are not a tab root, which React Navigation forwards to RNScreens as `tabBarHidden` (it derives the flag from `tabBarStyle.display === 'none'`). RNScreens calls UIKit's `setTabBarHidden:animated:` with `animated:NO`, so the bar blinks in and out instead of travelling with the screen that hid it. The patch animates the change once the bar is in a window, which lets UIKit run its own show/hide animation without animating the bar out on the first render. The pre-iOS 18 branch is left alone: it assigns `tabBar.hidden` directly and has no animated counterpart. **This patch can be removed on the bump to react-native-screens 4.29.0**, the first release with the upstream fix linked below.
- Upstream PR/issue: fixed upstream by [software-mansion/react-native-screens#4632](https://github.com/software-mansion/react-native-screens/pull/4632), which animates by default behind a new `ios.tabBarHiddenAnimationEnabled` prop, and [#4673](https://github.com/software-mansion/react-native-screens/pull/4673), which skips the animation on the first render. Both are merged after the 4.28.0 release and labeled for the v4 backport.
- E/App issue: [#101169](https://github.com/Expensify/App/issues/101169)
- PR introducing patch: [#101339](https://github.com/Expensify/App/pull/101339)

### [react-native-screens+4.28.0+003+android-tab-label-typography.patch](react-native-screens+4.28.0+003+android-tab-label-typography.patch)

- Reason: Two changes to the Android tab labels, both in `TabsAppearanceApplicator`, which React Navigation has no option for.
  - Bold selected label. The Android tab bar takes one font weight for every label, while the design marks the selected tab with a bold label, the same way the JS side bar does. Material's `BottomNavigationView` draws each item with two labels, a small one shown while unselected and a large one shown while selected. `updateFontStyles` sets the large label's typeface with `Typeface.BOLD`, the way Material applies its own bold, so Android picks the bold face of the same font family. Material's `setItemTextAppearanceActiveBoldEnabled` is not used for this: it re-applies Material's 12sp text size to the large label alone and recomputes the selected item's offset from the difference between the two labels' sizes, so every selected tab would sit higher than the others.
  - Letter spacing. `updateFontStyles` replaces the typeface and size of Material's tab labels but keeps the rest of Material 3's `LabelMedium` text appearance, which tracks letters 0.5sp apart. With Expensify Neue the labels read too spread out next to the rest of the app, so the patch sets the letter spacing of both labels to 0.
- Upstream PR/issue: not reported, because both changes are the App's typography (a bold selected label and its letter spacing) rather than a library defect, and RNScreens has no option for either.
- E/App issue: [#101169](https://github.com/Expensify/App/issues/101169)
- PR introducing patch: [#101339](https://github.com/Expensify/App/pull/101339)

### [react-native-screens+4.28.0+004+no-android-tab-icon-tint.patch](react-native-screens+4.28.0+004+no-android-tab-icon-tint.patch)

- Reason: The Android account tab shows the user's avatar. `TabsAppearanceApplicator` assigns `bottomNavigationView.itemIconTintList` unconditionally, and a `ColorStateList` tint is `SRC_IN`, so it flattens the avatar to a solid silhouette in the tint color. React Navigation's `tinted: false` only reaches iOS, since `getPlatformIcon` in `@react-navigation/bottom-tabs` always hands Android a plain `imageSource`. The patch drops the icon tint list so Android draws every icon bitmap as supplied. The App recolors the glyphs off-screen in Skia for both selection states, so they keep the design's colors. Label colors are untouched and keep coming from `tabBarItemTitleFontColor`.
- Upstream PR/issue: not reported, because dropping the tint for every icon fits only a bar whose icons all arrive pre-colored, as the App's do. The disabled and focused icon colors go with it, which the App does not use.
- E/App issue: [#101169](https://github.com/Expensify/App/issues/101169)
- PR introducing patch: [#101339](https://github.com/Expensify/App/pull/101339)

### [react-native-screens+4.28.0+005+hidden-android-tab-bar-touches.patch](react-native-screens+4.28.0+005+hidden-android-tab-bar-touches.patch)

- Reason: On Android, a hidden native tab bar is set to `View.GONE`. `TabsContainer` is a `FrameLayout`, which skips `GONE` children during layout, so the bar keeps the bounds it had while visible. React Native's `TouchTargetHelper` walks native children without checking visibility, so a touch inside those stale bounds targets the hidden bar instead of the React views drawn there. On a chat, that swallowed taps on the composer's emoji and + buttons while the keyboard was closed. The touch target search skips a child whose transform is non-invertible, so the patch scales the hidden bar to zero on the Y axis and back to one when it is shown. Its layout is left alone, so the bar's height and the insets derived from it do not change.
- Upstream PR/issue: TBD
- E/App issue: [#104226](https://github.com/Expensify/App/issues/104226)
- PR introducing patch: [#104238](https://github.com/Expensify/App/pull/104238)

### [react-native-screens+4.28.0+006+stack-scroll-to-top-uses-scroll-view-marker.patch](react-native-screens+4.28.0+006+stack-scroll-to-top-uses-scroll-view-marker.patch)

- Reason: On iOS, a second tap on a native tab scrolls the tab's content to the top. When the tab's root is a native stack, as with the Inbox tab's split navigator, `RNSScreenStack` handles that tap and picks the scroll view by following each view's first native subview. On the Inbox the first one it reaches is the horizontal tab selector above the list. That selector is already at the top, so nothing scrolls. A `ScrollViewMarker` around the list registers the list's scroll view with the tabs screen, but the stack never reads it. The patch makes the stack scroll the marked scroll view while it shows a single screen, and fall back to the first-subview search otherwise, since the marker can sit on any screen of the stack. The marker only exists on iOS when `RNS_GAMMA_ENABLED=1` is set at `pod install`, which both Podfiles do.
- Upstream PR/issue: [#4985](https://github.com/software-mansion/react-native-screens/pull/4985)
- E/App issue: https://github.com/Expensify/App/issues/104284
- PR introducing patch: [#104368](https://github.com/Expensify/App/pull/104368)
