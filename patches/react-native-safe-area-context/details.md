# `react-native-safe-area-context` patches

### [react-native-safe-area-context+5.6.2+001+fix-removechild-crash-on-unmount.patch](react-native-safe-area-context+5.6.2+001+fix-removechild-crash-on-unmount.patch)

- Reason:

    ```
    The web build of NativeSafeAreaProvider appends a hidden measurement element to document.body and
    its effect cleanup removes it with document.body.removeChild(element), which throws NotFoundError
    when the element is no longer a child of body. During navigation the provider subtree can be torn
    down with the element already detached, and the throw escapes as an uncaught error. This patch
    detaches the transition listener first and then uses element.remove(), which is a no-op when the
    node has no parent.
    ```

- Upstream PR/issue: https://github.com/appandflow/react-native-safe-area-context/pull/746
- E/App issue: https://github.com/Expensify/App/issues/95343
- PR introducing patch: https://github.com/Expensify/App/pull/97595
