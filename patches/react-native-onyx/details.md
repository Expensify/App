# `react-native-onyx` patches

### [react-native-onyx+3.0.149+001+set-collection-key-set.patch](react-native-onyx+3.0.149+001+set-collection-key-set.patch)

- Reason:

    ```
    setCollectionWithRetry checked every persisted key of the collection against the new collection's keys with Array.includes, which is O(n²).
    On a large production account with ~280k collection members, applying GetRules with Onyx.setCollection froze the tab for ~57s.
    This patch uses a Set for the lookup, which brings that step down to ~0.15s. Behavior is otherwise identical.
    ```

- Upstream PR/issue: https://github.com/Expensify/react-native-onyx/pull/898
- E/App issue: https://github.com/Expensify/App/issues/<issueID>
- PR introducing patch: https://github.com/Expensify/App/pull/108098
