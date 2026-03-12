# `@shopify/flash-list` patches

### [@shopify+flash-list+2.3.0+001+fix-horizontal-height-normalization.patch](@shopify+flash-list+2.3.0+001+fix-horizontal-height-normalization.patch)

- Reason: Fixes height normalization in horizontal FlashList when items change. `LinearLayoutManager.normalizeLayoutHeights` had three issues:
  1. **Screen resize / item shrink**: When items shrink, `tallestItemHeight` was updated prematurely, causing the next cycle to skip re-normalization. Fixed by resetting tallest item tracking when `targetMinHeight === 0` so the next repaint re-detects the tallest item.
  2. **Tallest item removed**: When the tallest item is deleted from the list, all remaining items kept the old `minHeight` forever because no item could pass the `height > minHeight` check. Fixed by detecting when `tallestItem` is no longer in `this.layouts` and resetting tracking with a repaint.
  3. **New smaller item added**: When the tallest item is already tracked, newly added items never got `minHeight` applied because there was no code path to normalize them. Fixed by applying `minHeight`/`height` to any unnormalized items when a tallest item is already tracked.
- Upstream PR/issue: TBD
- E/App issue: https://github.com/Expensify/App/issues/33725
- PR introducing patch: https://github.com/Expensify/App/pull/81566

### [@shopify+flash-list+2.3.0+002+fix-inverted-scroll-direction-on-web.patch](@shopify+flash-list+2.3.0+002+fix-inverted-scroll-direction-on-web.patch)

- Reason: Fixes inverted scroll direction on web. FlashList uses `scaleY: -1` / `scaleX: -1` CSS transform to visually invert the list, but the browser's native wheel scroll doesn't flip accordingly — scrolling down visually scrolls up and vice versa. This patch adds a `useEffect` in `RecyclerView` that attaches a `wheel` event listener on web when `inverted` is true, intercepting the event, negating the scroll delta, and manually adjusting `scrollTop`/`scrollLeft`. Mirrors the same fix applied in react-native-web's `VirtualizedList`.
- Upstream PR/issue: TBD
- E/App issue: TBD
- PR introducing patch: TBD

### [@shopify+flash-list+2.3.0+003+fix-inverted-first-item-offset.patch](@shopify+flash-list+2.3.0+003+fix-inverted-first-item-offset.patch)

- Reason: Fixes inverted lists rendering only a few items with white space on scroll. FlashList's `RecyclerView` measures `firstItemOffset` by calling `measureFirstChildLayout` relative to the outer container. When `inverted` is true, the outer container has `scaleY: -1`, which flips the coordinate system — causing the measured y-offset to equal the container height instead of 0. This makes all scroll offsets negative after adjustment (`adjustedOffset = scrollOffset - firstItemOffset`), so the viewport thinks it's in negative space where no items exist. Only items caught by the draw-distance buffer render. The fix forces `firstItemOffset` to 0 for inverted lists, since the transform already handles visual inversion.
- Upstream PR/issue: TBD
- E/App issue: TBD
- PR introducing patch: TBD
