# `react-native` patches

### [react-native+0.86.0+001+initial.patch](react-native+0.86.0+001+initial.patch)

- Reason: Fixes keyboard flickering issue when opening/closing modals. When an input is blurred and a modal is opened, the `rootView` becomes the `firstResponder`, causing the system to retain an incorrect keyboard state. This leads to keyboard flickering when the modal is closed. The patch adds code to resign the `rootView`'s `firstResponder` status before presenting the modal to prevent this issue.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/23994

### [react-native+0.86.0+002+fixMVCPAndroid.patch](react-native+0.86.0+002+fixMVCPAndroid.patch)

- Reason: Fixes content jumping issues with `MaintainVisibleContentPosition` on Android, particularly in bidirectional pagination scenarios. The patch makes two key improvements:
  1. Changes when the first visible view is calculated - now happens on scroll events instead of during Fabric's willMountItems lifecycle, which was causing incorrect updates
  2. Improves first visible view selection logic to handle Fabric's z-index-based view reordering by finding the view with the smallest position that's still greater than the scroll position
- Upstream PR/issue: https://github.com/facebook/react-native/pull/46247
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/46315 (introduced), https://github.com/Expensify/App/pull/45289 (refactored)

### [react-native+0.86.0+003+disableTextInputRecycling.patch](react-native+0.86.0+003+disableTextInputRecycling.patch)

- Reason: Disables text input recycling to prevent issues with state of recycled component
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/13767

### [react-native+0.86.0+004+iOSFontResolution.patch](react-native+0.86.0+004+iOSFontResolution.patch)

- Reason: Fixes font resolution issues on iOS by properly preserving font properties when loading fonts by name. When a font is loaded by its name, the patch now correctly extracts and uses its actual weight and style properties instead of ignoring them.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/13767

### [react-native+0.86.0+005+resetAutoresizingOnView.patch](react-native+0.86.0+005+resetAutoresizingOnView.patch)

- Reason: This is a workaround fix for an issue with `UIPageViewController` and Fabric's view recycling system. The problem occurs because pager-view was incorrectly using a Fabric-provided view as its content-view. This is problematic because `UIPageViewController` modifies its content view, and when Fabric later recycles this modified view, it can lead to unexpected layout issues. The patch addresses this by resetting the autoresizing mask on the view to prevent layout corruption when views are recycled. The root cause should be addressed in react-native-pager-view: https://github.com/callstack/react-native-pager-view/issues/819
- Upstream PR/issue: https://github.com/facebook/react-native/issues/42732
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/13767

### [react-native+0.86.0+006+disableNonTranslucentStatusBar.patch](react-native+0.86.0+006+disableNonTranslucentStatusBar.patch)

- Reason: Disables non-translucent status bar to fix UI issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.86.0+007+TextInput.patch](react-native+0.86.0+007+TextInput.patch)

- Reason: Fixes TextInput component issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.86.0+008+copyStateOnClone.patch](react-native+0.86.0+008+copyStateOnClone.patch)

- Reason: Ensures state is properly copied when cloning components
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.86.0+009+textinput-clear-command.patch](react-native+0.86.0+009+textinput-clear-command.patch)

- Reason: Adds clear command functionality to TextInput
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.86.0+010+Add-onPaste-to-TextInput.patch](react-native+0.86.0+010+Add-onPaste-to-TextInput.patch)

- Reasons:
    - Adds `onPaste` callback to `TextInput` to support image pasting on native
    - Fixes an issue where pasted image displays as binary text on some Android devices where rich clipboard data is stored in binary form
    - Fixes an issue where pasting from WPS Office app crashes the app on Android where its content URI is not recognized by Android `ContentResolver`
    - Fixes an issue where mentions copied from mWeb and pasted on Android are not displayed.
- Upstream PR/issue: https://github.com/facebook/react-native/pull/45425
- Upstream RFC: https://github.com/s77rt/discussions-and-proposals/blob/TextInput-onPaste/proposals/0000-textinput-onpaste.md
- E/App issue:
    - https://github.com/Expensify/App/issues/41239
    - https://github.com/Expensify/App/issues/55304
    - https://github.com/Expensify/App/issues/63191
    - https://github.com/Expensify/App/issues/75991
- PR Introducing Patch: [#47203](https://github.com/Expensify/App/pull/47203)

### [react-native+0.86.0+011+alert-style.patch](react-native+0.86.0+011+alert-style.patch)

- Reason: Fixes alert styling issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.86.0+012+fixScrollViewState.patch](react-native+0.86.0+012+fixScrollViewState.patch)

- Reason: Fixes ScrollView state management issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.86.0+013+fix-mask-persisting-recycling.patch](react-native+0.86.0+013+fix-mask-persisting-recycling.patch)

- Reason: Fixes mask persisting and recycling issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.86.0+014+fix-text-selecting-on-change.patch](react-native+0.86.0+014+fix-text-selecting-on-change.patch)

- Reason: Fixes text selection issues during onChange events
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.86.0+015+fix-dropping-mutations-in-transactions.patch](react-native+0.86.0+015+fix-dropping-mutations-in-transactions.patch)

- Reason: Fixes issues with dropping mutations in transactions
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.86.0+016+fix-crash-when-deleting-expense.patch](react-native+0.86.0+016+fix-crash-when-deleting-expense.patch)

- Reason: Fixes crash when deleting expenses
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.86.0+017+publish-gradle.patch](react-native+0.86.0+017+publish-gradle.patch)

- Reason: This patch customizes the Gradle publishing script to allow publishing our custom React Native artifacts to GitHub Packages.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/59738

### [react-native+0.86.0+018+textinput-prevent-focus-on-first-responder.patch](react-native+0.86.0+018+textinput-prevent-focus-on-first-responder.patch)

- Reason: On iOS, a text input automatically becomes the "first responder" in UIKit's "UIResponder" chain. Once a text input becomes the first responder, it will be automatically focused. (This also causes the keyboard to open)
    - This is not handled by React or React Native, but is rather a native iOS/UIKit behaviour. This patch adds an additional `TextInput` prop (`preventFocusOnFirstResponder`) and a ref method (`preventFocusOnFirstResponderOnce`) to bypass the focus on first responder.
    - In E/App this causes issues with e.g. the keyboard briefly opening after a modal has been dismissed before another modal is opened (`ReportActionContextMenu` -> `EmojiPicker`)
- Upstream PR/issue: None, because this is not a real bug fix but a hotfix specific to Expensify
- E/App issue: [#54813](https://github.com/Expensify/App/issues/54813)
- PR Introducing Patch: [#61492](https://github.com/Expensify/App/pull/61492)

### [react-native+0.86.0+019+fix-modal-transparent-navigation-bar.patch](react-native+0.86.0+019+fix-modal-transparent-navigation-bar.patch)

- Reason: This patch fixes an issue where it is not possible to enable a transparent navigation bar on Android
- Upstream PR/issue: 🛑
- E/App issue: [#69005](https://github.com/Expensify/App/issues/69005)
- PR introducing patch: [#69004](https://github.com/Expensify/App/pull/69004)

### [react-native+0.86.0+021+perf-increase-initial-heap-size.patch](react-native+0.86.0+021+perf-increase-initial-heap-size.patch)

- Reason: This patch increases the initial heap size of the Hermes runtime. This allows us to disable Hermes Young-Gen Garbage Collection (GC) in a separate patch, which improves initial TTI and app startup time.
- Upstream PR/issue: This is not intended to be upstreamed, since this is a low-level fix very specific to the Expensify app's requirements.
- E/App issue: [#76859](https://github.com/Expensify/App/issues/76859)
- PR introducing patch: [#76154](https://github.com/Expensify/App/pull/76154)

### [react-native+0.86.0+022+perf-disable-hermes-young-gc-before-tti-reached.patch](react-native+0.86.0+022+perf-disable-hermes-young-gc-before-tti-reached.patch)

- Reason: This patch disables Hermes Young-Gen Garbage Collection (GC), which improves initial TTI and app startup time, by delaying GC for early allocated memory to the first Old-Gen GC run.
- Upstream PR/issue: This is not intended to be upstreamed, since this is a low-level fix very specific to the Expensify app's requirements.
- E/App issue: [#76859](https://github.com/Expensify/App/issues/76859)
- PR introducing patch: [#76154](https://github.com/Expensify/App/pull/76154)

### [react-native+0.86.0+023+strip-hermes-debug-info.patch](react-native+0.86.0+023+strip-hermes-debug-info.patch)

- Reason: Always pass `-output-source-map` to `hermesc` for production iOS builds, stripping ~13.4MB of debug metadata from the Hermes bytecode. Previously this flag was only passed when `SOURCEMAP_FILE` was set; if the build environment didn't propagate that variable, debug info remained in the shipped bundle.
- Upstream PR/issue: This should ideally be the default behavior upstream, but no PR has been filed yet.
- E/App issue: [#83000](https://github.com/Expensify/App/issues/83000)
- PR introducing patch: [#83256](https://github.com/Expensify/App/pull/83256)

### [react-native+0.86.0+024+fix-hermes-sampling-profiler-pthread-kill-crash.patch](react-native+0.86.0+024+fix-hermes-sampling-profiler-pthread-kill-crash.patch)

- Reason: On Android (Bionic libc), `pthread_kill` with an invalid `pthread_t` (e.g., thread has exited) calls `abort()` instead of returning `ESRCH` like glibc. The Hermes sampling profiler's timer thread sends `SIGPROF` via `pthread_kill` to registered runtime threads at ~100Hz. If a runtime's thread exits while profiling is active (e.g., during HybridApp transitions or background/foreground), the stale `pthread_t` triggers `SIGABRT: invalid pthread_t passed to pthread_kill`. This patch adds a `doLast` hook to the `unzipHermes` Gradle task that modifies `SamplingProfilerPosix.cpp` after Hermes source extraction, replacing `pthread_kill` with the `tgkill` syscall on Android, which safely returns `ESRCH` for dead threads. A kernel thread ID (`currentTid_`) is stored alongside the `pthread_t` and kept in sync via `setRuntimeThread()`. The Gradle hook approach is necessary because `unzipHermes` downloads fresh Hermes source, overwriting any direct source patches.
- Upstream PR/issue: 🛑
- E/App issue: [#77171](https://github.com/Expensify/App/issues/77171)
- PR introducing patch: [#84708](https://github.com/Expensify/App/pull/84708)

### [react-native+0.86.0+025+fix-display-contents-dirty-flag.patch](react-native+0.86.0+025+fix-display-contents-dirty-flag.patch)

- Reason: When a child node has `display: contents`, Yoga may reuse cached layout results from a previous pass even though the subtree has changed. This patch marks the parent yoga node as dirty when it encounters a child with `display: contents`, ensuring Yoga re-visits and recalculates the layout for that subtree instead of skipping it.
- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/85877
- PR introducing patch: 🛑

### [react-native+0.86.0+026+fix-fabric-collapsed-accessibility-announcement.patch](react-native+0.86.0+026+fix-fabric-collapsed-accessibility-announcement.patch)

- Reason: Fixes a Fabric regression where VoiceOver on iOS only announces "expanded" but never "collapsed" for elements with `accessibilityState.expanded`. In `RCTViewComponentView.mm`, the code uses `value_or(false)` which skips the announcement entirely when `expanded` is `false`. This patch changes the logic to use `has_value()` and correctly announce both "expanded" and "collapsed" states, matching the old architecture (Paper) behavior.
- Upstream PR/issue: https://github.com/facebook/react-native/issues/56296
- E/App issue: [#76929](https://github.com/Expensify/App/issues/76929)

### [react-native+0.86.0+027+fix-pressability-new-arch.patch](react-native+0.86.0+027+fix-pressability-new-arch.patch)

- Reason: Fixes an Android-specific issue (reproducible on certain Samsung models) where `onPress` events do not trigger for `Pressable` components when used inside a `Tooltip`. The root cause is that in the new architecture, `Pressability.measure()` reads stale layout information from the shadow tree instead of the actual native view hierarchy. This patch introduces a new `measureAsyncOnUI` method that measures the view asynchronously using the native layout hierarchy on the UI thread, bypassing stale shadow tree data.
- Upstream PR/issue: [facebook/react-native#51835](https://github.com/facebook/react-native/pull/51835)
- E/App issue: [#59953](https://github.com/Expensify/App/issues/59953)

### [react-native+0.86.0+028+fix-turbomodule-event-emitter-uaf.patch](react-native+0.86.0+028+fix-turbomodule-event-emitter-uaf.patch)

- Reason: Fixes an Android use-after-free crash in `JavaTurboModule::configureEventEmitterCallback`. The event-emitter callback lambda captured `this` by reference (`[&]`), so when the C++ TurboModule was deallocated (e.g. on screen unmount) a background thread invoking the callback would dereference freed memory via `eventEmitterMap_[name]` and crash with `SIGSEGV`. The fix copies the `shared_ptr` map by value into the lambda and replaces `operator[]` with `find()` + null-check, which both keeps the map alive for the callback's lifetime and avoids inserting empty entries on missing keys.
- Upstream PR/issue: [facebook/react-native#55398](https://github.com/facebook/react-native/pull/55398)
- E/App issue: [#90623](https://github.com/Expensify/App/issues/90623)

### [react-native+0.86.0+029+fix-deadlock-APP-7B2.patch](react-native+0.86.0+029+fix-deadlock-APP-7B2.patch)

- Reason: Fixes a fatal iOS app hang (APP-7B2) caused by a deadlock in Fabric's `ComponentDescriptorRegistry`. During HybridApp OldDot->NewDot transitions, a background thread lazily registering legacy interop component descriptors via `ComponentDescriptorRegistry::add()` holds a `unique_lock(mutex_)` while constructing a descriptor that calls `RCTUnsafeExecuteOnMainQueueSync`. Simultaneously, the main thread (driven by `CADisplayLink` animation ticks) tries to acquire `shared_lock(mutex_)` in `findComponentDescriptorByHandle_DO_NOT_USE_THIS_IS_BROKEN`. This creates a circular dependency: main waits for the lock, background waits for main. The fix moves descriptor construction outside the `unique_lock`, so the lock is only held for the two map insertions.
- Upstream PR/issue: https://github.com/facebook/react-native/issues/53128
- E/App issue: https://github.com/Expensify/App/issues/91292
- PR introducing patch: https://github.com/Expensify/App/pull/91736


### [react-native+0.86.0+030+fix-nil-BlobModule-crash-APP-8BM.patch](react-native+0.86.0+030+fix-nil-BlobModule-crash-APP-8BM.patch)

- Reason: Fixes a fatal iOS crash (APP-8BM) in HybridApp where `RCTNetworking`'s default URL-request-handler provider builds its handler list using an Objective-C array literal (`@[...]`) with `[moduleRegistry moduleForName:"BlobModule"]` at index 3. During OldDot↔NewDot bridge transitions, the `__weak _turboModuleRegistry` in `RCTModuleRegistry` is zeroed by ARC at the start of `TurboModuleManager` dealloc — before `[RCTNetworking invalidate]` clears the handler cache — leaving a window where a concurrent in-flight network request calls `prioritizedHandlers`, finds the cache empty, and tries to rebuild it with a nil `BlobModule`. Since `@[…]` compiles to `+[NSArray arrayWithObjects:count:]` which raises `NSInvalidArgumentException` on any nil element, the crash is fatal. The fix replaces the literal with an `NSMutableArray` built from the three always-non-nil handlers (`RCTHTTPRequestHandler`, `RCTDataRequestHandler`, `RCTFileRequestHandler`) and conditionally appends `BlobModule` only when the registry lookup is non-nil, turning a guaranteed crash into a graceful "no blob handler for this window".
- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/92413
- PR introducing patch: https://github.com/Expensify/App/pull/92918

### [react-native+0.86.0+031+nested-text-border-radius.patch](react-native+0.86.0+031+nested-text-border-radius.patch)

- Reason:

    ```
    Adds borderRadius / per-corner radius support for nested <Text> backgrounds on iOS and Android.
    On the C++ side, borderRadius + borderTopLeftRadius / borderTopRightRadius /
    borderBottomLeftRadius / borderBottomRightRadius fields are added to TextAttributes and wired
    through BaseTextProps and conversions. borderRadius acts as a fallback for unset individual
    corners; unset corners default to 0 when any radius prop is present. On Android, a custom
    DrawCommandSpan with ReactBackgroundDrawSpan draws rounded-rect backgrounds using the four
    effective corner radii. On iOS, a custom NSLayoutManager subclass
    (RCTTextLayoutManagerWithBorderRadius) overrides fillBackgroundRectArray to draw per-corner
    rounded rectangles using CGPath, with per-line outer-corner rounding for multiline spans.
    ```

- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/78873
- PR introducing patch: https://github.com/Expensify/App/pull/84556

### [react-native+0.86.0+032+fix-recycled-view-stale-frame.patch](react-native+0.86.0+032+fix-recycled-view-stale-frame.patch)

- Reason: Fixes an iOS Fabric bug where a recycled `RCTViewComponentView` keeps the geometry of its previous occupant, leaving an invisible view that swallows all touches (e.g. the app appears frozen after the `SplashScreenHider` fade/scale animation finishes). `prepareForRecycle` cleared `_layoutMetrics` to `{}` but never updated the physical `center`/`bounds`, nor did it reset the layer transform/opacity that libraries like Reanimated mutate directly on the UI thread (bypassing `_propKeysManagedByAnimated_DO_NOT_USE_THIS_IS_BROKEN`). When such a view was later dequeued for a zero-sized wrapper component, `updateLayoutMetrics` saw the incoming zero frame match the (already zero) stored `_layoutMetrics.frame`, skipped updating `center`/`bounds`, and the view retained the splash overlay's full-screen frame. The patch unconditionally realigns `layer.transform`/`layer.opacity` with the shadow-tree props and resets `center`/`bounds` to zero before the view returns to the recycle pool.
- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/91629
- PR introducing patch: https://github.com/Expensify/App/pull/92484

### [react-native+0.86.0+033+fix-runtime-scheduler-delegate-uaf-APP-25V.patch](react-native+0.86.0+033+fix-runtime-scheduler-delegate-uaf-APP-25V.patch)

- Reason: Fixes a fatal iOS HybridApp crash (APP-25V) where `RuntimeScheduler_Modern::runEventLoopTick` can drain deferred Fabric rendering updates after the captured `SchedulerDelegate` has been torn down. RN 0.86.0 queues `Scheduler::uiManagerDidFinishTransaction` and `Scheduler::uiManagerDidDispatchCommand` callbacks with lambdas that capture the raw `delegate_` pointer by value. During OldDot↔NewDot lifecycle churn, the delegate can be replaced or destroyed before the scheduled rendering update runs, causing `EXC_BAD_ACCESS` when the lambda dereferences stale native memory. This patch backports the upstream RN scheduler-delegate invalidation guard by adding a per-delegate `shared_ptr<atomic<bool>>` token, invalidating the old token on delegate changes and Scheduler destruction, and making already-queued lambdas no-op before touching a stale delegate.
- Upstream PR/issue: https://github.com/facebook/react-native/pull/56680 / https://github.com/facebook/react-native/commit/aadbe965792bd900ca70412d6704b76e339d1aca
- E/App issue: https://github.com/Expensify/App/issues/92412
- PR introducing patch: https://github.com/Expensify/App/pull/93878
- 0.86.0 migration note: upstream RN 0.86.0 ships the same `delegateInvalidated_` guard from PR #56680, but gates it behind `ReactNativeFeatureFlags::enableSchedulerDelegateInvalidation()`, which defaults to `false` and is not overridden anywhere in this app. Re-adding the original members would duplicate upstream's own declarations, so this patch now only strips the feature-flag gating in `Scheduler.cpp` (in the destructor, `setDelegate`, `uiManagerDidFinishTransaction`, and `uiManagerDidDispatchCommand`) so the guard is unconditionally active, matching the original patch's behavior without depending on an experimental flag Meta hasn't promoted to stable.

### [react-native+0.86.0+034+nested-text-border-width.patch](react-native+0.86.0+034+nested-text-border-width.patch)

- Reason:

    ```
    Adds borderWidth / per-side border width and per-side border color support for nested <Text>
    backgrounds on iOS and Android. On the C++ side, borderColor, borderTopColor, borderRightColor,
    borderBottomColor, borderLeftColor, borderWidth, borderTopWidth, borderRightWidth,
    borderBottomWidth, and borderLeftWidth fields are added to TextAttributes and wired through
    BaseTextProps and conversions. borderWidth acts as a fallback for unset individual widths;
    borderColor acts as a fallback for unset individual colors. On Android,
    ReactBackgroundDrawSpan is extended to draw per-side stroked borders (with corner arcs matching
    the border radius) using separate Paint strokes for each side. On iOS,
    RCTTextLayoutManagerWithBorderRadius draws per-side stroked borders using CGContext stroke
    paths, with corner arcs on first/last lines matching the fill's rounded-rect shape.
    ```

- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/57556
- PR introducing patch: https://github.com/Expensify/App/pull/94332

### [react-native+0.86.0+035+nested-text-padding.patch](react-native+0.86.0+035+nested-text-padding.patch)

- Reason:

    ```
    Adds horizontal padding (paddingLeft / paddingRight / paddingHorizontal) support for nested
    <Text> spans that have a border, so the border does not touch the text. On the C++ side,
    paddingLeft and paddingRight fields are added to TextAttributes, resolved from paddingLeft /
    paddingRight / paddingHorizontal props in BaseTextProps; TextInput explicitly clears them to
    avoid leaking view-level padding into text fragments. On Android, zero-width spacer spans
    (ReactInlinePaddingSpan) are inserted before/after bordered fragments to reserve horizontal
    advance, and ReactBackgroundDrawSpan extends its fill/border box by the padding amount. On
    iOS, NSKern attributes and firstLineHeadIndent reserve advance around bordered spans, an
    NSLayoutManager delegate indents soft-wrapped lines that begin with a bordered span, and
    RCTTextLayoutManager inflates the measured size to account for the reserved space.
    ```

- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/57556
- PR introducing patch: https://github.com/Expensify/App/pull/94332

### [react-native+0.86.0+036+fix-find-shadow-node-uaf-APP-HNA.patch](react-native+0.86.0+036+fix-find-shadow-node-uaf-APP-HNA.patch)

- Reason: Fixes a fatal Android HybridApp crash (APP-HNA) — a SIGSEGV in `findShadowNodeByTagRecursively` reached via `FabricUIManagerBinding::findNextFocusableElement` during focus navigation (D-pad / hardware-keyboard Tab / accessibility focus) inside a scroll view. `UIManager::findShadowNodeByTag_DEPRECATED` has two paths gated on RN's `fixFindShadowNodeByTagRaceCondition` feature flag: the safe path holds the root node alive via a `shared_ptr` for the entire traversal, while the flag-off path grabs a raw root pointer via `tryCommit` (immediately cancelled) that keeps nothing alive. The flag defaults to `false`, so a concurrent commit/unmount on the background thread can free the shadow subtree mid-traversal, leaving a dangling `shared_ptr` that segfaults at `ShadowNode::getTag()`. This patch removes the flag gate and unconditionally uses the safe `shared_ptr`-holding path. Upstream removed the flag (making the safe path the default) in RN 0.87.0, so this patch can be dropped once we upgrade to RN >= 0.87.0.
- Upstream PR/issue: https://github.com/facebook/react-native/pull/55751 (introduced the fix behind the `fixFindShadowNodeByTagRaceCondition` flag) and https://github.com/facebook/react-native/pull/56850 (removed the flag in RN 0.87.0)
- E/App issue: https://github.com/Expensify/App/issues/97471
- PR introducing patch: https://github.com/Expensify/App/pull/97496
- 0.86.0 migration note: the `fixFindShadowNodeByTagRaceCondition` flag still defaults to `false` in RN 0.86.0 (unchanged from 0.85.3), and the surrounding code in `UIManager.cpp` is byte-for-byte identical, so the original diff applies with zero fuzz. Only the patch-package filename was renumbered from `0.85.3+040` to `0.86.0+036`; no content changes were needed.

### [react-native+0.86.0+037+fix-stale-font-scale.patch](react-native+0.86.0+037+fix-stale-font-scale.patch)

- Reason: Fixes Fabric reusing shadow nodes that hold a stale font scale, leaving text at its old measured size after the OS font size changes. RN 0.86.0 dirties measurable nodes from `SurfaceHandler::constraintLayout` only on the commit where the multiplier changes, and only compares against the *root's* value — so a node cloned from a parent still carrying an obsolete `fontSizeMultiplier` is never re-dirtied. The upstream rewrite stores `fontSizeMultiplier` on `LayoutMetrics` and threads it through `YogaLayoutableShadowNode::configureYogaTree` alongside `pointScaleFactor`, so every commit re-checks each node's own value and calls `markDirtyAndPropagate()` when it is out of date; the now-redundant `dirtyMeasurableNodes`/`dirtyMeasurableNodesRecursive` helpers are removed from `SurfaceHandler`. Gated by RN's existing `enableFontScaleChangesUpdatingLayout` flag, which defaults to `true` in 0.86.0.
- Upstream PR/issue: https://github.com/react/react-native/pull/57246 (fixes https://github.com/react/react-native/issues/52895)
- E/App issue: 🛑 — backport of an upstream fix, no separate E/App issue was filed.
- PR introducing patch: https://github.com/Expensify/App/pull/98507
- 0.86.0 migration note: **drop this patch with the RN 0.87 upgrade** — upstream commit `45904c8` is absent from every 0.86.x release but ships in `v0.87.0`, and the patch will not apply against it. Two deviations from the upstream commit: the `scripts/cxx-api/api-snapshots/*.api` hunks are omitted (those files are not shipped in the npm package), and `fontSizeMultiplier` is declared *last* in `LayoutMetrics` rather than after `pointScaleFactor`, because `@rnmapbox/maps` initializes that struct positionally and inserting a field mid-struct breaks its iOS build.

### [react-native+0.86.0+038+log-soft-exception-if-viewState-not-found.patch](react-native+0.86.0+038+log-soft-exception-if-viewState-not-found.patch)

- Reason: Guards Android Fabric's `updateOverflowInset`, `updatePadding`, and `updateState` batch-mount paths against a view tag that was already unmounted. These methods otherwise resolve the tag through the throwing `getViewState`, so a stale batch instruction throws `RetryableMountingLayerException` from inside `IntBufferBatchMountItem.execute`. `MountItemDispatcher.dispatchMountItems` only retries `DispatchCommandMountItem`s, and `IntBufferBatchMountItem` is not retryable, so the exception propagates and crashes the app. The patch uses `getNullableViewState`, soft-logs the missing state, and returns, matching upstream's established handling for stale batch work. The `updateOverflowInset` hunk restores protection dropped during the RN 0.86 upgrade; the `updatePadding` and `updateState` hunks backport upstream commit `0e86a043` after production release `9.4.46-10` confirmed a fatal `getViewState -> updateState -> IntBufferBatchMountItem` recurrence.
- Upstream PR/issue: [#49077](https://github.com/facebook/react-native/issues/49077) [#56762](https://github.com/facebook/react-native/pull/56762) [#57181](https://github.com/facebook/react-native/pull/57181) [#7493](https://github.com/software-mansion/react-native-reanimated/issues/7493)
- E/App issues: [#82611](https://github.com/Expensify/App/issues/82611) [#93833](https://github.com/Expensify/App/issues/93833)
- PR introducing patch: [#84303](https://github.com/Expensify/App/pull/84303) (original 0.85.3 patch) and [#98604](https://github.com/Expensify/App/pull/98604) (restored `updateOverflowInset` on 0.86.0)
- 0.86.0 migration note: RN 0.86.0 upstreamed the `getNullableViewState` + soft-log guard for `addViewAt`, `updateProps`, `updateLayout`, and `removeViewAt`, which is why the 0.85.3 patch was dropped during the upgrade, but it did not include the corresponding `updateOverflowInset`, `updatePadding`, or `updateState` guards. All three are patched here. Re-check these methods during the RN 0.87 upgrade and drop this patch once the adopted React Native release contains them upstream.

### [react-native+0.86.0+039+persist-change-bundle-location.patch](react-native+0.86.0+039+persist-change-bundle-location.patch)

- Reason: Backports React Native's Android fix for persisting the host selected through `Change Bundle Location`. The setting is written to the existing `debug_http_host` preference, restored after process restarts, and removed when the host is reset. This replaces the HybridApp-specific lifecycle workaround and can be removed after upgrading to React Native 0.88 or later.
- Upstream PR/issue: [facebook/react-native#57425](https://github.com/facebook/react-native/pull/57425) / [d2ac1904118](https://github.com/facebook/react-native/commit/d2ac190411877e7a1bc94ffac346c5fd35b65a7c)
- E/App issue: N/A
- PR introducing patch: https://github.com/Expensify/Mobile-Expensify/pull/14058

### [react-native+0.86.0+040+fix-android15-text-clipping.patch](react-native+0.86.0+040+fix-android15-text-clipping.patch)

- Reason: Backports upstream's fix for Android 15+ text clipping. `TextLayoutManager` sized text layouts from `ceil(Layout.getDesiredWidth(...))`, which sums glyph *advances* only; on Android 15+ a line's visual glyph bounds can exceed that, so the layout ends up a fraction of a pixel too narrow. Line breaking is a step function, so that shortfall moves a whole trailing word onto a second line inside a view whose height was computed for one line, and that line is clipped: the word disappears with no ellipsis and no change in row height. The patch adds a `getDesiredWidth` helper that, on API 35+, builds a probe `StaticLayout` with `setUseBoundsForWidth(true)` and returns `max(advanceWidth, ceil(visualBoundsWidth))`, so the desired width can never shrink below the previous value. Only the `AT_MOST` and `UNDEFINED` measure modes are affected; `EXACTLY` still uses the width Yoga supplies, and the final layout keeps the existing advance-based bounds mode — which is what got the earlier blanket `setUseBoundsForWidth` attempt reverted in [5964a197](https://github.com/facebook/react-native/commit/5964a197) after multiline and wrapping regressions.
- Why this rather than reverting `LINEAR_TEXT_FLAG`: RN 0.86 made `Paint.LINEAR_TEXT_FLAG` unconditional ([#56409](https://github.com/facebook/react-native/pull/56409)) — the `enableAndroidLinearText` flag it deleted defaulted to `false` in OSS, so 0.85.3 never set it. Disabling hinting shifts glyph advance widths by a fraction of a pixel, widening the advance-vs-visual-bounds gap and pushing borderline strings over the wrapping threshold; that is why the bug presents as a 0.85.3 → 0.86.0 regression. Reverting the flag was verified to fix the reported cases too, but it only removes the amplifier — the advance-based measurement stays wrong and borderline strings can still wrap. This patch fixes the measurement itself, keeps 0.86's intended text rendering, and is not a deviation from upstream.
- Upstream PR/issue: [facebook/react-native#57117](https://github.com/facebook/react-native/pull/57117) (fixes [#56402](https://github.com/facebook/react-native/issues/56402))
- E/App issue: [#98499](https://github.com/Expensify/App/issues/98499) [#98690](https://github.com/Expensify/App/issues/98690)
- PR introducing patch: https://github.com/Expensify/App/pull/99069
- Reproduction: Android 16, custom font, non-default font scale *and* non-default display density — e.g. `wm size 1080x2340`, `wm density 420` (physical 450), `settings put system font_scale 0.8`, matching the Galaxy S25 FE the bug was reported on. The layout must be re-mounted (navigate forward, then back) before the clipping appears. Devices at their physical density are far less likely to hit it: at 450 dpi a 1080 px screen is exactly 384 dp, while the 420 dpi override makes it 411.428571… dp, so every derived width carries a fractional residue for `ceil`/`floor` to disagree on.
- Upstream history: this is upstream's *third* attempt at the same bug. [#54721](https://github.com/facebook/react-native/pull/54721) (commit [8347cc4b5](https://github.com/facebook/react-native/commit/8347cc4b50ca9229b638d0823d3148fed50b9a61)) closed [#53286](https://github.com/facebook/react-native/issues/53286) in December 2025 by calling `setUseBoundsForWidth(true)` on the final `StaticLayout`, but it was gated behind `fixTextClippingAndroid15useBoundsForWidth`, which **defaulted to `false` in OSS** — so 0.85.3 never ran it. RN 0.86.0 removed the flag and both call sites after multiline and wrapping regressions, leaving only the now-unused `setUseBoundsForWidthMethod` reflection handle in `TextLayoutManager` (which this patch reuses). The bug was refiled as [#56402](https://github.com/facebook/react-native/issues/56402) and is still open. #57117 is the narrower retry: the visual-bounds layout is only a measurement probe, so the final layout keeps advance-based bounds. **Because the two earlier attempts were reverted for wrapping regressions specifically, wrapping is the thing to regression-test on Android 15+.**
- 0.86.0 migration note: **upstream #57117 is still open and has not been reviewed by Meta.** Re-evaluate on the RN 0.87 upgrade and drop this patch once the fix lands upstream. Two things to weigh before shipping: the probe layout costs one extra `StaticLayout` build per text measure on API 35+ for `AT_MOST`/`UNDEFINED`, on a hot path; and widening measured text can change wrapping app-wide on Android 15+. The upstream diff's `TextLayoutManagerAbsoluteLayoutWithFractionalPixelTest.kt` hunks are omitted because the npm package does not ship `ReactAndroid/src/test`.

### [react-native+0.86.0+041+ios-responder-ignore-scroll.patch](react-native+0.86.0+041+ios-responder-ignore-scroll.patch)

- Reason: On iOS a tap could be silently cancelled when the list scrolled underneath it, even if the scroll moved nothing. React Native negotiates for the touch on every scroll event unless the event carries `responderIgnoreScroll`, and `ScrollView` claims it whenever a finger is down. iOS never sent that key, Android always has, which is why only iOS was affected. This adds the field to `ScrollEvent` and sets it on iOS from `_isUserTriggeredScrolling`, so a real drag still cancels a press as before, and does the same for text inputs, the only other source of these events on iOS. Merged upstream on 2026-08-20 but after the 0.87 cut, so it first ships in React Native 0.88.0 and **this patch can be dropped on that upgrade**. The upstream commit also updates a `types_DEPRECATED/` declaration, omitted because that directory is not shipped in the npm package.
- Upstream PR/issue: https://github.com/react/react-native/pull/57546 (merged as `06eb1fe`)
- E/App issue: https://github.com/Expensify/App/issues/97127
- PR introducing patch: https://github.com/Expensify/App/pull/98095
