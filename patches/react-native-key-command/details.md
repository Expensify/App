# `react-native-key-command` patches

### [react-native-key-command+1.0.14+001+rn088-ios-utils-import.patch](react-native-key-command+1.0.14+001+rn088-ios-utils-import.patch)

- Reason:

    ```
    HardwareShortcuts.m needs RCTUtils.h for RCTAssertMainQueue. The React
    Native 0.88 prebuilt iOS framework exposes the header as <React/RCTUtils.h>.
    ```

- Upstream PR/issue: No upstream fix published; `1.0.35` still uses the unqualified import. Drop the patch once the dependency ships the qualified import.
- E/App issue: https://github.com/Expensify/App/issues/108096
- PR introducing patch: https://github.com/Expensify/App/pull/108111
