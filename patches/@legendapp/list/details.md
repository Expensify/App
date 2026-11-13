# `@legendapp/list` patches

Each patch is the build output of its upstream PR, so it changes exactly what that PR changes. Remove a patch once a LegendList release contains its PR.

### [@legendapp+list+3.7.2+001+apply-pending-anchor-correction.patch](@legendapp+list+3.7.2+001+apply-pending-anchor-correction.patch)

- Reason: On web, LegendList holds a scroll anchor for a moment after a data change and defers the scroll correction for item size changes to the next frame. Any other pass that repositions items before that frame, such as the one a scroll event triggers, moves the visible messages without the correction. They jump for a frame and only partly return. With this patch, the first pass that repositions items applies the pending correction.
- Scope: All bundles. Only web defers the correction, so native lists are unaffected.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/596
- E/App issue: https://github.com/Expensify/App/pull/100733#issuecomment-6411009930
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On web, open a chat with more history than the first page. Scroll to the top until older messages load. The message at the top of the screen should stay in place instead of jumping and snapping back.

### [@legendapp+list+3.7.2+002+add-mvcp-end-anchor.patch](@legendapp+list+3.7.2+002+add-mvcp-end-anchor.patch)

- Reason: When items change size or data changes, LegendList keeps the first visible item in place. In a chat, the oldest loaded message shows the sender's avatar, and it loses that header once older messages from the same sender load. Its height shrinks, so every message below it moves up. An inverted list keeps the bottom in place instead. This patch adds `anchor: "end"` to `maintainVisibleContentPosition`, which keeps the last visible item in place, so a size change above it only moves the content above.
- Scope: All bundles and type definitions, and only lists that pass `anchor: "end"`. Other lists still keep the first visible item in place.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/597
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: Clear the cache and open a chat whose oldest loaded message shows the sender's avatar. Scroll to that message and wait until older messages from the same sender load. The avatar line should disappear without moving the messages below it.

### [@legendapp+list+3.7.2+003+anchor-data-changes-after-scroll-jumps.patch](@legendapp+list+3.7.2+003+anchor-data-changes-after-scroll-jumps.patch)

- Reason: After a large scroll jump, such as a fast scrollbar drag or fling, LegendList repositions newly measured items without keeping anything in place, so the region the user jumped to can lay out. This lasts until it has measured every item it rendered since the jump. If older messages load in the meantime, their measurements push the visible messages down by a few hundred pixels for a frame. This patch ends that state when the data changes, so the new messages are anchored like any other data change.
- Scope: All bundles, and only lists that keep their visible content in place on data changes.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/598
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On web, clear the cache and open a chat with a long history. Drag the scrollbar thumb quickly up and down a few times, then hold it near the top until older messages load. The messages on screen should not move.

### [@legendapp+list+3.7.2+004+land-initial-mount-adjustments-once.patch](@legendapp+list+3.7.2+004+land-initial-mount-adjustments-once.patch)

- Reason: Before a list is ready, LegendList moves its items as soon as they are measured but applies the matching native scroll adjustment one frame later. It could mark the list ready, and show it, before that frame ran. An initial scroll dispatched in between also already lands on the adjusted offset, so the late adjustment moved the list a second time, and LegendList's retries reissued the offset recorded when the scroll started. A chat that opens at a linked message then shows the message at the top of the list and moves it down. With this patch, the list becomes ready only after those adjustments have run, skips an adjustment that a later native scroll already includes, and moves the target of the initial scroll with each adjustment.
- Scope: All bundles, and only during a list's initial layout. Skipping adjustments and moving the target only apply on native.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/600
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On iOS or Android, clear the cache and open a chat from an LHN row with a Pay, Approve, or Fix action, so it opens at the linked expense. The highlighted expense should appear once, a little below the top of the list, and not move afterward.

### [@legendapp+list+3.7.2+005+keep-scroll-adjust-anchor-precise.patch](@legendapp+list+3.7.2+005+keep-scroll-adjust-anchor-precise.patch)

- Reason: LegendList keeps the visible items in place with a hidden anchor view placed 10,000,000 points down. Native layout stores positions as 32-bit floats, which hold that value only to the nearest whole point, so each scroll adjustment was rounded while the items moved by the exact amount. On Android, a chat that opens at a linked message moved up by 1 or 2 px when the rows above it were measured. This patch moves the anchor to 1,000,000 points, where its position stays precise to 1/16 of a point. Adjustments move the anchor along with the content, so the list can still scroll through 1,000,000 points of content that loaded without one, such as the first page and new messages.
- Scope: Only the native bundles.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/602
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On Android, open a chat from an LHN row with a Fix action, so it opens at the linked expense. When the Latest messages button appears, the messages on screen should not move.

### [@legendapp+list+3.7.2+006+finish-silent-initial-scroll-retries.patch](@legendapp+list+3.7.2+006+finish-silent-initial-scroll-retries.patch)

- Reason: When Android dispatches an initial scroll without reporting a scroll event, LegendList retries it by moving the list one point away and back on the next frame. If another check finished the scroll first, the list stayed one point off its target, and the return used the offset recorded before adjustments moved the target. With this patch, finishing the scroll completes a pending return, and the return goes to the current target.
- Scope: All bundles, and only initial scrolls that LegendList retries because they reported no scroll event. That only happens on native.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/604, which builds on https://github.com/LegendApp/legend-list/pull/600
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On Android, clear the cache and open a chat from an LHN row with a Fix action, so it opens at the linked expense. The highlighted expense should come to rest a little below the top of the list and stay there.

### [@legendapp+list+3.7.2+007+keep-native-content-in-place-on-header-resize.patch](@legendapp+list+3.7.2+007+keep-native-content-in-place-on-header-resize.patch)

- Reason: LegendList keeps the visible items in place when the list header resizes above the viewport, but only on web. While offline, a chat shows a loading placeholder as the list header, and when it disappears on reconnect, the messages on screen moved by its height on iOS and Android. This patch makes header size changes above the viewport keep the visible items in place on every platform. On Android, it first accounts for the scroll offset Android clamps when the content shrinks, as LegendList already does for item size changes.
- Scope: All bundles, and only header size changes above the viewport. Web behaves as before.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/607
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On iOS or Android, open a chat with more history than the first page. Turn off the network connection. Turn the network connection back on. The messages on screen should not move when the placeholder above them disappears.
