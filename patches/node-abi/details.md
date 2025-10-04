# `node-abi` patches

### [node-abi+3.65.0+001+electron-37-abi.patch](node-abi+3.65.0+001+electron-37-abi.patch)

- Reason:
  
    ```
    node-abi 3.65.0 does not yet know about Electron 37.0.0, causing native
    module rebuilds to fail because the ABI lookup throws. This patch adds
    a temporary mapping that returns ABI 136 for Electron 37 until upstream
    ships support.
    ```
  
- Upstream PR/issue: N/A
- E/App issue: https://github.com/Expensify/App/issues/70014
- PR introducing patch: https://github.com/Expensify/App/pull/70833
