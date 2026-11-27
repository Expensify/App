# `@legendapp/list` patches

Remove a patch when the installed LegendList release covers its behavior.

### [@legendapp+list+3.9.2+002+add-mvcp-end-anchor.patch](@legendapp+list+3.9.2+002+add-mvcp-end-anchor.patch)

- Reason: When items change size or data changes, LegendList keeps the first visible item in place. In a chat, the oldest loaded message shows the sender's avatar, and it loses that header once older messages from the same sender load. Its height shrinks, so every message below it moves up. An inverted list keeps the bottom in place instead. This patch adds `anchor: "end"` to `maintainVisibleContentPosition`, which keeps the last visible item in place, so a size change above it only moves the content above.
- Scope: All bundles and type definitions, and only lists that pass `anchor: "end"`. Without an explicit anchor, LegendList keeps the last visible item in place only when the list is aligned to its end and follows that end. Expensify turns off end following when newer messages are still unloaded.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/597
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: Clear the cache and open a chat whose oldest loaded message shows the sender's avatar. Scroll to that message and wait until older messages from the same sender load. The avatar line should disappear without moving the messages below it.

### [@legendapp+list+3.9.2+005+keep-scroll-adjust-anchor-precise.patch](@legendapp+list+3.9.2+005+keep-scroll-adjust-anchor-precise.patch)

- Reason: LegendList keeps the visible items in place with a hidden anchor view placed 10,000,000 points down. Native layout stores positions as 32-bit floats, which hold that value only to the nearest whole point, so each scroll adjustment was rounded while the items moved by the exact amount. On Android, a chat that opens at a linked message moved up by 1 or 2 px when the rows above it were measured. This patch moves the anchor to 1,000,000 points, where its position stays precise to 1/16 of a point. Adjustments move the anchor along with the content, so the list can still scroll through 1,000,000 points of content that loaded without one, such as the first page and new messages.
- Scope: Only the native bundles.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/602
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On Android, open a chat from an LHN row with a Fix action, so it opens at the linked expense. When the Latest messages button appears, the messages on screen should not move.

### [@legendapp+list+3.9.2+007+keep-native-content-in-place-on-header-resize.patch](@legendapp+list+3.9.2+007+keep-native-content-in-place-on-header-resize.patch)

- Reason: LegendList keeps the visible items in place when the list header resizes above the viewport, but only on web. While offline, a chat shows a loading placeholder as the list header, and when it disappears on reconnect, the messages on screen moved by its height on iOS and Android. This patch makes header size changes above the viewport keep the visible items in place on every platform. On Android, it first accounts for the scroll offset Android clamps when the content shrinks, as LegendList already does for item size changes.
- Scope: All bundles, and only header size changes above the viewport. Web behaves as before.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/607
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: On iOS or Android, open a chat with more history than the first page. Turn off the network connection. Turn the network connection back on. The messages on screen should not move when the placeholder above them disappears.
