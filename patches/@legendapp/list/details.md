# `@legendapp/list` patches

The Fabric content-size fix from https://github.com/LegendApp/legend-list/commit/a2d20a9b is included in [LegendList 3.7.0](https://github.com/LegendApp/legend-list/blob/v3.7.0/CHANGELOG.md#370), so its local patch has been removed.

### [@legendapp+list+3.7.0+001+account-for-android-end-clamp.patch](@legendapp+list+3.7.0+001+account-for-android-end-clamp.patch)

- Reason: On Android, a chat that opens at its newest messages can briefly show older messages before it snaps back to the end. When rows above the viewport get their real, smaller heights, the content shrinks. Android clamps the scroll offset to the new end, and LegendList's scroll-preservation anchor then moves the offset by the full shrink again. The list stays above the end by that amount until the next scroll to the end. Account for Android's clamp and only move the anchor by what the clamp doesn't cover.
- Scope: Only item-size scroll preservation on Android, and only when the content shrinks below the current offset. Data changes and active scroll targets already handle the clamp and are unchanged. iOS and web are unchanged.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/582 upstreams this patch. https://github.com/LegendApp/legend-list/pull/481 covers the related bottom-inset case. Keep this patch until the installed LegendList release includes this fix.
- E/App issue: https://github.com/Expensify/App/pull/100733#issuecomment-6287555197
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: In a DM, mark the third-newest message as unread and go back to the inbox. Open the DM again. It should open at the newest messages without a frame showing older messages. Also scroll through older history and send a new message to check scroll preservation and end following.

### Related upstream work

- https://github.com/LegendApp/legend-list/pull/583 refreshes the cached end-follow state when `maintainScrollAtEndThreshold` changes. This supports a fixed pixel follow distance across viewport changes when using LegendList's built-in end following.
