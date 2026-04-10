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
- Files changed: Both `src/recyclerview/RecyclerView.tsx` and `dist/recyclerview/RecyclerView.js`. The `src/` file contains the full explanatory comments describing the intent of each guard. The `dist/` file contains only the bare code without comments, since it is compiled output. If the `dist/` file changes in a future version, refer to the `src/` diff to understand the intent and re-apply the equivalent guards.
- Upstream PR/issue: TBD
- E/App issue: https://github.com/Expensify/App/issues/83976
- PR introducing patch: https://github.com/Expensify/App/pull/84887
