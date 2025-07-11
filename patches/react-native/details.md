# `react-native` patches

### [react-native+0.79.2+025+fix-display-contents-not-updating-nodes.patch](react-native+0.79.2+025+fix-display-contents-not-updating-nodes.patch)

- Reason:

    ```
    This patch updates Yoga to correctly update the subtrees of `display: contents` nodes
    so that they are in sync with their React Native counterparts.
    ```
  
- Upstream PR/issue: https://github.com/facebook/react-native/pull/52530
- E/App issue: https://github.com/Expensify/App/issues/65268
- PR introducing patch: [#65925](https://github.com/Expensify/App/pull/65925)