# `@react-native/virtualized-lists` patches


### [@react-native+virtualized-lists+0.81.4+001+osr-improvement.patch](@react-native+virtualized-lists+0.81.4+001+osr-improvement.patch)

- Reason:
  
    ```
    Fix onStartReached not called in some cases (https://github.com/Expensify/App/commit/15546b6fa2aad0e74d8822bcaecebbf9b4187287): When scrolling down after comment linking, sometimes the scroll would get stuck. This is because onStartReached was never called. This is caused by the early return in VirtualizedList.getDerivedStateFromProps. It compares the number of items with renderMask.numCells(), but for some reason sometimes this is different from the previous number of items. So to fix it we now save the previous number of items in state and also compare that.
    ```
  
- Upstream PR/issue: https://github.com/facebook/react-native/pull/46250
- E/App issue: https://github.com/Expensify/App/issues/46217
- PR introducing patch: https://github.com/Expensify/App/pull/46315
