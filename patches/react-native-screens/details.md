# `react-native-screens` patches

### [react-native-screens+4.25.0+001+fix-removal-listener-use-after-free.patch](react-native-screens+4.25.0+001+fix-removal-listener-use-after-free.patch)

- Reason: Fixes a use-after-free behind the Android SIGSEGV in `MountingCoordinator::pullTransaction` (Sentry APP-9Y9). `NativeProxy::nativeAddMutationsListener` lazily created `screenRemovalListener_` without synchronization, and on a cold launch two threads reach it concurrently: `ScreensModule.initialize()` calls `setupFabric()` on the module thread while `onHostResume()` dispatches the same call to the main thread. Both can pass the null check, and the racing `shared_ptr` assignments tear — libc++ moves the object pointer and the control block as two independent words, so the member can keep one thread's pointer next to the other thread's control block while the losing temporary frees the listener it points at. The delegate registered in core's append-only override list then reports `use_count=1, expired=0` forever, so `lock()` succeeds and the next `pullTransaction` virtual-dispatches through a recycled vtable slot. A listener destroyed normally through its own control block is harmless (`expired=1`, core null-checks that path), which is what identifies this as the init race rather than teardown. The patch makes the listener a process-lifetime singleton (function-local static, thread-safe initialization) holding a mutex-guarded swappable callback that captures the JNI global reference by value instead of `this`; `setListener` returns an ownership token and `invalidateNative()` clears the callback only when it still owns it, so a stale proxy's late teardown cannot disarm a newer install (e.g. with a second `ReactHost`), and a disarmed listener passes the transaction through untouched.
- Upstream PR/issue: [software-mansion/react-native-screens#4413](https://github.com/software-mansion/react-native-screens/pull/4413) (merged, [`b3badd0`](https://github.com/software-mansion/react-native-screens/commit/b3badd012f83679b12f4e29f2e28eceaa4830efd)) / [software-mansion/react-native-screens#4151](https://github.com/software-mansion/react-native-screens/issues/4151). Not in a release yet — the latest tag at the time of patching is 4.27.0, published before the merge. **This patch can be removed as soon as `react-native-screens` is bumped to the first release containing `b3badd0`**; the patched files are byte-identical to the merged upstream files (upstream `cpp/legacy/RNSScreenRemovalListener.*` maps to `cpp/RNSScreenRemovalListener.*` in the published package).
- E/App issue: [#93842](https://github.com/Expensify/App/issues/93842)
- PR introducing patch: [#98632](https://github.com/Expensify/App/pull/98632)


### [react-native-screens+4.25.0+002+animate-hiding-the-native-tab-bar.patch](react-native-screens+4.25.0+002+animate-hiding-the-native-tab-bar.patch)

- Reason: The App hides the native tab bar on screens that are not a tab root, which React Navigation forwards to RNScreens as `tabBarHidden` (it derives the flag from `tabBarStyle.display === 'none'`). RNScreens calls UIKit's `setTabBarHidden:animated:` with `animated:NO`, so the bar blinks in and out instead of travelling with the screen that hid it. The patch passes `YES` at both call sites, which lets UIKit run its own show/hide animation. The pre-iOS 18 branch is left alone: it assigns `tabBar.hidden` directly and has no animated counterpart.
- Upstream PR/issue: not reported yet.
- E/App issue: n/a — found while building the native tab bar in `TabNavigator.native.tsx`.
- PR introducing patch: n/a


### [react-native-screens+4.25.0+003+no-android-tab-icon-tint.patch](react-native-screens+4.25.0+003+no-android-tab-icon-tint.patch)

- Reason: The App builds every native tab icon off-screen in Skia and hands it over already colored, because iOS 26 ignores the inactive icon color from `UITabBarItemAppearance`. React Navigation marks those icons `tinted: false`, but `getPlatformIcon` in `@react-navigation/bottom-tabs` only honors the flag on iOS: Android always receives the plain `imageSource`, and `TabsAppearanceApplicator` then assigns `bottomNavigationView.itemIconTintList` unconditionally. A `ColorStateList` tint is `SRC_IN`, so it flattens the whole bitmap to one color. On the glyph tabs this is invisible, since Material repaints them in the same color Skia used, but the account tab shows the user's avatar and turns into a solid silhouette, gray when the tab is not selected and green when it is, and the status dots painted into the bitmaps lose their own colors too. The patch drops the icon tint list so Android draws the bitmap as supplied, which is what `tinted: false` already means on iOS. Label colors are untouched and keep coming from `tabBarItemTitleFontColor`.
- Upstream PR/issue: not reported yet.
- E/App issue: n/a, found while building the native tab bar in `TabNavigator.native.tsx`.
- PR introducing patch: n/a


### [react-native-screens+4.25.0+004+teardown-tabs-color-scheme-coordinator.patch](react-native-screens+4.25.0+004+teardown-tabs-color-scheme-coordinator.patch)

- Reason: `TabsContainer.onAttachedToWindow` calls `colorSchemeCoordinator.setup(...)`, and that setup opens with `check(!isSetUp)`. `ColorSchemeCoordinator.teardown()` is the only thing that clears the flag, and it is never called anywhere in the package, so the coordinator stays marked as set up once the container has been attached a single time. The first time the fragment manager re-adds the container's view, `onAttachedToWindow` runs again and the check throws `[RNScreens] ColorSchemeCoordinator's setup method must not be called again without calling teardown() first`, with `ColorSchemeCoordinator.kt:57` under `TabsContainer.kt:270` under `FragmentStateManager.addViewToContainer`. In a debug build that surfaces as a red box over a dead React tree; in release the `IllegalStateException` propagates. The patch calls `teardown()` from `onDetachedFromWindow`, next to the fragment manager teardown that is already there, so attach and detach are symmetric.
- Upstream PR/issue: not reported yet.
- E/App issue: n/a, found while building the native tab bar in `TabNavigator.native.tsx`.
- PR introducing patch: n/a
