# `react-native-screens` patches

### [react-native-screens+4.25.0+001+fix-removal-listener-use-after-free.patch](react-native-screens+4.25.0+001+fix-removal-listener-use-after-free.patch)

- Reason: Fixes a use-after-free behind the Android SIGSEGV in `MountingCoordinator::pullTransaction` (Sentry APP-9Y9). `NativeProxy::nativeAddMutationsListener` lazily created `screenRemovalListener_` without synchronization, and on a cold launch two threads reach it concurrently: `ScreensModule.initialize()` calls `setupFabric()` on the module thread while `onHostResume()` dispatches the same call to the main thread. Both can pass the null check, and the racing `shared_ptr` assignments tear — libc++ moves the object pointer and the control block as two independent words, so the member can keep one thread's pointer next to the other thread's control block while the losing temporary frees the listener it points at. The delegate registered in core's append-only override list then reports `use_count=1, expired=0` forever, so `lock()` succeeds and the next `pullTransaction` virtual-dispatches through a recycled vtable slot. A listener destroyed normally through its own control block is harmless (`expired=1`, core null-checks that path), which is what identifies this as the init race rather than teardown. The patch makes the listener a process-lifetime singleton (function-local static, thread-safe initialization) holding a mutex-guarded swappable callback that captures the JNI global reference by value instead of `this`; `setListener` returns an ownership token and `invalidateNative()` clears the callback only when it still owns it, so a stale proxy's late teardown cannot disarm a newer install (e.g. with a second `ReactHost`), and a disarmed listener passes the transaction through untouched.
- Upstream PR/issue: [software-mansion/react-native-screens#4413](https://github.com/software-mansion/react-native-screens/pull/4413) (merged, [`b3badd0`](https://github.com/software-mansion/react-native-screens/commit/b3badd012f83679b12f4e29f2e28eceaa4830efd)) / [software-mansion/react-native-screens#4151](https://github.com/software-mansion/react-native-screens/issues/4151). Not in a release yet — the latest tag at the time of patching is 4.27.0, published before the merge. **This patch can be removed as soon as `react-native-screens` is bumped to the first release containing `b3badd0`**; the patched files are byte-identical to the merged upstream files (upstream `cpp/legacy/RNSScreenRemovalListener.*` maps to `cpp/RNSScreenRemovalListener.*` in the published package).
- E/App issue: [#93842](https://github.com/Expensify/App/issues/93842)
- PR introducing patch: [#98632](https://github.com/Expensify/App/pull/98632)

### [react-native-screens+4.25.0+002+animate-hiding-the-native-tab-bar.patch](react-native-screens+4.25.0+002+animate-hiding-the-native-tab-bar.patch)

- Reason: The App hides the native tab bar on screens that are not a tab root, which React Navigation forwards to RNScreens as `tabBarHidden` (it derives the flag from `tabBarStyle.display === 'none'`). RNScreens calls UIKit's `setTabBarHidden:animated:` with `animated:NO`, so the bar blinks in and out instead of travelling with the screen that hid it. The patch passes `YES` at both call sites, which lets UIKit run its own show/hide animation. The pre-iOS 18 branch is left alone: it assigns `tabBar.hidden` directly and has no animated counterpart.
- Upstream PR/issue: not reported yet.
- E/App issue: [#101169](https://github.com/Expensify/App/issues/101169)
- PR introducing patch: [#101339](https://github.com/Expensify/App/pull/101339)

### [react-native-screens+4.25.0+003+tabs-container-reattach.patch](react-native-screens+4.25.0+003+tabs-container-reattach.patch)

- Reason: Pushing any opaque screen onto the root native stack over the tab navigator leaves the tab content permanently blank once that screen is popped. `ScreenStack.kt` computes a null `visibleBottom` when the new top is opaque and then removes every wrapper below it, so the whole `TAB_NAVIGATOR` `ScreenStackFragment` is removed rather than detached, taking its child FragmentManager and the selected tab's `TabsScreenFragment` with it. On the pop, `TabsContainer.onAttachedToWindow` calls `setupFragmentManager()`, which hands back a fresh and empty child FragmentManager, and then `flushPendingUpdates()`, which is guarded by `invalidationFlags.any()`. Nothing invalidated the container, because the JS side sends no new navigation state when the selected tab did not change, so the flush is a no-op and the content FrameLayout stays empty forever. The patch re-adds the selected tab's fragment to the new FragmentManager on re-attach.
- The same re-attach also trips `ColorSchemeCoordinator.setup`, which opens with `check(!isSetUp)`. `teardown()` is the only thing that clears the flag and the package never calls it, and the re-attach does not always come with a matching detach, so the patch calls `teardown()` both from `onDetachedFromWindow` and immediately before `setup()`.
- Upstream PR/issue: not reported yet.
- E/App issue: [#101169](https://github.com/Expensify/App/issues/101169)
- PR introducing patch: [#101339](https://github.com/Expensify/App/pull/101339)

### [react-native-screens+4.25.0+004+bold-selected-tab-label.patch](react-native-screens+4.25.0+004+bold-selected-tab-label.patch)

- Reason: The Android tab bar takes one font weight for every label, while the design marks the selected tab with a bold label, the same way the JS side bar does. Material's `BottomNavigationView` draws each item with two labels, a small one shown while unselected and a large one shown while selected, so the patch gives the large label the bold weight of the same font family.
- Upstream PR/issue: not reported yet.
- E/App issue: [#101169](https://github.com/Expensify/App/issues/101169)
- PR introducing patch: [#101339](https://github.com/Expensify/App/pull/101339)
