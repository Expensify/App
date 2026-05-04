# `@shopify/flash-list` patches

### [@shopify+flash-list+2.3.0+001+fix-horizontal-height-normalization.patch](@shopify+flash-list+2.3.0+001+fix-horizontal-height-normalization.patch)

- Reason: Fixes height normalization in horizontal FlashList when items change. `LinearLayoutManager.normalizeLayoutHeights` had three issues:
  1. **Screen resize / item shrink**: When items shrink, `tallestItemHeight` was updated prematurely, causing the next cycle to skip re-normalization. Fixed by resetting tallest item tracking when `targetMinHeight === 0` so the next repaint re-detects the tallest item.
  2. **Tallest item removed**: When the tallest item is deleted from the list, all remaining items kept the old `minHeight` forever because no item could pass the `height > minHeight` check. Fixed by detecting when `tallestItem` is no longer in `this.layouts` and resetting tracking with a repaint.
  3. **New smaller item added**: When the tallest item is already tracked, newly added items never got `minHeight` applied because there was no code path to normalize them. Fixed by applying `minHeight`/`height` to any unnormalized items when a tallest item is already tracked.
- Upstream PR/issue: TBD
- E/App issue: https://github.com/Expensify/App/issues/33725
- PR introducing patch: https://github.com/Expensify/App/pull/81566

### [@shopify+flash-list+2.3.0+002+skip-layout-when-hidden.patch](@shopify+flash-list+2.3.0+002+skip-layout-when-hidden.patch)

- Reason: Prevents FlashList from losing its render state when a navigation stack hides the parent container with `display: none`. Two early-return guards added in `RecyclerView`:
  1. **First `useLayoutEffect`** (measures parent container): After calling `measureParentSize()`, if both width and height are 0, return early before calling `updateLayoutParams()` or updating `containerViewSizeRef`. This preserves the last known valid window size and prevents the layout manager from receiving zero dimensions.
  2. **Second `useLayoutEffect`** (measures individual items): If `containerViewSizeRef.current` is 0x0 (because the first effect bailed out), return early before calling `modifyChildrenLayout()`. This prevents item measurements taken under `display: none` (also 0) from corrupting stored layouts.
  When the container becomes visible again, `onLayout` fires (React Native Web uses ResizeObserver), triggering a re-render with correct dimensions so FlashList resumes normally without re-initialization.
- Upstream PR/issue: https://github.com/Shopify/flash-list/issues/2231
- E/App issue: https://github.com/Expensify/App/issues/83976
- PR introducing patch: https://github.com/Expensify/App/pull/84887

### [@shopify+flash-list+2.3.0+003+fix-inverted-scroll-direction-on-web.patch](@shopify+flash-list+2.3.0+003+fix-inverted-scroll-direction-on-web.patch)

- Reason: Fixes inverted scroll direction on web. FlashList uses `scaleY: -1` / `scaleX: -1` CSS transform to visually invert the list, but the browser's native wheel scroll doesn't flip accordingly — scrolling down visually scrolls up and vice versa. This patch adds a `useEffect` in `RecyclerView` that attaches a `wheel` event listener on web when `inverted` is true, intercepting the event, negating the scroll delta, and manually adjusting `scrollTop`/`scrollLeft`. Mirrors the same fix applied in react-native-web's `VirtualizedList`.
- Upstream PR/issue: TBD
- E/App issue: https://github.com/Expensify/App/issues/33725
- PR introducing patch: https://github.com/Expensify/App/pull/85114

### [@shopify+flash-list+2.3.0+004+fix-inverted-first-item-offset.patch](@shopify+flash-list+2.3.0+004+fix-inverted-first-item-offset.patch)

- Reason: Fixes inverted lists rendering only a few items with white space on scroll. FlashList's `RecyclerView` measures `firstItemOffset` by calling `measureFirstChildLayout` relative to the outer container. When `inverted` is true, the outer container has `scaleY: -1`, which flips the coordinate system — causing the measured y-offset to equal the container height instead of 0. This makes all scroll offsets negative after adjustment (`adjustedOffset = scrollOffset - firstItemOffset`), so the viewport thinks it's in negative space where no items exist. Only items caught by the draw-distance buffer render. The fix forces `firstItemOffset` to 0 for inverted lists, since the transform already handles visual inversion.
- Upstream PR/issue: TBD
- E/App issue: https://github.com/Expensify/App/issues/33725
- PR introducing patch: https://github.com/Expensify/App/pull/85114

### [@shopify+flash-list+2.3.0+005+fix-pending-children-blocking-measurements.patch](@shopify+flash-list+2.3.0+005+fix-pending-children-blocking-measurements.patch)

- Reason: Fixes items overlapping on initial load when a list contains nested FlashLists (e.g. a horizontal list inside a chat message). The `RecyclerView` layout measurement `useLayoutEffect` had an early return when `pendingChildIds.size > 0` — while any nested FlashList was still doing its progressive first layout, the parent list skipped ALL measurement processing. This meant newly added items stayed at estimated positions (wrong heights/y-offsets) while being visible (`opacity: 1`), causing overlap. The fix moves the `pendingChildIds` check so that measurements are always collected and processed by the layout manager, but when children are pending, `commitLayout()` is called instead of `setRenderId()`. This updates item positions in `ViewHolderCollection` without triggering a full `RecyclerView` re-render, avoiding the cascading `setState` calls that the original guard was meant to prevent.
- Upstream PR/issue: TBD
- E/App issue: https://github.com/Expensify/App/issues/33725
- PR introducing patch: https://github.com/Expensify/App/pull/85114

### [@shopify+flash-list+2.3.0+006+fix-inverted-mvcp-android.patch](@shopify+flash-list+2.3.0+006+fix-inverted-mvcp-android.patch)

- Reason: Fixes `maintainVisibleContentPosition` not working on Android for inverted lists when items are prepended (e.g. new messages arriving, or `useFlashListScrollKey` switching from sliced to full data). FlashList's offset correction uses a `ScrollAnchor` component — an invisible absolutely-positioned element whose `top` changes to trigger the native `maintainVisibleContentPosition` on the ScrollView. On Android, where inversion uses `rotate: 180deg` (vs `scaleY: -1` on iOS), this mechanism silently fails: the anchor position changes but the native ScrollView does not adjust its scroll offset. The fix detects the specific case (`inverted && Platform.OS === 'android' && hasDataChanged`) and bypasses `ScrollAnchor` in favor of a deferred `scrollTo` via `requestAnimationFrame`, which fires after the native layout has committed the new content size. Non-inverted lists, iOS, web, and layout-only corrections (no data change) are unaffected and continue using the original code paths.
- Upstream PR/issue: TBD
- E/App issue: https://github.com/Expensify/App/issues/33725
- PR introducing patch: https://github.com/Expensify/App/pull/85114

### [@shopify+flash-list+2.3.0+007+fix-scroll-anchor-unmount-on-ios.patch](@shopify+flash-list+2.3.0+007+fix-scroll-anchor-unmount-on-ios.patch)

- Reason: Fixes a scroll position reset on iOS when `maintainVisibleContentPosition.disabled` toggles from `true` to `false` (e.g. when `shouldMaintainVisibleContentPosition` changes based on scroll offset). Root cause: `ScrollAnchor` was conditionally rendered based on `shouldMaintainVisibleContentPosition()`. When MVCP was disabled, the anchor unmounted, which made the native Fabric `_firstVisibleView` weak-ref become nil. When MVCP was re-enabled, the anchor remounted at `top: 1,000,000` (its initial position), but `_prevFirstVisibleFrame` was stale at `1,000,000 + X` from the prior anchor instance. `_adjustForMaintainVisibleContentPosition` then computed `deltaY = 0 - (1,000,000 + X)` — a massive negative offset — causing the list to jump to the start. The fix decouples anchor lifetime from the `disabled` flag: `ScrollAnchor` is now always mounted (and `maintainVisibleContentPositionInternal` always non-null) whenever `maintainVisibleContentPosition` prop is defined. The `disabled` flag continues to gate JS-level `scrollBy` corrections in `applyOffsetCorrection` (via `shouldMaintainVisibleContentPosition()`), so the anchor stays in place when MVCP is logically off — the native side always has a live `_firstVisibleView` and a fresh `_prevFirstVisibleFrame` to diff against.
- Files changed: Both `src/recyclerview/RecyclerView.tsx` and `dist/recyclerview/RecyclerView.js`.
- Upstream PR/issue: TBD
- E/App issue: https://github.com/Expensify/App/issues/33725
- PR introducing patch: TBD

### [@shopify+flash-list+2.3.0+008+sort-for-natural-DOM-order.patch](@shopify+flash-list+2.3.0+008+sort-for-natural-DOM-order.patch)

- Reason: Fixes scrambled DOM order in virtualized list items on web. FlashList uses `position: absolute` to position items, so visual order is determined by CSS `top`/`left` values rather than DOM order. Due to recycling (reusing ViewHolder components for different data items), the DOM order reflects Map insertion order rather than data index order. This causes three web-specific issues:

  1. **Screen reader reading order**: Assistive technologies follow DOM order, so items are read in a scrambled sequence that doesn't match the visual layout.
  2. **Keyboard Tab navigation**: Tab key follows DOM order, so focus jumps unpredictably between items instead of following the visual top-to-bottom sequence.
  3. **Cross-item text selection**: Selecting text across multiple list items selects them in DOM order rather than visual order, producing garbled selections.

  **How it works:**

  1. **Stable render order during scroll**: Render entries are maintained in a ref (`renderEntriesRef`) that preserves its order across renders. On each render, a reconcile step removes keys that left the render stack and appends new keys. Because FlashList's recycling mutates index values in place on shared object references (`keyInfo.index = newIndex`), the entries in the ref always have current index values without needing updates — only the array order can be stale. This means during normal scrolling, React sees children in the same order and produces zero `insertBefore` calls, avoiding any DOM reordering.

  2. **Deferred sort after scroll** (default `SORT_DELAY_MS` = 1000ms): After scrolling pauses, a single-slot `setTimeout` (armed by `schedulePendingSort`, handle in `pendingSortTimeoutRef`) sorts the ref by data index and triggers a re-render. This is the only moment React reorders DOM nodes via `insertBefore`. The delay gives the browser time to process queued pointer events (hover state cleanup) from CSS position changes before the structural DOM reorder occurs. When the timer fires, it re-checks scroll state via `isScrolling()` — if any scroll is still in progress (a freshly started mousewheel, a continued momentum scroll, etc.), the timer reschedules itself rather than committing, so a long-running scroll never lets a stale timer fire in the middle of motion. The sort uses a separate, sort-only re-render trigger (`bumpSortVersion` from a `useReducer` counter) instead of reusing FlashList's `renderId`, so the sort does not fire lifecycle callbacks (`onCommitLayoutEffect`, `onCommitEffect`) that would cause duplicate `onViewableItemsChanged` or `onEndReached` calls.

  3. **Immediate sort on keyboard focus** (default `RECENT_FOCUS_WINDOW_MS` = 400ms): Tab navigation (and screen-reader element navigation that moves DOM focus) walks DOM order on web, so an out-of-date order makes the next Tab press land on the wrong row. A `focusin` event listener on the container calls `maybeDoSort` when focus enters the list, reconciling the order the moment the user tabs in. Tab itself normally doesn't scroll — but when the user tabs to a row that's currently outside the viewport, the browser auto-scrolls to bring it into view (typically centring it), and that scroll re-renders the list. A scroll-driven re-render would normally take the deferred (1s) path to let queued hover events drain; that's wrong mid-Tab, because the DOM would stay out of order while the user keeps tabbing. The sort effect therefore tracks the last `focusin` time, and when the render stack changes within `RECENT_FOCUS_WINDOW_MS` of that timestamp it also routes through `maybeDoSort` — i.e. the threshold answers "have we just tabbed?": if yes, we treat the re-render as tab-induced and sort right away rather than deferring. By keying on focus *recency* rather than focus *presence*, this distinguishes tab-triggered re-renders (sort right away) from scroll-triggered re-renders that happen while an element is still focused (defer the sort to protect hover state and any in-flight scroll).

  4. **Unified scroll-aware gating via `maybeDoSort`**: Both focus-driven entry points (the `focusin` listener and the recent-focus branch of the sort effect) funnel through `maybeDoSort`, which picks one of three branches based on the current scroll state:
     - *Programmatic scroll queued or in flight* (`isScrollingProgrammatically()` is true): the sort is held off via `runAfterProgrammaticScroll`. Once the scroll settles, the held callback hands off to `schedulePendingSort` so we still wait an additional `SORT_DELAY_MS` for queued pointer/focus events to land before committing.
     - *Any other scroll in progress* (`isScrolling()` is true — touch drag, mousewheel, scrollbar drag, etc.): the sort is rescheduled via `schedulePendingSort`.
     - *List is idle*: the sort runs synchronously — the fast-track that keeps Tab navigation snappy.

     Every entry into `maybeDoSort` first evicts any existing pending-sort timer, so a stale timer from a previous scroll's drain cannot fire mid-motion during rapid-fire arrow-key navigation (where `isMomentumEnd` doesn't fire between key-repeats and the same `pendingSortTimeoutRef` is the only one we ever own). The "scroll has truly ended" signal driving the programmatic-defer drain is FlashList's existing `isMomentumEnd`, fired by `VelocityTracker` ~100ms after the last `scroll` event — distance-independent and naturally overlap-safe (the browser merges overlapping smooth scrolls into one).

  5. **Pre-scroll announcement (`queueProgrammaticScroll`)**: A new public method on `FlashListRef` lets the consumer announce an imminent programmatic scroll *before* `scrollToIndex` is actually called. It flips an "is queued" ref that `isScrollingProgrammatically()` already ORs in, so any sort triggered by an intervening event (notably the `focusin` that fires when the consumer focuses the target row first and only then calls `scrollToIndex`) is correctly held off rather than committing immediately and cancelling the upcoming smooth scroll. The queued flag is handed off to the in-flight ref at `scrollToIndex` entry and finally cleared when the scroll settles, so it cannot get stuck on.

  **Why the deferred approach is necessary:**

  Two distinct web-only hazards make immediate, mid-scroll DOM reordering wrong:

  1. **Hover/pointer state loss**: When recycling moves items to new CSS positions, the browser queues `mouseleave`/`pointerleave` events for elements that are no longer under the pointer. However, if `insertBefore` executes before the browser has processed those queued pointer events, the structural DOM move interferes with the browser's hover tracking — the pending `mouseleave` is effectively lost, and recycled items retain stale hover/tooltip states. Keeping the array order stable during scrolling and only committing after the list goes idle gives the browser time to drain those events before any reorder.

  2. **Smooth-scroll cancellation**: When a list row is focused and a sort commit lands during an in-flight smooth `scrollToIndex`, React's commit-time selection-preservation logic saves and writes back `scrollTop` on every scrollable ancestor of the focused element (including the FlashList scroll container). Per CSSOM, writing `scrollTop` performs an instant scroll, which aborts any in-flight `behavior: 'smooth'` animation on that element — the visible "scroll starts then freezes" symptom on long arrow-key navigations. The `maybeDoSort` gating above keeps every commit out of the smooth-scroll window, so the commit lands only after the animation has truly ended (`isMomentumEnd`).

  **Platform gating:**

  On web: render entries are held in the order-preserving ref, the deferred sort fires after scrolling pauses, the `focusin` listener triggers an immediate sort on tab-in, and every sort is scroll-state-gated — synchronous attempts go through `maybeDoSort`, deferred ones through `schedulePendingSort`'s timer-fire check.
  On non-web: the ref is set to a fresh `Array.from(renderStack.entries())` on every render, preserving original behavior identically.

- Upstream PR/issue: https://github.com/Shopify/flash-list/issues/1955
- E/App issue: https://github.com/Expensify/App/issues/86126
- PR introducing patch: https://github.com/Expensify/App/pull/85825
