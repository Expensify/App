# `@shopify/flash-list` patches

### [@shopify+flash-list+2.2.0.patch](@shopify+flash-list+2.2.0.patch)

- Reason: Fixes horizontal FlashList items getting stuck with `minHeight: 0` after a layout change (e.g., screen resize). In `LinearLayoutManager.normalizeLayoutHeights`, when items shrink, `tallestItemHeight` was updated prematurely, causing the next cycle to skip re-normalization. The fix resets the tallest item tracking when items shrink so the next repaint cycle properly re-detects the tallest item and re-applies `minHeight` for all layouts.
- Upstream PR/issue: TBD
- E/App issue: https://github.com/Expensify/App/issues/33725
- PR introducing patch: https://github.com/Expensify/App/pull/81566
