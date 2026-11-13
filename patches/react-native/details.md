# `react-native` patches

### [react-native+0.88.0+001+fixMVCPAndroid.patch](react-native+0.88.0+001+fixMVCPAndroid.patch)

- Reason: Fixes content jumping issues with `MaintainVisibleContentPosition` on Android, particularly in bidirectional pagination scenarios. The patch:
  1. Changes when the first visible view is calculated - now happens on scroll events instead of during Fabric's willMountItems lifecycle, which was causing incorrect updates
  2. Improves first visible view selection logic to handle Fabric's z-index-based view reordering by finding the view with the smallest position that's still greater than the scroll position
  3. Preserves a positioned, zero-sized first child as a scroll anchor. LegendList moves this anchor to compensate for item measurements. Selecting its surrounding container or rejecting its empty frame prevents native scroll compensation and makes the chat jump as estimated rows shrink. LegendList 3.7 places the anchor at its adjustment offset plus 10,000,000 pixels, beyond the viewport. The strict visibility check also prevents a fixed, zero-sized spacer at or above the scroll offset in another scroll view from taking over its visible-content anchor.
- Scope: This changes Android `MaintainVisibleContentPosition` for every React Native scroll view that enables it, not only the report-action list. Keep this in mind when updating React Native or investigating anchoring in other scroll views.
- Upstream PR/issue: https://github.com/react/react-native/pull/57959 merged on 2026-10-28 as [9bc1a28a9623419d62eb350acd0c172644e2c022](https://github.com/react/react-native/commit/9bc1a28a9623419d62eb350acd0c172644e2c022). It ports the original Android MVCP proposal and includes z-index anchor selection and support for LegendList's positioned, zero-sized anchor.
- Expected release: React Native 0.89.0, [currently scheduled for 2026-12-07](https://reactnative.dev/releases/overview), unless cherry-picked into an earlier release. The fix landed after the 0.88 branch cut and before the scheduled 0.89 branch cut on 2026-11-03.
- Reproducer: https://github.com/react/react-native/pull/59360 adds the RNTester reproduction, without a runtime fix. The standalone reproduction and proposed anchor patch are in https://github.com/margelo/react-native-mvcp-reproducer.
- Earlier proposal: https://github.com/react/react-native/pull/46247 closed without merging.
- Removal: Expected to be removable when the adopted React Native release contains `9bc1a28`. Before removing it, verify bidirectional pagination, changing row heights, and LegendList's positioned-anchor corrections with the patch disabled. Keep it on React Native 0.88 unless the upstream fix is backported.
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/46315 (introduced), https://github.com/Expensify/App/pull/45289 (refactored)

### [react-native+0.88.0+002+disableTextInputRecycling.patch](react-native+0.88.0+002+disableTextInputRecycling.patch)

- Reason: Disables text input recycling to prevent issues with state of recycled component
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/13767

### [react-native+0.88.0+003+iOSFontResolution.patch](react-native+0.88.0+003+iOSFontResolution.patch)

- Reason: Fixes font resolution issues on iOS by properly preserving font properties when loading fonts by name. When a font is loaded by its name, the patch now correctly extracts and uses its actual weight and style properties instead of ignoring them.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/13767

### [react-native+0.88.0+004+resetAutoresizingOnView.patch](react-native+0.88.0+004+resetAutoresizingOnView.patch)

- Reason: This is a workaround fix for an issue with `UIPageViewController` and Fabric's view recycling system. The problem occurs because pager-view was incorrectly using a Fabric-provided view as its content-view. This is problematic because `UIPageViewController` modifies its content view, and when Fabric later recycles this modified view, it can lead to unexpected layout issues. The patch addresses this by resetting the autoresizing mask on the view to prevent layout corruption when views are recycled. The root cause should be addressed in react-native-pager-view: https://github.com/callstack/react-native-pager-view/issues/819
- Upstream PR/issue: https://github.com/facebook/react-native/issues/42732
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/13767

### [react-native+0.88.0+005+TextInput.patch](react-native+0.88.0+005+TextInput.patch)

- Reason: Fixes TextInput component issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.88.0+006+copyStateOnClone.patch](react-native+0.88.0+006+copyStateOnClone.patch)

- Reason: Ensures state is properly copied when cloning components
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.88.0+007+textinput-clear-command.patch](react-native+0.88.0+007+textinput-clear-command.patch)

- Reason: Adds clear command functionality to TextInput
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.88.0+008+Add-onPaste-to-TextInput.patch](react-native+0.88.0+008+Add-onPaste-to-TextInput.patch)

- Reasons:
    - Adds `onPaste` callback to `TextInput` to support image pasting on native
    - Fixes an issue where pasted image displays as binary text on some Android devices where rich clipboard data is stored in binary form
    - Fixes an issue where pasting from WPS Office app crashes the app on Android where its content URI is not recognized by Android `ContentResolver`
    - Fixes an issue where mentions copied from mWeb and pasted on Android are not displayed.
    - Fixes an issue on iOS where pasting an image failed with "We couldn't process this image" when the first image representation on the pasteboard (e.g. HEIC) could not be read: unreadable representations are now skipped, HEIC/HEIF is tried last so a PNG or JPEG of the same image is used directly when the pasteboard offers one (no HEIC to JPEG conversion needed), the decoded `UIImage` is used as a fallback, and no file is emitted when nothing can be read.
- Upstream PR/issue: https://github.com/facebook/react-native/pull/45425
- Upstream RFC: https://github.com/s77rt/discussions-and-proposals/blob/TextInput-onPaste/proposals/0000-textinput-onpaste.md
- E/App issue:
    - https://github.com/Expensify/App/issues/41239
    - https://github.com/Expensify/App/issues/55304
    - https://github.com/Expensify/App/issues/63191
    - https://github.com/Expensify/App/issues/75991
- PR Introducing Patch: [#47203](https://github.com/Expensify/App/pull/47203)

### [react-native+0.88.0+009+alert-style.patch](react-native+0.88.0+009+alert-style.patch)

- Reason: Fixes alert styling issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.88.0+010+fixScrollViewState.patch](react-native+0.88.0+010+fixScrollViewState.patch)

- Reason: Fixes ScrollView state management issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.88.0+011+fix-mask-persisting-recycling.patch](react-native+0.88.0+011+fix-mask-persisting-recycling.patch)

- Reason: Fixes mask persisting and recycling issues
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.88.0+012+fix-text-selecting-on-change.patch](react-native+0.88.0+012+fix-text-selecting-on-change.patch)

- Reason: Fixes text selection issues during onChange events
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.88.0+013+fix-merged-transaction-mount-order.patch](react-native+0.88.0+013+fix-merged-transaction-mount-order.patch)

- Reason: Fixes the Android Fabric mount-item failures behind `APP-7AR` (`addViewAt: failed to insert view into parent`, underlying `IndexOutOfBoundsException: index=1 count=0`) and `APP-H7A` (`Unable to remove a view from a view that is not a ViewGroup`). Both fire when a mount batch is applied to a native view tree that no longer matches the shadow tree the batch was computed against. On Android, `FabricUIManagerBinding::schedulerDidFinishTransaction` merges a finished transaction into the one still pending for the same surface whenever commits outpace UI-thread mounting, and `FabricMountingManager::executeMount` then writes `Delete` mount items last and splits `Update`s into their own buckets. React Native's own comment on that block says the optimization "is incorrect when multiple transactions are merged together": a merged `REMOVE -> DELETE | CREATE -> INSERT` sequence is mounted as `INSERT -> REMOVE -> DELETE`, which destroys a view the shadow tree still considers mounted, and every index computed for that parent afterwards is stale. The patch sets `maintainMutationOrder` whenever the transaction is a merge of several commits (`MountingTransaction::wasMerged()`), so a merged batch is mounted in differ order and no mutation pairing can be reordered. Transactions that were never merged keep the delete-batching optimization exactly as it is, and differ-order mounting is already a supported mode - it is what `disableMountItemReorderingAndroid` turns on globally.
- Why the whole `maintainMutationOrder` flag and not just the deletes: the FIXME is attached to the deletes-last write block, but the same flag also un-buckets the six `Update` categories, which are otherwise emitted ahead of every `Delete`. That second half matters - in a merged batch, bucketing hoists an `Update(X)` from commit N in front of a `Create(X)` from commit N+1, so commit N's props land on the view commit N+1 created. Narrowing this patch to deletes only would reintroduce that case. The cost is that a merged batch writes one int-buffer preamble per instruction run instead of one per type, so an insert-heavy merged batch carries a slightly larger int array; it is still a single batch, a single JNI call and the same mount-item count, and it is cheaper than the two separate batches `fix-dropping-mutations-in-transactions` produced whenever it refused a merge.
- Replaces the previous `fix-dropping-mutations-in-transactions` patch, which is deleted here. That patch guarded the same hazard from the other side, by refusing the merge when the incoming transaction created a tag the pending one deleted. It only inspected `Type::Create`, so pairings such as `Delete(tag)` + `Insert(same tag)` still merged, and refusing a merge left a surface holding several pending transactions - a state upstream's merge-target lookup and its swap-then-mount drain do not expect. Mounting merged transactions in differ order closes the hazard for every pairing, so both the guard and the multi-pending state it created are unnecessary.
- Upstream PR/issue: React Native's own `FIXME: this optimization is incorrect when multiple transactions are merged together` in [`FabricMountingManager.cpp`](https://github.com/facebook/react-native/blob/v0.86.0/packages/react-native/ReactAndroid/src/main/jni/react/fabric/FabricMountingManager.cpp#L974-L980). The merging this patch makes safe is upstream behaviour, but the FIXME is unfixed upstream, so there is nothing to adopt.
- E/App issue: [#98791](https://github.com/Expensify/App/issues/98791) (parent tracker [#91302](https://github.com/Expensify/App/issues/91302))
- PR introducing patch: https://github.com/Expensify/App/pull/101057
- Removal: drop this patch once `disableMountItemReorderingAndroid` defaults to true upstream (still `false` in 0.88.0), or if Android stops merging mounting transactions - either one makes it redundant.

### [react-native+0.88.0+014+fix-crash-when-deleting-expense.patch](react-native+0.88.0+014+fix-crash-when-deleting-expense.patch)

- Reason: Fixes crash when deleting expenses
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: 🛑

### [react-native+0.88.0+015+publish-gradle.patch](react-native+0.88.0+015+publish-gradle.patch)

- Reason: This patch customizes the Gradle publishing script to allow publishing our custom React Native artifacts to GitHub Packages. The POM records the patches hash and the Hermes version the artifact was compiled against, which `scripts/artifacts-utils/lib/artifactsResolver.ts` matches before consuming an artifact.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/59738

### [react-native+0.88.0+016+textinput-prevent-focus-on-first-responder.patch](react-native+0.88.0+016+textinput-prevent-focus-on-first-responder.patch)

- Reason: On iOS, a text input automatically becomes the "first responder" in UIKit's "UIResponder" chain. Once a text input becomes the first responder, it will be automatically focused. (This also causes the keyboard to open)
    - This is not handled by React or React Native, but is rather a native iOS/UIKit behaviour. This patch adds an additional `TextInput` prop (`preventFocusOnFirstResponder`) and a ref method (`preventFocusOnFirstResponderOnce`) to bypass the focus on first responder.
    - In E/App this causes issues with e.g. the keyboard briefly opening after a modal has been dismissed before another modal is opened (`ReportActionContextMenu` -> `EmojiPicker`)
- Upstream PR/issue: None, because this is not a real bug fix but a hotfix specific to Expensify
- E/App issue: [#54813](https://github.com/Expensify/App/issues/54813)
- PR Introducing Patch: [#61492](https://github.com/Expensify/App/pull/61492)

### [react-native+0.88.0+017+fix-modal-transparent-navigation-bar.patch](react-native+0.88.0+017+fix-modal-transparent-navigation-bar.patch)

- Reason: This patch fixes an issue where it is not possible to enable a transparent navigation bar on Android, and keeps the modal's system bar icons in sync with the activity. The `dialog === newDialog` check in the call that `showOrUpdate()` posts fixes the fatal `IllegalStateException: dialog must exist when we call updateProperties` behind `APP-M66`, which happens when the modal is dismissed before that call runs. Keep this check when regenerating the patch.
- Upstream PR/issue: 🛑
- E/App issue: [#69005](https://github.com/Expensify/App/issues/69005), [#103778](https://github.com/Expensify/App/issues/103778)
- PR introducing patch: [#69004](https://github.com/Expensify/App/pull/69004) (introduced), [#104689](https://github.com/Expensify/App/pull/104689) (`APP-M66` guard)

### [react-native+0.88.0+018+perf-increase-initial-heap-size.patch](react-native+0.88.0+018+perf-increase-initial-heap-size.patch)

- Reason: This patch increases the initial heap size of the Hermes runtime. This allows us to disable Hermes Young-Gen Garbage Collection (GC) in a separate patch, which improves initial TTI and app startup time.
- Upstream PR/issue: This is not intended to be upstreamed, since this is a low-level fix very specific to the Expensify app's requirements.
- E/App issue: [#76859](https://github.com/Expensify/App/issues/76859)
- PR introducing patch: [#76154](https://github.com/Expensify/App/pull/76154)

### [react-native+0.88.0+019+perf-disable-hermes-young-gc-before-tti-reached.patch](react-native+0.88.0+019+perf-disable-hermes-young-gc-before-tti-reached.patch)

- Reason: This patch disables Hermes Young-Gen Garbage Collection (GC), which improves initial TTI and app startup time, by delaying GC for early allocated memory to the first Old-Gen GC run.
- Upstream PR/issue: This is not intended to be upstreamed, since this is a low-level fix very specific to the Expensify app's requirements.
- E/App issue: [#76859](https://github.com/Expensify/App/issues/76859)
- PR introducing patch: [#76154](https://github.com/Expensify/App/pull/76154)

### [react-native+0.88.0+020+strip-hermes-debug-info.patch](react-native+0.88.0+020+strip-hermes-debug-info.patch)

- Reason: Always pass `-output-source-map` to `hermesc` for production iOS builds, stripping ~13.4MB of debug metadata from the Hermes bytecode. Previously this flag was only passed when `SOURCEMAP_FILE` was set; if the build environment didn't propagate that variable, debug info remained in the shipped bundle.
- Upstream PR/issue: This should ideally be the default behavior upstream, but no PR has been filed yet.
- E/App issue: [#83000](https://github.com/Expensify/App/issues/83000)
- PR introducing patch: [#83256](https://github.com/Expensify/App/pull/83256)

### [react-native+0.88.0+022+fix-display-contents-dirty-flag.patch](react-native+0.88.0+022+fix-display-contents-dirty-flag.patch)

- Reason: When a child node has `display: contents`, Yoga may reuse cached layout results from a previous pass even though the subtree has changed. This patch marks the parent yoga node as dirty when it encounters a child with `display: contents`, ensuring Yoga re-visits and recalculates the layout for that subtree instead of skipping it.
- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/85877
- PR introducing patch: 🛑

### [react-native+0.88.0+023+fix-fabric-collapsed-accessibility-announcement.patch](react-native+0.88.0+023+fix-fabric-collapsed-accessibility-announcement.patch)

- Reason: Fixes a Fabric regression where VoiceOver on iOS only announces "expanded" but never "collapsed" for elements with `accessibilityState.expanded`. In `RCTViewComponentView.mm`, the code uses `value_or(false)` which skips the announcement entirely when `expanded` is `false`. This patch changes the logic to use `has_value()` and correctly announce both "expanded" and "collapsed" states, matching the old architecture (Paper) behavior.
- Upstream PR/issue: https://github.com/facebook/react-native/issues/56296
- E/App issue: [#76929](https://github.com/Expensify/App/issues/76929)

### [react-native+0.88.0+024+fix-pressability-new-arch.patch](react-native+0.88.0+024+fix-pressability-new-arch.patch)

- Reason: Fixes an Android-specific issue (reproducible on certain Samsung models) where `onPress` events do not trigger for `Pressable` components when used inside a `Tooltip`. The root cause is that in the new architecture, `Pressability.measure()` reads stale layout information from the shadow tree instead of the actual native view hierarchy. This patch introduces a new `measureAsyncOnUI` method that measures the view asynchronously using the native layout hierarchy on the UI thread, bypassing stale shadow tree data.
- Upstream PR/issue: [facebook/react-native#51835](https://github.com/facebook/react-native/pull/51835)
- E/App issue: [#59953](https://github.com/Expensify/App/issues/59953)

### [react-native+0.88.0+025+fix-deadlock-APP-7B2.patch](react-native+0.88.0+025+fix-deadlock-APP-7B2.patch)

- Reason: Fixes a fatal iOS app hang (APP-7B2) caused by a deadlock in Fabric's `ComponentDescriptorRegistry`. During HybridApp OldDot->NewDot transitions, a background thread lazily registering legacy interop component descriptors via `ComponentDescriptorRegistry::add()` holds a `unique_lock(mutex_)` while constructing a descriptor that calls `RCTUnsafeExecuteOnMainQueueSync`. Simultaneously, the main thread (driven by `CADisplayLink` animation ticks) tries to acquire `shared_lock(mutex_)` in `findComponentDescriptorByHandle_DO_NOT_USE_THIS_IS_BROKEN`. This creates a circular dependency: main waits for the lock, background waits for main. The fix moves descriptor construction outside the `unique_lock`, so the lock is only held for the two map insertions.
- Upstream PR/issue: https://github.com/facebook/react-native/issues/53128
- E/App issue: https://github.com/Expensify/App/issues/91292
- PR introducing patch: https://github.com/Expensify/App/pull/91736


### [react-native+0.88.0+026+fix-nil-BlobModule-crash-APP-8BM.patch](react-native+0.88.0+026+fix-nil-BlobModule-crash-APP-8BM.patch)

- Reason: Fixes a fatal iOS crash (APP-8BM) in HybridApp where `RCTNetworking`'s default URL-request-handler provider builds its handler list using an Objective-C array literal (`@[...]`) with `[moduleRegistry moduleForName:"BlobModule"]` at index 3. During OldDot↔NewDot bridge transitions, the `__weak _turboModuleRegistry` in `RCTModuleRegistry` is zeroed by ARC at the start of `TurboModuleManager` dealloc — before `[RCTNetworking invalidate]` clears the handler cache — leaving a window where a concurrent in-flight network request calls `prioritizedHandlers`, finds the cache empty, and tries to rebuild it with a nil `BlobModule`. Since `@[…]` compiles to `+[NSArray arrayWithObjects:count:]` which raises `NSInvalidArgumentException` on any nil element, the crash is fatal. The fix replaces the literal with an `NSMutableArray` built from the three always-non-nil handlers (`RCTHTTPRequestHandler`, `RCTDataRequestHandler`, `RCTFileRequestHandler`) and conditionally appends `BlobModule` only when the registry lookup is non-nil, turning a guaranteed crash into a graceful "no blob handler for this window".
- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/92413
- PR introducing patch: https://github.com/Expensify/App/pull/92918

### [react-native+0.88.0+027+nested-text-border-radius.patch](react-native+0.88.0+027+nested-text-border-radius.patch)

- Reason:

    ```
    Adds borderRadius / per-corner radius support for nested <Text> backgrounds on iOS and Android.
    On the C++ side, borderRadius + borderTopLeftRadius / borderTopRightRadius /
    borderBottomLeftRadius / borderBottomRightRadius fields are added to TextAttributes and wired
    through BaseTextProps and conversions. borderRadius acts as a fallback for unset individual
    corners; unset corners default to 0 when any radius prop is present. On Android, a custom
    CanvasEffectSpan with ReactBackgroundDrawSpan draws rounded-rect backgrounds using the four
    effective corner radii. On iOS, a custom NSLayoutManager subclass
    (RCTTextLayoutManagerWithBorderRadius) overrides fillBackgroundRectArray to draw per-corner
    rounded rectangles using CGPath, with per-line outer-corner rounding for multiline spans.
    ```

- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/78873
- PR introducing patch: https://github.com/Expensify/App/pull/84556

### [react-native+0.88.0+028+fix-recycled-view-stale-frame.patch](react-native+0.88.0+028+fix-recycled-view-stale-frame.patch)

- Reason: Fixes an iOS Fabric bug where a recycled `RCTViewComponentView` keeps the geometry of its previous occupant, leaving an invisible view that swallows all touches (e.g. the app appears frozen after the `SplashScreenHider` fade/scale animation finishes). `prepareForRecycle` cleared `_layoutMetrics` to `{}` but never updated the physical `center`/`bounds`, nor did it reset the layer transform/opacity that libraries like Reanimated mutate directly on the UI thread (bypassing `_propKeysManagedByAnimated_DO_NOT_USE_THIS_IS_BROKEN`). When such a view was later dequeued for a zero-sized wrapper component, `updateLayoutMetrics` saw the incoming zero frame match the (already zero) stored `_layoutMetrics.frame`, skipped updating `center`/`bounds`, and the view retained the splash overlay's full-screen frame. The patch unconditionally realigns `layer.transform`/`layer.opacity` with the shadow-tree props before the view returns to the recycle pool. Resetting `center`/`bounds` is upstream since 0.88.0 (#57590).
- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/91629
- PR introducing patch: https://github.com/Expensify/App/pull/92484

### [react-native+0.88.0+029+fix-runtime-scheduler-delegate-uaf-APP-25V.patch](react-native+0.88.0+029+fix-runtime-scheduler-delegate-uaf-APP-25V.patch)

- Reason: Fixes a fatal iOS HybridApp crash (APP-25V) where `RuntimeScheduler_Modern::runEventLoopTick` can drain deferred Fabric rendering updates after the captured `SchedulerDelegate` has been torn down. React Native queues `Scheduler::uiManagerDidFinishTransaction` and `Scheduler::uiManagerDidDispatchCommand` callbacks with lambdas that capture the raw `delegate_` pointer by value. During OldDot↔NewDot lifecycle churn, the delegate can be replaced or destroyed before the scheduled rendering update runs, causing `EXC_BAD_ACCESS` when the lambda dereferences stale native memory. This patch backports the upstream RN scheduler-delegate invalidation guard by adding a per-delegate `shared_ptr<atomic<bool>>` token, invalidating the old token on delegate changes and Scheduler destruction, and making already-queued lambdas no-op before touching a stale delegate.
- Upstream PR/issue: https://github.com/facebook/react-native/pull/56680 / https://github.com/facebook/react-native/commit/aadbe965792bd900ca70412d6704b76e339d1aca. Upstream removed the guard again in 0.88.0 (#58138), which still crashes when the delegate is destroyed without a JS error.
- E/App issue: https://github.com/Expensify/App/issues/92412
- PR introducing patch: https://github.com/Expensify/App/pull/93878

### [react-native+0.88.0+030+nested-text-border-width.patch](react-native+0.88.0+030+nested-text-border-width.patch)

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

### [react-native+0.88.0+031+nested-text-padding.patch](react-native+0.88.0+031+nested-text-padding.patch)

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

### [react-native+0.88.0+032+fix-android15-text-clipping.patch](react-native+0.88.0+032+fix-android15-text-clipping.patch)

- Reason: Backports upstream's fix for Android 15+ text clipping. `TextLayoutManager` sized text layouts from `ceil(Layout.getDesiredWidth(...))`, which sums glyph *advances* only; on Android 15+ a line's visual glyph bounds can exceed that, so the layout ends up a fraction of a pixel too narrow. Line breaking is a step function, so that shortfall moves a whole trailing word onto a second line inside a view whose height was computed for one line, and that line is clipped: the word disappears with no ellipsis and no change in row height. The patch adds a `getDesiredWidth` helper that, on API 35+, builds a probe `StaticLayout` with `setUseBoundsForWidth(true)` and returns `max(advanceWidth, ceil(visualBoundsWidth))`, so the desired width can never shrink below the previous value. Only the `AT_MOST` and `UNDEFINED` measure modes are affected; `EXACTLY` still uses the width Yoga supplies, and the final layout keeps the existing advance-based bounds mode — which is what got the earlier blanket `setUseBoundsForWidth` attempt reverted in [5964a197](https://github.com/facebook/react-native/commit/5964a197) after multiline and wrapping regressions.
- Why this rather than reverting `LINEAR_TEXT_FLAG`: RN 0.86 made `Paint.LINEAR_TEXT_FLAG` unconditional ([#56409](https://github.com/facebook/react-native/pull/56409)) — the `enableAndroidLinearText` flag it deleted defaulted to `false` in OSS, so 0.85.3 never set it. Disabling hinting shifts glyph advance widths by a fraction of a pixel, widening the advance-vs-visual-bounds gap and pushing borderline strings over the wrapping threshold; that is why the bug presents as a 0.85.3 → 0.86.0 regression. Reverting the flag was verified to fix the reported cases too, but it only removes the amplifier — the advance-based measurement stays wrong and borderline strings can still wrap. This patch fixes the measurement itself, keeps 0.86's intended text rendering, and is not a deviation from upstream.
- Upstream PR/issue: [facebook/react-native#57117](https://github.com/facebook/react-native/pull/57117) (fixes [#56402](https://github.com/facebook/react-native/issues/56402))
- E/App issue: [#98499](https://github.com/Expensify/App/issues/98499) [#98690](https://github.com/Expensify/App/issues/98690)
- PR introducing patch: https://github.com/Expensify/App/pull/99069
- Reproduction: Android 16, custom font, non-default font scale *and* non-default display density — e.g. `wm size 1080x2340`, `wm density 420` (physical 450), `settings put system font_scale 0.8`, matching the Galaxy S25 FE the bug was reported on. The layout must be re-mounted (navigate forward, then back) before the clipping appears. Devices at their physical density are far less likely to hit it: at 450 dpi a 1080 px screen is exactly 384 dp, while the 420 dpi override makes it 411.428571… dp, so every derived width carries a fractional residue for `ceil`/`floor` to disagree on.
- Upstream history: this is upstream's *third* attempt at the same bug. [#54721](https://github.com/facebook/react-native/pull/54721) (commit [8347cc4b5](https://github.com/facebook/react-native/commit/8347cc4b50ca9229b638d0823d3148fed50b9a61)) closed [#53286](https://github.com/facebook/react-native/issues/53286) in December 2025 by calling `setUseBoundsForWidth(true)` on the final `StaticLayout`, but it was gated behind `fixTextClippingAndroid15useBoundsForWidth`, which **defaulted to `false` in OSS** — so 0.85.3 never ran it. RN 0.86.0 removed the flag and both call sites after multiline and wrapping regressions, leaving only the now-unused `setUseBoundsForWidthMethod` reflection handle in `TextLayoutManager` (which this patch reuses). The bug was refiled as [#56402](https://github.com/facebook/react-native/issues/56402) and is still open. #57117 is the narrower retry: the visual-bounds layout is only a measurement probe, so the final layout keeps advance-based bounds. **Because the two earlier attempts were reverted for wrapping regressions specifically, wrapping is the thing to regression-test on Android 15+.**
- Removal: drop this patch once #57117 (still open) or an equivalent fix lands in the adopted React Native release.

### [react-native+0.88.0+033+clamp-blob-range-APP-KDN.patch](react-native+0.88.0+033+clamp-blob-range-APP-KDN.patch)

- Reason: Defence in depth for the APP-KDN crash (`NSRangeException: -[NSConcreteMutableData subdataWithRange:]: range {0, 321} exceeds data length 318`). `RCTBlobManager resolve:offset:size:` sliced the stored `NSData` with the JS-supplied offset and size without range-checking them, so any descriptor/data desync raised an `NSRangeException` on a background queue where no JS frame can catch it and the app dies. This clamps the range to the bytes actually stored and logs when it has to — an out-of-bounds offset returns `nil`, an oversized size is truncated — and adds the same logging to the silently-0-byte part paths in `createFromParts:withId:`. `size < 0` still means "the whole blob", preserving the existing `-1` contract. Android is already forgiving here ([`Arrays.copyOfRange`](https://github.com/facebook/react-native/blob/v0.86.0/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/modules/blob/BlobModule.kt)), which is why the crash is iOS-only.
- Why it is still needed: React Native 0.88 fixes the producer ([`5906cfb`](https://github.com/react/react-native/commit/5906cfb06085a4ae7ae2e5ac5bb190e0c1e90a42)); without that fix this patch alone would turn the crash into silent data loss (a leading NUL resolves to 0 bytes and uploads as an empty attachment as if it had succeeded). It is here so any *future* desync degrades and logs instead of killing the app. `RCTLogWarn` rather than `RCTLogError` deliberately: this runs on a background queue and `RCTLogError` red-boxes on every occurrence in dev.
- Upstream PR/issue: [react/react-native#58566](https://github.com/react/react-native/pull/58566) — open, not merged. Still unfixed in every release to date: `v0.88.0-rc.1` has the same unchecked `subdataWithRange:`. Re-check on each RN upgrade and drop this patch once the adopted release contains it.
- E/App issue: https://github.com/Expensify/App/issues/100843
- PR introducing patch: this PR.

### [react-native+0.88.0+034+soft-fail-addViewAt-non-ViewGroup-parent-APP-K0G.patch](react-native+0.88.0+034+soft-fail-addViewAt-non-ViewGroup-parent-APP-K0G.patch)

- Reason: Fixes the fatal `IllegalStateException: Unable to add a view into a view that is not a ViewGroup` behind `APP-K0G`. `SurfaceMountingManager.addViewAt` throws when the parent tag has a `ViewState` whose view is null or not a `ViewGroup`. The usual source is a placeholder `ViewState` with no view, which `updateEventEmitter` creates for a tag Java no longer has; the next batch's `Insert` into that tag then throws, and `IntBufferBatchMountItem` is not retryable, so the app crashes. The crash kept firing after `+013` shipped in `9.4.93-3` (last seen on `9.4.94-0`), so the remaining sources (delayed deletes during touches, differ flatten/unflatten bugs, Reanimated-rewritten transactions) still reach it. The patch soft-logs a `ReactNoCrashSoftException` with the parent view class and skips the insert, which matches upstream's handling of the same condition in `removeViewAt` and the missing-`ViewState` case already handled a few lines above in `addViewAt`. The child may be missing until the next render that rebuilds that parent, instead of the app crashing.
- Upstream PR/issue: [react-native@3f553d7](https://github.com/react/react-native/commit/3f553d76bc3f4f57e62653d11bab415a21cd02a8) (same change for `removeViewAt`), [react-native#58526](https://github.com/react/react-native/issues/58526) (placeholder `ViewState` from `updateEventEmitter`), [react-native#58527](https://github.com/react/react-native/pull/58527) (open, guards only the child)
- E/App issue: https://github.com/Expensify/App/issues/102741
- PR introducing patch: https://github.com/Expensify/App/pull/102901
- Removal: drop this patch once the adopted React Native release soft-fails a null or non-`ViewGroup` parent in `addViewAt`.

### [react-native+0.88.0+035+fix-differ-nested-flatten-moved-view.patch](react-native+0.88.0+035+fix-differ-nested-flatten-moved-view.patch)

- Reason: Backports an upstream differ fix. When a view flattens in the same commit in which its parent unflattens, and one of its children has a negative `zIndex`, the differ creates that child again while it is still mounted, or deletes it even though it only moves. The patch makes the final create/delete loop in `calculateShadowViewMutationsFlattener` also skip candidates whose tag the recursion recorded in the sub-visited map, and stops `unvisitedRecursiveChildPairs` from storing a pointer to a loop-local copy. Mutations like these leave the native tree out of sync with the shadow tree, which is one of the sources of the Android Fabric mount crashes tracked in `APP-K0G`, `APP-7AR`, and `APP-H7A`. The only change from upstream is `find(...) != end()` in place of `contains(...)`, which is equivalent.
- Upstream PR/issue: [react-native#58648](https://github.com/react/react-native/pull/58648) / [react-native@361bc24](https://github.com/react/react-native/commit/361bc240e42fb4db0568c1d411116c6bf8f7049d), issue [react-native#58647](https://github.com/react/react-native/issues/58647)
- E/App issue: https://github.com/Expensify/App/issues/102741
- PR introducing patch: https://github.com/Expensify/App/pull/102901
- Removal: drop this patch once the adopted React Native release contains `361bc24` (0.88.0 does not).

### [react-native+0.88.0+036+soft-fail-removeViewAt-non-ViewGroup-parent-APP-H7A.patch](react-native+0.88.0+036+soft-fail-removeViewAt-non-ViewGroup-parent-APP-H7A.patch)

- Reason: Fixes the fatal `IllegalStateException: Unable to remove a view from a view that is not a ViewGroup` behind `APP-H7A`. `SurfaceMountingManager.removeViewAt` throws when the parent tag has a `ViewState` whose view is null or not a `ViewGroup`. It is the `Remove` counterpart of `APP-K0G` (`+034`), with the same sources: a placeholder `ViewState` with no view created by `updateEventEmitter`, delayed deletes during touches, and differ flatten/unflatten bugs (`+035` closes one of them). `IntBufferBatchMountItem` is not retryable, so the throw kills the app. A view that is not a `ViewGroup` cannot hold children, so the removal is a no-op. React Native 0.88.0 already soft-fails a non-`ViewGroup` parent (`3f553d7`), but keeps a `checkNotNull(parentView)` right before that check, so a null `parentView` (the placeholder `ViewState` from [react-native#58526](https://github.com/react/react-native/issues/58526)) still crashes. The patch removes that `checkNotNull` and makes the class-name lookup in upstream's log message null-safe, so a null parent takes the same soft-fail branch. If the child is still attached to a stale native parent, the next `addViewAt` of that child already detaches it (the "View already has a parent" branch), so nothing crashes later.
- Upstream PR/issue: [react-native#57860](https://github.com/react/react-native/pull/57860) / [react-native@3f553d7](https://github.com/react/react-native/commit/3f553d76bc3f4f57e62653d11bab415a21cd02a8)
- E/App issue: https://github.com/Expensify/App/issues/103369
- PR introducing patch: https://github.com/Expensify/App/pull/103447
- Removal: drop this patch once upstream handles a null `parentView` in `removeViewAt`.

### [react-native+0.88.0+037+fix-hermes-tarball-root-after-repo-move.patch](react-native+0.88.0+037+fix-hermes-tarball-root-after-repo-move.patch)

- Reason: Fixes Android builds that compile React Native from source (the artifacts publish workflow, any build that misses the prebuilt artifacts, `BUILD_RN_FROM_SOURCE=1`) failing at `hermes-engine:configureBuildForHermes` with `The source directory ".../sdks/hermes" does not appear to contain CMakeLists.txt`. On 2026-10-28 `facebook/hermes` moved to `meta/hermes`. The old tarball URL still redirects, but GitHub names the archive's top-level folder `<owner>-<repo>-<sha>`, so it is now `meta-hermes-<sha>/` and `unzipHermes` only flattened `facebook-hermes-*`, leaving the sources one level too deep. The patch is the upstream fix: download from `meta/hermes` and strip the single top-level folder whatever its name (`includeEmptyDirs = false` keeps the empty wrapper folder from being recreated), the same way `ReactAndroid/build.gradle.kts` extracts folly, fmt and fast_float.
- Upstream PR/issue: [react-native#59587](https://github.com/react/react-native/issues/59587) / [react-native#59589](https://github.com/react/react-native/pull/59589) ([react-native@f6a5042](https://github.com/react/react-native/commit/f6a5042c8)), merged to `main` on 2026-10-28. It is not in 0.88.0, which still downloads from `facebook/hermes` and only flattens `facebook-hermes-*`.
- E/App issue: https://github.com/Expensify/App/issues/105383
- PR introducing patch: https://github.com/Expensify/App/pull/105381
- Removal: drop this patch once the adopted React Native release contains `f6a5042`.
