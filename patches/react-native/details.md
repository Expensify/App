# `react-native` patches

### [react-native+0.88.0+002+fixMVCPAndroid.patch](react-native+0.88.0+002+fixMVCPAndroid.patch)

- Reason: Fixes content jumping issues with `MaintainVisibleContentPosition` on Android, particularly in bidirectional pagination scenarios. The patch makes two key improvements:
  1. Changes when the first visible view is calculated - now happens on scroll events instead of during Fabric's willMountItems lifecycle, which was causing incorrect updates
  2. Improves first visible view selection logic to handle Fabric's z-index-based view reordering by finding the view with the smallest position that's still greater than the scroll position
- Upstream PR/issue: https://github.com/facebook/react-native/pull/46247
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/46315 (introduced), https://github.com/Expensify/App/pull/45289 (refactored)
- 0.88.0 port: `ReactScrollView` and `ReactHorizontalScrollView` are Kotlin now, so the `onScroll()` call was re-added in their `onScrollChanged`. It was also added to `ReactNestedScrollView.kt` (generated from `ReactScrollView.kt`, used only with the `useNestedScrollViewAndroid` flag) so the anchor does not go stale if that flag is turned on.

### [react-native+0.88.0+003+disableTextInputRecycling.patch](react-native+0.88.0+003+disableTextInputRecycling.patch)

- Reason: Disables text input recycling to prevent issues with state of recycled component
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/13767

### [react-native+0.88.0+004+iOSFontResolution.patch](react-native+0.88.0+004+iOSFontResolution.patch)

- Reason: Fixes font resolution issues on iOS by properly preserving font properties when loading fonts by name. When a font is loaded by its name, the patch now correctly extracts and uses its actual weight and style properties instead of ignoring them.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/13767

### [react-native+0.88.0+005+resetAutoresizingOnView.patch](react-native+0.88.0+005+resetAutoresizingOnView.patch)

- Reason: This is a workaround fix for an issue with `UIPageViewController` and Fabric's view recycling system. The problem occurs because pager-view was incorrectly using a Fabric-provided view as its content-view. This is problematic because `UIPageViewController` modifies its content view, and when Fabric later recycles this modified view, it can lead to unexpected layout issues. The patch addresses this by resetting the autoresizing mask on the view to prevent layout corruption when views are recycled. The root cause should be addressed in react-native-pager-view: https://github.com/callstack/react-native-pager-view/issues/819
- Upstream PR/issue: https://github.com/facebook/react-native/issues/42732
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/13767

### [react-native+0.88.0+007+TextInput.patch](react-native+0.88.0+007+TextInput.patch)

- Reason: Fixes TextInput component issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.88.0+008+copyStateOnClone.patch](react-native+0.88.0+008+copyStateOnClone.patch)

- Reason: Ensures state is properly copied when cloning components
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.88.0+009+textinput-clear-command.patch](react-native+0.88.0+009+textinput-clear-command.patch)

- Reason: Adds clear command functionality to TextInput
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑
- 0.88.0 port: the legacy Paper `RCTBaseTextInputViewManager` file no longer exists, so its hunk was dropped. The TypeScript hunk moved to `types_DEPRECATED/`, which the App resolves through the `react-native-legacy-deep-imports` condition in `tsconfig.base.json`. Add the props to `types_generated/` too when the App moves to the Strict TypeScript API.

### [react-native+0.88.0+010+Add-onPaste-to-TextInput.patch](react-native+0.88.0+010+Add-onPaste-to-TextInput.patch)

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
- 0.88.0 port: the legacy Paper `RCTBaseTextInputView`/manager files no longer exist, so their hunks were dropped. `onPaste`, `PasteEvent` and `TextInputPasteEventData` are typed in `types_DEPRECATED/` (see the 009 note about the Strict TypeScript API).

### [react-native+0.88.0+011+alert-style.patch](react-native+0.88.0+011+alert-style.patch)

- Reason: Fixes alert styling issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.88.0+012+fixScrollViewState.patch](react-native+0.88.0+012+fixScrollViewState.patch)

- Reason: Fixes ScrollView state management issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.88.0+013+fix-mask-persisting-recycling.patch](react-native+0.88.0+013+fix-mask-persisting-recycling.patch)

- Reason: Fixes mask persisting and recycling issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.88.0+014+fix-text-selecting-on-change.patch](react-native+0.88.0+014+fix-text-selecting-on-change.patch)

- Reason: Fixes text selection issues during onChange events
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑
- 0.88.0 port: context drift only, same logic.

### [react-native+0.88.0+015+fix-merged-transaction-mount-order.patch](react-native+0.88.0+015+fix-merged-transaction-mount-order.patch)

- Reason: Fixes the Android Fabric mount-item failures behind `APP-7AR` (`addViewAt: failed to insert view into parent`, underlying `IndexOutOfBoundsException: index=1 count=0`) and `APP-H7A` (`Unable to remove a view from a view that is not a ViewGroup`). Both fire when a mount batch is applied to a native view tree that no longer matches the shadow tree the batch was computed against. On Android, `FabricUIManagerBinding::schedulerDidFinishTransaction` merges a finished transaction into the one still pending for the same surface whenever commits outpace UI-thread mounting, and `FabricMountingManager::executeMount` then writes `Delete` mount items last and splits `Update`s into their own buckets. React Native's own comment on that block says the optimization "is incorrect when multiple transactions are merged together": a merged `REMOVE -> DELETE | CREATE -> INSERT` sequence is mounted as `INSERT -> REMOVE -> DELETE`, which destroys a view the shadow tree still considers mounted, and every index computed for that parent afterwards is stale. The patch sets `maintainMutationOrder` whenever the transaction is a merge of several commits (`MountingTransaction::wasMerged()`), so a merged batch is mounted in differ order and no mutation pairing can be reordered. Transactions that were never merged keep the delete-batching optimization exactly as it is, and differ-order mounting is already a supported mode - it is what `disableMountItemReorderingAndroid` turns on globally.
- Why the whole `maintainMutationOrder` flag and not just the deletes: the FIXME is attached to the deletes-last write block, but the same flag also un-buckets the six `Update` categories, which are otherwise emitted ahead of every `Delete`. That second half matters - in a merged batch, bucketing hoists an `Update(X)` from commit N in front of a `Create(X)` from commit N+1, so commit N's props land on the view commit N+1 created. Narrowing this patch to deletes only would reintroduce that case. The cost is that a merged batch writes one int-buffer preamble per instruction run instead of one per type, so an insert-heavy merged batch carries a slightly larger int array; it is still a single batch, a single JNI call and the same mount-item count, and it is cheaper than the two separate batches `+015` produced whenever it refused a merge.
- Takes the slot of the previous `+015` patch (`fix-dropping-mutations-in-transactions`), which is deleted here. That patch guarded the same hazard from the other side, by refusing the merge when the incoming transaction created a tag the pending one deleted. It only inspected `Type::Create`, so pairings such as `Delete(tag)` + `Insert(same tag)` still merged, and refusing a merge left a surface holding several pending transactions - a state upstream's merge-target lookup and its swap-then-mount drain do not expect. Mounting merged transactions in differ order closes the hazard for every pairing, so both the guard and the multi-pending state it created are unnecessary.
- Upstream PR/issue: React Native's own `FIXME: this optimization is incorrect when multiple transactions are merged together` in [`FabricMountingManager.cpp`](https://github.com/facebook/react-native/blob/v0.86.0/packages/react-native/ReactAndroid/src/main/jni/react/fabric/FabricMountingManager.cpp#L974-L980). The merging this patch makes safe is upstream behaviour, but the FIXME is unfixed upstream, so there is nothing to adopt.
- E/App issue: [#98791](https://github.com/Expensify/App/issues/98791) (parent tracker [#91302](https://github.com/Expensify/App/issues/91302))
- PR introducing patch: https://github.com/Expensify/App/pull/101057
- 0.86.0 migration note: drop this patch once `disableMountItemReorderingAndroid` defaults to true upstream, or if Android stops merging mounting transactions - either one makes it redundant. Re-check on the RN 0.87 upgrade.

### [react-native+0.88.0+016+fix-crash-when-deleting-expense.patch](react-native+0.88.0+016+fix-crash-when-deleting-expense.patch)

- Reason: Fixes crash when deleting expenses
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑
- 0.88.0 port: the local variable was renamed upstream (`viewParent` -> `currParentView`); same `endViewTransition` call before `removeView`.

### [react-native+0.88.0+017+publish-gradle.patch](react-native+0.88.0+017+publish-gradle.patch)

- Reason: This patch customizes the Gradle publishing script to allow publishing our custom React Native artifacts to GitHub Packages.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/59738
- 0.88.0 port: dropped two accidental `.DS_Store` binary entries; the `publish.gradle` changes are unchanged.

### [react-native+0.88.0+018+textinput-prevent-focus-on-first-responder.patch](react-native+0.88.0+018+textinput-prevent-focus-on-first-responder.patch)

- Reason: On iOS, a text input automatically becomes the "first responder" in UIKit's "UIResponder" chain. Once a text input becomes the first responder, it will be automatically focused. (This also causes the keyboard to open)
    - This is not handled by React or React Native, but is rather a native iOS/UIKit behaviour. This patch adds an additional `TextInput` prop (`preventFocusOnFirstResponder`) and a ref method (`preventFocusOnFirstResponderOnce`) to bypass the focus on first responder.
    - In E/App this causes issues with e.g. the keyboard briefly opening after a modal has been dismissed before another modal is opened (`ReportActionContextMenu` -> `EmojiPicker`)
- Upstream PR/issue: None, because this is not a real bug fix but a hotfix specific to Expensify
- E/App issue: [#54813](https://github.com/Expensify/App/issues/54813)
- PR Introducing Patch: [#61492](https://github.com/Expensify/App/pull/61492)
- 0.88.0 port: one Flow hunk was re-done by hand. The TypeScript props live in `types_DEPRECATED/` (see the 009 note about the Strict TypeScript API).

### [react-native+0.88.0+019+fix-modal-transparent-navigation-bar.patch](react-native+0.88.0+019+fix-modal-transparent-navigation-bar.patch)

- Reason: This patch fixes an issue where it is not possible to enable a transparent navigation bar on Android
- Upstream PR/issue: 🛑
- E/App issue: [#69005](https://github.com/Expensify/App/issues/69005)
- PR introducing patch: [#69004](https://github.com/Expensify/App/pull/69004)

### [react-native+0.88.0+021+perf-increase-initial-heap-size.patch](react-native+0.88.0+021+perf-increase-initial-heap-size.patch)

- Reason: This patch increases the initial heap size of the Hermes runtime. This allows us to disable Hermes Young-Gen Garbage Collection (GC) in a separate patch, which improves initial TTI and app startup time.
- Upstream PR/issue: This is not intended to be upstreamed, since this is a low-level fix very specific to the Expensify app's requirements.
- E/App issue: [#76859](https://github.com/Expensify/App/issues/76859)
- PR introducing patch: [#76154](https://github.com/Expensify/App/pull/76154)

### [react-native+0.88.0+022+perf-disable-hermes-young-gc-before-tti-reached.patch](react-native+0.88.0+022+perf-disable-hermes-young-gc-before-tti-reached.patch)

- Reason: This patch disables Hermes Young-Gen Garbage Collection (GC), which improves initial TTI and app startup time, by delaying GC for early allocated memory to the first Old-Gen GC run.
- Upstream PR/issue: This is not intended to be upstreamed, since this is a low-level fix very specific to the Expensify app's requirements.
- E/App issue: [#76859](https://github.com/Expensify/App/issues/76859)
- PR introducing patch: [#76154](https://github.com/Expensify/App/pull/76154)

### [react-native+0.88.0+023+strip-hermes-debug-info.patch](react-native+0.88.0+023+strip-hermes-debug-info.patch)

- Reason: Always pass `-output-source-map` to `hermesc` for production iOS builds, stripping ~13.4MB of debug metadata from the Hermes bytecode. Previously this flag was only passed when `SOURCEMAP_FILE` was set; if the build environment didn't propagate that variable, debug info remained in the shipped bundle.
- Upstream PR/issue: This should ideally be the default behavior upstream, but no PR has been filed yet.
- E/App issue: [#83000](https://github.com/Expensify/App/issues/83000)
- PR introducing patch: [#83256](https://github.com/Expensify/App/pull/83256)

### [react-native+0.88.0+024+fix-hermes-sampling-profiler-pthread-kill-crash.patch](react-native+0.88.0+024+fix-hermes-sampling-profiler-pthread-kill-crash.patch)

- Reason: On Android (Bionic libc), `pthread_kill` with an invalid `pthread_t` (e.g., thread has exited) calls `abort()` instead of returning `ESRCH` like glibc. The Hermes sampling profiler's timer thread sends `SIGPROF` via `pthread_kill` to registered runtime threads at ~100Hz. If a runtime's thread exits while profiling is active (e.g., during HybridApp transitions or background/foreground), the stale `pthread_t` triggers `SIGABRT: invalid pthread_t passed to pthread_kill`. This patch adds a `doLast` hook to the `unzipHermes` Gradle task that modifies `SamplingProfilerPosix.cpp` after Hermes source extraction, replacing `pthread_kill` with the `tgkill` syscall on Android, which safely returns `ESRCH` for dead threads. A kernel thread ID (`currentTid_`) is stored alongside the `pthread_t` and kept in sync via `setRuntimeThread()`. The Gradle hook approach is necessary because `unzipHermes` downloads fresh Hermes source, overwriting any direct source patches.
- Upstream PR/issue: 🛑
- E/App issue: [#77171](https://github.com/Expensify/App/issues/77171)
- PR introducing patch: [#84708](https://github.com/Expensify/App/pull/84708)

### [react-native+0.88.0+025+fix-display-contents-dirty-flag.patch](react-native+0.88.0+025+fix-display-contents-dirty-flag.patch)

- Reason: When a child node has `display: contents`, Yoga may reuse cached layout results from a previous pass even though the subtree has changed. This patch marks the parent yoga node as dirty when it encounters a child with `display: contents`, ensuring Yoga re-visits and recalculates the layout for that subtree instead of skipping it.
- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/85877
- PR introducing patch: 🛑
- 0.88.0 port: the `YogaLayoutableShadowNode` clone constructor no longer loops over the children, so the `display: contents` dirty check now runs at the end of the constructor, right before `ensureConsistency()`. The related upstream Yoga fix (#58721, `19a6722f91`) is not in 0.88.0.

### [react-native+0.88.0+026+fix-fabric-collapsed-accessibility-announcement.patch](react-native+0.88.0+026+fix-fabric-collapsed-accessibility-announcement.patch)

- Reason: Fixes a Fabric regression where VoiceOver on iOS only announces "expanded" but never "collapsed" for elements with `accessibilityState.expanded`. In `RCTViewComponentView.mm`, the code uses `value_or(false)` which skips the announcement entirely when `expanded` is `false`. This patch changes the logic to use `has_value()` and correctly announce both "expanded" and "collapsed" states, matching the old architecture (Paper) behavior.
- Upstream PR/issue: https://github.com/facebook/react-native/issues/56296
- E/App issue: [#76929](https://github.com/Expensify/App/issues/76929)

### [react-native+0.88.0+027+fix-pressability-new-arch.patch](react-native+0.88.0+027+fix-pressability-new-arch.patch)

- Reason: Fixes an Android-specific issue (reproducible on certain Samsung models) where `onPress` events do not trigger for `Pressable` components when used inside a `Tooltip`. The root cause is that in the new architecture, `Pressability.measure()` reads stale layout information from the shadow tree instead of the actual native view hierarchy. This patch introduces a new `measureAsyncOnUI` method that measures the view asynchronously using the native layout hierarchy on the UI thread, bypassing stale shadow tree data.
- Upstream PR/issue: [facebook/react-native#51835](https://github.com/facebook/react-native/pull/51835)
- E/App issue: [#59953](https://github.com/Expensify/App/issues/59953)
- 0.88.0 port: `HostInstance` is now only an alias of `ReactNativeElement`, so the `HostInstance.js` hunk was dropped and its doc comment moved onto `ReactNativeElement.measureAsyncOnUI`. `specs/NativeDOM.js` uses `readonly` instead of `+`. `MountingManager.kt` and `NativeDOM.cpp` were re-inserted by hand. RN's own `SchedulerDelegateInvalidationTest.cpp` gtest would not compile against the new pure virtual, but app builds do not compile RN tests.

### [react-native+0.88.0+029+fix-deadlock-APP-7B2.patch](react-native+0.88.0+029+fix-deadlock-APP-7B2.patch)

- Reason: Fixes a fatal iOS app hang (APP-7B2) caused by a deadlock in Fabric's `ComponentDescriptorRegistry`. During HybridApp OldDot->NewDot transitions, a background thread lazily registering legacy interop component descriptors via `ComponentDescriptorRegistry::add()` holds a `unique_lock(mutex_)` while constructing a descriptor that calls `RCTUnsafeExecuteOnMainQueueSync`. Simultaneously, the main thread (driven by `CADisplayLink` animation ticks) tries to acquire `shared_lock(mutex_)` in `findComponentDescriptorByHandle_DO_NOT_USE_THIS_IS_BROKEN`. This creates a circular dependency: main waits for the lock, background waits for main. The fix moves descriptor construction outside the `unique_lock`, so the lock is only held for the two map insertions.
- Upstream PR/issue: https://github.com/facebook/react-native/issues/53128
- E/App issue: https://github.com/Expensify/App/issues/91292
- PR introducing patch: https://github.com/Expensify/App/pull/91736


### [react-native+0.88.0+030+fix-nil-BlobModule-crash-APP-8BM.patch](react-native+0.88.0+030+fix-nil-BlobModule-crash-APP-8BM.patch)

- Reason: Fixes a fatal iOS crash (APP-8BM) in HybridApp where `RCTNetworking`'s default URL-request-handler provider builds its handler list using an Objective-C array literal (`@[...]`) with `[moduleRegistry moduleForName:"BlobModule"]` at index 3. During OldDot↔NewDot bridge transitions, the `__weak _turboModuleRegistry` in `RCTModuleRegistry` is zeroed by ARC at the start of `TurboModuleManager` dealloc — before `[RCTNetworking invalidate]` clears the handler cache — leaving a window where a concurrent in-flight network request calls `prioritizedHandlers`, finds the cache empty, and tries to rebuild it with a nil `BlobModule`. Since `@[…]` compiles to `+[NSArray arrayWithObjects:count:]` which raises `NSInvalidArgumentException` on any nil element, the crash is fatal. The fix replaces the literal with an `NSMutableArray` built from the three always-non-nil handlers (`RCTHTTPRequestHandler`, `RCTDataRequestHandler`, `RCTFileRequestHandler`) and conditionally appends `BlobModule` only when the registry lookup is non-nil, turning a guaranteed crash into a graceful "no blob handler for this window".
- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/92413
- PR introducing patch: https://github.com/Expensify/App/pull/92918

### [react-native+0.88.0+031+nested-text-border-radius.patch](react-native+0.88.0+031+nested-text-border-radius.patch)

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
- 0.88.0 port: `DrawCommandSpan` became `CanvasEffectSpan` (no longer a `ReactSpan`/`UpdateAppearance`), so `ReactBackgroundDrawSpan` extends `CanvasEffectSpan(), ReactSpan, UpdateAppearance`. 0.88's `ReactTextView` already pre-draws these spans, so only the `postInvalidateOnAnimation()` fallback was kept there. MapBuffer keys 30/31 are taken upstream, so ours moved to 32-35. The `TextAttributes` hash hashes our optionals in a second `hash_combine_optionals` call (it takes at most 32 values).

### [react-native+0.88.0+032+fix-recycled-view-stale-frame.patch](react-native+0.88.0+032+fix-recycled-view-stale-frame.patch)

- Reason: Fixes an iOS Fabric bug where a recycled `RCTViewComponentView` keeps the geometry of its previous occupant, leaving an invisible view that swallows all touches (e.g. the app appears frozen after the `SplashScreenHider` fade/scale animation finishes). `prepareForRecycle` cleared `_layoutMetrics` to `{}` but never updated the physical `center`/`bounds`, nor did it reset the layer transform/opacity that libraries like Reanimated mutate directly on the UI thread (bypassing `_propKeysManagedByAnimated_DO_NOT_USE_THIS_IS_BROKEN`). When such a view was later dequeued for a zero-sized wrapper component, `updateLayoutMetrics` saw the incoming zero frame match the (already zero) stored `_layoutMetrics.frame`, skipped updating `center`/`bounds`, and the view retained the splash overlay's full-screen frame. The patch unconditionally realigns `layer.transform`/`layer.opacity` with the shadow-tree props and resets `center`/`bounds` to zero before the view returns to the recycle pool.
- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/91629
- PR introducing patch: https://github.com/Expensify/App/pull/92484
- 0.88.0 port: the `center`/`bounds` reset was dropped because upstream #57590 (`711a9a5e07`, in 0.88.0) resets `_layoutMetrics` to `EmptyLayoutMetrics` in `prepareForRecycle`. The unconditional `layer.transform`/`layer.opacity` reset is kept, because upstream still only resets them when Animated registered those keys.

### [react-native+0.88.0+033+fix-runtime-scheduler-delegate-uaf-APP-25V.patch](react-native+0.88.0+033+fix-runtime-scheduler-delegate-uaf-APP-25V.patch)

- Reason: Fixes a fatal iOS HybridApp crash (APP-25V) where `RuntimeScheduler_Modern::runEventLoopTick` can drain deferred Fabric rendering updates after the captured `SchedulerDelegate` has been torn down. RN 0.86.0 queues `Scheduler::uiManagerDidFinishTransaction` and `Scheduler::uiManagerDidDispatchCommand` callbacks with lambdas that capture the raw `delegate_` pointer by value. During OldDot↔NewDot lifecycle churn, the delegate can be replaced or destroyed before the scheduled rendering update runs, causing `EXC_BAD_ACCESS` when the lambda dereferences stale native memory. This patch backports the upstream RN scheduler-delegate invalidation guard by adding a per-delegate `shared_ptr<atomic<bool>>` token, invalidating the old token on delegate changes and Scheduler destruction, and making already-queued lambdas no-op before touching a stale delegate.
- Upstream PR/issue: https://github.com/facebook/react-native/pull/56680 / https://github.com/facebook/react-native/commit/aadbe965792bd900ca70412d6704b76e339d1aca
- E/App issue: https://github.com/Expensify/App/issues/92412
- PR introducing patch: https://github.com/Expensify/App/pull/93878
- 0.88.0 migration note: upstream removed the `enableSchedulerDelegateInvalidation` flag *and* its guard in `9682967a09` (#58138, in 0.88.0), relying on `RuntimeScheduler_Modern::handleTaskError` instead. That only covers teardown after an uncaught JS error; a delegate destroyed without an error (the HybridApp OldDot/NewDot switch behind APP-25V) is still a use-after-free, as the upstream commit message itself notes. The patch therefore re-adds the standalone `delegateInvalidated_` guard (the pre-0.86 version of this patch). Upstream's new death test in `SchedulerDelegateInvalidationTest.cpp` would no longer crash with it, but RN tests are not part of app builds.

### [react-native+0.88.0+034+nested-text-border-width.patch](react-native+0.88.0+034+nested-text-border-width.patch)

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
- 0.88.0 port: MapBuffer keys renumbered to 36-43 (see 031).

### [react-native+0.88.0+035+nested-text-padding.patch](react-native+0.88.0+035+nested-text-padding.patch)

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
- 0.88.0 port: MapBuffer keys renumbered to 44-45 (see 031). The trailing spacer now sits before 0.88's new text-effects coalescing step, so a text-effect range can span the spacer characters between fragments; this only matters when bordered spans and custom text effects are combined.

### [react-native+0.88.0+040+fix-android15-text-clipping.patch](react-native+0.88.0+040+fix-android15-text-clipping.patch)

- Reason: Backports upstream's fix for Android 15+ text clipping. `TextLayoutManager` sized text layouts from `ceil(Layout.getDesiredWidth(...))`, which sums glyph *advances* only; on Android 15+ a line's visual glyph bounds can exceed that, so the layout ends up a fraction of a pixel too narrow. Line breaking is a step function, so that shortfall moves a whole trailing word onto a second line inside a view whose height was computed for one line, and that line is clipped: the word disappears with no ellipsis and no change in row height. The patch adds a `getDesiredWidth` helper that, on API 35+, builds a probe `StaticLayout` with `setUseBoundsForWidth(true)` and returns `max(advanceWidth, ceil(visualBoundsWidth))`, so the desired width can never shrink below the previous value. Only the `AT_MOST` and `UNDEFINED` measure modes are affected; `EXACTLY` still uses the width Yoga supplies, and the final layout keeps the existing advance-based bounds mode — which is what got the earlier blanket `setUseBoundsForWidth` attempt reverted in [5964a197](https://github.com/facebook/react-native/commit/5964a197) after multiline and wrapping regressions.
- Why this rather than reverting `LINEAR_TEXT_FLAG`: RN 0.86 made `Paint.LINEAR_TEXT_FLAG` unconditional ([#56409](https://github.com/facebook/react-native/pull/56409)) — the `enableAndroidLinearText` flag it deleted defaulted to `false` in OSS, so 0.85.3 never set it. Disabling hinting shifts glyph advance widths by a fraction of a pixel, widening the advance-vs-visual-bounds gap and pushing borderline strings over the wrapping threshold; that is why the bug presents as a 0.85.3 → 0.86.0 regression. Reverting the flag was verified to fix the reported cases too, but it only removes the amplifier — the advance-based measurement stays wrong and borderline strings can still wrap. This patch fixes the measurement itself, keeps 0.86's intended text rendering, and is not a deviation from upstream.
- Upstream PR/issue: [facebook/react-native#57117](https://github.com/facebook/react-native/pull/57117) (fixes [#56402](https://github.com/facebook/react-native/issues/56402))
- E/App issue: [#98499](https://github.com/Expensify/App/issues/98499) [#98690](https://github.com/Expensify/App/issues/98690)
- PR introducing patch: https://github.com/Expensify/App/pull/99069
- Reproduction: Android 16, custom font, non-default font scale *and* non-default display density — e.g. `wm size 1080x2340`, `wm density 420` (physical 450), `settings put system font_scale 0.8`, matching the Galaxy S25 FE the bug was reported on. The layout must be re-mounted (navigate forward, then back) before the clipping appears. Devices at their physical density are far less likely to hit it: at 450 dpi a 1080 px screen is exactly 384 dp, while the 420 dpi override makes it 411.428571… dp, so every derived width carries a fractional residue for `ceil`/`floor` to disagree on.
- Upstream history: this is upstream's *third* attempt at the same bug. [#54721](https://github.com/facebook/react-native/pull/54721) (commit [8347cc4b5](https://github.com/facebook/react-native/commit/8347cc4b50ca9229b638d0823d3148fed50b9a61)) closed [#53286](https://github.com/facebook/react-native/issues/53286) in December 2025 by calling `setUseBoundsForWidth(true)` on the final `StaticLayout`, but it was gated behind `fixTextClippingAndroid15useBoundsForWidth`, which **defaulted to `false` in OSS** — so 0.85.3 never ran it. RN 0.86.0 removed the flag and both call sites after multiline and wrapping regressions, leaving only the now-unused `setUseBoundsForWidthMethod` reflection handle in `TextLayoutManager` (which this patch reuses). The bug was refiled as [#56402](https://github.com/facebook/react-native/issues/56402) and is still open. #57117 is the narrower retry: the visual-bounds layout is only a measurement probe, so the final layout keeps advance-based bounds. **Because the two earlier attempts were reverted for wrapping regressions specifically, wrapping is the thing to regression-test on Android 15+.**
- 0.86.0 migration note: **upstream #57117 is still open and has not been reviewed by Meta.** Re-evaluate on the RN 0.87 upgrade and drop this patch once the fix lands upstream. Two things to weigh before shipping: the probe layout costs one extra `StaticLayout` build per text measure on API 35+ for `AT_MOST`/`UNDEFINED`, on a hot path; and widening measured text can change wrapping app-wide on Android 15+. The upstream diff's `TextLayoutManagerAbsoluteLayoutWithFractionalPixelTest.kt` hunks are omitted because the npm package does not ship `ReactAndroid/src/test`.

### [react-native+0.88.0+043+clamp-blob-range-APP-KDN.patch](react-native+0.88.0+043+clamp-blob-range-APP-KDN.patch)

- Reason: Defence in depth for the same crash (APP-KDN, `NSRangeException: -[NSConcreteMutableData subdataWithRange:]: range {0, 321} exceeds data length 318`). `RCTBlobManager resolve:offset:size:` sliced the stored `NSData` with the JS-supplied offset and size without range-checking them, so any descriptor/data desync raised an `NSRangeException` on a background queue where no JS frame can catch it and the app dies. This clamps the range to the bytes actually stored and logs when it has to — an out-of-bounds offset returns `nil`, an oversized size is truncated — and adds the same logging to the silently-0-byte part paths in `createFromParts:withId:`. `size < 0` still means "the whole blob", preserving the existing `-1` contract. Android is already forgiving here ([`Arrays.copyOfRange`](https://github.com/facebook/react-native/blob/v0.86.0/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/modules/blob/BlobModule.kt)), which is why the crash is iOS-only.
- Why both patches: patch 042 fixes the producer; on its own this one would turn the crash into silent data loss (a leading NUL resolves to 0 bytes and uploads as an empty attachment as if it had succeeded). It is here so any *future* desync degrades and logs instead of killing the app. `RCTLogWarn` rather than `RCTLogError` deliberately: this runs on a background queue and `RCTLogError` red-boxes on every occurrence in dev.
- Upstream PR/issue: [react/react-native#58566](https://github.com/react/react-native/pull/58566) — open, not merged. Still unfixed in every release to date: `v0.88.0-rc.1` has the same unchecked `subdataWithRange:`. Re-check on each RN upgrade and drop this patch once the adopted release contains it.
- E/App issue: https://github.com/Expensify/App/issues/100843
- PR introducing patch: this PR.

### [react-native+0.88.0+045+soft-fail-addViewAt-non-ViewGroup-parent-APP-K0G.patch](react-native+0.88.0+045+soft-fail-addViewAt-non-ViewGroup-parent-APP-K0G.patch)

- Reason: Fixes the fatal `IllegalStateException: Unable to add a view into a view that is not a ViewGroup` behind `APP-K0G`. `SurfaceMountingManager.addViewAt` throws when the parent tag has a `ViewState` whose view is null or not a `ViewGroup`. The usual source is a placeholder `ViewState` with no view, which `updateEventEmitter` creates for a tag Java no longer has; the next batch's `Insert` into that tag then throws, and `IntBufferBatchMountItem` is not retryable, so the app crashes. The crash kept firing after `+015` shipped in `9.4.93-3` (last seen on `9.4.94-0`), so the remaining sources (delayed deletes during touches, differ flatten/unflatten bugs, Reanimated-rewritten transactions) still reach it. The patch soft-logs a `ReactNoCrashSoftException` with the parent view class and skips the insert, which matches upstream's handling of the same condition in `removeViewAt` and the missing-`ViewState` case already handled a few lines above in `addViewAt`. The child may be missing until the next render that rebuilds that parent, instead of the app crashing.
- Upstream PR/issue: [react-native@3f553d7](https://github.com/react/react-native/commit/3f553d76bc3f4f57e62653d11bab415a21cd02a8) (same change for `removeViewAt`), [react-native#58526](https://github.com/react/react-native/issues/58526) (placeholder `ViewState` from `updateEventEmitter`), [react-native#58527](https://github.com/react/react-native/pull/58527) (open, guards only the child)
- E/App issue: https://github.com/Expensify/App/issues/102741
- PR introducing patch: https://github.com/Expensify/App/pull/102901
- 0.86.0 migration note: drop this patch once the adopted React Native release no longer throws for a non-`ViewGroup` parent in `addViewAt`. Re-check on the RN 0.87 upgrade.
- 0.88.0 port: 0.88 now does `checkNotNull(parentView)` and then throws for a non-`ViewGroup` parent. The `checkNotNull` was removed and the throw turned into the soft log + `return`, so a null parent is covered as on 0.86.

### [react-native+0.88.0+046+fix-differ-nested-flatten-moved-view.patch](react-native+0.88.0+046+fix-differ-nested-flatten-moved-view.patch)

- Reason: Backports an upstream differ fix. When a view flattens in the same commit in which its parent unflattens, and one of its children has a negative `zIndex`, the differ creates that child again while it is still mounted, or deletes it even though it only moves. The patch makes the final create/delete loop in `calculateShadowViewMutationsFlattener` also skip candidates whose tag the recursion recorded in the sub-visited map, and stops `unvisitedRecursiveChildPairs` from storing a pointer to a loop-local copy. Mutations like these leave the native tree out of sync with the shadow tree, which is one of the sources of the Android Fabric mount crashes tracked in `APP-K0G`, `APP-7AR`, and `APP-H7A`. The only change from upstream is `find(...) != end()` in place of `contains(...)`, because 0.86.0's `DiffMap` has no `contains`.
- Upstream PR/issue: [react-native#58648](https://github.com/react/react-native/pull/58648) / [react-native@361bc24](https://github.com/react/react-native/commit/361bc240e42fb4db0568c1d411116c6bf8f7049d), issue [react-native#58647](https://github.com/react/react-native/issues/58647)
- E/App issue: https://github.com/Expensify/App/issues/102741
- PR introducing patch: https://github.com/Expensify/App/pull/102901
- 0.86.0 migration note: drop this patch once the adopted React Native release contains `361bc24`.

### [react-native+0.88.0+047+soft-fail-removeViewAt-non-ViewGroup-parent-APP-H7A.patch](react-native+0.88.0+047+soft-fail-removeViewAt-non-ViewGroup-parent-APP-H7A.patch)

- Reason: Fixes the fatal `IllegalStateException: Unable to remove a view from a view that is not a ViewGroup` behind `APP-H7A`. `SurfaceMountingManager.removeViewAt` throws when the parent tag has a `ViewState` whose view is null or not a `ViewGroup`. It is the `Remove` counterpart of `APP-K0G` (`+045`), with the same sources: a placeholder `ViewState` with no view created by `updateEventEmitter`, delayed deletes during touches, and differ flatten/unflatten bugs (`+046` closes one of them). `IntBufferBatchMountItem` is not retryable, so the throw kills the app. A view that is not a `ViewGroup` cannot hold children, so the removal is a no-op. The patch soft-logs a `ReactNoCrashSoftException` with the parent view class and returns, which is the upstream fix. If the child is still attached to a stale native parent, the next `addViewAt` of that child already detaches it (the "View already has a parent" branch), so nothing crashes later. The log message keeps 0.86.0's wording and adds `ParentView` the same way `+045` does. Unlike upstream, the patch also covers a null `parentView`: 0.86.0 has no `checkNotNull(parentView)` before this check, so null falls into the same branch, while upstream still crashes on it.
- Upstream PR/issue: [react-native#57860](https://github.com/react/react-native/pull/57860) / [react-native@3f553d7](https://github.com/react/react-native/commit/3f553d76bc3f4f57e62653d11bab415a21cd02a8)
- E/App issue: https://github.com/Expensify/App/issues/103369
- PR introducing patch: https://github.com/Expensify/App/pull/103447
- 0.86.0 migration note: the adopted release containing `3f553d7` is not enough to drop this patch. `0.87.0` still throws here and already has `checkNotNull(parentView)` right before this check. `0.88` soft-fails a non-`ViewGroup` parent but keeps that `checkNotNull`, so a null `parentView` (the placeholder `ViewState` from [react-native#58526](https://github.com/react/react-native/issues/58526)) still crashes. On the 0.88 upgrade, reduce it to soft-failing the `checkNotNull` only. Drop it once upstream handles a null `parentView` in `removeViewAt`.
- 0.88.0 port: 0.88 already soft-fails a non-`ViewGroup` parent (`3f553d7`), so the patch is reduced to the null case: `checkNotNull(parentView)` removed and the class-name lookup in the message made null-safe. The log text is now upstream's, not the 0.86 patch's.
