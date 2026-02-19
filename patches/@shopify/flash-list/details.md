# `@shopify/flash-list` patches

### [@shopify+flash-list+2.2.0.patch](@shopify+flash-list+2.2.0.patch)

- Reason: Fixes height normalization in horizontal FlashList when items change. `LinearLayoutManager.normalizeLayoutHeights` had three issues:
  1. **Screen resize / item shrink**: When items shrink, `tallestItemHeight` was updated prematurely, causing the next cycle to skip re-normalization. Fixed by resetting tallest item tracking when `targetMinHeight === 0` so the next repaint re-detects the tallest item.
  2. **Tallest item removed**: When the tallest item is deleted from the list, all remaining items kept the old `minHeight` forever because no item could pass the `height > minHeight` check. Fixed by detecting when `tallestItem` is no longer in `this.layouts` and resetting tracking with a repaint.
  3. **New smaller item added**: When the tallest item is already tracked, newly added items never got `minHeight` applied because there was no code path to normalize them. Fixed by applying `minHeight`/`height` to any unnormalized items when a tallest item is already tracked.
- Upstream PR/issue: TBD
- E/App issue: https://github.com/Expensify/App/issues/33725
- PR introducing patch: https://github.com/Expensify/App/pull/81566
