# `@legendapp/list` patches

### [@legendapp+list+3.7.1+001+apply-pending-anchor-correction-on-scroll.patch](@legendapp+list+3.7.1+001+apply-pending-anchor-correction-on-scroll.patch)

- Reason: On web, the visible messages jump when older messages load. LegendList moves the scroll offset by the estimated height of the new rows. When those rows are measured, it defers the matching correction to the next frame. The scroll event from the first adjustment then repositions the rows with their measured heights but without that correction, so the visible messages jump by the estimate error for one frame and only partly return. When a deferred correction is pending, apply it in that same scroll-triggered pass.
- Scope: Only the web bundles, and only while a deferred item-size correction is pending. Large scroll jumps still cancel the deferred correction before this check, so their behavior is unchanged.
- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/pull/100733#issuecomment-6411009930
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On web, open a chat with more history than the first page. Scroll to the top until older messages load. The message at the top of the screen should stay in place instead of jumping and snapping back.
