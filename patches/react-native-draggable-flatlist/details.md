# `react-native-draggable-flatlist` patches

### [react-native-draggable-flatlist+4.0.3+001+listfooter-constraint.patch](react-native-draggable-flatlist+4.0.3+001+listfooter-constraint.patch)

- Reason: Ensures items can't be dragged into the list footer by accounting for its height when constraining drag bounds.
- Upstream PR/issue: https://github.com/computerjazz/react-native-draggable-flatlist/pull/592
- E/App issue: 🛑
- PR Introducing Patch: [#61380](https://github.com/Expensify/App/pull/61380)


### [react-native-draggable-flatlist+4.0.3+002+fix-console-error-ref-measureLayout.patch](react-native-draggable-flatlist+4.0.3+002+fix-console-error-ref-measureLayout.patch)

- Reason: Prevents console warning when adding a new item due to incorrect `ref.measureLayout` call.
- Upstream PR/issue: https://github.com/computerjazz/react-native-draggable-flatlist/pull/544
- E/App issue: 🛑
- PR Introducing Patch: [#55066](https://github.com/Expensify/App/pull/55066)
