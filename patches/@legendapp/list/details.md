# `@legendapp/list` patches

### [@legendapp+list+3.7.1+001+apply-pending-anchor-correction.patch](@legendapp+list+3.7.1+001+apply-pending-anchor-correction.patch)

- Reason: On web, LegendList holds a scroll anchor for a moment after a data change and defers the scroll correction for item size changes to the next frame. Any other pass that repositions items before that frame, such as the one a scroll event triggers, moves the visible messages without the correction. They jump for a frame and only partly return. With this patch, the first pass that repositions items applies the pending correction.
- Scope: Only the web bundles, and only while a deferred item-size correction is pending.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/596
- E/App issue: https://github.com/Expensify/App/pull/100733#issuecomment-6411009930
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On web, open a chat with more history than the first page. Scroll to the top until older messages load. The message at the top of the screen should stay in place instead of jumping and snapping back.

### [@legendapp+list+3.7.1+002+anchor-end-aligned-lists-to-last-visible-item.patch](@legendapp+list+3.7.1+002+anchor-end-aligned-lists-to-last-visible-item.patch)

- Reason: When items change size or data changes, LegendList keeps the first visible item in place. In a chat, the oldest loaded message shows the sender's avatar, and it loses that header once older messages from the same sender load. Its height shrinks, so every message below it moves up. An inverted list keeps the bottom in place instead. For lists with `alignItemsAtEnd`, this patch anchors the last visible item, so a size change above it only moves the content above.
- Scope: Only the web bundles, and only lists with `alignItemsAtEnd`. Other lists still anchor the first visible item.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/597
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On web, clear the cache and open a chat whose oldest loaded message shows the sender's avatar. Scroll to that message and wait until older messages from the same sender load. The avatar line should disappear without moving the messages below it.

### [@legendapp+list+3.7.1+003+anchor-data-changes-after-scroll-jumps.patch](@legendapp+list+3.7.1+003+anchor-data-changes-after-scroll-jumps.patch)

- Reason: After a large scroll jump, such as a fast scrollbar drag, LegendList repositions newly measured items without keeping anything in place, so the region the user jumped to can lay out. This lasts until it has measured every item it rendered since the jump. If older messages load in the meantime, their measurements push the visible messages down by a few hundred pixels for a frame. This patch ends that state when the data changes, so the new messages are anchored like any other data change.
- Scope: Only the web bundles, and only lists that keep their visible content in place on data changes.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/598
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On web, clear the cache and open a chat with a long history. Drag the scrollbar thumb quickly up and down a few times, then hold it near the top until older messages load. The messages on screen should not move.
