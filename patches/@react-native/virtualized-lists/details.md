# `@react-native/virtualized-lists` patches

### [@react-native+virtualized-lists+0.81.1+001+osr-improvement.patch](@react-native+virtualized-lists+0.81.1+001+osr-improvement.patch)

- Reason:
  
    ```
    onStartReached is called more than it should be since our heuristic to not re-trigger it is based on the list
    content size. This has worked fine for onEndReached, but for onStartReached it causes some issues.

    On initial mount we receive different content size updates. I assume this is normal because of virtualization
    and the need to measure content. However for onStartReached since we usually start at scroll position 0 we are
    already in the threshold so any change to content size causes us to trigger a onStartReached event.

    To improve this I suggest using firstVisibleItemKey that we use for maintainVisibleContentPosition to track if we
    should re-trigger onStartReached. This means that it will be only re-triggered if new items are added at the start
    of the list or if we leave the threshold.
    ```
  
- Upstream PR/issue: https://github.com/facebook/react-native/pull/44287
- E/App issue: <Please create an E/App issue ([template](./../.github/ISSUE_TEMPLATE/NewPatchTemplate.md)) for each introduced patch. Link it here and if patch won't be removed in the future (no upstream PR exists) explain why>
- PR introducing patch: https://github.com/Expensify/App/pull/41189
