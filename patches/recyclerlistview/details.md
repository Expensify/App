# `recyclerlistview` patches

### [recyclerlistview+4.2.3+001+fix-queueStateRefresh.patch](recyclerlistview+4.2.3+001+fix-queueStateRefresh.patch)

- Reason:
  
    ```
    This patch sets the _isMounted back to true when the component is mounted.
    ```
  
- Upstream PR/issue: https://github.com/Flipkart/recyclerlistview/pull/787
- E/App issue: https://github.com/Expensify/App/issues/51658
- PR introducing patch: https://github.com/Expensify/App/pull/52675