# `@legendapp/list` patches

### [@legendapp+list+3.7.2+001+apply-pending-anchor-correction.patch](@legendapp+list+3.7.2+001+apply-pending-anchor-correction.patch)

- Reason: On web, LegendList holds a scroll anchor for a moment after a data change and defers the scroll correction for item size changes to the next frame. Any other pass that repositions items before that frame, such as the one a scroll event triggers, moves the visible messages without the correction. They jump for a frame and only partly return. With this patch, the first pass that repositions items applies the pending correction.
- Scope: Only the web bundles, and only while a deferred item-size correction is pending.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/596
- E/App issue: https://github.com/Expensify/App/pull/100733#issuecomment-6411009930
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On web, open a chat with more history than the first page. Scroll to the top until older messages load. The message at the top of the screen should stay in place instead of jumping and snapping back.

### [@legendapp+list+3.7.2+002+anchor-end-aligned-lists-to-last-visible-item.patch](@legendapp+list+3.7.2+002+anchor-end-aligned-lists-to-last-visible-item.patch)

- Reason: When items change size or data changes, LegendList keeps the first visible item in place. In a chat, the oldest loaded message shows the sender's avatar, and it loses that header once older messages from the same sender load. Its height shrinks, so every message below it moves up. An inverted list keeps the bottom in place instead. For lists with `alignItemsAtEnd`, this patch anchors the last visible item, so a size change above it only moves the content above.
- Scope: Only the web bundles, and only lists with `alignItemsAtEnd`. Other lists still anchor the first visible item.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/597
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On web, clear the cache and open a chat whose oldest loaded message shows the sender's avatar. Scroll to that message and wait until older messages from the same sender load. The avatar line should disappear without moving the messages below it.

### [@legendapp+list+3.7.2+003+anchor-data-changes-after-scroll-jumps.patch](@legendapp+list+3.7.2+003+anchor-data-changes-after-scroll-jumps.patch)

- Reason: After a large scroll jump, such as a fast scrollbar drag, LegendList repositions newly measured items without keeping anything in place, so the region the user jumped to can lay out. This lasts until it has measured every item it rendered since the jump. If older messages load in the meantime, their measurements push the visible messages down by a few hundred pixels for a frame. This patch ends that state when the data changes, so the new messages are anchored like any other data change.
- Scope: Only the web bundles, and only lists that keep their visible content in place on data changes.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/598
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On web, clear the cache and open a chat with a long history. Drag the scrollbar thumb quickly up and down a few times, then hold it near the top until older messages load. The messages on screen should not move.

### [@legendapp+list+3.7.2+004+reveal-list-after-initial-scroll-adjustments.patch](@legendapp+list+3.7.2+004+reveal-list-after-initial-scroll-adjustments.patch)

- Reason: Before a list is ready, LegendList moves its items as soon as they are measured but applies the matching native scroll adjustment one frame later. It could mark the list ready, and show it, before that frame ran. On iOS, a chat that opens at a linked message then shows the message at the top of the list and moves it down by about 45 points. With this patch, the list becomes ready only after those adjustments have run.
- Scope: All bundles, and only during a list's initial layout while a scroll adjustment requested before the list was ready is still pending.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/600
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On iOS, open a chat from an LHN row with a Pay or Approve action, so it opens at the linked expense. The highlighted expense should appear once, a little below the top of the list, and not move afterward.

### [@legendapp+list+3.7.2+005+keep-scroll-adjust-anchor-precise.patch](@legendapp+list+3.7.2+005+keep-scroll-adjust-anchor-precise.patch)

- Reason: LegendList keeps the visible items in place with a hidden anchor view placed 10,000,000 points down. Native layout stores positions as 32-bit floats, which hold that value only to the nearest whole point, so each scroll adjustment was rounded while the items moved by the exact amount. On Android, a chat that opens at a linked message moved up by 1–2 px when the rows above it were measured. This patch moves the anchor to 1,000,000 points, where its position stays precise to 1/16 of a point.
- Scope: Only the native bundles.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/602
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On Android, open a chat from an LHN row with a Fix action, so it opens at the linked expense. When the Latest messages button appears, the messages on screen should not move.

### [@legendapp+list+3.7.2+006+keep-native-initial-scroll-on-target.patch](@legendapp+list+3.7.2+006+keep-native-initial-scroll-on-target.patch)

- Reason: Before a list is ready, LegendList moves its item positions right away but moves its native scroll anchor a frame later. An initial scroll dispatched in between already lands on the adjusted offset, so the late anchor move shifted the list again, and LegendList's retries then reissued the offset recorded when the scroll started. A retry for scrolls Android reports silently also left the list one point off when the scroll finished first. On Android, a chat that opens at a linked message appeared with the message at the top of the list and then moved down to its offset. This patch skips anchor moves that a later native scroll already includes, moves the pending initial-scroll target with each adjustment, and completes the retry before the scroll finishes.
- Scope: Only the native bundles, and only while an initial scroll is in flight or the list is not ready yet.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/604
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On Android, clear the cache and open a chat from an LHN row with a Fix action, so it opens at the linked expense. The highlighted expense should appear once, a little below the top of the list, and not move afterward.
