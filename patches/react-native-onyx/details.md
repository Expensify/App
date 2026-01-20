# `react-native-onyx` patches

### [react-native-onyx+3.0.29+001+allow-pending-fields-in-snapshot.patch](react-native-onyx+3.0.29+001+allow-pending-fields-in-snapshot.patch)

- Reason:

  ```
  Allow `pendingAction` and `pendingFields` to be merged into search snapshots even when those keys were not previously present, so delete flows can propagate pending flags into snapshot data.
  ```

- Upstream PR/issue: TODO
- E/App issue: TODO
- PR introducing patch: TODO
