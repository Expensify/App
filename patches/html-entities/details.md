# `html-entities` patches

### [html-entities+2.5.2+001+use-worklet.patch](html-entities+2.5.2+001+use-worklet.patch)

- Reason:
  
    ```
    This patch adds `"worklet";` directive at the beginning of `node_modules/html-entities/index.js`. So the function used in react-native-live-markdown parser is a worklet and able to run in UI thread (react-native-reanimated).
    ```
  
- Upstream PR/issue: https://github.com/Expensify/react-native-live-markdown/pull/576
- E/App issue: https://github.com/Expensify/App/issues/52475
- PR introducing patch: https://github.com/Expensify/App/pull/53627