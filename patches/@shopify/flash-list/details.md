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

### [@shopify+flash-list+2.3.0+003+sort-for-natural-DOM-order.patch](@shopify+flash-list+2.3.0+003+sort-for-natural-DOM-order.patch)

- Reason: Fixes scrambled DOM order in virtualized list items on web. FlashList uses `position: absolute` to position items, so visual order is determined by CSS `top`/`left` values rather than DOM order. Due to recycling (reusing ViewHolder components for different data items), the DOM order reflects Map insertion order rather than data index order. This causes three web-specific issues:
  1. **Screen reader reading order**: Assistive technologies follow DOM order, so items are read in a scrambled sequence that doesn't match the visual layout.
  2. **Keyboard Tab navigation**: Tab key follows DOM order, so focus jumps unpredictably between items instead of following the visual top-to-bottom sequence.
  3. **Cross-item text selection**: Selecting text across multiple list items selects them in DOM order rather than visual order, producing garbled selections.

  **How it works:**

  1. **Stable render order during scroll**: Render entries are maintained in a ref (`renderEntriesRef`) that preserves its order across renders. On each render, a reconcile step removes keys that left the render stack and appends new keys. Because FlashList's recycling mutates index values in place on shared object references (`keyInfo.index = newIndex`), the entries in the ref always have current index values without needing updates — only the array order can be stale. This means during normal scrolling, React sees children in the same order and produces zero `insertBefore` calls, avoiding any DOM reordering.

  2. **Deferred sort after scroll** (default `SORT_DELAY_MS` = 1000ms): After scrolling pauses, a `useEffect` sorts the ref by data index and triggers a re-render. This is the only moment React reorders DOM nodes via `insertBefore`. The delay gives the browser time to process queued pointer events (hover state cleanup) from CSS position changes before the structural DOM reorder occurs. A separate state counter (`sortId`) triggers this re-render instead of reusing FlashList's `renderId`, so the sort does not fire lifecycle callbacks (`onCommitLayoutEffect`, `onCommitEffect`) that would cause duplicate `onViewableItemsChanged` or `onEndReached` calls.

  3. **Immediate sort on keyboard focus** (default `TAB_SCROLL_THRESHOLD_MS` = 400ms): A `focusin` event listener on the container immediately sorts when focus enters the list, ensuring Tab navigation always follows the correct order without waiting for the deferred timeout. Additionally, the sort effect checks if focus occurred recently (within `TAB_SCROLL_THRESHOLD_MS`) to also sort immediately on tab-triggered scroll re-renders. By checking the recency of focus rather than its presence, this correctly distinguishes tab-triggered re-renders (sort immediately) from scroll-triggered re-renders that happen while an element is still focused (defer sort to protect hover).

  **Why the deferred approach is necessary:**

  When recycling moves items to new CSS positions, the browser queues `mouseleave`/`pointerleave` events for elements that are no longer under the pointer. However, if `insertBefore` executes before the browser has processed those queued pointer events, the structural DOM move interferes with the browser's hover tracking — the pending `mouseleave` is effectively lost, and recycled items retain stale hover/tooltip states. The stable-ref approach ensures that during scrolling the array order doesn't change (no `insertBefore`), and the sort only fires after scrolling pauses, giving the browser time to process hover state changes.

  **Platform gating:**

  On web: reconcile preserves order, deferred sort, focusin listener.
  On non-web: the ref is set to a fresh `Array.from(renderStack.entries())` on every render, preserving original behavior identically.

- Upstream PR/issue: TBD
- E/App issue: https://github.com/Expensify/App/issues/86126
- PR introducing patch: https://github.com/Expensify/App/pull/85825