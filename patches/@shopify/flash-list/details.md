# `@shopify/flash-list` patches

### [@shopify+flash-list+2.2.0.patch](@shopify+flash-list+2.2.0.patch)

- Reason: Fixes initial items rendering for FlashList with `startRenderingFromBottom` prop. The issue occurs because layout calculations were happening before layouts were properly recomputed. The patch:
  1. Reorders operations in `applyInitialScrollAdjustment()` to query layouts AFTER calling `recomputeLayouts()`
  2. Calculates viewport size and item dimensions to position the last item at the bottom of the viewport
  3. Adds controlled progressive rendering to prevent premature scroll adjustments
  4. Performs a final scroll adjustment after all items are measured to ensure correct positioning
- Upstream PR/issue: https://github.com/Shopify/flash-list/issues/2070
- E/App issue: N/A
- PR Introducing Patch: https://github.com/Expensify/App/issues/33725
