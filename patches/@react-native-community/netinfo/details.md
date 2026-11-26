# `@react-native-community/netinfo` patches

### [@react-native-community+netinfo+11.4.1+001+initial.patch](@react-native-community+netinfo+11.4.1+001+initial.patch)

- Reason:
  
    ```
    This patch makes the library support new architecture. It deliberately renames the file before modifying it to avoid this known issue: https://github.com/ds300/patch-package/issues/518
    ```
  
- Upstream PR/issue: https://github.com/react-native-netinfo/react-native-netinfo/pull/655
- E/App issue: https://github.com/Expensify/App/issues/8503
- PR introducing patch: https://github.com/Expensify/App/pull/13767

### [@react-native-community+netinfo+11.4.1+002+turbomodule.patch](@react-native-community+netinfo+11.4.1+002+turbomodule.patch)

- Reason:
  
    ```
    This patch makes the library support new architecture.
    ```
  
- Upstream PR/issue: https://github.com/react-native-netinfo/react-native-netinfo/pull/655
- E/App issue: https://github.com/Expensify/App/issues/8503
- PR introducing patch: https://github.com/Expensify/App/pull/13767

### [@react-native-community+netinfo+11.4.1+003+fix-web-online-events.patch](@react-native-community+netinfo+11.4.1+003+fix-web-online-events.patch)

- Reason:

    ```
    On web, NetInfo only listens to `navigator.connection` `change` events when that API exists (Chrome), and ignores window `online`/`offline`.
    Chrome can fire `change` before `navigator.onLine` flips back to true when the network returns, so NetInfo reports `isConnected: false`
    and never hears about the reconnect. The App then stays offline until the page is reloaded. This patch also listens to window
    `online`/`offline` when `navigator.connection` exists, so the final `navigator.onLine` value is always reported.
    ```

- Upstream PR/issue: https://github.com/react-native-netinfo/react-native-netinfo/pull/817 (issue: https://github.com/react-native-netinfo/react-native-netinfo/issues/756)
- E/App issue: https://github.com/Expensify/App/issues/107620
- PR introducing patch: https://github.com/Expensify/App/pull/108127
