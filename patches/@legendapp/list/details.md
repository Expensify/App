# `@legendapp/list` patches

### [@legendapp+list+3.6.0+001+synchronize-fabric-content-size.patch](@legendapp+list+3.6.0+001+synchronize-fabric-content-size.patch)

- Reason: On Android, the entire report-action list can briefly jump to older rows while item measurements settle. LegendList updates its content size through an imperative `Animated.Value`, while Fabric row positions and the scroll-preservation anchor update through React. An early content-size update can clamp the old viewport before the matching positions mount. Read the content size through the same React store on the New Architecture so these layout changes commit together.
- Scope: Both native module formats use the synchronized size on the New Architecture. The legacy architecture retains its animated size updates, and the web entries are unchanged. Native scroll preservation and the initial loading skeleton remain enabled.
- Upstream PR/issue: Fixed upstream in https://github.com/LegendApp/legend-list/commit/a2d20a9b, which isn't in a release yet.
- E/App issue: https://github.com/Expensify/App/pull/100733#issuecomment-5886543887
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: Open an expense chat containing a report preview and messages with different heights. Wait for the actual rows to replace the skeleton. The highlighted preview should stay visible while measurements settle, without a frame displaying older rows. Also scroll through older history and return to the latest messages to check scroll preservation.

### [@legendapp+list+3.6.0+002+account-for-android-end-clamp.patch](@legendapp+list+3.6.0+002+account-for-android-end-clamp.patch)

- Reason: On Android, a chat that opens at its newest messages can briefly show older messages before it snaps back to the end. When rows above the viewport get their real, smaller heights, the content shrinks. Android clamps the scroll offset to the new end, and LegendList's scroll-preservation anchor then moves the offset by the full shrink again. The list stays above the end by that amount until the next scroll to the end. Account for Android's clamp and only move the anchor by what the clamp doesn't cover.
- Scope: Only item-size scroll preservation on Android, and only when the content shrinks below the current offset. Data changes and active scroll targets already handle the clamp and are unchanged. iOS and web are unchanged.
- Upstream PR/issue: https://github.com/LegendApp/legend-list/pull/582 upstreams this patch. https://github.com/LegendApp/legend-list/pull/481 covers the related bottom-inset case. Keep this patch until the installed LegendList release includes this fix.
- E/App issue: https://github.com/Expensify/App/pull/100733#issuecomment-6287555197
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: In a DM, mark the third-newest message as unread and go back to the inbox. Open the DM again. It should open at the newest messages without a frame showing older messages. Also scroll through older history and send a new message to check scroll preservation and end following.

### Related upstream work

- https://github.com/LegendApp/legend-list/pull/583 refreshes the cached end-follow state when `maintainScrollAtEndThreshold` changes. This supports a fixed pixel follow distance across viewport changes when using LegendList's built-in end following.
