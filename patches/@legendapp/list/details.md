# `@legendapp/list` patches

### [@legendapp+list+3.6.0+001+synchronize-fabric-content-size.patch](@legendapp+list+3.6.0+001+synchronize-fabric-content-size.patch)

- Reason: On Android, the entire report-action list can briefly jump to older rows while item measurements settle. LegendList updates its content size through an imperative `Animated.Value`, while Fabric row positions and the scroll-preservation anchor update through React. An early content-size update can clamp the old viewport before the matching positions mount. Read the content size through the same React store on the New Architecture so these layout changes commit together.
- Scope: Both native module formats use the synchronized size on the New Architecture. The legacy architecture retains its animated size updates, and the web entries are unchanged. Native scroll preservation and the initial loading skeleton remain enabled.
- Upstream PR/issue: Pending submission after local validation. This patch is being developed locally as part of the LegendList migration.
- E/App issue: https://github.com/Expensify/App/pull/100733#issuecomment-5886543887
- PR introducing patch: https://github.com/Expensify/App/pull/100733
- Reproduction: Open an expense chat containing a report preview and messages with different heights. Wait for the actual rows to replace the skeleton. The highlighted preview should stay visible while measurements settle, without a frame displaying older rows. Also scroll through older history and return to the latest messages to check scroll preservation.
