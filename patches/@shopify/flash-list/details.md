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

- Reason: Prevents FlashList from losing its render state when a navigation stack hides the parent container with `display: none`. Four guards in total — two in `RecyclerView` to skip layout processing while hidden, and two in `useRecyclerViewController` to make scroll methods safe while hidden:
  1. **First `useLayoutEffect`** in `RecyclerView` (measures parent container): After calling `measureParentSize()`, if both width and height are 0, return early before calling `updateLayoutParams()` or updating `containerViewSizeRef`. This preserves the last known valid window size and prevents the layout manager from receiving zero dimensions.
  2. **Second `useLayoutEffect`** in `RecyclerView` (measures individual items): If `containerViewSizeRef.current` is 0x0 (because the first effect bailed out), return early before calling `modifyChildrenLayout()`. This prevents item measurements taken under `display: none` (also 0) from corrupting stored layouts.
  3. **`scrollToIndex`** in `useRecyclerViewController`: When the list is hidden, guards 1/2 leave `layoutManager` undefined. Any `scrollToIndex` call (also reached via `scrollToEnd`, `scrollToItem`, `scrollToTop`) would then throw "LayoutManager is not initialized, window size is unavailable" from `recyclerViewManager.getWindowSize()`. Early-return a resolved Promise when `!recyclerViewManager.hasLayout()` so the call becomes a safe no-op; the list will scroll correctly on its next layout pass.
  4. **`scrollToOffset` RTL+horizontal branch** in `useRecyclerViewController`: Only the `I18nManager.isRTL && horizontal` branch reads `getChildContainerDimensions()` and `getWindowSize()`, both of which throw when `layoutManager` is undefined. Gate the branch on `recyclerViewManager.hasLayout()` so the RTL math is skipped while hidden; the non-RTL / vertical paths are unaffected and continue using the underlying `scrollViewRef.scrollTo()` directly.
  When the container becomes visible again, `onLayout` fires (React Native Web uses ResizeObserver), triggering a re-render with correct dimensions so FlashList resumes normally without re-initialization.
- Files changed: `dist/recyclerview/RecyclerView.js` and `dist/recyclerview/hooks/useRecyclerViewController.js`.
- Upstream PR/issue: TBD
- E/App issue: https://github.com/Expensify/App/issues/83976 (original), https://github.com/Expensify/App/issues/90756 (scroll-while-hidden follow-up)
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

### [@shopify+flash-list+2.3.0+008+increase-timeout.patch](@shopify+flash-list+2.3.0+008+increase-timeout.patch)

- Reason: Fixes an initial-render scroll jump on iOS for inverted lists using `initialScrollIndex`. The existing 100 ms `pauseOffsetCorrection` window in `applyInitialScrollIndex` wasn't long enough — MVCP resumed before the corrective `scrollToOffset` had settled, exposing the jump. Bumped to 500 ms.
- Files changed: `dist/recyclerview/hooks/useRecyclerViewController.js` only.
- Upstream PR/issue: TBD
- E/App issue: https://github.com/Expensify/App/issues/89768
- PR introducing patch: https://github.com/Expensify/App/pull/90218

### [@shopify+flash-list+2.3.0+009+ignore-stale-viewholder-layout.patch](@shopify+flash-list+2.3.0+009+ignore-stale-viewholder-layout.patch)

- Reason: Prevents stale `ViewHolder.onLayout` callbacks from crashing FlashList after the list data/layout table has changed. `validateItemSize` previously read the stored layout with `recyclerViewManager.getLayout(index)`, which throws when the callback's render-time index is no longer present in the layout manager. The patch uses `recyclerViewManager.tryGetLayout(index)` and returns early when the layout is missing, so obsolete measurements are ignored while current indexes continue through the existing width/height comparison.
- Files changed: Both `src/recyclerview/RecyclerView.tsx` and `dist/recyclerview/RecyclerView.js`.
- Upstream PR/issue: https://github.com/Shopify/flash-list/issues/2291
- E/App issue: https://github.com/Expensify/App/issues/89933
- PR introducing patch: https://github.com/Expensify/App/pull/91248

### [@shopify+flash-list+2.3.0+010+fix-web-subpixel-rounding.patch](@shopify+flash-list+2.3.0+010+fix-web-subpixel-rounding.patch)

- Reason: Fixes a "Maximum update depth exceeded" infinite render loop on web (mostly Windows with fractional display scaling). `roundOffPixel` on web was a no-op, so subpixel drift in the child container's `getBoundingClientRect()` width re-triggered `ViewHolderCollection`'s `[fixedContainerSize]` layout effect on every measurement. The patch implements `roundOffPixel` to snap to the device-pixel grid (`Math.round(value * devicePixelRatio) / devicePixelRatio`), matching native `PixelRatio.roundToNearestPixel`. Two measurements that paint the same physical pixel now collapse to the same JS value, breaking the loop.
- Files changed: `dist/recyclerview/utils/measureLayout.web.js` only.
- Upstream PR/issue: TBD
- E/App issue: https://github.com/Expensify/App/issues/91584
- Sentry: https://expensify.sentry.io/issues/APP-DQ2
- PR introducing patch: https://github.com/Expensify/App/pull/91799

### [@shopify+flash-list+2.3.0+011+sort-for-natural-DOM-order.patch](@shopify+flash-list+2.3.0+011+sort-for-natural-DOM-order.patch)

- Reason: Fixes scrambled DOM order in virtualized list items on web. FlashList uses `position: absolute` to position items, so visual order is determined by CSS `top`/`left` values rather than DOM order. Due to recycling (reusing ViewHolder components for different data items), the DOM order reflects Map insertion order rather than data index order. This causes three web-specific issues:

  1. **Screen reader reading order**: Assistive technologies follow DOM order, so items are read in a scrambled sequence that doesn't match the visual layout.
  2. **Keyboard Tab navigation**: Tab key follows DOM order, so focus jumps unpredictably between items instead of following the visual top-to-bottom sequence.
  3. **Cross-item text selection**: Selecting text across multiple list items selects them in DOM order rather than visual order, producing garbled selections.

  **How it works:**

  1. **Stable render order during scroll**: Render entries are maintained in a ref (`renderEntriesRef`) that preserves its order across renders. On each render, a reconcile step removes keys that left the render stack and appends new keys. Because FlashList's recycling mutates index values in place on shared object references (`keyInfo.index = newIndex`), the entries in the ref always have current index values without needing updates — only the array order can be stale. This means during normal scrolling, React sees children in the same order and produces zero `insertBefore` calls, avoiding any DOM reordering.

  2. **Deferred sort after scroll** (default `SORT_DELAY_MS` = 1000ms): After scrolling pauses, a single-slot `setTimeout` (armed by `schedulePendingSort`, with the handle held inside `useDeferredCallback`) sorts the ref by data index and triggers a re-render. This is the only moment React reorders DOM nodes via `insertBefore`. The delay gives the browser time to process queued pointer events (hover state cleanup) from CSS position changes before the structural DOM reorder occurs. When the timer fires, it re-checks scroll state via `isScrolling()` — if any scroll is still in progress (a freshly started mousewheel, a continued momentum scroll, etc.), the timer reschedules itself rather than committing, so a long-running scroll never lets a stale timer fire in the middle of motion. The sort uses a separate, sort-only re-render trigger (`bumpSortVersion` from a `useReducer` counter) instead of reusing FlashList's `renderId`, so the sort does not fire lifecycle callbacks (`onCommitLayoutEffect`, `onCommitEffect`) that would cause duplicate `onViewableItemsChanged` or `onEndReached` calls.

  3. **Focus-aware sort triggering**: Tab navigation walks DOM order on web, so an out-of-date order makes the next Tab press land on the wrong row. A `focusin` event listener on the container resolves which logical row received focus by reading a `data-flashlist-index` DOM marker that each `ViewHolder` renders alongside its children, and routes real focus changes to `maybeDoSortOnFocus`. Spurious refocus events caused by recycling and React's mutation-phase selection-preservation are filtered out so they don't trigger a sort cascade — see [viewholder-marker-and-focus-filter.md](viewholder-marker-and-focus-filter.md) for the full filter design. Tab itself doesn't scroll, but tabbing to a row that's outside the viewport makes the browser auto-scroll to bring it into view; that scroll re-renders the list and runs a separate `maybeDoSortOnScroll` callback. The actual synchronous sort during Tab navigation happens in the scroll callback (see #4); the focus callback typically just schedules a deferred sort.

  4. **Two `maybeDoSort` callbacks + programmatic-scroll gating**: The focus path and the scroll path have different decisions to make, so the original single `maybeDoSort` is split into two callbacks that cooperate via a one-shot flag (`shouldSortOnNextFocusRef`):

     - **`maybeDoSortOnScroll`** runs from the effect that fires on `renderStack` / `renderId` changes — i.e. whenever recycling produced a new layout. It arms `shouldSortOnNextFocusRef`, evicts any pending-sort timer (a stale timer from a previous scroll's drain cannot fire mid-motion during rapid arrow-key repeats), then picks one of three branches:
       - *Programmatic scroll queued or in flight* (`isScrollingProgrammatically()` is true): hand off via `runAfterProgrammaticScroll` → `schedulePendingSort`. Once the scroll settles we still wait an additional `SORT_DELAY_MS` for queued pointer/focus events to land before committing. The flag stays armed.
       - *In-motion scroll caused by a recent focus* (`isScrolling()` is true and the last `scroll` event landed within `FOCUS_INDUCED_SCROLL_WINDOW_MS` = 30 ms after the last `focusin`): call `sortItems` synchronously and reset the flag. This is the browser's auto-scroll-into-view from a Tab/focus on an off-viewport row — keeping DOM order synced is critical for the next Tab to land on the right row, even at the cost of perturbing the auto-scroll. **This is the path that does the sync sort during Tab navigation.**
       - *Anything else* (user mousewheel/scrollbar/touch, or a quiet list): schedule the deferred sort. The flag stays armed for the next focusin to consume.

     - **`maybeDoSortOnFocus`** runs from the `focusin` listener. It evicts any pending-sort timer; if `shouldSortOnNextFocusRef` is armed it consumes the flag and commits `sortItems` synchronously; either way it then schedules a fresh deferred sort. In the common Tab → auto-scroll flow, `maybeDoSortOnScroll`'s focus-induced branch has already done the sync sort and reset the flag *before* the next focusin gets here, so the sync-sort path inside this callback is mainly a safety net for scroll-less re-renders and for the programmatic-scroll branch (where the flag was armed but no sync sort fired).

     The deferred-sort timer is provided by `useDeferredCallback`, a small inline hook that wraps a single-slot `setTimeout` with a fire-time `shouldDefer` predicate. When the timer expires it re-checks `isScrolling()` and reschedules itself if a scroll is still in progress, so a long-running scroll never lets a stale timer fire in the middle of motion. The "scroll has truly ended" signal driving the programmatic-defer drain is FlashList's existing `isMomentumEnd`, fired by `VelocityTracker` ~100 ms after the last `scroll` event — distance-independent and naturally overlap-safe (the browser merges overlapping smooth scrolls into one).

  5. **Pre-scroll announcement (`announceProgrammaticScroll`)**: A new public method on `FlashListRef` lets the consumer announce an imminent programmatic scroll *before* `scrollToIndex` is actually called. It flips an "is queued" ref that `isScrollingProgrammatically()` already ORs in, so any sort triggered by an intervening event (notably the `focusin` that fires when the consumer focuses the target row first and only then calls `scrollToIndex`) is correctly held off rather than committing immediately and cancelling the upcoming smooth scroll. The queued flag is handed off to the in-flight ref at `scrollToIndex` entry and finally cleared when the scroll settles, so it cannot get stuck on.

  **Why the deferred approach is necessary:**

  Two distinct web-only hazards make immediate, mid-scroll DOM reordering wrong:

  1. **Hover/pointer state loss**: When recycling moves items to new CSS positions, the browser queues `mouseleave`/`pointerleave` events for elements that are no longer under the pointer. However, if `insertBefore` executes before the browser has processed those queued pointer events, the structural DOM move interferes with the browser's hover tracking — the pending `mouseleave` is effectively lost, and recycled items retain stale hover/tooltip states. Keeping the array order stable during scrolling and only committing after the list goes idle gives the browser time to drain those events before any reorder.

  2. **Smooth-scroll cancellation**: When a list row is focused and a sort commit lands during an in-flight smooth `scrollToIndex`, React's commit-time selection-preservation logic saves and writes back `scrollTop` on every scrollable ancestor of the focused element (including the FlashList scroll container). Per CSSOM, writing `scrollTop` performs an instant scroll, which aborts any in-flight `behavior: 'smooth'` animation on that element — the visible "scroll starts then freezes" symptom on long arrow-key navigations. The programmatic-scroll gating in both `maybeDoSort*` callbacks keeps commits out of the smooth-scroll window, so a `scrollToIndex` animation lands only after it has truly ended (`isMomentumEnd`). Browser auto-scroll-into-view triggered by Tab focusing an off-viewport row is intentionally *not* gated this way (see #4 above) — Tab-navigation correctness takes priority over preserving that auto-scroll's centring.

  **Platform gating:**

  On web: render entries are held in the order-preserving ref, the deferred sort fires after scrolling pauses, the `focusin` listener (filtered via the `data-flashlist-index` marker) routes real focus changes through `maybeDoSortOnFocus`, and `maybeDoSortOnScroll` decides per-render whether to sort synchronously, defer until momentum-end, or defer the standard `SORT_DELAY_MS`. The deferred path itself reschedules until any scroll has settled, via `useDeferredCallback`'s timer-fire `isScrolling()` re-check.
  On non-web: the ref is set to a fresh `Array.from(renderStack.entries())` on every render, preserving original behavior identically. The marker JSX, the focusin listener, and both `maybeDoSort*` callbacks are gated to web only.

- Upstream PR/issue: https://github.com/Shopify/flash-list/issues/1955
- E/App issue: https://github.com/Expensify/App/issues/86126
- PR introducing patch: https://github.com/Expensify/App/pull/85825

### [@shopify+flash-list+2.3.0+012+fix-scrollbar-oscillation-crash.patch](@shopify+flash-list+2.3.0+012+fix-scrollbar-oscillation-crash.patch)

- Reason: Fixes a "Maximum update depth exceeded" (#185) infinite render loop on web with classic (non-overlay) scrollbars — i.e. Windows/Linux Chrome and macOS with "Always show scroll bars". For a vertical list FlashList derives its cross-axis bounded size from `firstChildViewLayout.width` (the scroll viewport's **client** width, which excludes the scrollbar). When the vertical scrollbar toggles, that width steps by the scrollbar size (e.g. 375 ↔ 355); each change re-triggers layout, which changes content height, which toggles the scrollbar again — an infinite loop. This patch breaks the loop inside `LinearLayoutManager.updateLayoutParams` by detecting the scrollbar ping-pong and settling `boundedSize` instead of thrashing it — reserving no width. A change is treated as scrollbar-induced only when all hold, so a real window resize is never misread:
  1. **Strict alternation**: the last 4 *rounded* cross-axis sizes form a clean `A,B,A,B` (exactly two values, three consecutive flips). A manual drag sweeps through many distinct values and never matches; rounding keeps the equality robust against subpixel drift.
  2. **Scrollbar-sized delta**: the two values differ by no more than `SCROLLBAR_OSCILLATION_TOLERANCE` (25px — classic scrollbars are ~15–17px, with headroom for thicker/zoomed bars).

  When detected, `boundedSize` settles on the **smaller** of the two values, which already accounts for the scrollbar so items never overflow the client width.
- Files changed: `dist/recyclerview/layout-managers/LinearLayoutManager.js` only.
- Upstream PR/issue: TBD
- E/App issue: https://github.com/Expensify/App/issues/91584, https://github.com/Expensify/App/issues/92263
- PR introducing patch: TBD

### [@shopify+flash-list+2.3.0+013+improve-scroll-key-handling.patch](@shopify+flash-list+2.3.0+013+improve-scroll-key-handling.patch)

- Reason: Adds `viewPosition` support to `initialScrollIndexParams` (0 = start, 0.5 = center, 1 = end — same semantics as `scrollToIndex`'s `viewPosition`), so a chat opened via deep link or unread marker can show the target message centered in the viewport instead of pinned to an edge. Three changes:
  1. **`applyInitialScrollIndex`** in `useRecyclerViewController.js`: the corrective scroll for `initialScrollIndex` now shifts the target offset by `(containerSize - itemSize) * viewPosition` (clamped to ≥ 0, and skipped while the container is unmeasured), mirroring `scrollToIndex`'s math. Because this re-applies on every commit until the pause window from patch 008 closes, the target is progressively re-centered as estimated item layouts get measured and as nearby items resize.
  2. **`applyInitialScrollAdjustment`** in `RecyclerViewManager.js`: the initial render window is anchored with the same `viewPosition` adjustment, so the very first painted frame already renders the items around the centered position — without this, the first frame renders items from the target's raw offset (target at the viewport edge) and visibly jumps once the first corrective scroll lands.
  3. **Bottom peek** in `applyInitialScrollIndex` (`useRecyclerViewController.js`): for inverted vertical lists positioned via `viewPosition`, when the bottom-most visible item is flush against the bottom edge and another item exists underneath it, the offset is nudged so a small sliver of that next item peeks — signaling there is more content below.
  `viewOffset` handling is untouched and `viewPosition` is opt-in, so existing `initialScrollIndex` consumers (e.g. the top-aligned money report flow, which uses `viewOffset`) are unaffected. Consumed by `useFlashListScrollKey` via `InvertedFlashList`'s `initialScrollKey` for deep-linked messages and the unread marker.
- Files changed: `dist/FlashListProps.d.ts`, `dist/recyclerview/hooks/useRecyclerViewController.js`, `dist/recyclerview/RecyclerViewManager.js`.
- Upstream PR/issue: TBD
- E/App issue: TBD
- PR introducing patch: TBD
