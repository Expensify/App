# `@legendapp/list` patches

### [@legendapp+list+3.7.1+001+apply-pending-anchor-correction.patch](@legendapp+list+3.7.1+001+apply-pending-anchor-correction.patch)

- Reason: On web, LegendList holds a scroll anchor for a moment after a data change and defers the scroll correction for item size changes to the next frame. Any other pass that repositions items before that frame, such as the one a scroll event triggers, moves the visible messages without the correction. They jump for a frame and only partly return. With this patch, the first pass that repositions items applies the pending correction.
- Scope: Only the web bundles, and only while a deferred item-size correction is pending.
- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/pull/100733#issuecomment-6411009930
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On web, open a chat with more history than the first page. Scroll to the top until older messages load. The message at the top of the screen should stay in place instead of jumping and snapping back.
